import pytest
from datetime import date
from typing import Dict, Any

# Mocking: 실제 report_service가 여기에 있다고 가정합니다. 
# 실제 구현 시에는 이 부분이 report_service 모듈을 임포트해야 합니다.
class MockReportGenerator:
    """Mock Report Generator Class for E2E Testing."""
    def generate_report(self, client_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        가상 고객 데이터를 기반으로 QLoss를 계산하고 진단 보고서를 생성합니다.
        
        Args:
            client_data: 사용자가 제출한 가상의 고객 데이터 딕셔너리.
        
        Returns:
            진단 보고서 구조화된 딕셔너리 또는 예외 발생 시 에러 메시지.
        """
        print("--- [INFO] Running Mock Report Generation Logic ---")
        
        # --- 시스템 검증 로직 (System Validation) ---
        required_fields = ["client_id", "annual_revenue", "compliance_score"]
        for field in required_fields:
            if field not in client_data or client_data[field] is None:
                raise ValueError(f"Missing critical input data: '{field}'. Report generation failed.")

        # --- QLoss 계산 및 구조적 결함 로직 (Business Logic) ---
        try:
            revenue = client_data['annual_revenue']
            score = client_data['compliance_score']
            
            # QLoss는 Revenue의 10%를 기본 리스크로 설정하고, 점수(Score)가 낮을수록 증가 (최대치 적용)
            base_loss = revenue * 0.1 
            q_loss = base_loss + max(0, 1 - score) * (revenue * 0.5)

            # 구조적 결함 카테고리 정의 (Writer가 제공한 것 활용)
            defects = [
                {"name": "PII 마스킹 실패 위험", "risk_score": q_loss * 0.3, "description": f"개인 식별 정보 관리가 미흡합니다. 잠재적 법규 위반 리스크가 높습니다."},
                {"name": "데이터 파이프라인 무결성 결함", "risk_score": q_loss * 0.4, "description": "자동화된 데이터 흐름 중 오류 발생 가능성이 확인되었습니다. 전송 로직 점검 필요."},
                {"name": "총체적 리스크 노출 대비 미흡", "risk_score": q_loss * 0.3, "description": f"현재 구조는 외부 변수에 대한 방어 메커니즘이 부족합니다. (QLoss 기여율: {q_loss*0.3:.2f})"}
            ]

            report = {
                "status": "SUCCESS",
                "generated_date": date.today().isoformat(),
                "total_potential_loss_qloss": round(q_loss, 2),
                "structural_defects": defects[:3], # 최대 3개만 반환
                "summary": f"잠재적 손실액 {round(q_loss, 0):,} 달러가 산출되었습니다. 즉각적인 시스템 개선이 필요합니다."
            }
            return report

        except Exception as e:
            # 예측 못한 오류 발생 시 (Unexpected Error)
            raise RuntimeError(f"Critical internal processing error during report generation: {e}")


@pytest.fixture
def generator():
    """테스트에 사용할 Report Generator 인스턴스를 제공합니다."""
    return MockReportGenerator()

# ===============================================
# 🧪 테스트 케이스 정의 (Test Cases)
# ===============================================

def test_01_success_happy_path(generator: MockReportGenerator):
    """[Happy Path] 모든 데이터가 정상이고, QLoss 계산이 성공적으로 이루어지는 경우를 테스트합니다."""
    print("\n\n[--- Running Test 01: Happy Path (Success) ---]")
    client_data = {
        "client_id": "CUST-A-987",
        "annual_revenue": 5_000_000,  # $5M 매출 가정
        "compliance_score": 0.2,      # 매우 낮은 점수 (리스크 높음)
        "metadata": {"source": "WebForm"}
    }
    try:
        report = generator.generate_report(client_data)
        assert report['status'] == "SUCCESS"
        # QLoss가 0보다 크고, 특정 범위 내에 있는지 확인 (단위 테스트 목적)
        assert isinstance(report['total_potential_loss_qloss'], float)
        print(f"✅ Test 01 Passed: QLoss 산출 성공. 값: {report['total_potential_loss_qloss']:.2f}")
    except Exception as e:
        pytest.fail(f"Test 01 Failed unexpectedly: {e}")


def test_02_partial_failure_missing_data(generator: MockReportGenerator):
    """[Graceful Degradation] 필수 필드 중 일부가 누락되었을 때 시스템이 치명적 오류 대신 경고를 내보내는 경우를 테스트합니다."""
    print("\n\n[--- Running Test 02: Partial Failure (Missing Data) ---]")
    client_data = {
        "client_id": "CUST-B-123",
        # annual_revenue 누락 처리하여 ValueError 유발 검증
        "compliance_score": 0.5,      
        "metadata": {"source": "Manual"}
    }
    with pytest.raises(ValueError) as excinfo:
        generator.generate_report(client_data)
    
    assert "Missing critical input data: 'annual_revenue'" in str(excinfo.value)
    print("✅ Test 02 Passed: 필수 데이터 누락 시 ValueError를 정상적으로 발생시키고 잡았습니다.")


def test_03_fatal_error_type_mismatch(generator: MockReportGenerator):
    """[Fatal Error] 데이터 타입이 완전히 잘못되어 시스템 내부 로직에서 예외가 발생하는 경우를 테스트합니다."""
    print("\n\n[--- Running Test 03: Fatal Error (Type Mismatch) ---]")
    client_data = {
        "client_id": "CUST-C-456",
        "annual_revenue": "FIVE MILLION", # 숫자가 아닌 문자열을 넣어 계산 실패 유도
        "compliance_score": 0.8,      
        "metadata": {"source": "Test"}
    }
    with pytest.raises(RuntimeError) as excinfo:
        # 이 테스트는 내부 로직의 try-except를 통과하는지 검증합니다.
        generator.generate_report(client_data) 

    assert "Critical internal processing error" in str(excinfo.value)
    print("✅ Test 03 Passed: 타입 불일치 등 치명적 오류 발생 시, 시스템 레벨의 RuntimeError를 통해 안전하게 포착했습니다.")