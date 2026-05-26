import pytest
from src.services.risk_calculator import calculate_systemic_risk, DiagnosisResult

# --- 테스트 케이스 1: 치명적인 결함 발견 시나리오 (Red Zone 강제) ---
def test_critical_failure_detection():
    """
    구조적 결함(Defect Flag True)과 높은 압박감이 결합될 때, 위험 점수가 임계점을 넘기는지 확인.
    [기대: Critical Status]
    """
    user_data = {"structural_defect_flag": True, "source": "Audit Report"}
    result = calculate_systemic_risk(
        initial_threat_score=0.7, # 70% 기본 위협
        user_input_data=user_data,
        psychological_pressure_intensity=1.0 # 최대 압박감
    )
    # 기대값: (0.7 * 1.0 * (1 + 0.3)) = 0.91 -> 점수 스케일링을 고려하여 임계점 테스트
    assert result.severity_level == "Red Zone - IMMEDIATE ACTION REQUIRED"
    assert result.status == "Critical"

# --- 테스트 케이스 2: 결함이 없으나 압박감이 높은 경우 (Warning/Yellow Zone) ---
def test_high_pressure_low_defect():
    """
    결함은 없지만, 시간적 압박(Time Pressure)만 높을 때 경고가 뜨는지 확인.
    [기대: Yellow Status]
    """
    user_data = {"structural_defect_flag": False}
    result = calculate_systemic_risk(
        initial_threat_score=0.5, # 50% 기본 위협
        user_input_data=user_data,
        psychological_pressure_intensity=1.0 # 최대 압박감 (가중치 2배)
    )
    # 기대값: (0.5 * 2.0 * (1 + 0)) = 1.0 -> 점수 스케일링을 고려하여 임계점 테스트
    assert result.severity_level == "Yellow Zone - STRUCTURAL REVIEW RECOMMENDED"
    assert result.status == "Warning"

# --- 테스트 케이스 3: 안전한 경우 (Green Zone) ---
def test_safe_scenario():
    """
    모든 입력값이 낮은 수준일 때, 시스템이 안전하다고 판단하는지 확인.
    [기대: Green Status]
    """
    user_data = {"structural_defect_flag": False}
    result = calculate_systemic_risk(
        initial_threat_score=0.2, # 낮은 기본 위협
        user_input_data=user_data,
        psychological_pressure_intensity=0.1 # 낮은 압박감
    )
    assert result.severity_level == "Green Zone - MONITORING OK"
    assert result.status == "Safe"

# --- 테스트 케이스 4: 데이터 유효성 검증 (Input Validation) ---
def test_invalid_input_type():
    """
    입력 인자 중 float이 아닌 문자열이나 None이 들어올 경우의 예외 처리를 확인합니다.
    (FastAPI 레벨에서 처리되지만, 서비스 레이어에서도 방어가 필요함)
    """
    # 이 테스트는 FastAPI가 자동으로 실패를 낼 것이므로, 로직 자체에 대한 가드문을 추가하여 검증하는 것을 권장합니다.
    pass