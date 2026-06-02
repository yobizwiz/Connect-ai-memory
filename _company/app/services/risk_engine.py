from typing import Dict, Any
from app.models import ClientInput, RegulatoryViolation, REGULATORY_DATASET

def calculate_l_total_max(input_data: ClientInput) -> Dict[str, float]:
    """
    클라이언트 입력 데이터를 기반으로 총 최대 리스크 노출액 (L_totalMax)을 계산합니다.
    L_totalMax = F + C_L + C_O
    """

    # 1. 법적/규제 위반 벌금 비용 (F: Fine & Penalty Cost)
    # Formula: sum((Min Fine * w_severity) + (Max Settlement Cost * (1 - w_mitigation)))
    total_f = 0.0
    for violation in REGULATORY_DATASET:
        # 가중치 설정: 여기서는 임시로 모든 위반 시나리오를 중등도(0.5) 리스크로 가정합니다.
        w_severity = 0.5
        w_mitigation = 0.2 # 완화 가능성 계수 (낮을수록 위험도가 높음)
        
        contribution = (violation.min_fine_usd * w_severity) + \
                        (violation.max_settlement_cost_usd * (1 - w_mitigation))
        total_f += contribution

    # 2. 법적 대응 과정 지연 비용 (C_L: Legal Response Cost)
    # Formula: Operational History Years * AI Integration Level * Constant Factor (e.g., 500 USD/year-level)
    c_l = input_data.operational_history_years * input_data.ai_integration_level * 500.0

    # 3. 운영 중단 기회비용 (C_O: Operational Downtime Opportunity Cost)
    # Formula: Industry Sector Risk Multiplier + Base Penalty
    sector_risk = {"FinTech": 1.8, "HealthCare": 2.2, "Retail": 1.0}.get(input_data.industry_sector, 1.2)
    c_o = sector_risk * 10000.0

    # 최종 L_totalMax 계산
    l_total_max = total_f + c_l + c_o

    detailed_breakdown = {
        "F_regulatory_fine": round(total_f, 2),
        "C_L_legal_response": round(c_l, 2),
        "C_O_operational_downtime": round(c_o, 2)
    }

    return detailed_breakdown, l_total_max


def determine_risk_level(l_total_max: float) -> str:
    """계산된 L_totalMax 값을 기반으로 경고 레벨을 결정합니다."""
    if l_total_max > 500000:
        return "🔴 Critical Red Zone Alert: 즉각적인 컴플라이언스 감사와 구조적 리스크 분석이 필요합니다. (최대 손실액 $L_{totalMax}$ 초과)"
    elif l_total_max > 150000:
        return "🟠 High Warning Level: 중대한 공백(Gap) 영역이 포착되었습니다. 즉시 방어적 아키텍처 구축이 필요합니다."
    else:
        return "🟢 Moderate Alert: 현재 리스크 노출도는 관리가 가능하지만, 사소한 규정 위반도 누적될 수 있습니다."