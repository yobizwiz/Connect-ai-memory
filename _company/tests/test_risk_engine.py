import unittest
from app.services.risk_engine import calculate_total_risk

class TestRiskEngine(unittest.TestCase):

    def test_zero_risk_scenario(self):
        """모든 위반이 0일 때, 위험 점수는 0이어야 한다."""
        regulatory = {"gdpr_violations": 0, "hipaa_violations": 0}
        legal = {"missed_revenue": 0.0, "litigation_risk": 0.0}
        operational = {"downtime_loss": 0.0, "staffing_gap_cost": 0.0}

        result = calculate_total_risk(regulatory, legal, operational)
        self.assertIsNotNone(result)
        self.assertEqual(result["F"], 0.0)
        self.assertEqual(result["C_L"], 0.0)
        self.assertEqual(result["C_O"], 0.0)
        self.assertEqual(result["TotalRiskExposure"], 0.0)

    def test_high_risk_scenario(self):
        """모든 요소가 최대치로 위험할 때, L_totalMax 값이 올바르게 합산되어야 한다."""
        # F: GDPR (10건 * $150) + HIPAA (2건 * $200) = 1500 + 400 = 1900.0
        regulatory = {"gdpr_violations": 10, "hipaa_violations": 2}
        # C_L: 미진행 매출 $50k + 소송 위험 $10k = 60,000.0
        legal = {"missed_revenue": 50000.0, "litigation_risk": 10000.0}
        # C_O: 다운타임 $20k + 인력 공백 $30k = 50,000.0
        operational = {"downtime_loss": 20000.0, "staffing_gap_cost": 30000.0}

        result = calculate_total_risk(regulatory, legal, operational)
        self.assertIsNotNone(result)
        # F: 1900.0 (정확히 계산되었는지 확인)
        self.assertEqual(result["F"], 1900.0)
        # C_L: 60000.0
        self.assertEqual(result["C_L"], 60000.0)
        # C_O: 50000.0
        self.assertEqual(result["C_O"], 50000.0)
        # Total Risk Exposure: 1900 + 60000 + 50000 = 111,900.0
        self.assertEqual(result["TotalRiskExposure"], 111900.0)

    def test_mixed_risk_scenario(self):
        """일부 요소만 위험할 때의 계산 검증."""
        regulatory = {"gdpr_violations": 5, "hipaa_violations": 0} # F: 750.0
        legal = {"missed_revenue": 0.0, "litigation_risk": 1000.0}  # C_L: 1000.0
        operational = {"downtime_loss": 500.0, "staffing_gap_cost": 0.0} # C_O: 500.0

        result = calculate_total_risk(regulatory, legal, operational)
        self.assertIsNotNone(result)
        # Total Risk Exposure: 750 + 1000 + 500 = 2250.0
        self.assertEqual(result["TotalRiskExposure"], 2250.0)


if __name__ == '__main__':
    unittest.main()