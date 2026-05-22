import pytest
from backend.api.compliance_engine import calculate_risk, ProcessInputs

# High Risk 시나리오: 효율성이 매우 낮고 Gap이 많을 때
def test_high_risk_scenario():
    inputs = ProcessInputs(process_efficiency_score=0.1, regulatory_compliance_gap_count=5, operational_cycle_time_days=30)
    level, _, _, is_critical, report = calculate_risk(inputs)
    assert level == "HIGH"
    assert is_critical == True
    assert "$85" in report # 임계치 이상일 때의 메시지 패턴 확인

# Medium Risk 시나리오: 적절한 수준의 Gap과 효율성을 가질 때
def test_medium_risk_scenario():
    inputs = ProcessInputs(process_efficiency_score=0.6, regulatory_compliance_gap_count=2, operational_cycle_time_days=7)
    level, _, _, is_critical, report = calculate_risk(inputs)
    assert level == "MEDIUM"
    assert is_critical == False

# Low Risk 시나리오: 모든 지표가 좋을 때 (시스템적 안정성)
def test_low_risk_scenario():
    inputs = ProcessInputs(process_efficiency_score=0.95, regulatory_compliance_gap_count=0, operational_cycle_time_days=1)
    level, _, _, is_critical, report = calculate_risk(inputs)
    assert level == "LOW"
    assert is_critical == False