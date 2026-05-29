import unittest
from yobizwiz_backend.services.risk_engine import RiskEngineService
from yobizwiz_backend.models import UserProfileData, RegulationRiskScore, RiskMetricsOutput

class TestRiskEngine(unittest.TestCase):
    """
    리스크 엔진의 핵심 비즈니스 로직을 테스트하는 단위 인수 테스트 스위트입니다.
    규제 가중치 및 페널티 적용에 대한 무결성을 검증합니다.
    """
    def setUp(self):
        self.engine = RiskEngineService()

    # ----------------------------------------------
    # Test Case 1: Ideal/Low Risk Scenario (최소 리스크)
    # ----------------------------------------------
    def test_low_risk_scenario(self):
        """모든 규제에 대한 동의가 완벽하고, 민감 데이터가 없는 이상적인 시나리오."""
        profile = {
            "user_id": "test_safe",
            "data_storage_location": ["Cloud Safe Zone"], # 안전한 위치만 사용
            "has_consent": {"GDPR": True, "CCPA": True, "HIPAA": True}, # 모두 동의
            "data_type_inventory": {"PII": 10, "PHI": 0} # PHI 없음
        }
        # Expectation: 모든 규제 점수가 매우 낮게 나와야 함 (가장 안전한 상태)
        result = self.engine.calculate_risk(profile)

        self.assertLessEqual(result.total_risk_exposure(TRE), 10.0, "Low risk score should be near zero.")
        self.assertEqual(result.violation_count, 0, "Should detect zero violations in ideal scenario.")


    # ----------------------------------------------
    # Test Case 2: High Risk Scenario (최대 리스크)
    # ----------------------------------------------
    def test_high_risk_scenario(self):
        """동의가 누락되고, PHI와 온프레미스에 저장된 데이터로 최대 리스크를 유발하는 시나리오."""
        profile = {
            "user_id": "test_critical",
            "data_storage_location": ["On-Premise Server"], # 온프레미스 (리스크 증폭)
            "has_consent": {"GDPR": False, "CCPA": False, "HIPAA": False}, # 모두 미동의 (최대 페널티)
            "data_type_inventory": {"PII": 50, "PHI": 2} # PHI 존재
        }
        # Expectation: TRE가 매우 높게 나와야 하며, 위반 카운트도 최대여야 함.
        result = self.engine.calculate_risk(profile)

        self.assertGreaterEqual(result.total_risk_exposure(TRE), 60.0, "High risk score must exceed a critical threshold.")
        self.assertEqual(result.violation_count, 3, "Must detect violation for all three major regulations.")


    # ----------------------------------------------
    # Test Case 3: Specific Failure Scenario (GDPR 위반만)
    # ----------------------------------------------
    def test_specific_gdpr_failure(self):
        """GDPR 관련 문제를 일으키는 조건만 테스트."""
        profile = {
            "user_id": "test_gdpr",
            "data_storage_location": ["On-Premise Server"], # GDPR 리스크 증폭 요인
            "has_consent": {"GDPR": False, "CCPA": True, "HIPAA": True}, # GDPR만 위반
            "data_type_inventory": {"PII": 10, "PHI": 0}
        }
        result = self.engine.calculate_risk(profile)

        # GDPR 점수가 다른 규제보다 월등히 높아야 함을 검증 (가중치 확인)
        gdpr_score = next(r for r in result.risk_scores if r.regulation == "GDPR").score
        self.assertTrue(gdpr_score > 30.0, f"GDPR score ({gdpr_score}) should be significantly high.")


if __name__ == "__main__":
    # 이 스크립트를 직접 실행하여 테스트할 수 있습니다.
    unittest.main()