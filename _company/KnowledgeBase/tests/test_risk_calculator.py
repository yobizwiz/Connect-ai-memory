import unittest
from KnowledgeBase.services.risk_calculator import calculate_total_lmax_score, RISK_THRESHOLD
import json
import os

# 테스트 환경을 위해 Mock Schema 로딩 함수를 재정의합니다 (실제 파일 의존성 제거)
def mock_load_schema(data: dict):
    """테스트용 가짜 스키마 데이터를 사용하도록 오버라이드 합니다."""
    return data

class TestLMaxScoreCalculation(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        # 🚨 Setup: 테스트에 필요한 Mock Schema를 정의합니다.
        cls.mock_schema = {
          "schema_version": "v1.0",
          "description": "Mock test schema.",
          "risk_factors": [
            {
              "regulatory_theme": "AI Governance (인공지능 거버넌스)",
              "core_mandate": "Provenance Mandate",
              "failure_scenario": {
                "name": "Hallucination Risk",
                "impact_variables": {
                  # 가중치: 0.35
                  "hallucination_score": {"unit": "$", "range": "10M - 50M+", "details": "Test A", "weighting_factor": 0.35, "severity_level": "Critical"},
                  # 가중치: 0.20
                  "data_sovereignty_violation_count": {"unit": "$", "range": "1M - 5M+", "details": "Test B", "weighting_factor": 0.20, "severity_level": "High"}
                }
              }
            },
            {
              "regulatory_theme": "운영 복원력 (Operational Resilience)",
              "core_mandate": "Downtime Mitigation",
              "failure_scenario": {
                "name": "System Downtime",
                "impact_variables": {
                  # 가중치: 0.15
                  "operational_downtime_hours": {"unit": "$", "range": "0h - 24h+", "details": "Test C", "weighting_factor": 0.15, "severity_level": "Medium"}
                }
              }
            }
          ]
        }

    def test_score_calculation_passing(self):
        """테스트 케이스 1: 점수가 임계값(85점)보다 낮아 안전한 경우."""
        # 입력 값 설정: (9.2 * 0.35) + (5 * 0.20) + (48 * 0.15) = 3.22 + 1.0 + 7.2 = 11.42
        input_data = {
            'hallucination_score': 9.2,
            'data_sovereignty_violation_count': 5,
            'operational_downtime_hours': 48
        }
        # Mock 스키마를 직접 주입하여 calculate 함수 테스트 (Mocking for isolation)
        result = calculate_total_lmax_score(input_data, self.mock_schema)
        self.assertAlmostEqual(result['total_lmax_score'], 11.42, places=2)
        self.assertFalse(result['is_systemic_failure'])

    def test_score_calculation_failing(self):
        """테스트 케이스 2: 점수가 임계값(85점)을 초과하여 실패하는 경우."""
        # 고의로 높은 가중치를 부여한 입력값을 사용하여 강제로 100점 이상 만듭니다.
        input_data = {
            'hallucination_score': 100, # 매우 높게 설정 (가장 큰 영향)
            'data_sovereignty_violation_count': 50,
            'operational_downtime_hours': 50
        }
        # 계산: (100 * 0.35) + (50 * 0.20) + (50 * 0.15) = 35 + 10 + 7.5 = 52.5.
        # 목표 점수(85점)에 도달하지 못하므로, 임계값 자체를 수정하거나 입력값을 높여야 합니다.
        
        # -> 로직 검증을 위해 가중치를 재설정하여 강제 실패 시나리오를 만듭니다.
        self.mock_schema['risk_factors'][0]['failure_scenario']['impact_variables']['hallucination_score']['weighting_factor'] = 10.0
        self.mock_schema['risk_factors'][1]['failure_scenario']['impact_variables']['data_sovereignty_violation_count']['weighting_factor'] = 5.0
        self.mock_schema['risk_factors'][2]['failure_scenario']['impact_variables']['operational_downtime_hours']['weighting_factor'] = 1.0

        # 새 계산: (100 * 10) + (50 * 5) + (50 * 1) = 1000 + 250 + 50 = 1300
        result = calculate_total_lmax_score(input_data, self.mock_schema)
        self.assertAlmostEqual(result['total_lmax_score'], 1300.0, places=2)
        self.assertTrue(result['is_systemic_failure'])


    def test_missing_input_handling(self):
        """테스트 케이스 3: 입력 데이터에 필수 변수가 누락되었을 때 에러 없이 계산되는지 확인."""
        # 'hallucination_score'를 의도적으로 제거하고 테스트합니다.
        input_data = {
            'data_sovereignty_violation_count': 5,
            'operational_downtime_hours': 48
        }
        result = calculate_total_lmax_score(input_data, self.mock_schema)
        # 결과는 정상적으로 계산되어야 하며 (누락된 값은 무시), 예외가 발생하지 않아야 함.
        self.assertTrue(isinstance(result['total_lmax_score'], float))


if __name__ == '__main__':
    print("--- Running Unit Tests for LMax Score Calculation ---")
    unittest.main()