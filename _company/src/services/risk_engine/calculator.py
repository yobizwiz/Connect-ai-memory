from typing import List, Dict, Any
from pydantic import BaseModel, Field, validator

# --- 1. Data Schema Definition (Pydantic Models) ---

class JurisdictionData(BaseModel):
    """단일 관할권의 규제 위반 데이터를 정의합니다."""
    jurisdiction_name: str = Field(description="예: GDPR, CCPA, PIPL")
    violation_type: str = Field(description="위반 유형. 예: Data Provenance Gap, Cross-Border Transfer Failure.")
    base_fine_usd: float = Field(ge=0.0, description="기본 규제 벌금 (USD).")
    operational_risk_score: float = Field(ge=0.0, description="운영 중단 리스크 점수 (0~10).")

class RiskInputPayload(BaseModel):
    """전체 위험 계산에 사용되는 입력 페이로드입니다."""
    data_points: List[JurisdictionData] = Field(..., min_items=1, max_items=5)
    context_description: str = Field(default="Global data processing context.")

class LTotalMaxResult(BaseModel):
    """최종 계산된 $L_{totalMax}$ 결과를 반환하는 스키마입니다."""
    total_estimated_loss_usd: float = Field(..., description="$L_{totalMax}$. 총 예상 손실액.")
    conflict_detected: bool = Field(..., description="복합 규제 충돌이 감지되었는지 여부.")
    breakdown: Dict[str, Any] = Field(description="세부 계산 내역 (벌금, 운영 리스크 등).")

# --- 2. Core Calculation Engine ---

def calculate_ltotalmax(payload: RiskInputPayload) -> LTotalMaxResult:
    """
    복합 관할권 충돌을 감지하고 $L_{totalMax}$를 산출하는 핵심 엔진 함수입니다.
    
    Args:
        payload: 다중 규제 위반 데이터를 포함한 입력 페이로드.
        
    Returns:
        LTotalMaxResult 객체.
    """
    data_points = payload.data_points
    
    # 1. 초기화 및 기본 합산 (Single-Jurisdiction Sum)
    base_fine_sum = sum(d.base_fine_usd for d in data_points)
    total_operational_score = max([d.operational_risk_score for d in data_points], default=0.0)

    # 2. 충돌 감지 로직 (Conflict Detection Logic - The Core Improvement)
    conflicts: List[tuple] = []
    is_conflict_detected = False
    
    if len(data_points) < 2:
        return LTotalMaxResult(total_estimated_loss_usd=base_fine_sum * (1 + total_operational_score / 10), conflict_detected=False, breakdown={"base_fines": base_fine_sum, "op_risk_multiplier": 1.0})

    # N-Squared 비교를 통해 모든 관할권 쌍을 비교합니다.
    for i in range(len(data_points)):
        for j in range(i + 1, len(data_points)):
            d1 = data_points[i]
            d2 = data_points[j]

            # 임시 충돌 판단 기준: '개인정보'와 '국경 이동' 관련 키워드가 모두 포함될 때.
            is_privacy_related = any(k in d1.violation_type for k in ["Provenance", "PII"]) and \
                                 any(k in d2.violation_type for k in ["Cross-Border", "Transfer"])
            
            # 예시 충돌: GDPR (EU) + PIPL (중국) = 가장 높은 Operational Loss Multiplier 발생 가능
            is_cross_border_conflict = (("GDPR" in d1.jurisdiction_name and "PIPL" in d2.jurisdiction_name) or 
                                       ("PIPL" in d1.jurisdiction_name and "GDPR" in d2.jurisdiction_name))

            if is_privacy_related or is_cross_border_conflict:
                conflicts.append((d1.jurisdiction_name, d2.jurisdiction_name))
                is_conflict_detected = True

    # 3. 복합 손실 계수 계산 (Conflict Multiplier)
    if is_conflict_detected and conflicts:
        # 충돌이 감지되면 기본 벌금 합산에 가중치를 곱합니다.
        # 이 가중치는 단순 합산으로는 예측할 수 없는 '시스템적 신뢰도 하락'을 반영합니다.
        CONFLICT_MULTIPLIER = 1.5 + (len(conflicts) * 0.2) # 충돌 쌍 개수만큼 보너스 부여
    else:
        CONFLICT_MULTIPLIER = 1.0

    # 4. 최종 $L_{totalMax}$ 산출 공식 적용
    final_loss = base_fine_sum * CONFLICT_MULTIPLIER * (1 + total_operational_score / 10)

    breakdown = {
        "base_fines": base_fine_sum,
        "conflict_multiplier": round(CONFLICT_MULTIPLIER, 2),
        "op_risk_multiplier": 1.0 + (total_operational_score / 10), # Operational Score가 가중치로 작용
    }

    return LTotalMaxResult(
        total_estimated_loss_usd=round(final_loss, 2),
        conflict_detected=is_conflict_detected,
        breakdown=breakdown
    )