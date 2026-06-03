"""
core/api.py — 통합 FastAPI 라우터
==================================

기존 4개 API 엔드포인트를 1개로 통합합니다.

기존:
- backend/main.py         → POST /api/v1/diagnose-risk
- src/api/risk_engine.py   → POST /v1/risk/analyze
- yobizwiz_backend/api_gateway.py → POST /api/v1/calculate_tre
- src/services/threat_calculator.py → POST /api/v1/calculate-threat

통합:
- POST /api/v1/diagnose  ← 단 하나의 진단 엔드포인트
- GET  /api/v1/health     ← 헬스 체크 + Self-Healing 상태
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi import FastAPI, HTTPException
from _shared import get_circuit_breaker, HealingLogger, classify_error

from .schemas import DiagnosisInput, DiagnosisReport, RiskLevel
from .engine import RiskDiagnosisEngine


# ============================================================
# 앱 초기화
# ============================================================

app = FastAPI(
    title="Yobizwiz Risk Diagnosis API",
    description="통합 리스크 진단 엔진 — 구조적 위험 분석 및 최대 잠재 손실액(Lmax) 산출",
    version="2.0.0",
)

# 싱글톤 인스턴스
_engine = RiskDiagnosisEngine()
_healing_logger = HealingLogger()
_breaker = get_circuit_breaker(
    name="diagnose_endpoint",
    failure_threshold=5,
    reset_timeout=30.0,
)

# 안전한 기본 응답 (Circuit Breaker OPEN 또는 최종 실패 시)
_SAFE_FALLBACK = DiagnosisReport(
    tre_score=0.0,
    risk_level=RiskLevel.GREEN,
    estimated_lmax_usd=0.0,
    threat_messages=[],
    legal_evidence=[],
    summary="⚠️ 시스템이 자가 복구 중입니다. 잠시 후 다시 시도해 주세요.",
    recommendation="잠시 후 다시 시도하거나 시스템 관리자에게 문의하세요.",
    is_red_zone=False,
    was_self_healed=True,
)


# ============================================================
# 엔드포인트
# ============================================================

@app.post("/api/v1/diagnose", response_model=DiagnosisReport)
async def diagnose(input_data: DiagnosisInput):
    """
    통합 리스크 진단 엔드포인트.
    
    기존 4개 엔드포인트를 하나로 통합했습니다.
    동일 입력 → 항상 동일 결과를 보장합니다 (random 제거).
    
    Self-Healing 전략:
    - Circuit Breaker OPEN → 즉시 안전한 기본 응답 반환
    - 계산 에러 → 캐시 fallback 또는 안전한 기본값
    """
    # Circuit Breaker 검사
    if not _breaker.can_execute():
        _healing_logger.log_recovery(
            service="api.diagnose",
            error_type="CircuitOpenError",
            action="circuit_breaker_fallback",
            result="degraded",
            recovery_time_ms=0,
        )
        return _SAFE_FALLBACK

    try:
        # 엔진 호출
        report = _engine.diagnose(input_data)

        # Circuit Breaker 성공 기록
        _breaker.record_success()
        return report

    except Exception as e:
        # Circuit Breaker 실패 기록
        _breaker.record_failure(e)

        _healing_logger.log_error(
            service="api.diagnose",
            error=e,
            classification=classify_error(e),
        )

        _healing_logger.log_recovery(
            service="api.diagnose",
            error_type=type(e).__name__,
            action="final_fallback",
            result="degraded",
            recovery_time_ms=0,
        )
        return _SAFE_FALLBACK


@app.get("/api/v1/health")
def health_check():
    """헬스 체크 + Self-Healing 상태."""
    return {
        "status": "OK",
        "service": "Yobizwiz Risk Diagnosis Engine v2.0",
        "self_healing": {
            "circuit_breaker": _breaker.stats,
            "recovery_stats": _healing_logger.get_recovery_stats("api.diagnose"),
        },
    }


# ============================================================
# 직접 실행 (개발용)
# ============================================================

if __name__ == "__main__":
    import uvicorn
    print("🚀 Yobizwiz Risk Diagnosis API v2.0 시작")
    print("📍 http://localhost:8000/docs 에서 API 문서 확인")
    uvicorn.run(app, host="0.0.0.0", port=8000)
