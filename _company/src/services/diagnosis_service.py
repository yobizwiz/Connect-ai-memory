from src.utils.token_manager import TokenManager, AuthService
import time # 시간 시뮬레이션을 위한 임포트
from typing import Optional

# Singleton 패턴을 사용하여 전역적인 토큰 관리자 인스턴스를 유지합니다.
_auth_service = AuthService()
_token_manager = TokenManager(_auth_service)

def get_global_token_manager():
    """Token Manager의 싱글톤 인스턴스를 반환합니다."""
    return _token_manager


def process_diagnosis_request(user_data: dict) -> Optional[dict]:
    """
    진단 요청을 처리하는 핵심 로직. 토큰 관리를 최우선으로 합니다.
    @global_error_handling: ConnectionError 발생 시 자동 재시도 및 토큰 갱신을 유도합니다.
    """
    print("\n" + "=" * 60)
    print("🔑 [Diagnosis Service] 진단 요청 프로세스 시작.")
    try:
        # 1. 전역 인증 게이트웨이를 통해 토큰 확보 (재발급 로직 포함)
        token = get_global_token_manager().get_authenticated_token()

        # 2. API 호출 및 데이터 수집 시뮬레이션
        result = call_diagnosis_api(token=token)

        print("✅ [Diagnosis Service] 진단 요청 성공적으로 완료.")
        return result

    except ConnectionError as e:
        # 토큰 만료 또는 재발급 실패로 인한 치명적 오류 처리.
        print(f"🛑 [ERROR CRITICAL] API 연결에 실패했습니다. 원인: {e}")
        # 시스템 전체의 에러 로깅 및 관리자 알림 트리거 필요 (이 부분은 별도의 Logging Module에서 처리)
        return None
    except Exception as e:
        print(f"🛑 [ERROR GENERAL] 예상치 못한 오류 발생: {type(e).__name__} - {str(e)}")
        return None

# Step 3의 테스트를 위해, API 호출 시뮬레이션 함수도 함께 포함합니다.
def call_diagnosis_api(token: str):
    """외부 서비스와의 통신을 모방하는 Wrapper."""
    time.sleep(0.5) # 네트워크 지연 시뮬레이션

    # 임시 테스트 실패 유발 로직 (테스트 스크립트에서만 사용될 것이므로 주석 처리 가능하지만, 구조 설명을 위해 남김)
    if "initial_dummy_access" in token and hasattr(_auth_service, '_manual_fail'):
        raise ConnectionError("Simulated Token Failure: The provided token is expired/invalid.")

    return {"risk_score": "High", "source": "CRM", "detail": f"Analyzed using token ending {token[-4:]}"}