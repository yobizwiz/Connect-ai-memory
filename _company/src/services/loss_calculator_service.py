# src/services/loss_calculator_service.py
import numpy as np
from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class CalculationInput(BaseModel):
    """
    Loss Calculator Widget에 필요한 핵심 입력 변수들.
    이 값들은 고객의 '시스템적 무지' 또는 '규정 미준수' 정도를 수치화합니다.
    """
    time_lag_days: float  # A. 놓친 시간 지연 기간 (일) - 데이터 접근성 위협
    compliance_gap_count: int # B. 누락된 컴플라이언스 요건 개수 - 규제 준수 위협
    critical_system_vulnerability: float # C. 시스템적 취약점 노출 정도 (0.0 ~ 1.0)

@router.post("/api/calculate-loss")
async def calculate_financial_loss(input_data: CalculationInput) -> Dict[str, Any]:
    """
    입력된 변수들을 기반으로 고객의 잠재적 금전 손실 위험액을 계산하는 핵심 로직.
    이 함수는 단순히 합산하는 것이 아니라, 위협 요소 간의 '상호작용(Interaction)'에 가중치를 줍니다.
    """
    data = input_data

    # 1. 기본 손실 점수 (Base Loss Score) 계산
    base_score = data.time_lag_days * 50 + (data.compliance_gap_count * 30)
    
    # 2. 시스템적 취약성 가중치 적용 (Volatility Multiplier)
    # 취약성이 높을수록, 시간 지연 및 Gap의 영향이 기하급수적으로 증가함.
    volatility_multiplier = np.exp(data.critical_system_vulnerability * 1.5)

    # 3. 최종 위험액 산출 (Final Risk Amount Calculation)
    # Loss = BaseScore * VolatilityMultiplier * 1000 (단위 통화 변환 상수)
    potential_loss_usd = round(base_score * volatility_multiplier * 1000, 2)

    if potential_loss_usd < 50.0:
        # 위험도가 너무 낮으면 '데이터 부족'으로 처리하여 구매 유도 강도를 유지함.
        potential_loss_usd = 50.0
        
    return {
        "status": "success",
        "calculated_risk_usd": potential_loss_usd,
        "detail_message": f"분석 결과, 귀사는 최소 ${potential_loss_usd} 이상의 재무적 위험에 노출되어 있습니다. 즉각적인 진단이 필수입니다.",
        "risk_level_description": "CRITICAL (Red Zone)" if potential_loss_usd >= 500 else "MODERATE/LOW (Yellow/Green Zone)"
    }

def calculate_financial_loss_sync(threat_score: float, user_context: dict) -> float:
    """
    Threat score와 user context에 기반하여 재무 손실을 간편히 계산해주는 동기식 헬퍼 함수.
    risk_router.py에서 이 함수를 연동하여 사용합니다.
    """
    if threat_score > 0.9: # Critical
        return 800.0
    elif threat_score > 0.6: # High
        return 600.0
    else: # Low/Medium
        return 75.0

# --- End of API Router Definition ---