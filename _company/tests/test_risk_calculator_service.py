import pytest
from unittest.mock import MagicMock
# 절대 경로를 사용한다고 가정하고 임포트 (실제 프로젝트 구조에 맞게 수정 필요)
from src.services.risk_calculator_service import RiskCalculationEngine 

# @pytest.fixture는 테스트 환경을 설정하는 역할을 합니다.
@pytest.fixture
def engine():
    """RiskCalculationEngine 클래스 인스턴스를 제공합니다."""
    return RiskCalculationEngine()

# --- 성공 케이스 테스트 (Happy Path) ---
def test_low_risk_scenario(engine):
    """변수들이 모두 낮을 때, 점수가 선형적으로 증가하는지 확인한다. (기본값 검증)"""
    result = engine.calculate_tre_score(
        base_risk=50.0, l_residency=10.0, l_transfer=5.0, historical_compliance_score=0.9
    )
    assert result["final_score"] > 50.0 # 기본 리스크보다 높아야 함
    # L_residency와 L_transfer가 모두 작으므로 폭증이 미미할 것으로 예상
    assert result["synergy_multiplier"] < 100.0

def test_high_risk_scenario(engine):
    """두 변수가 동시에 크면, 점수가 기하급수적으로 폭증하는지 검증한다."""
    result = engine.calculate_tre_score(
        base_risk=50.0, l_residency=300.0, l_transfer=400.0, historical_compliance_score=0.6
    )
    # 폭발적인 시너지가 발생했는지 확인 (임의로 큰 값을 설정하여 검증)
    assert result["synergy_multiplier"] > 1000.0
    # 최종 점수도 매우 높은 값이 나와야 함
    assert result["final_score"] > 5000.0

# --- 실패 및 경계값 테스트 (Edge Case & Failure Path) ---
def test_missing_variables(engine):
    """L_residency 또는 L_transfer가 None일 때, 엔진이 안정적으로 기본값을 사용하고 계산하는지 검증한다."""
    result = engine.calculate_tre_score(
        base_risk=100.0, l_residency=None, l_transfer=50.0, historical_compliance_score=1.0
    )
    # None 값으로 인해 계산이 실패하지 않고 정상적인 점수가 나와야 함
    assert result["final_score"] > 100.0

def test_zero_input(engine):
    """모든 리스크 변수와 공백 손실이 0일 때, 최종 점수가 기본값에 가깝게 유지되는지 확인한다."""
    result = engine.calculate_tre_score(
        base_risk=100.0, l_residency=0.0, l_transfer=0.0, historical_compliance_score=1.0
    )
    # 시너지와 기여도가 모두 0에 가까워져야 함
    assert result["final_score"] == pytest.approx(100.0)

def test_invalid_input_error_handling(engine):
    """음수 리스크나 비정상적인 컴플라이언스 점수를 넣었을 때 ValueError를 발생시키는지 확인한다."""
    # 1. 음수 Base Risk 시도
    with pytest.raises(ValueError, match="Base risk must be non-negative"):
        engine.calculate_tre_score(base_risk=-10.0, l_residency=10.0, l_transfer=10.0, historical_compliance_score=1.0)

    # 2. 컴플라이언스 점수 초과 시도 (1.0 초과)
    with pytest.raises(ValueError, match="compliance score must be <= 1.0"):
        engine.calculate_tre_score(base_risk=50.0, l_residency=10.0, l_transfer=10.0, historical_compliance_score=1.1)