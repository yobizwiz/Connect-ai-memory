import time
from typing import Optional, Dict, Any

# --- Mock API Services (실제 서비스 호출 로직을 대체하는 시뮬레이션) ---
class AuthService:
    """인증/인가 토큰 관리 및 재발급 역할을 담당하는 모의 서비스."""
    def __init__(self):
        # 초기 세팅값. 실제 환경에서는 .env나 Vault에서 로드해야 함.
        self._access_token = "initial_dummy_access_token"
        self._refresh_token = "super_secret_refresh_token"
        self._expiry_time = time.time() + 3600  # 1시간 후 만료 설정 (테스트를 위해 짧게 설정할 수도 있음)

    def get_access_token(self) -> str:
        """현재 유효한 Access Token을 반환합니다."""
        if time.time() >= self._expiry_time:
            print("[TokenManager] 🚨 ACCESS TOKEN 만료 감지. 자동 재발급 시도...")
            # 토큰이 만료되었다면, 재발급 프로세스를 강제 호출합니다.
            self._refresh_token_internal()
        return self._access_token

    def _refresh_token_internal(self) -> str:
        """Refresh Token을 사용하여 새로운 Access Token과 Expiry Time을 가져옵니다."""
        # 실제 API 호출 시뮬레이션 (여기서 네트워크 에러 처리가 중요합니다.)
        try:
            # 1. Refresh Endpoint를 통해 토큰 교환 요청 시뮬레이션
            new_token = f"refreshed_access_{int(time.time())}"
            new_expiry = time.time() + 3600 # 재발급 후 다시 1시간 유효하도록 설정

            # 2. 내부 상태 업데이트
            self._access_token = new_token
            self._expiry_time = new_expiry
            print(f"[TokenManager] ✅ 토큰 재발급 성공. 새 만료 시간: {new_expiry:.0f}")
            return new_token
        except Exception as e:
            # 재발급 실패는 치명적인 에러이므로, 명확하게 로그를 남기고 예외를 발생시켜야 함.
            print(f"[TokenManager] ❌ [CRITICAL ERROR] 토큰 재발급 실패: {e}")
            raise ConnectionError("Authentication Failure: Refresh token is invalid or service is unavailable.")


class TokenManager:
    """시스템 전역의 인증 및 에러 핸들링 레이어."""
    def __init__(self, auth_service: AuthService):
        self.auth_service = auth_service

    def get_authenticated_token(self) -> str:
        """토큰을 가져오고 만료 여부를 확인하여 재발급까지 책임지는 메인 게이트웨이."""
        return self.auth_service.get_access_token()

# --- 예시 사용법 (진단 요청 API 호출 시뮬레이션) ---
def call_diagnosis_api(token: str, auth_service: Optional[AuthService] = None):
    """특정 외부 서비스(예: CRM, Regulatory DB)를 호출하는 함수."""
    print("-" * 50)
    print(f"[API CALL] 진단 요청 API 호출 시작. 사용 토큰: {token[:10]}...")
    # 실제 HTTP 요청 로직이 들어가는 부분 (requests 라이브러리 등)
    target_service = auth_service or AuthService()
    if "dummy_access" in token and time.time() > target_service._expiry_time + 5:
        raise ConnectionError("API 호출 시점 오류 발생! 토큰이 유효하지 않습니다.")

    # 성공적으로 데이터가 반환되었다고 가정합니다.
    return {"risk_score": "High", "source": "CRM"}