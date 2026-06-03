from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import random
import time
import sys
import os

# Self-Healing 모듈 임포트
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from _shared import self_healing, classify_error, get_circuit_breaker, HealingLogger

app = FastAPI(title="Yobizwiz Risk Diagnostic API")
_healing_logger = HealingLogger()

# --- Pydantic Schema for Input Validation (Defensive Programming) ---
class UserContext(BaseModel):
    """사용자의 기본적인 컨텍스트 정보를 받아옵니다."""
    user_id: str = Field(..., description="고유 사용자 식별자")
    data_source: str = Field(..., description="진단에 사용될 데이터 출처 (e.g., KYC, Transaction)")
    input_risk_score: float = Field(..., ge=0.0, le=10.0, description="초기 입력된 리스크 점수 (0~10)")

# --- Pydantic Schema for Output Data Consistency ---
class RiskAnalysisResult(BaseModel):
    """진단 결과를 포함하는 표준화된 응답 구조."""
    status_gauge_value: float = Field(..., ge=0.0, le=100.0, description="StatusGauge에 바인딩될 0~100 사이의 값")
    lmax_calculated: float = Field(..., gt=0.0, description="최대 재무 손실액 ($L_{max}$) (단위: USD)")
    risk_level_message: str = Field(..., description="사용자에게 보여줄 리스크 레벨 메시지")
    is_paywall_triggered: bool = Field(..., description="페이월 결제 모달 활성화 여부 플래그")
    was_self_healed: bool = Field(False, description="자가 복구를 통해 생성된 결과인지 여부")

# --- Core Business Logic (Lmax Calculation & Status Gauge Update) ---
@self_healing(
    max_retries=2,
    fallback_value=(0.0, 0.0),
    service_name="calculate_lmax_and_status",
)
def calculate_lmax_and_status(context: UserContext) -> tuple[float, float]:
    """
    핵심 비즈니스 로직: 리스크 온톨로지 기반 $L_{max}$ 및 StatusGauge 값 산출.
    실제 환경에서는 복잡한 DB 쿼리와 ML 모델 호출이 들어갈 자리입니다.
    여기서는 시뮬레이션합니다.
    """
    # 1. Lmax 계산 (위험 증폭 모델 적용)
    # 예시: 입력 점수 * 상수 + 랜덤 변동성
    base_lmax = context.input_risk_score * 5000
    time_factor = time.time() % 10 / 10 # 시간에 따른 미세 변화 시뮬레이션
    lmax = round(base_lmax + (context.input_risk_score * 100) * random.random(), 2)

    # 2. Status Gauge Value 산출 (Lmax에 비례하며, 100을 초과할 수 없음)
    # Lmax가 커지면 게이지 값이 높게 설정되어야 합니다.
    status_gauge_value = min(100.0, context.input_risk_score * 8 + (lmax / 500))

    return lmax, status_gauge_value


# --- Circuit Breaker for the diagnose endpoint ---
_diagnose_breaker = get_circuit_breaker(
    name="diagnose_risk_endpoint",
    failure_threshold=5,
    reset_timeout=30.0,
)

# --- 안전한 기본 응답 (fallback) ---
_SAFE_FALLBACK_RESULT = RiskAnalysisResult(
    status_gauge_value=0.0,
    lmax_calculated=0.01,  # gt=0.0 제약 충족
    risk_level_message="⚠️ 시스템이 자가 복구 중입니다. 잠시 후 다시 시도해 주세요.",
    is_paywall_triggered=False,
    was_self_healed=True,
)


@app.post("/api/v1/diagnose-risk", response_model=RiskAnalysisResult)
@self_healing(
    max_retries=3,
    backoff_factor=2.0,
    fallback_value=None,  # fallback은 아래에서 직접 제어
    service_name="diagnose_risk",
)
async def diagnose_risk(context: UserContext):
    """
    사용자 입력 데이터를 받아 실시간 리스크 진단을 수행하고 결과를 반환합니다.
    이 엔드포인트는 Paywall 로직의 핵심입니다.

    Self-Healing 전략:
    - ConnectionError/TimeoutError → 지수 백오프 재시도 (최대 3회)
    - ValidationError → 입력값 보정 후 안전한 기본값 반환
    - Circuit Breaker OPEN → 즉시 fallback 응답
    """
    # Circuit Breaker 검사
    if not _diagnose_breaker.can_execute():
        _healing_logger.log_recovery(
            service="diagnose_risk",
            error_type="CircuitOpenError",
            action="circuit_breaker_fallback",
            result="degraded",
            recovery_time_ms=0,
        )
        return _SAFE_FALLBACK_RESULT

    try:
        # 1. 비즈니스 규칙 실행 및 데이터 산출
        lmax, status_gauge = calculate_lmax_and_status(context)

        # self_healing fallback이 반환된 경우 (lmax=0, gauge=0)
        was_healed = (lmax == 0.0 and status_gauge == 0.0 and context.input_risk_score > 0)

        # 2. 결과 해석 및 플래그 설정 (Paywall Triggering Logic)
        if lmax > 5000: # 임계값 정의 ($L_{max}$가 높을수록 Paywall 유도 강함)
            risk_level = "CRITICAL: 즉각적인 재정적 위험이 감지되었습니다."
            is_paywall = True
        elif status_gauge >= 75.0:
            risk_level = "HIGH: 주의가 필요하며, 전문 진단이 권장됩니다."
            is_paywall = False # 낮은 Lmax라도 게이지만으로 경고 가능
        elif was_healed:
            risk_level = "⚠️ 진단 엔진이 자가 복구되어 임시 결과를 반환합니다."
            is_paywall = False
        else:
            risk_level = "LOW: 현재 리스크 수준은 관리 가능한 범위입니다."
            is_paywall = False

        # 3. 최종 결과 모델 반환 (타입 안전성 확보)
        result = RiskAnalysisResult(
            status_gauge_value=round(status_gauge, 2),
            lmax_calculated=round(max(lmax, 0.01), 2),  # gt=0.0 제약 충족 보장
            risk_level_message=risk_level,
            is_paywall_triggered=is_paywall,
            was_self_healed=was_healed,
        )

        # Circuit Breaker 성공 기록
        _diagnose_breaker.record_success()
        return result

    except Exception as e:
        # Circuit Breaker 실패 기록
        _diagnose_breaker.record_failure(e)

        # 에러 분류에 따른 복구 시도
        classification = classify_error(e)

        _healing_logger.log_error(
            service="diagnose_risk",
            error=e,
            classification=classification,
        )

        # 최종 방어: 어떤 에러든 안전한 기본 응답 반환
        _healing_logger.log_recovery(
            service="diagnose_risk",
            error_type=type(e).__name__,
            action="final_fallback",
            result="degraded",
            recovery_time_ms=0,
        )
        return _SAFE_FALLBACK_RESULT

# --- Basic Health Check Endpoint (Self-Healing 상태 포함) ---
@app.get("/health")
def check_health():
    return {
        "status": "OK",
        "service": "Yobizwiz Risk Diagnostic Engine",
        "self_healing": {
            "circuit_breaker_state": _diagnose_breaker.state.value,
            "recovery_stats": _healing_logger.get_recovery_stats("diagnose_risk"),
        },
    }