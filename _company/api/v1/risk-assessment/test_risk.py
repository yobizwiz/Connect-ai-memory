import pytest
from fastapi import HTTPException
from pydantic import ValidationError
from .schemas import RegulatoryRisk, RiskInputPayload
from .main import calculate_lmax # 로직 함수만 임포트하여 테스트

# --- Test Case 1: 기본 성공 시나리오 (Normal Operation) ---
def test_successful_risk_calculation():
    """표준적인 리스크 데이터를 입력했을 때 정상적으로 Lmax가 계산되는지 검증."""
    risks = [
        # GDPR: 높은 벌금, 중간 통제력, 일반 증폭 계수 1.5
        RegulatoryRisk(domain_name="GDPR", base_fine_estimate=20.0, control_maturity_score=3, multiplier_trend=1.5),
        # AI Act: 낮은 벌금, 높은 통제력 (Score 5), 강력한 증폭 계수 3.0
        RegulatoryRisk(domain_name="AI Act", base_fine_estimate=5.0, control_maturity_score=5, multiplier_trend=3.0)
    ]
    # 예상 계산:
    # GDPR = (20 / (3 - 1)) * 1.5 = 10 * 1.5 = 15.0
    # AI Act = (5 / (5 - 1)) * 3.0 = 1.25 * 3.0 = 3.75
    # Total = 18.75
    total_lmax, _ = calculate_lmax(risks)
    assert round(total_lmax, 2) == 18.75

# --- Test Case 2: 치명적 결함 시나리오 (Control Failure - Maturity=1) ---
def test_critical_control_failure():
    """내부 통제 점수가 1일 경우, 가장 높은 패널티가 적용되는지 검증."""
    risks = [
        # Data Sovereignty: 벌금은 낮으나, 통제가 '최악'인 상황 (Score 1)
        RegulatoryRisk(domain_name="Data Sovereignty", base_fine_estimate=5.0, control_maturity_score=1, multiplier_trend=1.0)
    ]
    # 예상 계산: Maturity <= 1 이므로 5.0 * 1.0 * 5.0 = 25.0 적용됨 (최대 패널티 계수 5.0)
    total_lmax, _ = calculate_lmax(risks)
    assert round(total_lmax, 2) == 25.0

# --- Test Case 3: 모든 변수가 최대 위험인 경우 (Worst Case Scenario) ---
def test_worst_case_scenario():
    """모든 값이 최악의 조합일 때 Lmax가 기하급수적으로 높아지는지 검증."""
    risks = [
        RegulatoryRisk(domain_name="Unknown", base_fine_estimate=100.0, control_maturity_score=2, multiplier_trend=5.0)
    ]
    # 예상 계산: (100 / (2 - 1)) * 5.0 = 500.0
    total_lmax, _ = calculate_lmax(risks)
    assert round(total_lmax, 2) == 500.0

# --- Test Case 4: 데이터 누락 방지 테스트 (Defensive Check) ---
def test_missing_multiplier_default():
    """Multiplier Trend가 명시되지 않았을 때 기본값(1.0)으로 처리되는지 검증."""
    risks = [
        RegulatoryRisk(domain_name="GDPR", base_fine_estimate=20.0, control_maturity_score=3, multiplier_trend=None)
    ]
    # 예상 계산: (20 / 2) * 1.0 = 10.0
    total_lmax, _ = calculate_lmax(risks)
    assert round(total_lmax, 2) == 10.0