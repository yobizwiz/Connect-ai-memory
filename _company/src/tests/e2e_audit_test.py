import unittest
from datetime import datetime
from typing import Dict, Any

# TokenManager 및 AuthService 통합 임포트
from src.utils.token_manager import TokenManager, AuthService

# 1. Mocking Environment (외부 서비스 시뮬레이션)
class MockCRMClient:
    """CRM 시스템으로 데이터 전송을 시뮬레이션하는 클래스. TokenManager와 연동하여 인증 과정을 검증합니다."""
    def __init__(self, token_manager: TokenManager, simulate_success=True, simulate_token_expiration=False):
        self.token_manager = token_manager
        self.simulate_success = simulate_success
        self.simulate_token_expiration = simulate_token_expiration
        self._token_expired_thrown = False  # 테스트용: 첫 번째 시도에서만 만료 에러를 던지기 위한 플래그

    def send_lead(self, lead_data: Dict[str, Any]) -> bool:
        """실제 CRM API 호출을 대체합니다. 토큰 유효성 및 전송을 검증합니다."""
        print("--- [CRM Mock] 전송 시도 시작 ---")
        
        # TokenManager를 통해 현재 활성화된 인증 토큰 획득
        token = self.token_manager.get_authenticated_token()
        print(f"[CRM Mock] API 호출에 사용된 인증 토큰: {token}")

        if not self.simulate_success:
            # 영구적인 물리적 연결 실패 케이스 시뮬레이션 (예: 네트워크 단선)
            raise ConnectionError("CRM API 연결 오류: 네트워크가 불안정합니다. (물리적 연결 실패)")
        
        if self.simulate_token_expiration and not self._token_expired_thrown:
            self._token_expired_thrown = True
            # 만료된 토큰으로 인한 API 인증 실패 시뮬레이션 (401 Unauthorized)
            print("[CRM Mock] 🚨 [401 에러] 인증 토큰이 만료되었습니다!")
            raise ConnectionError("CRM API 연결 오류: 인증 토큰이 만료되었거나 권한이 없습니다.")

        if len(lead_data['email']) < 5:
             # 데이터 무결성 검증 실패 시뮬레이션
            print("🚨 [Mock Error] 유효하지 않은 이메일 주소입니다. 전송 거부됨.")
            return False

        print(f"✅ [CRM Mock] 성공적으로 리드 저장 완료. ID: {hash(str(lead_data)) % 1000} (사용한 토큰: {token[-15:]})")
        return True

class MockUTMTracker:
    """UTM 파라미터 수집 및 로깅을 시뮬레이션하는 클래스."""
    def track(self, utm_params: Dict[str, str], source: str) -> bool:
        """실제 웹 트래픽 추적 시스템에 기록합니다."""
        print("--- [UTM Mock] 추적 데이터 로깅 시작 ---")
        if not utm_params.get('utm_source') or not utm_params.get('utm_campaign'):
            # 필수 UTM 파라미터 누락 검증 실패 시뮬레이션
            raise ValueError("필수 UTM 파라미터 (source, campaign)가 누락되어 로깅에 실패했습니다.")

        print(f"✅ [UTM Mock] 데이터 로깅 성공. 소스: {utm_params['utm_source']}, 캠페인: {utm_params['utm_campaign']}")
        return True

