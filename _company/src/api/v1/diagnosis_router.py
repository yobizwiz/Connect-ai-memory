from fastapi import APIRouter, Depends, Body
from typing import Dict, Any
# 위에서 만든 핵심 로직 임포트
from src.services.risk_calculator import calculate_systemic_risk

router = APIRouter(prefix="/diagnosis", tags=["Risk Diagnosis"])

@router.post("/calculate")
async def calculate_risk_endpoint(
    payload: Dict[str, Any] = Body(...)
):
    """
    위협 점수 계산을 위한 API 엔드포인트입니다. 
    Payload에는 초기 위협점수, 사용자 입력 데이터, 심리적 압박 강도가 포함되어야 합니다.
    """
    try:
        initial_score = payload.get("initial_threat_score")
        user_data = payload.get("user_input_data", {})
        pressure = payload.get("psychological_pressure_intensity")

        if initial_score is None or pressure is None:
            raise ValueError("Required fields (initial_threat_score, psychological_pressure_intensity) are missing.")
        
        # ⚙️ 핵심 비즈니스 로직 실행
        result = calculate_systemic_risk(
            initial_threat_score=float(initial_score),
            user_input_data=user_data,
            psychological_pressure_intensity=float(pressure)
        )
        return result.to_dict()

    except Exception as e:
        # 에러 처리 로직은 필수입니다. 어떤 실패 상황에서도 안정적인 응답을 해야 합니다.
        return {"error": f"Diagnosis failed due to structural error or invalid input type: {str(e)}"}