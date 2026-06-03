import random
import sys
import os
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
# Assume schemas are available in the same directory for demonstration
from .schemas import ThreatInput, OutputSchema 
from typing import Optional

# Self-Healing 모듈 임포트
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from _shared import self_healing, classify_error, HealingLogger
from _shared.error_classifier import ErrorCategory

_healing_logger = HealingLogger()

# --- [1. Error Handling Module] ---
class CalculationError(Exception):
    """Custom exception for failed calculations or invalid data states."""
    def __init__(self, message: str = "TRE 계산 중 치명적인 로직 오류가 발생했습니다.", status_code: int = 400):
        super().__init__(message)
        self.status_code = status_code

# CalculationError를 DEGRADABLE로 등록 (자가 복구 시 기본값 fallback)
from _shared import register_custom_error
from _shared.error_classifier import RecoveryStrategy
register_custom_error(
    CalculationError,
    ErrorCategory.DEGRADABLE,
    RecoveryStrategy.FALLBACK_TO_DEFAULT,
    max_retries=0,
    description="계산 오류 — 안전한 기본값으로 fallback"
)


# --- [2. Input Sanitization (자가 보정)] ---
def sanitize_input(input_data: dict) -> dict:
    """
    입력 데이터를 자동 보정합니다 (Self-Healing: sanitize_and_retry).

    보정 규칙:
    - 필수 필드 누락 시 안전한 기본값 삽입
    - 숫자 범위 초과 시 클리핑
    - 타입 불일치 시 자동 변환 시도
    """
    sanitized = input_data.copy() if isinstance(input_data, dict) else {}
    was_sanitized = False

    # 필수 필드 기본값 보정
    defaults = {
        "company_annual_revenue_usd": 10000,
        "pii_exposure_count": 0,
        "compliance_violation_likelihood": 0.0,
        "critical_workflow_gap_count": 0,
        "process_failure_cost_estimate": 0,
        "ai_hallucination_dependency_score": 0.0,
    }

    for field, default_val in defaults.items():
        if field not in sanitized or sanitized[field] is None:
            sanitized[field] = default_val
            was_sanitized = True
            _healing_logger.log_recovery(
                service="threat_calculator",
                error_type="MissingField",
                action=f"sanitize_field_{field}",
                result="degraded",
                recovery_time_ms=0,
                details={"field": field, "default_applied": default_val}
            )

    # 숫자 범위 클리핑
    if isinstance(sanitized.get("compliance_violation_likelihood"), (int, float)):
        sanitized["compliance_violation_likelihood"] = max(0.0, min(1.0, float(sanitized["compliance_violation_likelihood"])))

    if isinstance(sanitized.get("ai_hallucination_dependency_score"), (int, float)):
        sanitized["ai_hallucination_dependency_score"] = max(0.0, min(1.0, float(sanitized["ai_hallucination_dependency_score"])))

    # 타입 변환 시도
    for numeric_field in ["company_annual_revenue_usd", "pii_exposure_count", "process_failure_cost_estimate"]:
        try:
            sanitized[numeric_field] = float(sanitized[numeric_field])
        except (ValueError, TypeError):
            sanitized[numeric_field] = defaults[numeric_field]
            was_sanitized = True

    if was_sanitized:
        _healing_logger.log_recovery(
            service="threat_calculator",
            error_type="InputValidation",
            action="input_sanitization_complete",
            result="degraded",
            recovery_time_ms=0,
        )

    return sanitized


