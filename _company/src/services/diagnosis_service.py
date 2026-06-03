from src.utils.token_manager import TokenManager, AuthService
import time # 시간 시뮬레이션을 위한 임포트
import sys
import os
from typing import Optional

# Self-Healing 모듈 임포트
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from _shared import self_healing, classify_error, HealingLogger
from _shared.error_classifier import ErrorCategory, RecoveryStrategy

_healing_logger = HealingLogger()

# Singleton 패턴을 사용하여 전역적인 토큰 관리자 인스턴스를 유지합니다.
_auth_service = AuthService()
_token_manager = TokenManager(_auth_service)

# 마지막 성공 결과를 캐시합니다 (fallback용)
_last_successful_diagnosis: Optional[dict] = None


def get_global_token_manager():
    """Token Manager의 싱글톤 인스턴스를 반환합니다."""
    return _token_manager


def _refresh_token_and_retry(token_manager: TokenManager) -> str:
    """
    토큰 갱신 자가 복구 전략.
    기존 토큰이 만료되었을 때 자동으로 새 토큰을 발급받습니다.
    """
    try:
        _healing_logger.log_recovery(
            service="diagnosis_service",
            error_type="ConnectionError",
            action="token_refresh_attempt",
            result="waiting",
            recovery_time_ms=0,
        )
        # 토큰 매니저의 내부 갱신 메커니즘 트리거
        new_token = token_manager.get_authenticated_token()
        _healing_logger.log_recovery(
            service="diagnosis_service",
            error_type="ConnectionError",
            action="token_refresh_success",
            result="success",
            recovery_time_ms=0,
        )
        return new_token
    except Exception as e:
        _healing_logger.log_error(
            service="diagnosis_service",
            error=e,
            classification=classify_error(e),
        )
        raise


@self_healing(
    max_retries=3,
    backoff_factor=2.0,
    recoverable_errors=[ConnectionError, TimeoutError],
    fallback_value=None,  # fallback은 아래에서 직접 제어
    service_name="diagnosis_service.process_request",
)
def process_diagnosis_request(user_data: dict) -> Optional[dict]:
    """
    진단 요청을 처리하는 핵심 로직. 토큰 관리를 최우선으로 합니다.

    Self-Healing 전략:
    - ConnectionError → 토큰 자동 재발급 + 지수 백오프 재시도 (최대 3회)
    - TimeoutError → 지수 백오프 재시도
    - 모든 실패 → 마지막 성공 결과 캐시 반환 (Graceful Degradation)
    """
    global _last_successful_diagnosis

    print("\n" + "=" * 60)
    print("🔑 [Diagnosis Service] 진단 요청 프로세스 시작.")

    retry_count = 0
    max_token_retries = 2

    while retry_count <= max_token_retries:
        try:
            # 1. 전역 인증 게이트웨이를 통해 토큰 확보 (재발급 로직 포함)
            token = get_global_token_manager().get_authenticated_token()

            # 2. API 호출 및 데이터 수집
            result = call_diagnosis_api(token=token)

            # 3. 성공 결과 캐시 저장
            _last_successful_diagnosis = result.copy()

            print("✅ [Diagnosis Service] 진단 요청 성공적으로 완료.")

            _healing_logger.log_recovery(
                service="diagnosis_service",
                error_type="None",
                action="request_success",
                result="success",
                recovery_time_ms=0,
                details={"retry_count": retry_count} if retry_count > 0 else None,
            )
            return result

        except ConnectionError as e:
            retry_count += 1
            classification = classify_error(e)

            _healing_logger.log_error(
                service="diagnosis_service",
                error=e,
                classification=classification,
                attempt=retry_count,
            )

            if retry_count <= max_token_retries:
                # 토큰 재발급 시도 (Self-Healing: refresh_and_retry)
                print(f"🔄 [SELF-HEALING] 토큰 갱신 후 재시도 ({retry_count}/{max_token_retries})...")
                try:
                    _refresh_token_and_retry(_token_manager)
                    time.sleep(1.0 * retry_count)  # 선형 백오프
                    continue
                except Exception:
                    pass

            # 모든 재시도 소진 → 캐시 fallback
            print(f"🛑 [ERROR CRITICAL] API 연결에 실패했습니다. 원인: {e}")

            if _last_successful_diagnosis:
                _healing_logger.log_recovery(
                    service="diagnosis_service",
                    error_type="ConnectionError",
                    action="fallback_to_cached_result",
                    result="degraded",
                    recovery_time_ms=0,
                )
                print("🟡 [SELF-HEALING] 마지막 성공 결과를 캐시에서 반환합니다.")
                return {
                    **_last_successful_diagnosis,
                    "_was_self_healed": True,
                    "_healing_reason": "ConnectionError 후 캐시 fallback",
                }
            else:
                _healing_logger.log_recovery(
                    service="diagnosis_service",
                    error_type="ConnectionError",
                    action="fallback_to_safe_default",
                    result="degraded",
                    recovery_time_ms=0,
                )
                return {
                    "risk_score": "Unknown",
                    "source": "SelfHealing",
                    "detail": "⚠️ 진단 서비스가 자가 복구를 수행했습니다. 데이터 없이 안전한 기본값을 반환합니다.",
                    "_was_self_healed": True,
                }

        except Exception as e:
            _healing_logger.log_error(
                service="diagnosis_service",
                error=e,
                classification=classify_error(e),
            )
            print(f"🛑 [ERROR GENERAL] 예상치 못한 오류 발생: {type(e).__name__} - {str(e)}")

            # 캐시 fallback
            if _last_successful_diagnosis:
                _healing_logger.log_recovery(
                    service="diagnosis_service",
                    error_type=type(e).__name__,
                    action="fallback_to_cached_result",
                    result="degraded",
                    recovery_time_ms=0,
                )
                return {
                    **_last_successful_diagnosis,
                    "_was_self_healed": True,
                    "_healing_reason": f"{type(e).__name__} 후 캐시 fallback",
                }

            return {
                "risk_score": "Unknown",
                "source": "SelfHealing",
                "detail": f"⚠️ 자가 복구 완료: {type(e).__name__} 에러 발생 후 안전한 기본값을 반환합니다.",
                "_was_self_healed": True,
            }

    return None  # 이론적으로 도달 불가


# Step 3의 테스트를 위해, API 호출 시뮬레이션 함수도 함께 포함합니다.
def call_diagnosis_api(token: str):
    """외부 서비스와의 통신을 모방하는 Wrapper."""
    time.sleep(0.5) # 네트워크 지연 시뮬레이션

    # 임시 테스트 실패 유발 로직 (테스트 스크립트에서만 사용될 것이므로 주석 처리 가능하지만, 구조 설명을 위해 남김)
    if "initial_dummy_access" in token and hasattr(_auth_service, '_manual_fail'):
        raise ConnectionError("Simulated Token Failure: The provided token is expired/invalid.")

    return {"risk_score": "High", "source": "CRM", "detail": f"Analyzed using token ending {token[-4:]}"}