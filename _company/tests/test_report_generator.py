import unittest
from datetime import datetime
from src.api.v1.services.report_service import generate_mock_audit_report
from src.api.v1.schemas.audit_schema import AuditRequest, AuditReport

class TestMockReportGenerator(unittest.TestCase):
    """
    Mock Report Generator의 End-to-End 통합 테스트 케이스.
    실제 구현된 AuditRequest, AuditReport, generate_mock_audit_report를 검증합니다.
    """

    def setUp(self):
        # 1. 가상의 고객 데이터를 준비 (테스트 시나리오)
        self.mock_input_data = {
            "client_name": "Alpha Corp",
            "industry_sector": "금융",
            "regulatory_concern": "감사 추적",
            "current_process_description": "레거시 프로세스 기반 운영 중"
        }

    def test_01_input_validation(self):
        """Step 1: 입력 데이터 스키마 검증 테스트"""
        print("--- Test 01: Input Validation ---")
        try:
            # AuditRequest Pydantic 모델의 유효성 검증
            validated_data = AuditRequest(**self.mock_input_data)
            self.assertEqual(validated_data.client_name, "Alpha Corp")
            self.assertEqual(validated_data.industry_sector, "금융")
            self.assertEqual(validated_data.regulatory_concern, "감사 추적")
            print("✅ Input data validation successful.")
        except Exception as e:
            self.fail(f"Input data validation failed: {e}")

    def test_02_full_report_generation_e2e(self):
        """Step 2: E2E 최종 보고서 생성 및 구조 검증"""
        print("\n--- Test 02: Full Report Generation E2E ---")
        request = AuditRequest(**self.mock_input_data)
        
        # 서비스 레이어의 핵심 함수 호출
        report = generate_mock_audit_report(request)

        # 보고서 구조 검증
        self.assertIsInstance(report, AuditReport)
        self.assertTrue(report.overall_risk_score >= 4.0)
        self.assertIn(report.compliance_status, ["High Risk", "Moderate Risk", "Compliant"])
        
        # 핵심 키워드("PII", "감사 추적" 등) 및 "레거시" 포함으로 인한 High Risk 상태 점수 검증
        # Alpha Corp(5.0) + 감사 추적(1.5) + 레거시(2.0) = 8.5점 -> High Risk
        self.assertEqual(report.compliance_status, "High Risk")
        self.assertTrue(len(report.critical_vulnerabilitys) >= 2)
        self.assertTrue(len(report.recommendations) >= 2)

        print("✅ E2E Report Generation successful.")
        print("\n--- [Generated Mock Report Preview] ---")
        print(f"Report ID: {report.report_id}")
        print(f"Risk Score: {report.overall_risk_score}/10")
        print(f"Compliance Status: {report.compliance_status}")
        print("------------------------------------")

if __name__ == '__main__':
    unittest.main()