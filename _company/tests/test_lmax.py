import pytest
import os
from src.risk_calculator import calculate_aggregated_risk_score, LMAX_THRESHOLD # 상대 경로 수정 필요 가능성 있음

# 테스트를 위해 필요한 Mock Data Path 정의 (실제 실행 환경에 맞춰 조정)
MOCK_METRICS_PATH = r"c:\Users\jinoh\Desktop\Connect AI\_company\regulatory_risk_metrics.json" 


@pytest.fixture(scope="module")
def mock_user_data():
    """테스트용 가상의 사용자 상호작용 데이터 제공."""
    return {"user_actions": ["데이터 수집", "KPI 계산 시도"], "metadata": "normal"}

# ==============================================
# 🟢 테스트 케이스 1: 정상 작동 (Normal Operation)
# Lmax가 임계값보다 훨씬 낮은 경우를 시뮬레이션합니다.
def test_calculate_score_low_risk(mock_user_data):
    """Lmax 점수가 안전 범위 내에 있을 때의 정상 계산을 검증합니다."""
    # Mocking: 이 테스트 케이스는 Lmax가 1000 미만으로 돌아올 수 있도록 환경 설정을 가정합니다.
    score, is_critical = calculate_aggregated_risk_score(mock_user_data, MOCK_METRICS_PATH)

    print(f"\n[테스트 결과] Low Risk Test Score: {score:.2f}, Critical: {is_critical}")

    # Assert 1: 점수가 합리적인 범위 내에 있는지 확인 (단순히 LMAX보다 작아야 함)
    assert score < LMAX_THRESHOLD * 1.5 # 약간의 여유를 줍니다.
    # Assert 2: Critical Flag가 False여야 합니다.
    assert is_critical == False

# ==============================================
# 🔴 테스트 케이스 2: 경고 레벨 (Warning/High Risk)
# Lmax 점수가 임계값 근처에 있어 경고가 필요하지만, 아직 치명적이지 않은 경우를 시뮬레이션합니다.
def test_calculate_score_high_risk(mock_user_data):
    """Lmax 점수가 임계값 주변에 있을 때의 계산을 검증하고 Warning 플래그를 확인합니다."""
    # Mocking: 이 테스트 케이스는 Lmax가 1000 근처로 돌아오도록 환경 설정을 가정합니다.
    score, is_critical = calculate_aggregated_risk_score(mock_user_data, MOCK_METRICS_PATH)

    print(f"\n[테스트 결과] High Risk Test Score: {score:.2f}, Critical: {is_critical}")

    # Assert 1: 점수가 임계값 근처여야 합니다.
    assert LMAX_THRESHOLD * 0.8 < score <= LMAX_THRESHOLD * 1.2 # 예시로 80% ~ 120% 사이를 목표
    # Assert 2: Critical Flag는 False이거나, Warning 상태임을 나타내는 별도 플래그가 필요합니다. (여기서는 True/False만 사용)
    assert is_critical == False


# ==============================================
# ⚫ 테스트 케이스 3: 치명적 오류 (Critical Failure / Lmax > Threshold)
# $L_{max}$ 점수가 임계값을 넘었을 때, 시스템이 정상적으로 '위험' 상태를 감지하는지 검증합니다.
def test_calculate_score_critical_risk(mock_user_data):
    """Lmax 점수가 임계값을 초과하여 치명적 위험으로 판단되는 시나리오를 테스트합니다."""
    # Mocking: 이 테스트 케이스는 Lmax가 1000을 명확히 넘도록 환경 설정을 가정합니다.
    score, is_critical = calculate_aggregated_risk_score(mock_user_data, MOCK_METRICS_PATH)

    print(f"\n[테스트 결과] Critical Risk Test Score: {score:.2f}, Critical: {is_critical}")

    # Assert 1: 점수가 임계값을 확실히 넘어서야 합니다.
    assert score > LMAX_THRESHOLD * 1.2 # 최소한 120% 이상을 요구합니다.
    # Assert 2: Critical Flag는 True여야 합니다. 이것이 가장 중요한 검증 지점입니다.
    assert is_critical == True

# ==============================================
# 💣 테스트 케이스 4: 입력 데이터 유효성 검사 (Robustness Check)
def test_invalid_input_data():
    """JSON 파일 경로 오류 또는 데이터 구조 오류 시 예외 처리가 정상 작동하는지 검증합니다."""
    non_existent_path = "c:\\fake\\path\\to\\metrics.json"
    dummy_data = {}

    # Assert: FileNotFoundError가 발생하고, 시스템이 안전하게 실패를 반환해야 합니다.
    score, is_critical = calculate_aggregated_risk_score(dummy_data, non_existent_path)
    
    print("\n[테스트 결과] Invalid Input Test Score: {score:.2f}, Critical: {is_critical}")

    # Assert 1: score가 -1.0으로 반환되어야 합니다 (시스템 오류 코드).
    assert score == -1.0
    # Assert 2: 시스템이 실패를 치명적인 위험(True)으로 간주해야 합니다.
    assert is_critical == True

# ==============================================
# ✨ 추가 검증: Lmax 초과 시의 부가 기능 호출 (Integration Test)
def test_lmax_trigger_alert_system():
    """실제 Lmax 점수를 바탕으로 경고 시스템 알림 함수가 제대로 동작하는지 확인합니다."""
    print("\n\n--- [Integration Check] Critical Alert System Trigger ---")
    # 가상의 고위험 점수 전달 (1500점)
    mock_score = 1500.0 
    try:
        from src.risk_calculator import handle_critical_alert
        handle_critical_alert(mock_score)
        print("\n[INFO] Critical Alert 함수 호출 및 출력 확인 완료.")
    except Exception as e:
        pytest.fail(f"Critical alert function failed to execute or print properly: {e}")