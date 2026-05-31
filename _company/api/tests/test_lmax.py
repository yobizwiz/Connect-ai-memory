import pytest
from unittest.mock import patch
# lmax_calculator는 현재 작업 디렉토리의 API 로직을 포함하고 있다고 가정합니다.
from lmax_calculator import LmaxInput, calculate_lmax


@pytest.fixture(scope="module")
def mock_weights():
    """테스트에 사용할 모의(Mock) 가중치 데이터셋을 반환합니다."""
    return {
        "schema_version": "2.0",
        "description": "Test Weights for Lmax Calculation.",
        "calculation_formula": "Total_Loss = (Base_Fine * Violation_Multiplier) + (PII_Leakage_Cost * PII_Volume) + (Operational_Downtime_Cost)",
        "regulations": [
            {
                "regulation_id": "GDPR",
                "name": "General Data Protection Regulation (EU)",
                "scope": "개인 식별 정보(PII)의 처리 및 데이터 주권.",
                "base_fine_rate": 0.4,
                "violation_multiplier": {"data_volume_factor": 1.5, "severity_factor": 2.0},
                "penalty_breakdown": [
                    {
                        "violation": "PII_Leakage",
                        "coefficient_Wfine": 150, # PII 건당 기본 벌금 증가 계수 ($) - 이 값이 사용됨
                        "risk_metric": "data_record_count",
                        "loss_type": "Financial Penalty & Civil Lawsuit"
                    }
                ],
            }
        ]


@patch("lmax_calculator.load_regulatory_weights")
def test_successful_lmax_calculation(mock_load, mock_weights):
    """[SUCCESS] 모든 입력값이 정상이고 데이터셋도 완벽한 경우의 Lmax 계산 검증."""
    # Mocking: load_regulatory_weights가 항상 mock_weights를 반환하도록 설정
    mock_load.return_value = mock_weights

    # 1. 테스트 입력값 정의 (PII=100건, Base Rate=0.2, Exposure=5시간)
    test_input = LmaxInput(pii_record_count=100, base_violation_rate=0.2, exposure_hours=5.0)

    # 2. 예상 계산 결과 수동 검증: PII (150*100) + Base (0.2*1000) + Op (5*5000) = 15000 + 200 + 25000 = 40200
    expected_lmax = 40200.0

    result = calculate_lmax(test_input)
    
    assert result.total_risk_score_lmax == expected_lmax
    assert result.calculation_details['PII_Leakage_Cost'] == 15000
    assert result.is_compliant is True # 40200 < 1,000,000

@patch("lmax_calculator.load_regulatory_weights")
def test_high_risk_exceeding_threshold(mock_load, mock_weights):
    """[WARNING] 위험 임계값을 초과하여 Non-Compliant 상태가 되는지 확인."""
    mock_load.return_value = mock_weights

    # 1. 테스트 입력값 정의 (의도적으로 큰 값을 주입)
    test_input = LmaxInput(pii_record_count=5000, base_violation_rate=0.9, exposure_hours=20.0)
    
    result = calculate_lmax(test_input)

    # 2. 예상 결과 검증: 총합은 1M을 훨씬 초과하므로 Non-Compliant가 되어야 함.
    assert result.total_risk_score_lmax > 1000000
    assert result.is_compliant is False


@patch("lmax_calculator.load_regulatory_weights")
def test_graceful_error_on_missing_data(mock_load):
    """[FAILURE] 핵심 데이터셋이 로드되지 않았을 때 (Graceful Handling) 테스트."""
    # Mocking: load_regulatory_weights가 빈 딕셔너리를 반환하도록 설정하여 KeyError 유발
    mock_load.return_value = {}

    test_input = LmaxInput(pii_record_count=1, base_violation_rate=0.1, exposure_hours=1.0)
    
    # calculate_lmax 내부에서 RuntimeError를 발생시키는지 검증해야 함
    with pytest.raises(RuntimeError) as excinfo:
        calculate_lmax(test_input)

    assert "필수 규제 가중치 데이터셋을 불러올 수 없습니다" in str(excinfo.value)


@patch("lmax_calculator.load_regulatory_weights")
def test_fatal_error_on_file_system_failure(mock_load):
    """[CRITICAL] 파일 시스템 오류 (FileNotFoundError 등)가 발생했을 때의 방어 테스트."""
    # Mocking: load_regulatory_weights가 FileNotFoundError를 강제하여 반환하도록 설정
    mock_load.side_effect = FileNotFoundError("Simulated file not found.")

    test_input = LmaxInput(pii_record_count=1, base_violation_rate=0.1, exposure_hours=1.0)
    
    # 이 경우 calculate_lmax 내부에서 RuntimeError가 발생하며, API 레벨에서는 503으로 처리되어야 함을 검증.
    with pytest.raises(RuntimeError) as excinfo:
        calculate_lmax(test_input)

    assert "Fatal Error" in str(excinfo.value)