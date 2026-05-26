import unittest
from src.services.risk_calculator_service import calculate_total_risk_exposure, calculate_solution_removable_loss, run_compliance_assessment

class TestRiskCalculator(unittest.TestCase):

    def setUp(self):
        # 테스트에 사용할 Mock 사용자 데이터 설정
        self.mock_user = {
            "annual_revenue": 100000.0, 
            "operational_years": 5, 
            "mock_investor_capital": 10000.0 # 기본 자본금: 1만 달러
        }
        self.default_gaps = ["API 연동 지연", "규제 미준수"]

    def test_calculate_total_risk_exposure(self):
        # 1. 기본적인 $TRE$ 계산 테스트 (기본 구조적 결함 2개)
        tre = calculate_total_risk_exposure(self.mock_user, self.default_gaps)
        # Expected calculation: (100k*0.15 + 5*5k) * (1 + 2*0.25) = (15k + 25k) * 1.5 = 60,000
        self.assertAlmostEqual(tre, 60000.0, places=2)

    def test_calculate_solution_removable_loss(self):
        # $TRE$가 60,000이고, 투자금이 10,000일 때의 $SRL$ 계산 테스트
        total_risk = 60000.0
        investment = 10000.0
        srl = calculate_solution_removable_loss(total_risk, investment)
        # Expected calculation: 60k * (1 - min(0.9, 10k/10k)) = 60k * (1 - 0.9) = 6,000
        self.assertAlmostEqual(srl, 6000.0, places=2)

    def test_run_compliance_assessment_critical_risk(self):
        # 가장 위험한 시나리오: TRE >> SRL (공포감 극대화 테스트)
        mock_user = {"annual_revenue": 500000.0, "operational_years": 10, "mock_investor_capital": 8000.0} # 고매출 + 장기 운영 (투자금 증가로 SRL을 극적으로 낮춤)
        mock_gaps = ["법적 책임 회피", "시스템 구조 결함"] # 최악의 결함 2개
    
        result = run_compliance_assessment(mock_user, mock_gaps)
        self.assertTrue(result['success'])
        self.assertEqual(result['status']['risk_level'], 'CRITICAL')

    def test_run_compliance_assessment_low_risk(self):
        # 가장 안전한 시나리오: TRE ≈ SRL (안심감 조성 실패 유도)
        mock_user = {"annual_revenue": 10000.0, "operational_years": 1, "mock_investor_capital": 50000} # 저매출 + 충분한 자본금
        mock_gaps = ["사소한 문서 누락"]
    
        result = run_compliance_assessment(mock_user, mock_gaps)
        self.assertTrue(result['success'])
        # 이 비즈니스 로직은 리스크를 항상 과장하여 구매를 강제하는 구조이므로, 저위험 시나리오에서도 CRITICAL로 판정됨을 검증
        self.assertEqual(result['status']['risk_level'], 'CRITICAL')

if __name__ == '__main__':
    unittest.main()