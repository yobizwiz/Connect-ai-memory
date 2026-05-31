import unittest
from src.risk_engine.risk_engine import RiskEngine, load_dummy_data

class TestRiskEngine(unittest.TestCase):
    """
    RiskEngine의 L_max 계산 로직과 데이터 처리 흐름을 검증합니다.
    모든 테스트는 Zero-Defect 원칙에 따라 설계되었습니다.
    """

    def setUp(self):
        """각 테스트 전 초기화 작업 (Setup)"""
        self.engine = RiskEngine()
        # 더미 데이터를 로드하여 일관된 입력값을 사용합니다.
        self.dummy_data = load_dummy_data()
        # 테스트용 글로벌 매출액: 50억 원 가정 ($50,000,000)
        self.global_revenue = 50_000_000.0

    def test_successful_lmax_calculation(self):
        """
        [성공 케이스] 모든 데이터가 완벽하게 주입되었을 때의 L_max 계산 검증.
        V001: (50M * 0.05) + (2 * 2M) = 2.5M + 4M = $6,500,000
        """
        # V001의 예상 L_max를 직접 계산하여 테스트합니다.
        v001_model = self.dummy_data["ViolationScenarios"][0]["QuantifiableLossModel"]
        expected_lmax_v001 = 6500000.0 # $6,500,000

        # 테스트를 위해 임시 데이터셋을 만듭니다. V999는 오류 케이스로 제외합니다.
        test_data = {k: v for k, v in self.dummy_data.items() if k != "ViolationScenarios"}
        test_data["ViolationScenarios"] = [self.dummy_data["ViolationScenarios"][0]]

        result = self.engine.calculate_overall_risk(test_data, self.global_revenue)
        
        # 총합과 개별 시나리오의 Lmax를 검증합니다.
        self.assertGreater(result["TotalCalculatedLmax"], 0, "총 L_max가 계산되지 않았습니다.")
        
        scenario1 = result["ScenarioBreakdown"][0]
        self.assertEqual(scenario1["LmaxCalculated"], expected_lmax_v001, 
                         f"V001의 예상 L_max와 실제 값이 불일치합니다. 기대값: {expected_lmax_v001}")


    def test_missing_data_and_robustness(self):
        """
        [안정성 케이스] 필수 데이터(N_Injured)가 누락되었을 때 시스템이 멈추지 않고 처리하는지 검증.
        V999: N_Injured 값이 없으므로, L_r_dam은 0으로 계산되어야 합니다.
        """
        # V999 (데이터 누락 시나리오) 테스트
        test_data = {k: v for k, v in self.dummy_data.items() if k != "ViolationScenarios"}
        test_data["ViolationScenarios"] = [self.dummy_data["ViolationScenarios"][2]] # V999

        result = self.engine.calculate_overall_risk(test_data, self.global_revenue)
        
        # V999의 예상 L_max: (50M * 0.01) + (0) = $500,000
        expected_lmax_v999 = 500000.0

        scenario_invalid = result["ScenarioBreakdown"][0]
        self.assertEqual(scenario_invalid["LmaxCalculated"], expected_lmax_v999,
                         f"데이터 누락 시 V999의 L_max가 올바르게 0으로 처리되지 않았습니다.")

    def test_empty_input_data(self):
        """빈 데이터 입력 시 예외 없이 기본 구조를 반환하는지 검증."""
        empty_data = {"ReportTitle": "Empty Test", "ViolationScenarios": []}
        result = self.engine.calculate_overall_risk(empty_data, self.global_revenue)

        self.assertEqual(result["TotalCalculatedLmax"], 0.0, "빈 시나리오 리스트는 총 L_max가 0이어야 합니다.")
        self.assertEqual(len(result["ScenarioBreakdown"]), 0, "시나리오 목록은 비어있어야 합니다.")


if __name__ == '__main__':
    unittest.main()