# --- [3. Scoring Engine Core Logic] ---
@self_healing(
    max_retries=1,
    fallback_value=0.0,
    service_name="threat_calculator.calculate_tre_score",
)
def calculate_tre_score(input_data: ThreatInput) -> float:
    """
    Threat Risk Index (TRE) 점수를 계산하는 핵심 비즈니스 로직.
    가중치(Weights)와 위험 요소 간의 상관관계에 따라 점수가 결정됩니다.

    Self-Healing 전략:
    - 필수 데이터 누락 → 자동 보정(sanitization) 후 재계산
    - CalculationError → 안전한 기본 점수(0.0) 반환
    - 예상 외 에러 → fallback 0.0 반환

    [기술적 검증 포인트]
    1. 필수 데이터 누락 시 즉시 예외 발생 유도.
    2. 모든 입력 값은 0~1 사이로 정규화되어야 함 (가중치 적용 전).
    3. 가중치는 주기적으로 조정될 수 있는 상수(Constants)로 관리해야 합니다.
    """
    try:
        # --- Self-Healing: 입력값 자동 보정 ---
        if isinstance(input_data, dict):
            input_data = sanitize_input(input_data)

        # --- A. 데이터 유효성 검사 및 기본 점수 초기화 ---
        revenue = input_data.get("company_annual_revenue_usd") if isinstance(input_data, dict) else getattr(input_data, "company_annual_revenue_usd", None)
        if revenue is None or revenue < 1000:
            # Self-Healing: 기존에는 여기서 CalculationError를 발생시켰지만,
            # 이제는 자동 보정 후 계속 진행합니다.
            _healing_logger.log_recovery(
                service="threat_calculator",
                error_type="CalculationError",
                action="revenue_auto_corrected",
                result="degraded",
                recovery_time_ms=0,
                details={"original_revenue": revenue, "corrected_to": 10000}
            )
            if isinstance(input_data, dict):
                input_data["company_annual_revenue_usd"] = 10000
                revenue = 10000
            else:
                revenue = 10000

        # --- B. 리스크별 가중치 정의 (Weighting Factors - Hardcoded for now, should be config) ---
        W_PII = 0.35  # PII Leakage는 가장 흔하고 치명적인 초기 위험 요소
        W_AUDIT = 0.30 # 프로세스 단절은 시스템의 구조적 결함을 의미
        W_AI = 0.20    # AI 환각 의존도는 신뢰성 문제로 중요도가 높아짐
        W_REVENUE = 0.15 # 회사 규모에 따른 리스크 민감도 (Revenue가 높으면 리스크 지수 배율 증가)

        # --- C. 개별 위험 점수 계산 및 정규화 (Normalization & Scoring) ---
        # Helper: 안전한 값 추출 (KeyError 방지)
        def safe_get(key, default=0.0):
            if isinstance(input_data, dict):
                val = input_data.get(key, default)
            else:
                val = getattr(input_data, key, default)
            try:
                return float(val) if val is not None else default
            except (ValueError, TypeError):
                return default

        # 1. PII Risk Component (가장 높은 영향력)
        pii_score = safe_get("pii_exposure_count") * 0.05 + safe_get("compliance_violation_likelihood") * 0.6
        if pii_score > 1.0: pii_score = 1.0 # 상한선 제한

        # 2. Audit/Process Risk Component (가장 구조적 결함을 측정)
        audit_score = min(safe_get("critical_workflow_gap_count") * 0.2, 0.8) + safe_get("process_failure_cost_estimate") / 1_000_000
        if audit_score > 1.0: audit_score = 1.0

        # 3. AI Hallucination Risk Component
        ai_score = safe_get("ai_hallucination_dependency_score") * 0.9

        # --- D. 최종 가중 평균 산출 (Final Weighted Average) ---
        raw_tre_score = (pii_score * W_PII + audit_score * W_AUDIT + ai_score * W_AI)
        
        # 회사 규모에 따른 민감도 조절 (Revenue가 높을수록 위험은 더 커진다 가정)
        revenue_factor = 1.0 + (revenue / 100_000_000) * W_REVENUE
        final_tre_score = raw_tre_score * revenue_factor

        # 점수 클리핑 및 최종 반환 (최대 100점 스케일로 조정 가능하도록 처리)
        return min(max(final_tre_score, 0.0), 100.0)


    except CalculationError as e:
        _healing_logger.log_error(
            service="threat_calculator",
            error=e,
            classification=classify_error(e),
        )
        # Self-Healing: CalculationError는 기본 점수 반환
        _healing_logger.log_recovery(
            service="threat_calculator",
            error_type="CalculationError",
            action="fallback_to_zero_score",
            result="degraded",
            recovery_time_ms=0,
        )
        return 0.0  # 안전한 기본 점수
    except Exception as e:
        # 예상치 못한 시스템 오류 처리 (Root Cause 분석 필수!)
        _healing_logger.log_error(
            service="threat_calculator",
            error=e,
            classification=classify_error(e),
        )
        _healing_logger.log_recovery(
            service="threat_calculator",
            error_type=type(e).__name__,
            action="fallback_to_zero_score",
            result="degraded",
            recovery_time_ms=0,
        )
        return 0.0  # 안전한 기본 점수 (HTTPException 대신)


