import pytest
from unittest.mock import MagicMock, patch
from risk_engine.score_calculator import RiskScoreEngine
from risk_engine.data_loader import load_compliance_dataset # 데이터 로딩 모듈 테스트용

# ==============================================================
# 1. Data Loader Test (Dependency Check)
# ==============================================================
def test_load_compliance_dataset_success():
    """데이터셋이 정상적으로 로드되는지 확인합니다."""
    # 실제 환경에서는 JSON 파일이 존재해야 합니다.
    loaded_data = load_compliance_dataset()
    assert isinstance(loaded_data, dict)
    # R001 키가 존재하는지 확인 (Researcher 데이터 기준)
    assert "R001" in loaded_data

def test_load_compliance_dataset_failure():
    """데이터 파일이 없거나 깨졌을 때 빈 딕셔너리를 반환하는지 테스트합니다."""
    # 임시로 가짜 경로를 만들어 실패 케이스를 시뮬레이션합니다.
    with patch('risk_engine.data_loader.DATASET_PATH', 'non_existent_path/test.json'):
        with patch('builtins.open', side_effect=FileNotFoundError):
            loaded_data = load_compliance_dataset()
            assert loaded_data == {}

# ==============================================================
# 2. Core Engine Test (Unit & Edge Case)
# ==============================================================
def test_engine_initialization_failure():
    """데이터셋이 비어있을 경우 엔진 초기화 자체가 실패하는지 테스트합니다."""
    with patch('risk_engine.score_calculator.__init__', side_effect=RuntimeError("Initialization failed")):
        with pytest.raises(RuntimeError):
            # 강제로 빈 데이터로 설정하여 에러 발생 유도
            MagicMock(return_value=None) # Mocking the dataset loader dependency

@pytest.fixture
def engine():
    """테스트에 사용할 RiskScoreEngine 인스턴스를 제공합니다."""
    # 실제 테스트 환경에서는 모든 의존성이 준비되어 있다고 가정합니다.
    return RiskScoreEngine()


def test_calculate_lmax_normal_case(engine: RiskScoreEngine):
    """정상적인 입력 값으로 Lmax를 계산하고, 예상 점수 범위에 근접한지 확인합니다."""
    # 시나리오: PII 사용 O, 데이터 저장 방식 클라우드 (가장 안전한 경우)
    user_inputs = {
        "has_pii": True, 
        "data_storage": "cloud", 
        "encryption": True, 
        "is_ai_compliant": True
    }
    result = engine.calculate_lmax(user_inputs)
    # PII (R001: $2.5M -> ~2.5 * 3.5) + Storage (0) + AI (1.0) = 약 11.25점 이상 예상
    assert result['Lmax_Total_Score'] >= 10.0
    assert "PII_Leakage_Risk" in result['Component_Scores']

def test_calculate_lmax_critical_case(engine: RiskScoreEngine):
    """최악의 시나리오 (PII 사용 + 온프레미스 + 암호화 안 함)로 Lmax를 계산합니다."""
    # 시나리오: PII 사용 O, 데이터 저장 방식 온프레미스, 암호화 X, AI 규정 미준수
    user_inputs = {
        "has_pii": True, 
        "data_storage": "onpremise", 
        "encryption": False, 
        "is_ai_compliant": False
    }
    result = engine.calculate_lmax(user_inputs)
    # PII (R001: $2.5M * 3.5) + Storage (3.5) + AI (3.0) = 약 14.75점 이상 예상
    assert result['Lmax_Total_Score'] > 14.0 # 높은 점수가 나오는지 검증

def test_calculate_lmax_empty_input():
    """아무런 입력 값도 주어지지 않았을 때 기본 안전 로직이 작동하는지 확인합니다."""
    user_inputs = {}
    engine = RiskScoreEngine()
    result = engine.calculate_lmax(user_inputs)
    # PII (R001: $2.5M * 1.0) + Storage (0) + AI (1.0) = 약 3.5점 예상
    assert result['Lmax_Total_Score'] < 5.0

def test_calculate_lmax_invalid_input_type():
    """입력 타입이 딕셔너리가 아닐 때 TypeError를 던지는지 확인합니다."""
    engine = RiskScoreEngine()
    with pytest.raises(TypeError):
        engine.calculate_lmax("This is not a dictionary")