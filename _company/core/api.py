"""
core/api.py — 통합 FastAPI 라우터
==================================

엔드포인트:
- GET  /api/v1/checklist          ← 체크리스트 문항 조회
- POST /api/v1/checklist/submit   ← 체크리스트 제출 + 채점 + 전체 진단
- POST /api/v1/diagnose           ← 직접 진단 (체크리스트 없이)
- GET  /api/v1/health             ← 헬스 체크
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from _shared import get_circuit_breaker, HealingLogger, classify_error

from .schemas import DiagnosisInput, DiagnosisReport, RiskLevel
from .engine import RiskDiagnosisEngine
from .checklist import (
    CHECKLIST_QUESTIONS,
    score_checklist,
    ChecklistResult,
    ComplianceCategory,
)


# ============================================================
# 앱 초기화
# ============================================================

app = FastAPI(
    title="Yobizwiz Risk Diagnosis API",
    description="Compliance risk diagnosis with free self-assessment checklist, real enforcement case matching, and IBM breach cost data.",
    version="3.0.0",
)

_engine = RiskDiagnosisEngine()
_healing_logger = HealingLogger()
_breaker = get_circuit_breaker(
    name="diagnose_endpoint",
    failure_threshold=5,
    reset_timeout=30.0,
)

_SAFE_FALLBACK = DiagnosisReport(
    tre_score=0.0,
    risk_level=RiskLevel.GREEN,
    estimated_lmax_usd=0.0,
    threat_messages=[],
    legal_evidence=[],
    summary="⚠️ System is self-healing. Please try again shortly.",
    recommendation="Please retry in a few moments or contact support.",
    is_red_zone=False,
    was_self_healed=True,
)


# ============================================================
# 체크리스트 요청/응답 스키마
# ============================================================

class ChecklistSubmission(BaseModel):
    """체크리스트 제출 요청."""
    answers: Dict[str, bool] = Field(
        ...,
        description="Question ID → True(pass)/False(fail) mapping",
        examples=[{"DP-01": True, "DP-02": False, "AC-01": True}],
    )
    # 회사 정보 (체크리스트 결과 + 엔진 진단 통합용)
    industry: str = Field(..., description="Industry (e.g., Healthcare, Financial, Technology)")
    employee_count: int = Field(..., ge=1, description="Number of employees")
    data_storage_size_tb: float = Field(..., gt=0.0, description="Data storage size in TB")
    annual_revenue_usd: Optional[float] = Field(None, ge=0, description="Annual revenue (USD)")
    pii_record_count: Optional[int] = Field(None, ge=0, description="Number of PII records managed")


class GapResponse(BaseModel):
    """개별 갭 항목 응답."""
    question_id: str
    category: str
    question: str
    severity: str
    regulations: List[str]
    remediation_summary: str                    # 항상 공개
    remediation_detail: Optional[str] = None    # 유료 전용 (무료 1개만 포함)
    estimated_fix_days: int
    estimated_fix_cost_usd: float
    is_free_guide: bool


class ChecklistResponse(BaseModel):
    """체크리스트 + 진단 통합 응답."""
    # 체크리스트 결과
    total_questions: int
    passed: int
    failed: int
    compliance_score: float
    grade: str
    category_scores: Dict[str, Dict]
    gaps: List[GapResponse]
    total_estimated_fix_cost_usd: float
    total_estimated_fix_days: int
    free_guides_count: int
    paid_guides_count: int

    # 엔진 진단 결과 (Phase 1+2 통합)
    diagnosis: Optional[DiagnosisReport] = None


# ============================================================
# 체크리스트 엔드포인트
# ============================================================

@app.get("/api/v1/checklist")
def get_checklist():
    """
    체크리스트 문항을 조회합니다 (무료).
    
    20문항을 카테고리별로 그룹화하여 반환합니다.
    """
    questions_by_category = {}
    for q in CHECKLIST_QUESTIONS:
        cat = q.category.value
        if cat not in questions_by_category:
            questions_by_category[cat] = []
        questions_by_category[cat].append({
            "id": q.id,
            "question": q.question,
            "severity": q.severity.value,
            "regulations": q.regulations,
        })

    return {
        "total_questions": len(CHECKLIST_QUESTIONS),
        "categories": list(questions_by_category.keys()),
        "questions": questions_by_category,
    }


@app.post("/api/v1/checklist/submit", response_model=ChecklistResponse)
async def submit_checklist(submission: ChecklistSubmission):
    """
    체크리스트를 제출하고 채점 + 전체 진단 결과를 받습니다.
    
    무료 제공:
    - 전체 채점 결과 (점수, 등급, 카테고리별 점수)
    - 미충족 항목 목록 + 간단한 개선 방향
    - 가장 쉬운 1개 항목의 상세 개선 가이드
    - 유사 벌금 사례 + IBM 유출 비용 추정
    
    유료 전용:
    - 나머지 항목의 상세 개선 가이드 (remediation_detail)
    """
    # 1. 체크리스트 채점
    result = score_checklist(submission.answers)

    # 2. 갭 응답 생성 (무료/유료 분리)
    gap_responses = []
    for gap in result.gaps:
        gap_responses.append(GapResponse(
            question_id=gap.question_id,
            category=gap.category,
            question=gap.question,
            severity=gap.severity,
            regulations=gap.regulations,
            remediation_summary=gap.remediation_summary,
            # 유료 가이드는 is_free_guide인 것만 포함
            remediation_detail=gap.remediation_detail if gap.is_free_guide else None,
            estimated_fix_days=gap.estimated_fix_days,
            estimated_fix_cost_usd=gap.estimated_fix_cost_usd,
            is_free_guide=gap.is_free_guide,
        ))

    # 3. 체크리스트 결과를 엔진 진단과 통합
    has_audit = submission.answers.get("AU-02", False)  # 리스크 평가 수행 여부
    
    # 위반 유형 추론 (미충족 항목 기반)
    violation_history = {}
    critical_gaps = [g for g in result.gaps if g.severity == "Critical"]
    if len(critical_gaps) >= 3:
        violation_history["COMPLIANCE_DRIFT"] = len(critical_gaps)
    high_gaps = [g for g in result.gaps if g.severity == "High"]
    if any(g.question_id.startswith("DP") for g in result.gaps):
        violation_history["PII_LEAK"] = sum(1 for g in result.gaps if g.question_id.startswith("DP"))
    if any(g.question_id.startswith("EN") for g in result.gaps):
        violation_history["SYSTEM_VULNERABILITY"] = sum(1 for g in result.gaps if g.question_id.startswith("EN"))

    diagnosis_input = DiagnosisInput(
        industry=submission.industry,
        employee_count=submission.employee_count,
        has_compliance_audit=has_audit,
        data_storage_size_tb=submission.data_storage_size_tb,
        annual_revenue_usd=submission.annual_revenue_usd,
        pii_record_count=submission.pii_record_count,
        violation_history=violation_history if violation_history else None,
    )

    # 엔진 진단 실행
    try:
        diagnosis = _engine.diagnose(diagnosis_input)
    except Exception:
        diagnosis = None

    free_count = sum(1 for g in gap_responses if g.is_free_guide)
    paid_count = len(gap_responses) - free_count

    return ChecklistResponse(
        total_questions=result.total_questions,
        passed=result.passed,
        failed=result.failed,
        compliance_score=result.compliance_score,
        grade=result.grade,
        category_scores=result.category_scores,
        gaps=gap_responses,
        total_estimated_fix_cost_usd=result.total_estimated_fix_cost_usd,
        total_estimated_fix_days=result.total_estimated_fix_days,
        free_guides_count=free_count,
        paid_guides_count=paid_count,
        diagnosis=diagnosis,
    )


# ============================================================
# 기존 직접 진단 엔드포인트
# ============================================================

@app.post("/api/v1/diagnose", response_model=DiagnosisReport)
async def diagnose(input_data: DiagnosisInput):
    """Direct risk diagnosis (without checklist)."""
    if not _breaker.can_execute():
        return _SAFE_FALLBACK

    try:
        report = _engine.diagnose(input_data)
        _breaker.record_success()
        return report
    except Exception as e:
        _breaker.record_failure(e)
        _healing_logger.log_error(service="api.diagnose", error=e, classification=classify_error(e))
        return _SAFE_FALLBACK


@app.get("/api/v1/health")
def health_check():
    """Health check + Self-Healing status."""
    return {
        "status": "OK",
        "service": "Yobizwiz Risk Diagnosis Engine v3.0",
        "endpoints": {
            "checklist": "GET /api/v1/checklist",
            "submit": "POST /api/v1/checklist/submit",
            "diagnose": "POST /api/v1/diagnose",
        },
        "self_healing": {
            "circuit_breaker": _breaker.stats,
        },
    }


# ============================================================
# 직접 실행 (개발용)
# ============================================================

if __name__ == "__main__":
    import uvicorn
    print("🚀 Yobizwiz Risk Diagnosis API v3.0")
    print("📍 http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)