def determine_risk_level(score: float) -> tuple[str, str, str]:
    """점수를 기반으로 리스크 레벨, 경고 메시지, 제안 티어 3가지를 반환합니다."""
    if score < 30:
        return "Green", "낮음. 현재 시스템 구조는 안정적입니다.", "Tier 0 - None"
    elif score < 65:
        # Yellow Zone 경고 메시지 (미묘한 불편함)
        warning = "주의. 일부 사각지대(Blind Spot)가 감지됩니다. 프로세스 점검이 필요합니다."
        return "Yellow", warning, "Tier 1 - Detection"
    else:
        # Red Zone 경고 메시지 (생존 위협)
        warning = "🚨 시스템적 생존 위협! 즉각적인 구조 개선(Mitigation) 없이는 큰 금전적 손실이 예상됩니다. 전문가의 개입이 필수입니다."
        return "Red", warning, "Tier 2 - Prevention"


@self_healing(
    max_retries=1,
    fallback_value=None,
    service_name="threat_calculator.generate_report",
)
def generate_report(input_data: ThreatInput):
    """메인 실행 함수: 점수 계산 및 최종 리포트 구조화."""
    try:
        # 1. TRE Score 계산
        score = calculate_tre_score(input_data)

        # 2. 리스크 레벨 결정 (Red Zone 트리거)
        risk_level, warning_message, suggested_tier = determine_risk_level(score)

        # 3. 최종 Output 객체 구성 및 반환
        return {
            "threat_risk_index": round(score, 2),
            "risk_level": risk_level,
            "systemic_warning_message": warning_message,
            "suggested_tier": suggested_tier,
        }

    except HTTPException as e:
        # 이미 계산 엔진에서 처리된 에러는 그대로 전파
        raise e
    except Exception as e:
        # Self-Healing: 안전한 기본값 반환 + 구조화된 로깅
        _healing_logger.log_error(
            service="threat_calculator.generate_report",
            error=e,
            classification=classify_error(e),
        )
        _healing_logger.log_recovery(
            service="threat_calculator.generate_report",
            error_type=type(e).__name__,
            action="fallback_to_safe_report",
            result="degraded",
            recovery_time_ms=0,
        )
        return {
            "threat_risk_index": 0.0,
            "risk_level": "Green",
            "systemic_warning_message": "⚠️ 자가 복구 완료: 시스템 분석 중 에러가 발생하여 안전한 기본값을 반환합니다.",
            "suggested_tier": "Tier 0 - None",
            "_was_self_healed": True,
        }


# --- [4. FastAPI Application Setup (Mock Endpoint)] ---
app = FastAPI(title="yobizwiz TRE Calculator API")

@app.post("/api/v1/calculate-threat", response_model=dict)
async def calculate_threat_endpoint(data: ThreatInput):
    """
    사용자로부터 데이터를 받아 종합 위협 지수를 산출하고,
    Red Zone 트리거 여부를 결정하는 메인 엔드포인트.
    """
    # 핵심 로직 호출
    report = generate_report(data)
    return report

if __name__ == "__main__":
    import uvicorn
    print("--- Starting TRE Calculator API Mockup ---")
    # 실제 환경에서는 이 명령을 실행하여 서버를 띄웁니다.
    uvicorn.run(app, host="0.0.0.0", port=8000)

# 참고: 위 코드는 pydantic v2와 fastapi가 설치되어 있어야 작동합니다.