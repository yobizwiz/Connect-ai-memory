from fastapi import FastAPI, HTTPException, status
from typing import Dict, Any
import sys
import os

# Self-Healing 모듈 임포트
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from _shared import self_healing, classify_error, get_circuit_breaker, HealingLogger

# [근거: self-import] 내부적으로 정의된 스키마와 서비스 레이어를 사용합니다.
from .schemas import RiskInput, TREResult 
from .services.risk_engine import diagnose_risk

app = FastAPI(
    title="Yobizwiz API Gateway",
    description="구조적 리스크 진단 및 총 위험 노출도 (TRE) 계산 게이트웨이 v1.0"
)

_healing_logger = HealingLogger()
_gateway_breaker = get_circuit_breaker(
    name="api_gateway_tre",
    failure_threshold=5,
    reset_timeout=30.0,
)

# 안전한 기본 응답 (Circuit Breaker OPEN 또는 최종 실패 시)
_SAFE_TRE_FALLBACK = TREResult(
    calculated_tre=0.0,
    risk_level="Unknown",
    structural_gap_identified="자가 복구 중 — 진단 서비스가 일시적으로 비활성화됨",
    is_critical=False,
    alert_message="⚠️ 시스템이 자가 복구를 수행 중입니다. 잠시 후 다시 시도해 주세요."
)


@app.post("/api/v1/calculate_tre", response_model=TREResult, status_code=status.HTTP_200_OK)
@self_healing(
    max_retries=3,
    backoff_factor=2.0,
    recoverable_errors=[ConnectionError, TimeoutError, OSError],
    fallback_value=None,  # fallback은 아래에서 직접 제어
    service_name="api_gateway.calculate_tre",
)
async def calculate_tre_endpoint(input: RiskInput):
    """
    클라이언트가 제출한 데이터를 받아 TRE를 계산하고 구조적 리스크 진단 결과를 반환합니다.
    이 엔드포인트는 단순 API 호출을 넘어, '시스템 경고' 경험을 사용자에게 제공하는 핵심 무기입니다.

    Self-Healing 전략:
    - Circuit Breaker OPEN → 즉시 안전한 기본 응답 반환
    - ConnectionError/TimeoutError → 지수 백오프 재시도 (최대 3회)
    - 모든 실패 → 안전한 기본 응답 + 자가 복구 상태 표시
    """
    # Circuit Breaker 검사
    if not _gateway_breaker.can_execute():
        _healing_logger.log_recovery(
            service="api_gateway",
            error_type="CircuitOpenError",
            action="circuit_breaker_fallback",
            result="degraded",
            recovery_time_ms=0,
        )
        return _SAFE_TRE_FALLBACK

    try:
        # 1. 서비스 계층 호출 (비즈니스 로직 실행)
        tre_value, risk_level, structural_gap, alert_message = diagnose_risk(input)

        # 2. 결과 모델 생성 및 반환
        result = TREResult(
            calculated_tre=tre_value,
            risk_level=risk_level,
            structural_gap_identified=structural_gap,
            is_critical=(tre_value >= 50.0), # 로직 재확인 (코드의 일관성)
            alert_message=alert_message
        )

        # Circuit Breaker 성공 기록
        _gateway_breaker.record_success()
        return result

    except Exception as e:
        # Circuit Breaker 실패 기록
        _gateway_breaker.record_failure(e)

        # 에러 분류 및 로깅
        classification = classify_error(e)
        _healing_logger.log_error(
            service="api_gateway",
            error=e,
            classification=classification,
        )

        # 최종 방어: 안전한 기본 응답 반환 (사용자에게 에러를 숨기고 복구 상태 표시)
        _healing_logger.log_recovery(
            service="api_gateway",
            error_type=type(e).__name__,
            action="final_fallback",
            result="degraded",
            recovery_time_ms=0,
        )
        return _SAFE_TRE_FALLBACK


# --- Self-Healing 상태 확인 엔드포인트 ---
@app.get("/api/v1/health/self-healing")
def get_self_healing_status():
    """현재 자가 복구 시스템의 상태를 반환합니다."""
    return {
        "circuit_breaker": _gateway_breaker.stats,
        "recovery_stats": _healing_logger.get_recovery_stats("api_gateway"),
        "recent_events": _healing_logger.get_recent_events(count=10, service="api_gateway"),
    }