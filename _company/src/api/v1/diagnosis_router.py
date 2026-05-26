from fastapi import APIRouter, Depends, Body, HTTPException
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

    except (ValueError, TypeError) as e:
        # 입력 오류 또는 부적절한 데이터 타입에 대해서는 400 Bad Request 에러를 반환합니다.
        raise HTTPException(status_code=400, detail=f"구조적 결함이 발견되었습니다: {str(e)}")
    except Exception as e:
        # 시스템적 서버 오류에 대해서는 500 Internal Server Error를 반환합니다.
        raise HTTPException(status_code=500, detail=f"구조적 결함이 발생했습니다: {str(e)}")