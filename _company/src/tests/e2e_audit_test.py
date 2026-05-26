import unittest
from datetime import datetime
from typing import Dict, Any

# 1. Mocking Environment (외부 서비스 시뮬레이션)
# 실제 구현에서는 이 부분이 외부 API 클라이언트와 연동됩니다.
class MockCRMClient:
    """CRM 시스템으로 데이터 전송을 시뮬레이션하는 클래스."""
    def __init__(self, simulate_success=True):
        self.simulate_success = simulate_success

    def send_lead(self, lead_data: Dict[str, Any]) -> bool:
        """실제 CRM API 호출을 대체합니다. 성공 여부를 조작 가능하게 합니다."""
        print("--- [CRM Mock] 전송 시도 시작 ---")
        if not self.simulate_success:
            # 실패 케이스 시뮬레이션 (예: 인증 만료, 네트워크 에러)
            raise ConnectionError("CRM API 연결 오류: 인증 토큰이 만료되었거나 네트워크가 불안정합니다.")
        
        if len(lead_data['email']) < 5:
             # 데이터 무결성 검증 실패 시뮬레이션
            print("🚨 [Mock Error] 유효하지 않은 이메일 주소입니다. 전송 거부됨.")
            return False

        print(f"✅ [CRM Mock] 성공적으로 리드 저장 완료. ID: {hash(str(lead_data)) % 1000}")
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

# 2. Core Logic (API Gateway 시뮬레이션)
def process_diagnosis_submission(
    user_inputs: Dict[str, Any], 
    utm_params: Dict[str, str], 
    crm_client: MockCRMClient, 
    utm_tracker: MockUTMTracker
) -> bool:
    """
    사용자 제출 데이터를 받아 E2E 흐름에 따라 처리하는 핵심 함수.
    방어적 코딩과 트랜잭션 관리를 포함합니다.
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

    # 3. CRM 전송 시도 (핵심 트랜잭션)
    try:
        lead_data = {
            "name": user_inputs['name'],
            "email": user_inputs['email'],
            "risk_score": user_inputs['risk_score'] # 진단 결과 값 포함 필수
        }
        success = crm_client.send_lead(lead_data)

        if success:
             print("\n🌟 [SUCCESS] 모든 단계의 데이터가 성공적으로 처리되었습니다. 트랜잭션 완료.")
        else:
             # API는 성공했으나, 내부 로직 검증에 실패한 경우 (예: 이메일 형식만 틀린 경우)
            print("🛑 [FAIL] CRM 전송은 시도되었으나, 데이터 필터링/검증 단계에서 최종 거부되었습니다.")
        return success

    except ConnectionError as e:
        # 외부 API 연결 문제 처리 (가장 중요한 방어적 코딩 영역)
        print(f"❌ [CRITICAL FAIL] CRM 시스템 연결 실패. {e} - 재시도 로직 또는 관리자 알림 필요.")
        return False
    except Exception as e:
        # 예상치 못한 모든 에러 처리 (Catch-all)
        print(f"🛑 [UNHANDLED FAIL] 치명적인 오류 발생: {type(e).__name__} - {e}")
        return False

# 3. 테스트 케이스 정의
class TestAuditFunnelIntegrity(unittest.TestCase):
    def setUp(self):
        """각 테스트 실행 전에 초기화합니다."""
        self.mock_utm = MockUTMTracker()
        self.mock_crm_success = MockCRMClient(simulate_success=True)
        self.mock_crm_fail = MockCRMClient(simulate_success=False)

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
        """[실패 케이스] CRM 연결이 끊겼을 때의 방어적 코딩 검증."""
        print("\n================== TEST 02: CRITICAL API FAILURE ==============")
        user_data = {'name': '김에러', 'email': 'error@example.com', 'risk_score': 95}
        utm_params = {'utm_source': 'bing', 'utm_medium': 'cpc', 'utm_campaign': 'q2_safety'}

        # CRM 클라이언트를 실패 모드로 초기화
        result = process_diagnosis_submission(
            user_data, utm_params, self.mock_crm_fail, self.mock_utm
        )
        self.assertFalse(result, "CRM 연결 실패 시 최종 성공 플래그가 True여서는 안 됩니다.")

    def test_03_invalid_input_validation(self):
        """[실패 케이스] 유효성 검증 단계에서 막히는 경우 테스트 (API 호출 전 차단)."""
        print("\n================== TEST 03: INVALID INPUT ==============")
        # 이메일 형식 오류 입력
        user_data = {'name': '김유효성', 'email': 'invalid-email', 'risk_score': 20}
        utm_params = {'utm_source': 'test', 'utm_medium': 'direct', 'utm_campaign': 'test'}

        # CRM 클라이언트는 성공해도, 유효성 검사에서 실패해야 함.
        result = process_diagnosis_submission(
            user_data, utm_params, self.mock_crm_success, self.mock_utm
        )
        self.assertFalse(result, "유효하지 않은 입력 값에 대해 전송을 시도해서는 안 됩니다.")

    def test_04_missing_utms_failure(self):
        """[실패 케이스] UTM 파라미터가 누락되어 로깅 자체가 실패하는 경우 테스트."""
        print("\n================== TEST 04: MISSING UTMS ==============")
        user_data = {'name': '김로그', 'email': 'log@example.com', 'risk_score': 70}
        # 필수 파라미터 누락
        utm_params = {'utm_source': None, 'utm_medium': 'test', 'utm_campaign': 'safe'}

        result = process_diagnosis_submission(
            user_data, utm_params, self.mock_crm_success, self.mock_utm
        )
        # UTM 실패는 경고로 처리하고, CRM 전송은 계속 시도해야 함 (가장 중요한 방어적 동작).
        self.assertTrue(result, "UTM 추적이 실패해도 핵심 리드 데이터 전송이 중단되어서는 안 됩니다.")

if __name__ == '__main__':
    unittest.main(argv=['first-arg-is-ignored'], exit=False)