# 2. Core Logic (API Gateway 및 Submission Flow 시뮬레이션)
def process_diagnosis_submission(
    user_inputs: Dict[str, Any], 
    utm_params: Dict[str, str], 
    crm_client: MockCRMClient, 
    utm_tracker: MockUTMTracker,
    max_retries: int = 1
) -> bool:
    """
    사용자 제출 데이터를 받아 E2E 흐름에 따라 처리하는 핵심 함수.
    TokenManager를 통한 토큰 만료 자동 감지, 강제 갱신, 그리고 재시도 로직을 내장하고 있습니다.
    """
    print("\n=============================================")
    print("🚀 [Audit] Diagnosis Submission 프로세스 시작")
    print("=============================================")

    # 1. 유효성 검증 (Validation Gate)
    if not user_inputs.get('email') or '@' not in user_inputs['email']:
        print(f"🛑 [FAIL] 초기 입력 값 검증 실패: 유효한 이메일 주소가 아닙니다.")
        return False

    # 2. 트랜잭션 시작 (UTM 로깅 시도)
    try:
        utm_tracker.track(utm_params, source="landing_page")
    except Exception as e:
        print(f"🚨 [WARNING] UTM 추적 실패 ({e}). 리드 데이터는 계속 진행하되, 로그가 누락될 수 있습니다.")
        # Critical Failure가 아니므로 경고만 남기고 진행 (Graceful Degradation)

    # 3. CRM 전송 시도 및 자동 재시도 루프 (Token-Aware Retry Mechanism)
    lead_data = {
        "name": user_inputs['name'],
        "email": user_inputs['email'],
        "risk_score": user_inputs['risk_score'] # 진단 결과 값 포함 필수
    }

    attempt = 0
    while attempt <= max_retries:
        try:
            attempt += 1
            if attempt > 1:
                print(f"[Submission] 🔄 재시도 진행 중... (시도 횟수: {attempt}/{max_retries + 1})")
            
            success = crm_client.send_lead(lead_data)

            if success:
                 print("\n🌟 [SUCCESS] 모든 단계의 데이터가 성공적으로 처리되었습니다. 트랜잭션 완료.")
            else:
                 # API는 성공했으나, 내부 로직 검증에 실패한 경우
                print("🛑 [FAIL] CRM 전송은 시도되었으나, 데이터 필터링/검증 단계에서 최종 거부되었습니다.")
            return success

        except ConnectionError as e:
            # 토큰 만료 에러인지 식별
            if "인증 토큰이 만료되었거나" in str(e) or "인증 토큰이 만료되었습니다" in str(e):
                if attempt <= max_retries:
                    print(f"🚨 [Token Recovery] 토큰 만료 오류 감지! 즉시 토큰을 강제 만료(갱신 대상 설정) 처리하고 다음 시도에서 재발급을 유도합니다.")
                    # TokenManager의 내부 AuthService 토큰 만료 시간을 현재 시점 이전으로 세팅하여
                    # 다음 get_authenticated_token() 호출 시 자동 갱신(AuthService._refresh_token_internal)이 격발되도록 합니다.
                    crm_client.token_manager.auth_service._expiry_time = 0 
                    continue
                else:
                    print(f"❌ [CRITICAL FAIL] 최대 재시도 횟수({max_retries + 1})를 초과하여 토큰 만료 복구에 실패했습니다. {e}")
                    return False
            else:
                # 일반적인 네트워크/서버 물리적 장애의 경우 즉시 실패 처리 및 로깅
                print(f"❌ [CRITICAL FAIL] CRM 시스템 물리적 연결 실패. {e} - 관리자 알림 및 시스템 로그 기록 필요.")
                return False

    return False

