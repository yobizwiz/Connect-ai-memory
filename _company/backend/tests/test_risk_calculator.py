import pytest
from api.risk_calculator import RiskCalculator # 실제 모듈 경로로 수정 필요

# Mocking the calculator class for testing purposes
@pytest.fixture
def calculator():
    """테스트용 RiskCalculator 인스턴스를 제공합니다."""
    return RiskCalculator()

def test_perfect_compliance(calculator):
    """규제 준수가 완벽할 때 L_totalMax가 0이어야 함을 검증합니다."""
    # GDPR 규정: 이메일과 명시적 동의 필요. (Mocking user data)
    user_data = {
        'email': 'test@example.com',
        'explicit_consent': 'yes, I explicitly consent to processing.'
    }
    rules = [
        {'name': 'GDPR', 'field': 'email', 'rule': 'data_retention'}, # 예시 규정 1
        {'name': 'GDPR', 'field': 'explicit_consent', 'rule': 'explicit_consent'} # 동의 필요 필드
    ]
    # 예상 L_totalMax = 0.0 (모든 조건 충족 가정)
    loss, report = calculator.calculate_l_total_max(user_data, rules)
    assert loss == pytest.approx(0.0)

def test_missing_critical_field(calculator):
    """필수 필드가 아예 누락된 경우 높은 벌점을 받아야 함을 검증합니다 (GDPR)."""
    # 'email' 필드가 의도적으로 빠짐
    user_data = {
        'explicit_consent': 'yes, I explicitly consent to processing.'
    }
    rules = [
        {'name': 'GDPR', 'field': 'email', 'rule': 'data_retention'}, # <- MISSING
        {'name': 'GDPR', 'field': 'explicit_consent', 'rule': 'explicit_consent'}
    ]
    # 예상 L_totalMax = (base_risk * 1.5) + (0.0, because consent exists)
    # base_risk(GDPR)=50.0 -> 75.0가 최소 기여도일 것으로 기대
    loss, _ = calculator.calculate_l_total_max(user_data, rules)
    assert loss > 50.0 and loss < 100.0

def test_no_explicit_consent_failure(calculator):
    """명시적 동의가 불충분할 경우 중간 벌점을 받아야 함을 검증합니다 (CCPA)."""
    user_data = {
        'email': 'test@example.com',
        # 명시적 동의 필드 자체가 누락된 것이 아니라, 내용이 부족한 경우를 가정
        'explicit_consent': 'maybe' # 불완전한 동의
    }
    rules = [
        {'name': 'CCPA', 'field': 'explicit_consent', 'rule': 'explicit_consent'}
    ]
    # 예상 L_totalMax = base_risk(CCPA) * 0.8 = 35.0 * 0.8 = 28.0
    loss, _ = calculator.calculate_l_total_max(user_data, rules)
    assert loss == pytest.approx(28.0)

def test_multiple_violations_aggregation(calculator):
    """여러 규정 위반이 동시에 발생했을 때 점수가 합산되는지 검증합니다."""
    # 1. GDPR: 이메일 누락 (75점 예상)
    # 2. CCPA: 동의 부재 (28점 예상)
    user_data = {} # 모든 필수 필드 공백 처리
    rules = [
        {'name': 'GDPR', 'field': 'email', 'rule': 'data_retention'},
        {'name': 'CCPA', 'field': 'explicit_consent', 'rule': 'explicit_consent'}
    ]
    # 예상 L_totalMax = 75.0 + 28.0 = 103.0 (대략적 기대치)
    loss, _ = calculator.calculate_l_total_max(user_data, rules)
    assert loss > 90.0 and loss < 120.0