import unittest
from typing import List, Dict, Any
# 방금 만든 모듈을 임포트합니다.
from src.services.compliance_engine import ComplianceEngine, RiskItem

class TestComplianceEngine(unittest.TestCase):
    """
    ComplianceEngine의 핵심 로직이 비즈니스 규칙과 일치하는지 검증합니다.
    """

    def setUp(self):
        """테스트 실행 전마다 새로운 Engine 인스턴스를 초기화합니다."""
        self.engine = ComplianceEngine()

    def test_high_risk_scenario_red_zone(self):
        """가장 위험한 시나리오 (Red Zone)를 강제하여 점수와 리스크 요약이 정상 작동하는지 확인."""
        # 법적/운영적으로 매우 치명적인 리스크 2개 설정
        high_risk_data: List[Dict] = [
            {"name": "GDPR Non-compliance", "detail": "EU 데이터 처리 규정 위반.", "category": "Regulatory", "impact": 10, "cost": 100000}, # 최고 가중치 예상
            {"name": "Anti-Money Laundering Failure", "detail": "국제 금융 규제 미준수. 즉각적 사업 중단 위험.", "category": "Regulatory", "impact": 9, "cost": 80000}
        ]
        mock_raw_data = {"potential_risks": high_risk_data}

        report = self.engine.analyze_compliance(mock_raw_data)

        # Red Zone이 나와야 함을 검증
        self.assertIn("Red Zone", report.overall_threat_level, "최고 리스크 상황에서 Red Zone 레벨이 나와야 합니다.")
        # 비용 합산이 정확해야 함을 검증 (float 비교 시 약간의 오차 허용)
        self.assertEqual(report.total_estimated_cost, 180000.0, "총 예상 비용 합계가 맞지 않습니다.")
        # 리스크 개수도 정상적으로 잡혔는지 확인
        self.assertEqual(len(report.total_unresolved_risk), 2, "Red Zone 시나리오에서 2개의 핵심 리스크만 포함되어야 합니다.")


    def test_low_risk_scenario_green_zone(self):
        """리스크가 거의 없어 Green Zone을 출력하고 비용이 최소화되는 경우를 테스트."""
        # Impact 점수 자체가 낮은 데이터로 구성
        low_risk_data: List[Dict] = [
            {"name": "Minor UI Bug", "detail": "단순 사용자 인터페이스 오류.", "category": "Operational", "impact": 2, "cost": 100},
            {"name": "Outdated Docs", "detail": "기술 문서가 최신화되지 않음.", "category": "Operational", "impact": 3, "cost": 500}
        ]
        mock_raw_data = {"potential_risks": low_risk_data}

        report = self.engine.analyze_compliance(mock_raw_data)

        # Green Zone이 나와야 함을 검증
        self.assertIn("Green Status", report.overall_threat_level, "저위험 상황에서 Green Status가 나와야 합니다.")
        # 비용은 최소화되어야 하며, 점수도 낮게 잡혀야 함 (Threshold 테스트)
        self.assertTrue(report.integrated_score < 30, f"점수가 너무 높습니다: {report.integrated_score}")


    def test_medium_risk_scenario_yellow_alert(self):
        """중간 정도의 리스크로 Yellow Alert를 받는 시나리오를 테스트."""
        # 법적/운영적으로 중간 수준의 위협 요소 1개 설정
        medium_risk_data: List[Dict] = [
            {"name": "Vendor API Dependency Risk", "detail": "핵심 기능을 외부 공급자 API에 의존하여 운영 위험 증가.", "category": "Operational", "impact": 6, "cost": 35000}
        ]
        mock_raw_data = {"potential_risks": medium_risk_data}

        report = self.engine.analyze_compliance(mock_raw_data)

        # Yellow Alert가 나와야 함을 검증
        self.assertIn("Yellow Alert", report.overall_threat_level, "중간 리스크 상황에서 Yellow Alert 레벨이 나와야 합니다.")


if __name__ == '__main__':
    unittest.main()
#