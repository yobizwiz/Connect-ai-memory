from pydantic import BaseModel
from typing import Optional, Any

# ==============================================
# 1. INPUT SCHEMA: Threat Risk Index (TRE) Inputs
# ==============================================
class ThreatInput(BaseModel):
    pii_exposure_count: float = 0.0
    compliance_violation_likelihood: float = 0.0
    critical_workflow_gap_count: int = 0
    process_failure_cost_estimate: float = 0.0
    ai_hallucination_dependency_score: float = 0.0
    company_annual_revenue_usd: Optional[float] = None

    def get(self, key: str, default: Any = None) -> Any:
        """딕셔너리 스타일의 get 메소드 지원"""
        return getattr(self, key, default)

    def __getitem__(self, key: str) -> Any:
        """딕셔너리 스타일의 인덱싱(input_data['key']) 지원"""
        if not hasattr(self, key):
            raise KeyError(key)
        return getattr(self, key)


# ==============================================
# 2. OUTPUT SCHEMA: The Final Report Structure
# ==============================================
class OutputSchema(BaseModel):
    threat_risk_index: float
    risk_level: str  # 'Green' | 'Yellow' | 'Red'
    systemic_warning_message: str
    suggested_tier: str  # 'Tier 0 - None' | 'Tier 1 - Detection' | 'Tier 2 - Prevention'


# ==============================================
# 3. CLIENT DATA & THREAT REPORT SCHEMAS (For test_tre_system)
# ==============================================
class ClientDataSchema(BaseModel):
    name: str
    pii_exposure_count: float = 0.0
    compliance_violation_likelihood: float = 0.0
    critical_workflow_gap_count: int = 0
    process_failure_cost_estimate: float = 0.0
    ai_hallucination_dependency_score: float = 0.0
    company_annual_revenue_usd: Optional[float] = 100000.0

    def get(self, key: str, default: Any = None) -> Any:
        return getattr(self, key, default)

    def __getitem__(self, key: str) -> Any:
        if not hasattr(self, key):
            raise KeyError(key)
        return getattr(self, key)


class ThreatReport(BaseModel):
    report_title: str
    risk_level: str
    recommendation: str
    paywall_activated: bool
