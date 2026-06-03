import pytest
from lmax_calculator import calculate_lmax  # 가정: 계산 함수가 여기에 정의됨

# 🚨 테스트 환경 설정 및 가드 로직 검증을 위한 Fixture 사용 (Pytest 스타일)
@pytest.fixture(scope="module")
def standard_inputs():
    """Researcher의 명세서에 기반한 표준 변수 입력값 제공."""
    return {
        "R_W": 0.45,  # Regulatory Weight
        "C": 1.8,     # Legal Liability Multiplier
        "Operational_Gap_Cost": 10_000_000, # 예시: $10M
        "Reputation_Loss_Multiplier": 500_000_000 # 예시: $500M
    }

# =============================================================
# ✅ Happy Path & Core Logic Tests (가장 먼저 통과해야 할 케이스)
# =============================================================

def test_lmax_standard_calculation(standard_inputs):
    """표준 입력값을 사용하여 Lmax 계산 공식이 정확히 작동하는지 검증합니다."""
    R_W = standard_inputs["R_W"]
    C = standard_inputs["C"]
    OGC = standard_inputs["Operational_Gap_Cost"]
    RLM = standard_inputs["Reputation_Loss_Multiplier"]
    
    # 공식: Lmax = (R_W * C) + OGC + RLM
    expected_lmax = (R_W * C) + OGC + RLM
    calculated_lmax = calculate_lmax(R_W, C, OGC, RLM)
    
    # 부동 소수점 오차를 고려하여 비교합니다.
    assert abs(calculated_lmax - expected_lmax) < 1e-6

def test_lmax_zero_input():
    """모든 입력 변수가 0인 경우, Lmax는 정확히 0이어야 함을 검증합니다 (기본 무결성)."""
    assert calculate_lmax(0.0, 0.0, 0, 0) == 0.0

# =============================================================
# 🐛 Edge Case & Resilience Tests (가장 중요함: 시스템의 취약점 검증)
# =============================================================

def test_lmax_missing_inputs():
    """핵심 변수 중 하나라도 누락(None 또는 NaN)되었을 경우, 예외 처리가 발생하거나 0으로 처리되어야 함."""
    # R_W가 None인 경우를 시뮬레이션하여 TypeError/ValueError 방지 검증
    with pytest.raises((TypeError, ValueError)):
        calculate_lmax(None, 1.8, 10_000_000, 500_000_000)

def test_lmax_negative_inputs():
    """가중치나 비용이 음수일 경우 (논리적 오류), 반드시 예외를 발생시켜야 함."""
    # 규제 가중치가 마이너스인 상황은 비즈니스 로직상 불가능해야 합니다.
    with pytest.raises(ValueError, match="규제 강도 계수는 0보다 커야 합니다"):
        calculate_lmax(-0.1, 1.8, 10_000_000, 500_000_000)

def test_lmax_data_type_mismatch():
    """숫자가 아닌 문자열이나 객체가 입력되었을 경우, 안정적으로 실패하고 알려야 함."""
    with pytest.raises(TypeError):
        calculate_lmax(0.45, "1.8", 10_000_000, 500_000_000)

# =============================================================
# ✨ Boundary Condition Test (경계값 테스트)
# =============================================================

def test_lmax_maximum_boundary():
    """변수들이 최대치(예: 규제 강도 1.0, 배상 책임 무한대 등)에 근접했을 때의 계산을 검증합니다."""
    # 가정을 위해 임계치를 설정하고 테스트 진행 (실제 값으로 대체 필요)
    lmax_calc = calculate_lmax(1.0, 5.0, 999e6, 1e12) # 큰 수치로 Lmax가 잘 커지는지 확인
    assert lmax_calc > 1e12