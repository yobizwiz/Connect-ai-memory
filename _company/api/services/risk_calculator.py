from typing import Dict, List, Any, Tuple
from api.data.risk_scenarios import get_all_scenarios
from api.schemas.user_input import RiskInput

def calculate_lmax(input_data: RiskInput) -> Tuple[float, List[Dict]]:
    """
    입력된 사용자 데이터와 규제 시나리오를 결합하여 최대 잠재적 손실액을 계산합니다.
    L_totalMax = SUM ( Base Fine * RMM * Operational Loss Factor * User Vulnerability Score )

    Args:
        input_data: 사용자의 취약점을 담은 RiskInput 객체.

    Returns:
        튜플: (총 Lmax 값, Top 3 리스크 요소 목록)
    """
    scenarios = get_all_scenarios()
    risk_scores = []

    # 사용자 데이터에 대한 가드 처리 로직을 적용하여 안전하게 값을 읽어옵니다.
    try:
        user_profile = input_data.user_profile
    except Exception as e:
        print(f"Error extracting user profile: {e}")
        return 0.0, []

    for scenario_id, scenario in scenarios.items():
        # 1. 사용자 취약점 점수 추출 (가드 적용)
        weight_key = scenario["weight_key"]
        user_vulnerability_score = 1.0 # 기본값은 리스크 없음 가정
        
        if weight_key == "has_ai_hallucination_risk":
            user_vulnerability_score = input_data.user_profile.has_ai_hallucination_risk
        elif weight_key == "user_profile.data_sovereignty_compliance_score":
            user_vulnerability_score = input_data.user_profile.data_sovereignty_compliance_score
        elif weight_key == "user_profile.is_pii_stored":
            # boolean 값을 1.0 또는 0.0으로 변환하여 가중치로 사용
            user_vulnerability_score = float(input_data.user_profile.is_pii_stored)

        # 2. Lmax 계산 (Millions USD 단위)
        # $L_{totalMax} = BaseFine * RMM * OperationalLossFactor * UserVulnerabilityScore
        lmax_contribution = (
            (10 + scenario["rmm_multiplier"]) # 임의로 최소 기준 벌금을 설정하여 0 방지
            * scenario["rmm_multiplier"]
            * scenario["operational_loss_factor"]
            * user_vulnerability_score
        )

        # 3. 결과 저장 및 리스크 요소 기록
        risk_scores.append({
            "id": scenario_id,
            "name": scenario["name"],
            "contribution": lmax_contribution, # 백만 USD 단위
            "details": {
                "base_fine": scenario["base_fine_category"],
                "rmm": scenario["rmm_multiplier"],
                "op_loss": scenario["operational_loss_factor"]
            }
        })

    # 4. 최종 Lmax 및 Top 3 추출
    total_lmax = sum(item['contribution'] for item in risk_scores)
    
    # 리스크 점수별로 내림차순 정렬 후 상위 3개 선택
    sorted_risks = sorted(risk_scores, key=lambda x: x['contribution'], reverse=True)
    top_3_risks = sorted_risks[:3]

    return total_lmax, top_3_risks


def format_lmax_to_usd(total_lmax: float) -> str:
    """계산된 백만 USD 값을 읽기 쉬운 달러 문자열로 포맷합니다."""
    # 10^6을 곱하여 실제 금액 단위로 변환 후 천 단위 구분자 적용
    full_amount = total_lmax * 10**6
    return f"${full_amount:,.0f} USD"

def format_top_risks(top_risks: List[Dict]) -> List[Dict]:
    """Top 3 리스크 데이터를 최종 JSON 포맷에 맞게 가공합니다."""
    formatted = []
    for risk in top_risks:
        # 'Contribution' 값은 백만 USD 단위였으므로, 이를 다시 금액으로 변환하여 표시
        contribution_usd = risk['contribution'] * 10**6
        formatted.append({
            "risk_name": risk["name"],
            "impact_score": round(risk["contribution"] * 10**6, 2), # 소수점 둘째 자리까지 표시
            "description": f"위험 요소: {risk['details']['base_fine']} 기반의 복합적 시스템 무효화 리스크.",
        })
    return formatted