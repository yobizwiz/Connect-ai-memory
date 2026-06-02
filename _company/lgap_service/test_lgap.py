import pytest
from lgap_service.api import calculate_lgap # 가정한 임포트 경로

def test_basic_calculation():
    """기본값으로 L_gap 계산을 테스트합니다."""
    # C_Downtime=100, P_Loss=49 (sqrt=7), R_Penalty=2 => 1 + 100 * 7 * 2 = 1401
    input_data = type('Input', (object,), {'c_downtime': 100.0, 'p_loss': 49.0, 'r_penalty': 2.0})()
    expected = 1401.0 # 계산 공식에 따라 기대값 설정
    assert calculate_lgap(input_data) == pytest.approx(expected)

def test_high_risk_scenario():
    """위험 변수가 모두 높을 때 L_gap가 기하급수적으로 증가하는지 검증합니다."""
    # C_Downtime=1000, P_Loss=900 (sqrt=30), R_Penalty=5 => 1 + 1000 * 30 * 5 = 1,500,001
    input_data = type('Input', (object,), {'c_downtime': 1000.0, 'p_loss': 900.0, 'r_penalty': 5.0})()
    expected = 1500001.0
    assert calculate_lgap(input_data) == pytest.approx(expected)

def test_zero_risk_scenario():
    """모든 변수가 0일 때, 최소 임계값이 정상적으로 적용되는지 검증합니다."""
    # 로직상 minimum threshold (50000.0)가 강제되므로 1로 계산되어도 50000이 나와야 함.
    input_data = type('Input', (object,), {'c_downtime': 0.0, 'p_loss': 0.0, 'r_penalty': 0.0})()
    assert calculate_lgap(input_data) == pytest.approx(50000.0)

def test_invalid_input_negative():
    """음수 입력값에 대한 예외 처리 및 가드 로직을 테스트합니다."""
    input_data = type('Input', (object,), {'c_downtime': 100.0, 'p_loss': -1.0, 'r_penalty': 2.0})()
    with pytest.raises(ValueError):
        calculate_lgap(input_data)