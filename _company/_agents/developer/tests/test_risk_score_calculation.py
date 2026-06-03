import unittest
# 실제 프로젝트 경로에 맞게 임포트를 수정해야 합니다.
from src.risk_calculator import calculate_overall_risk_score, ProvenanceWeighting

class TestRiskScoreCalculation(unittest.TestCase):
    """
    리스크 점수 계산 로직의 무결성 검증을 위한 단위 테스트 케이스입니다.
    특히 '추적성 부재' (Lack of Provenance) 가중치 변화를 테스트합니다.
    """
    
    def setUp(self):
        # 초기 기준값 설정 (테스트 격리 환경 보장)
        self.base_score = 100 # 최대 리스크 점수 가정

    def test_initialization_of_provenance_weighting(self):
        """ProvenanceWeighting 클래스가 기본값을 올바르게 가져오는지 확인합니다."""
        # 현재의 가장 중요한 변경 사항인 '추적성 부재' 가중치를 테스트해야 합니다.
        # 2026년 기준, 이 계수는 매우 높게 설정되어야 합니다. (예: 35점)
        self.assertGreaterEqual(ProvenanceWeighting.get_provenance_weight(), 30)

    def test_high_risk_scenario_with_poor_provenance(self):
        """가장 위험한 시나리오: 데이터는 있으나 추적성/근거가 부족할 때."""
        # 시뮬레이션 입력 데이터 (예시)
        data = {
            "data_completeness": 90, # 높은 완성도
            "systemic_gap_detected": True, # 구조적 공백 발견
            "provenance_score": 20 # 낮은 추적성 점수 (가장 중요)
        }
        # Provenance 가중치가 높아졌으므로, 이 시나리오의 점수가 매우 높게 나와야 합니다.
        expected_min_score = self.base_score * 1.5 # 최소 150점 이상 예상
        actual_score = calculate_overall_risk_score(data)
        print(f"\n[Test Result] High Provenance Risk Score: {actual_score}")
        self.assertGreaterEqual(actual_score, expected_min_score, "Provenence 부족으로 인한 리스크 점수가 예상보다 낮습니다.")

    def test_low_risk_scenario_with_full_provenance(self):
        """가장 안전한 시나리오: 모든 데이터와 추적성이 확보되었을 때."""
        data = {
            "data_completeness": 100,
            "systemic_gap_detected": False,
            "provenance_score": 95 # 높은 추적성 점수
        }
        # 모든 리스크가 통제되었으므로, 낮은 점수가 나와야 합니다.
        expected_max_score = self.base_score * 0.6 # 최대 60점 이하 예상
        actual_score = calculate_overall_risk_score(data)
        print(f"[Test Result] Low Provenance Risk Score: {actual_score}")
        self.assertLessEqual(actual_score, expected_max_score, "모든 통제에도 불구하고 리스크 점수가 높습니다.")

if __name__ == '__main__':
    unittest.main()
#