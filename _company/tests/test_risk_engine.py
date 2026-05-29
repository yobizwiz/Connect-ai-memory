import pytest
from unittest.mock import MagicMock, patch
# 가정: 실제 리스크 계산 로직이 담긴 파일 경로 (엔지니어링 관행상 이 파일을 임포트함)
from src.services.risk_engine import calculate_total_risk

# ============================================================
# 🚨 테스트 환경 설정 및 Mocking 준비
# API가 외부 시스템(예: 규제 데이터베이스)에 의존하는 경우, 이를 Mock 처리합니다.
# 이렇게 해야 테스트 격리성(Isolation)을 확보하고, 오직 로직 자체만 검증할 수 있습니다.
# ============================================================

@pytest.fixture(scope="module")
def mock_external_api():
    """외부 API 호출을 모킹하여 안정적인 테스트 환경을 조성합니다."""
    with patch("src.services.risk_engine.fetch_regulatory_data", return_value={"DORA": 0.1, "AI_Act": 0.2}) as mock:
        yield mock

# ============================================================
# ✅ 1. Happy Path Test (성공 및 데이터 무결성 검증)
# 모든 변수가 완벽하게 들어왔을 때의 정상 동작을 확인합니다.
# ============================================================
def test_successful_risk_calculation(mock_external_api):
    """모든 필수 파라미터가 주어졌을 때, 논리적이고 정확한 리스크 점수를 반환하는지 테스트."""
    input_data = {
        "client_sector": "Finance",
        "regulatory_compliance_score": 0.95, # 높은 준수도 가정
        "employee_count": 120,
        "historical_loss_estimate": 1000000 # $TRE의 기본값
    }
    # Mocking된 외부 데이터를 포함하여 실행 (DORA: 0.1, AI_Act: 0.2)
    result = calculate_total_risk(input_data)

    assert result is not None
    assert isinstance(result, dict)
    # 리스크 점수가 적절한 범위 내에 있고, 계산 과정이 포함되어야 함 (구조적 무결성 확인)
    assert 'final_score' in result
    assert result['final_score'] >= 0 and result['final_score'] <= 1.0

# ============================================================
# 🚧 2. Boundary/Edge Case Test (경계 및 예외 조건 검증)
# 경계값 처리와 데이터 누락으로 인한 시스템 과부하 방지 여부를 확인합니다.
# ============================================================
def test_edge_case_zero_input(mock_external_api):
    """모든 변수가 0일 때 (최소 위험), 엔진이 오류 없이 최소 리스크를 반환하는지 테스트."""
    input_data = {
        "client_sector": "None", # 섹터가 의미 없을 경우
        "regulatory_compliance_score": 0.0, # 최악의 준수도 가정 (경계값)
        "employee_count": 1,
        "historical_loss_estimate": 0 # 최소 손실액
    }
    result = calculate_total_risk(input_data)

    assert result is not None
    # 리스크가 너무 높게 나오거나 NaN이 되는 것을 방지
    assert result['final_score'] <= 0.1 # 매우 낮은 점수여야 함 (또는 특정 기준점 미만)

def test_large_input_handling(mock_external_api):
    """변수가 극단적으로 클 때 (예: 직원 수), 데이터 오버플로우나 성능 저하가 없는지 테스트."""
    input_data = {
        "client_sector": "Global",
        "regulatory_compliance_score": 1.0, # 최대치 준수도 가정
        "employee_count": 999999, # 매우 큰 수
        "historical_loss_estimate": 5e9 # 대규모 손실 추정
    }
    result = calculate_total_risk(input_data)

    assert result is not None
    # 계산이 성공적으로 완료되었고, 오버플로우가 발생하지 않았음을 확인
    assert isinstance(result['final_score'], float)


# ============================================================
# 💥 3. Failure Path Test (강력한 Error Handling Loop 검증)
# 필수적인 에러 처리 로직을 커버하는 것이 핵심입니다. 이 부분이 깨지면 시스템이 무너집니다!
# ============================================================

def test_missing_required_parameter():
    """필수 파라미터(예: client_sector)가 누락되었을 때, 명확하고 구체적인 에러를 반환하는지 테스트."""
    input_data = {
        "regulatory_compliance_score": 0.95, # sector 누락
        "employee_count": 120,
        "historical_loss_estimate": 1000000
    }
    with pytest.raises(ValueError) as excinfo:
        # API가 내부적으로 ValueError를 발생시키도록 강제합니다.
        calculate_total_risk(input_data)

    # 반환된 에러 메시지에 '필수 파라미터'와 같은 구체적 가이드라인이 포함되어야 합니다.
    assert "Missing required parameter: client_sector" in str(excinfo.value)


def test_invalid_data_type():
    """데이터 타입 오류 (예: 숫자가 와야 할 곳에 문자열 입력) 발생 시, 시스템 충돌 없이 에러를 포착하는지 테스트."""
    input_data = {
        "client_sector": "Finance",
        "regulatory_compliance_score": 0.95,
        "employee_count": "One Hundred Twenty", # 문자열 입력 (Type Error)
        "historical_loss_estimate": 1000000
    }
    with pytest.raises(TypeError) as excinfo:
        calculate_total_risk(input_data)

    # 반환된 에러 메시지에 '데이터 타입' 문제임을 명시해야 합니다.
    assert "Invalid data type for employee_count" in str(excinfo.value)

def test_external_api_failure():
    """외부 규제 데이터 API가 다운되거나 응답할 수 없을 때, 시스템이 우아하게 실패(Graceful Degradation)하는지 테스트."""
    # 이 경우 외부 모킹을 사용해야 하지만, 여기서는 로직 흐름상 Failure를 가정합니다.
    with patch("src.services.risk_engine.fetch_regulatory_data", side_effect=ConnectionError("API Timeout")):
        with pytest.raises(RuntimeError) as excinfo:
            calculate_total_risk({"client_sector": "Test", "regulatory_compliance_score": 0.5, "employee_count": 1, "historical_loss_estimate": 1})

        # 내부 오류가 발생했더라도, 시스템이 전체 처리를 중단하지 않고 로그를 남기거나 대체값을 사용해야 합니다.
        assert "Failed to fetch regulatory data" in str(excinfo.value)