"""
core/schemas.py — 통합 입출력 스키마
====================================

6개 파일에 흩어져 있던 Pydantic 스키마를 하나로 통합합니다.

통합 출처:
- schemas/risk_input_schema.py → UserProfileInput 필드
- backend/main.py → UserContext 필드  
- src/api/risk_engine.py → RiskInputPayload 필드
- src/services/threat_calculator.py → ThreatInput 필드
- lmax_calculator.py → 위반 유형 딕셔너리
"""

from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
from enum import Enum


# ============================================================
# 위험 등급 열거형
# ============================================================

class RiskLevel(str, Enum):
    """위험 등급 (기존 6개 파일의 Green/Yellow/Red를 표준화)"""
    GREEN = "Green"
    YELLOW = "Yellow"
    RED = "Red"


# ============================================================
# 입력 스키마
# ============================================================

class DiagnosisInput(BaseModel):
    """
    통합 리스크 진단 입력 스키마.
    
    기존 5개 서로 다른 입력 스키마를 하나로 병합했습니다:
    - UserProfileInput: industry, employee_count, has_compliance_audit, data_storage_size_tb
    - UserContext: user_id, input_risk_score  
    - RiskInputPayload: user_industry, data_volume_mb, compliance_status
    - ThreatInput: company_annual_revenue_usd, pii_exposure_count, etc.
    - lmax_calculator: violation_history dict
    """
    
    # --- 회사 기본 정보 (필수) ---
    industry: str = Field(
        ..., 
        description="산업 분야 (예: 금융, 의료, 제조, Fintech, Healthcare)",
        examples=["금융", "의료", "제조"]
    )
    employee_count: int = Field(
        ..., 
        ge=1, 
        description="직원 수"
    )
    
    # --- 컴플라이언스 상태 (필수) ---
    has_compliance_audit: bool = Field(
        ..., 
        description="최근 12개월 내 규정 감사(Audit) 이력 보유 여부"
    )
    
    # --- 데이터 규모 (필수) ---
    data_storage_size_tb: float = Field(
        ..., 
        gt=0.0, 
        description="현재 관리 중인 데이터 총량 (TB)"
    )
    
    # --- 추가 리스크 지표 (선택) ---
    annual_revenue_usd: Optional[float] = Field(
        None, 
        ge=0, 
        description="연간 매출액 (USD). 제공 시 벌금 스케일링에 사용"
    )
    pii_record_count: Optional[int] = Field(
        None, 
        ge=0, 
        description="관리 중인 개인식별정보(PII) 레코드 수"
    )
    
    # --- 과거 위반 이력 (선택) ---
    violation_history: Optional[Dict[str, int]] = Field(
        None,
        description="과거 위반 유형별 건수. 예: {'PII_LEAK': 2, 'COMPLIANCE_DRIFT': 1}",
        examples=[{"PII_LEAK": 2, "COMPLIANCE_DRIFT": 1}]
    )


# ============================================================
# 위협 메시지 구조
# ============================================================

class ThreatMessage(BaseModel):
    """개별 위협 항목. services/risk_engine.py의 메시지 구조를 표준화."""
    threat: str = Field(..., description="위협 유형 설명")
    severity: str = Field(..., description="심각도 (Low / Medium / High / Critical)")
    action: str = Field(..., description="권장 조치 사항")
    legal_basis: Optional[str] = Field(None, description="관련 법률 근거")


# ============================================================
# 출력 스키마
# ============================================================

class SimilarCase(BaseModel):
    """유사 벌금 사례."""
    company: str = Field(..., description="회사명")
    year: int = Field(..., description="제재 연도")
    industry: str = Field(..., description="산업")
    regulation: str = Field(..., description="적용 규제")
    fine_usd: float = Field(..., description="벌금액 (USD)")
    description: str = Field(..., description="위반 내용 요약")
    similarity_score: float = Field(..., description="유사도 점수 (0~1)")


class BreachCostEstimate(BaseModel):
    """데이터 유출 비용 추정 (IBM Report 기반)."""
    avg_total_cost_usd: float = Field(..., description="산업 평균 유출 비용")
    estimated_pii_cost_usd: float = Field(0.0, description="PII 규모 기반 추정 비용")
    cost_per_record_usd: float = Field(..., description="레코드당 비용")
    source: str = Field("IBM Cost of Data Breach Report 2024", description="출처")


class DiagnosisReport(BaseModel):
    """
    통합 리스크 진단 결과 보고서 (v2 — 실제 데이터 기반).
    """
    
    # --- 핵심 지표 ---
    tre_score: float = Field(
        ..., 
        ge=0.0, 
        le=100.0, 
        description="Total Risk Exposure 점수 (0~100)"
    )
    risk_level: RiskLevel = Field(
        ..., 
        description="위험 등급 (Green / Yellow / Red)"
    )
    
    # --- 재무 영향 ---
    estimated_lmax_usd: float = Field(
        ..., 
        ge=0.0, 
        description="최대 잠재 손실액 Lmax (USD)"
    )
    
    # --- 위협 상세 ---
    threat_messages: List[ThreatMessage] = Field(
        default_factory=list, 
        description="식별된 위협 목록 및 권장 조치"
    )
    
    # --- 법적 근거 ---
    legal_evidence: List[Dict[str, str]] = Field(
        default_factory=list, 
        description="Lmax 계산에 사용된 법적 근거 상세"
    )
    
    # --- 유사 사례 (Phase 2: 실제 데이터) ---
    similar_cases: List[SimilarCase] = Field(
        default_factory=list,
        description="유사한 실제 벌금 사례 (산업/규모/위반유형 기반 매칭)"
    )
    
    # --- 유출 비용 추정 (Phase 2: IBM Report) ---
    breach_cost_estimate: Optional[BreachCostEstimate] = Field(
        None,
        description="IBM Data Breach Report 기반 예상 유출 비용"
    )
    
    # --- 요약 ---
    summary: str = Field(
        ..., 
        description="사람이 읽을 수 있는 진단 요약 메시지"
    )
    recommendation: str = Field(
        ..., 
        description="핵심 권장 조치"
    )
    
    # --- 메타데이터 ---
    is_red_zone: bool = Field(False, description="Red Zone 진입 여부")
    was_self_healed: bool = Field(False, description="자가 복구 결과인지 여부")