# 3. 테스트 케이스 정의
class TestAuditFunnelIntegrity(unittest.TestCase):
    def setUp(self):
        """각 테스트 실행 전에 인증 및 토큰 매니저 환경을 초기화합니다."""
        self.mock_utm = MockUTMTracker()
        
        # 전역 인증 및 토큰 관리 시스템 Mock 인스턴스화
        self.auth_service = AuthService()
        self.token_manager = TokenManager(self.auth_service)
        
        # 각각의 시나리오별 CRM 클라이언트 초기화
        self.mock_crm_success = MockCRMClient(self.token_manager, simulate_success=True)
        self.mock_crm_fail = MockCRMClient(self.token_manager, simulate_success=False)
        self.mock_crm_token_expired = MockCRMClient(self.token_manager, simulate_success=True, simulate_token_expiration=True)

    def test_01_perfect_flow_integrity(self):
        """[성공 케이스] 모든 데이터가 완벽하게 전송되는 표준 흐름 테스트."""
        print("\n================== TEST 01: PERFECT FLOW ==============")
        user_data = {'name': '김테스트', 'email': 'test@example.com', 'risk_score': 85}
        utm_params = {'utm_source': 'google', 'utm_medium': 'cpc', 'utm_campaign': 'q2_safety'}

        result = process_diagnosis_submission(
            user_data, utm_params, self.mock_crm_success, self.mock_utm
        )
        self.assertTrue(result, "Perfect flow에서 데이터 전송에 실패해서는 안 됩니다.")

    def test_02_critical_api_failure_handling(self):
        """[실패 케이스] CRM 연결이 물리적으로 끊겼을 때의 안전한 실패 처리 검증."""
        print("\n================== TEST 02: CRITICAL API FAILURE ==============")
        user_data = {'name': '김에러', 'email': 'error@example.com', 'risk_score': 95}
        utm_params = {'utm_source': 'bing', 'utm_medium': 'cpc', 'utm_campaign': 'q2_safety'}

        # CRM 클라이언트를 영구 실패 모드로 수행
        result = process_diagnosis_submission(
            user_data, utm_params, self.mock_crm_fail, self.mock_utm
        )
        self.assertFalse(result, "CRM 영구 연결 실패 시 최종 성공 플래그가 True여서는 안 됩니다.")

    def test_03_invalid_input_validation(self):
        """[실패 케이스] 유효성 검증 단계에서 막히는 경우 테스트 (API 호출 전 차단)."""
        print("\n================== TEST 03: INVALID INPUT ==============")
        user_data = {'name': '김유효성', 'email': 'invalid-email', 'risk_score': 20}
        utm_params = {'utm_source': 'test', 'utm_medium': 'direct', 'utm_campaign': 'test'}

        result = process_diagnosis_submission(
            user_data, utm_params, self.mock_crm_success, self.mock_utm
        )
        self.assertFalse(result, "유효하지 않은 입력 값에 대해 전송을 시도해서는 안 됩니다.")

    def test_04_missing_utms_failure(self):
        """[실패 케이스] UTM 파라미터가 누락되었으나 리드 데이터는 안전하게 구제되어 전송되는 경우 테스트."""
        print("\n================== TEST 04: MISSING UTMS ==============")
        user_data = {'name': '김로그', 'email': 'log@example.com', 'risk_score': 70}
        utm_params = {'utm_source': None, 'utm_medium': 'test', 'utm_campaign': 'safe'}

        result = process_diagnosis_submission(
            user_data, utm_params, self.mock_crm_success, self.mock_utm
        )
        self.assertTrue(result, "UTM 추적이 실패해도 핵심 리드 데이터 전송이 중단되어서는 안 됩니다.")

    def test_05_token_expiration_auto_retry(self):
        """[자가 복구 케이스] API 호출 시 토큰 만료가 감지되었을 때, 자동으로 토큰을 재발급하여 재시도에 성공하는 시나리오 검증."""
        print("\n================== TEST 05: TOKEN EXPIRATION AUTO-RETRY ==============")
        user_data = {'name': '김복구', 'email': 'recovery@example.com', 'risk_score': 88}
        utm_params = {'utm_source': 'facebook', 'utm_medium': 'social', 'utm_campaign': 'q2_safety'}

        # 첫 번째 시도 시 토큰 만료를 시뮬레이션하고, 자동 복구 후 전송 성공하도록 처리
        result = process_diagnosis_submission(
            user_data, utm_params, self.mock_crm_token_expired, self.mock_utm, max_retries=1
        )
        self.assertTrue(result, "토큰이 1회 만료되었더라도 자동 재발급 및 재시도를 통해 최종 성공해야 합니다.")

if __name__ == '__main__':
    unittest.main(argv=['first-arg-is-ignored'], exit=False)
