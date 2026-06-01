from typing import Dict, List, Any

# Researcher가 제공한 데이터를 구조화하여 API 엔진이 참조할 수 있도록 정의합니다.
RISK_SCENARIOS: Dict[str, Any] = {
    "AI_GOVERNANCE": {
        "name": "EU AI Act / GDPR (LLM 책임 전가)",
        "base_fine_category": "$5M - $10M+",
        "rmm_multiplier": 3.5,  # Risk Maturity Multiplier
        "operational_loss_factor": 20.0, # Operational Loss Factor (Millions USD)
        "weight_key": "has_ai_hallucination_risk",
    },
    "DATA_SOVEREIGNTY": {
        "name": "GDPR / CCPA (PII 비식별화 실패)",
        "base_fine_category": "$10M - $25M+",
        "rmm_multiplier": 2.8,
        "operational_loss_factor": 30.0,
        "weight_key": "user_profile.data_sovereignty_compliance_score",
    },
    "PII_STORAGE": {
        "name": "불필요한 PII 저장 (데이터 과잉)",
        "base_fine_category": "$1M - $5M+",
        "rmm_multiplier": 2.0,
        "operational_loss_factor": 15.0,
        "weight_key": "user_profile.is_pii_stored",
    }
}

# 이 데이터를 로드하여 엔진에 사용합니다.
def get_all_scenarios() -> Dict[str, Any]:
    return RISK_SCENARIOS