import unittest
from datetime import datetime
# 로컬 파일 경로를 사용한다고 가정합니다. 실제 프로젝트 구조에 맞게 수정 필요할 수 있습니다.
from src.api.v1.services.report_service import generate_mock_report, calculate_qloss
from src.api.v1.schemas.audit_schema import AuditDataSchema

class TestMockReportGenerator(unittest.TestCase):
    """
    Mock Report Generator의 End-to-End 통합 테스트 케이스.
    가상의 고객 데이터 입력부터 QLoss 산출, 최종 보고서 JSON 구조 검증까지 포함합니다.
    """

    def setUp(self):
        # 1. 가상의 고객 데이터를 준비 (테스트 시나리오)
        self.mock_input_data = {
            "client_name": "Alpha Corp",
            "industry": "FinTech",
            "years_in_operation": 7,
            "regulatory_exposure_score": 0.85, # 높은 위험 노출도 가정
            "process_documentation_level": 3, # 중간 수준의 문서화만 되어 있음
            "staff_training_frequency": "Annually", # 빈번하지 않음
            "data_storage_compliance": False # 가장 치명적인 결함 유발 항목
        }
        self.schema = AuditDataSchema()

    def test_01_input_validation(self):
        """Step 1: 입력 데이터 스키마 검증 테스트"""
        print("--- Test 01: Input Validation ---")
        try:
            # 실제 환경에서는 API 게이트웨이가 이 역할을 수행하지만, 단위 테스트로 선행 검증
            validated_data = self.schema(**self.mock_input_data)
            self.assertIsInstance(validated_data, dict)
            print("✅ Input data validation successful.")
        except Exception as e:
            self.fail(f"Input data validation failed: {e}")

    def test_02_qloss_calculation(self):
        """Step 2: 총 잠재적 손실 (QLoss) 산출 테스트"""
        print("\n--- Test 02: QLoss Calculation ---")
        # service layer의 핵심 비즈니스 로직 검증
        calculated_loss = calculate_qloss(self.mock_input_data)

        # QLoss는 반드시 특정 범위 내에 있어야 함 (예시 가정)
        self.assertIsInstance(calculated_loss, float)
        self.assertTrue(100000 <= calculated_loss <= 5000000, f"QLoss가 예상 범위를 벗어남: {calculated_loss}")
        print(f"✅ QLoss calculation successful. Calculated Loss: ${int(calculated_loss):,}")

    def test_03_full_report_generation_e2e(self):
        """Step 3: E2E 최종 보고서 생성 및 구조 검증 (핵심 목표)"""
        print("\n--- Test 03: Full Report Generation E2E ---")
        # 서비스 레이어의 핵심 함수 호출
        report = generate_mock_report(self.mock_input_data, calculated_loss)

        # 보고서 구조 검증 (Authority Level Check)
        self.assertIsInstance(report, dict)
        self.assertIn('executive_summary', report)
        self.assertIn('potential_losses', report)
        self.assertIn('structural_defects', report)

        # 3가지 핵심 결함 존재 확인 (Critical Check)
        defects = report['structural_defects']
        self.assertTrue(len(defects) >= 3, f"필수 3가지 구조적 결함이 발견되지 않았습니다. 발견된 개수: {len(defects)}")

        # QLoss와 보고서의 일관성 검증 (Consistency Check)
        report_qloss = report['potential_losses'].get('total_estimated_loss', 0)
        self.assertAlmostEqual(calculated_loss, report_qloss, delta=1000, msg="QLoss가 보고서의 잠재적 손실과 불일치합니다.")

        print("✅ E2E Report Generation successful. Authority Level: MAX.")
        # 최종 결과물을 확인하기 위해 리포트 일부를 출력
        print("\n--- [Generated Mock Report Preview] ---")
        print(f"Client: {report['metadata']['client_name']}")
        print(f"Total Potential Loss (QLoss): ${int(report['potential_losses']['total_estimated_loss']):,}")
        print("------------------------------------")

if __name__ == '__main__':
    unittest.main()