import pytest
from unittest.mock import MagicMock, patch
# API 라우터와 계산기가 있다고 가정하고 임포트합니다.
from src.api.v1.diagnosis_router import diagnose_endpoint # 가상의 엔드포인트 함수
from src.services import risk_calculator

# ----------------------------------------------------------------------
# 테스트 전 설정 (Mocking)
# 실제 API 호출을 막고, 로직 실행만 검증하기 위해 핵심 의존성을 Mock 합니다.
# ----------------------------------------------------------------------
@pytest.fixture(scope="module")
def mock_risk_calculator():
    """ risk_calculator 모듈 전체를 목킹합니다. """
    with patch('src.api.v1.diagnosis_router.risk_calculator') as Mock:
        yield Mock

# ----------------------------------------------------------------------
# 테스트 케이스 그룹 1: 성공적인 데이터 흐름 (Happy Path)
# ----------------------------------------------------------------------
def test_successful_diagnosis(mock_risk_calculator):
    """ 정상 데이터를 입력했을 때, API가 예상된 구조의 응답을 반환하는지 검증합니다. """
    # Mocking the successful return value from risk_calculator
    mock_risk_calculator.calculate_risk_score.return_value = 75 # 예시 점수

    test_data = {
        "industry": "Finance",
        "revenue_usd": "10000000",
        "employees": "150"
    }
    
    # 가상 API 호출 실행 (실제 함수가 diagnose_endpoint라고 가정)
    response = diagnose_endpoint(test_data=test_data)

    assert response["status_code"] == 200 # HTTP 성공 코드 가정
    assert "risk_score" in response
    assert isinstance(response["risk_score"], (int, float))
    assert response["advice"]["summary"].startswith("귀사의 위험 점수는")

# ----------------------------------------------------------------------
# 테스트 케이스 그룹 2: 클라이언트 입력 오류 처리 (400 Bad Request)
# ----------------------------------------------------------------------
def test_invalid_input_missing_field(mock_risk_calculator):
    """ 필수 필드가 누락된 경우, API가 400 에러와 함께 구조화된 메시지를 반환하는지 검증합니다. """
    test_data = {
        "industry": "Tech",
        # revenue_usd 누락
        "employees": "10"
    }

    response = diagnose_endpoint(test_data=test_data)

    assert response["status_code"] == 400 # Bad Request 확인
    assert "구조적 결함이 발견되었습니다" in response["message"]
    # Mocked calculator는 호출되지 않아야 함 (Short-circuiting check)
    mock_risk_calculator.calculate_risk_score.assert_not_called()

def test_invalid_input_type(mock_risk_calculator):
    """ 데이터 타입이 잘못된 경우 (예: revenue가 문자열인데 숫자가 아닌 경우), 400 에러를 검증합니다. """
    test_data = {
        "industry": "Retail",
        "revenue_usd": "ABCDEFGHIJK", # 유효하지 않은 숫자
        "employees": "50"
    }

    response = diagnose_endpoint(test_data=test_data)

    assert response["status_code"] == 400
    # 이 케이스는 로직 레벨에서 처리되므로, 역시 calculate_risk_score가 호출되지 않아야 함.
    mock_risk_calculator.calculate_risk_score.assert_not_called()


# ----------------------------------------------------------------------
# 테스트 케이스 그룹 3: 서버 내부 오류 처리 (500 Internal Server Error)
# ----------------------------------------------------------------------
def test_internal_server_failure(mock_risk_calculator):
    """ 리스크 계산 로직 자체에서 예상치 못한 예외가 발생했을 때, 시스템 에러 처리가 정상 작동하는지 검증합니다. """
    # Mocking the calculator to intentionally raise an unhandled exception
    mock_risk_calculator.calculate_risk_score.side_effect = ValueError("DB Connection Timeout")

    test_data = {
        "industry": "Finance",
        "revenue_usd": "10000000",
        "employees": "150"
    }

    response = diagnose_endpoint(test_data=test_data)

    assert response["status_code"] == 500 # Internal Server Error 확인
    # 사용자에게 보여주는 메시지가 '시스템적 생존 위협' 관련 공포 문구를 포함하는지 검증해야 함.
    assert "구조적 결함이 발생했습니다" in response["message"]