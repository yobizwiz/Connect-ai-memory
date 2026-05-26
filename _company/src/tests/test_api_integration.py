import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient

from src.main import app
from src.services.risk_calculator import DiagnosisResult

client = TestClient(app)

# ----------------------------------------------------------------------
# 테스트 전 설정 (Mocking)
# 실제 위험 점수 계산 로직 실행을 Mock 하기 위해 Fixture를 정의합니다.
# ----------------------------------------------------------------------
@pytest.fixture
def mock_calculate_risk():
    """ diagnosis_router 내의 calculate_systemic_risk 함수를 목킹합니다. """
    with patch('src.api.v1.diagnosis_router.calculate_systemic_risk') as mock:
        yield mock

# ----------------------------------------------------------------------
# 테스트 케이스 그룹 1: 성공적인 데이터 흐름 (Happy Path)
# ----------------------------------------------------------------------
def test_successful_diagnosis(mock_calculate_risk):
    """ 정상 데이터를 입력했을 때, API가 예상된 구조의 응답을 반환하는지 검증합니다. """
    # Mocking the successful return value
    mock_calculate_risk.return_value = DiagnosisResult(
        risk_score=75.0,
        status="Warning",
        severity_level="Yellow Zone - STRUCTURAL REVIEW RECOMMENDED"
    )

    payload = {
        "initial_threat_score": 50.0,
        "user_input_data": {
            "industry": "Finance",
            "revenue_usd": "10000000",
            "employees": "150"
        },
        "psychological_pressure_intensity": 2.0
    }
    
    response = client.post("/diagnosis/calculate", json=payload)

    assert response.status_code == 200
    res_data = response.json()
    assert "risk_score" in res_data
    assert res_data["risk_score"] == 75.0
    assert res_data["status"] == "Warning"
    assert "Yellow Zone" in res_data["severity_level"]

# ----------------------------------------------------------------------
# 테스트 케이스 그룹 2: 클라이언트 입력 오류 처리 (400 Bad Request)
# ----------------------------------------------------------------------
def test_invalid_input_missing_field(mock_calculate_risk):
    """ 필수 필드가 누락된 경우, API가 400 에러와 함께 구조화된 메시지를 반환하는지 검증합니다. """
    payload = {
        # "initial_threat_score" 누락
        "user_input_data": {
            "industry": "Tech",
            "employees": "10"
        },
        "psychological_pressure_intensity": 1.0
    }

    response = client.post("/diagnosis/calculate", json=payload)

    assert response.status_code == 400
    res_data = response.json()
    assert "구조적 결함이 발견되었습니다" in res_data["detail"]
    # Mocked calculator는 호출되지 않아야 함 (Short-circuiting check)
    mock_calculate_risk.assert_not_called()

def test_invalid_input_type(mock_calculate_risk):
    """ 데이터 타입이 잘못된 경우 (예: initial_threat_score가 숫자가 아닌 경우), 400 에러를 검증합니다. """
    payload = {
        "initial_threat_score": "ABCDEFGHIJK", # 유효하지 않은 숫자
        "user_input_data": {
            "industry": "Retail",
            "employees": "50"
        },
        "psychological_pressure_intensity": 1.0
    }

    response = client.post("/diagnosis/calculate", json=payload)

    assert response.status_code == 400
    res_data = response.json()
    assert "구조적 결함이 발견되었습니다" in res_data["detail"]
    # 역시 calculate_systemic_risk가 호출되지 않아야 함.
    mock_calculate_risk.assert_not_called()

# ----------------------------------------------------------------------
# 테스트 케이스 그룹 3: 서버 내부 오류 처리 (500 Internal Server Error)
# ----------------------------------------------------------------------
def test_internal_server_failure(mock_calculate_risk):
    """ 리스크 계산 로직 자체에서 예상치 못한 예외가 발생했을 때, 시스템 에러 처리가 정상 작동하는지 검증합니다. """
    # Mocking the calculator to intentionally raise an unhandled exception
    mock_calculate_risk.side_effect = Exception("DB Connection Timeout")

    payload = {
        "initial_threat_score": 50.0,
        "user_input_data": {
            "industry": "Finance",
            "revenue_usd": "10000000",
            "employees": "150"
        },
        "psychological_pressure_intensity": 2.0
    }

    response = client.post("/diagnosis/calculate", json=payload)

    assert response.status_code == 500
    res_data = response.json()
    # 사용자에게 보여주는 메시지가 '구조적 결함' 관련 문구를 포함하는지 검증합니다.
    assert "구조적 결함이 발생했습니다" in res_data["detail"]