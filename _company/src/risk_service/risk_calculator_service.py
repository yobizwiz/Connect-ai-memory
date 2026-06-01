from pydantic import BaseModel, Field, NonNegativeInt
import math
from typing import Dict, Any

# --- 비즈니스 규칙 정의 상수 (Configuration) ---
# C: 최소 의무 책임 보험료 (Minimum Compliance Cost) - 만약 계산 결과가 너무 낮을 때를 대비한 Floor Price.
MIN_COMPLIANCE_COST = 5000  # 예시 값 $5,000

# k1: 법적 벌금 트렌드 가중치 (Legal Fine Trend Multiplier) - 리스크 점수를 재정적으로 증폭시키는 계수.
LEGAL_FINE_MULTIPLIER_K1 = 0.8 # 예시 값 0.8

class UserInput(BaseModel):
    """
    사용자로부터 받아야 하는 모든 입력 변수들의 구조를 정의합니다.
    모든 필드는 필수적이며, NonNegativeInt 및 float 타입 제한을 둡니다.
    """
    user_dataset_score: float = Field(..., description="사용자의 데이터 취약성 기반 초기 리스크 점수.")
    violation_count: NonNegativeInt = Field(..., description="발견된 규제 위반의 총 횟수.")
    jurisdiction_type: str = Field(..., description="진단이 이루어지는 주요 관할권 (예: GDPR, CCPA).")

class LegalTrendData(BaseModel):
    """
    리서처가 제공하는 최신 법적 트렌드 데이터. 이 데이터를 기반으로 k1을 보정합니다.
    """
    current_fine_average: float = Field(..., description="현재 관할권의 평균 벌금액 (단위: USD).")
    risk_trend_factor: float = Field(..., description="법규 변화의 급격성 지수 (1.0 이상 권장).")


def calculate_gold_premium(user_input: UserInput, legal_data: LegalTrendData) -> Dict[str, Any]:
    """
    미개방 책임 보험료 ($P_{gold}$)를 계산하는 핵심 서비스 로직입니다.
    $P_{gold} = \max(\text{Min\_Compliance\_Cost}, \lceil k_1 \cdot TRE \rceil)$ 공식을 따릅니다.

    Args:
        user_input: 사용자의 리스크 데이터셋 및 위반 횟수 정보.
        legal_data: 외부 법적 트렌드 데이터.

    Returns:
        계산된 P_gold 값과 상세 내역을 포함하는 딕셔너리.

    Raises:
        ValueError: 필수 입력값이 누락되거나 비즈니스 규칙에 위배될 경우.
    """
    try:
        # 1. TRE (Total Risk Exposure) 계산
        # [TRE] = (사용자 점수 * 위반 횟수) + (관할권의 심각성 가중치)
        jurisdiction_weight = 0.5 if user_input.jurisdiction_type == "GDPR" else 0.3
        total_risk_exposure = (user_input.user_dataset_score * user_input.violation_count) + jurisdiction_weight

        # 2. k1 재계산 (Legal Fine Trend Multiplier 적용)
        # 법적 트렌드 데이터가 우리의 초기 가중치(LEGAL_FINE_MULTIPLIER_K1)를 보정합니다.
        k1 = LEGAL_FINE_MULTIPLIER_K1 * legal_data.risk_trend_factor

        # 3. 핵심 계산: P_gold의 잠재적 값 계산 (ceil 적용)
        potential_premium = math.ceil(k1 * total_risk_exposure)

        # 4. 최종 $P_{gold}$ 결정: max() 함수 적용
        final_p_gold = max(MIN_COMPLIANCE_COST, potential_premium)

        return {
            "status": "success",
            "calculated_premium_usd": float(final_p_gold),
            "details": {
                "total_risk_exposure": round(total_risk_exposure, 2),
                "effective_k1_multiplier": round(k1, 4),
                "minimum_compliance_floor": MIN_COMPLIANCE_COST,
                "potential_calculated_premium": int(potential_premium)
            }
        }

    except Exception as e:
        # 모든 예측 불가능한 오류를 포착하여 명확하게 반환합니다. (Defensive Programming)
        raise ValueError(f"P_gold 계산 중 치명적인 내부 에러 발생: {str(e)}. 필수 변수 체크 필요.")