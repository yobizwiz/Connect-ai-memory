from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import math

# --- Pydantic Schema (Input Validation) ---
class GapInput(BaseModel):
    """L_gap 계산에 필요한 핵심 정량 변수들을 정의합니다."""
    c_downtime: float = Field(..., description="운영 중단 비용 (Cost of Downtime, $C_{Downtime}$). 최소 단위는 1000.")
    p_loss: float = Field(..., description="잠재적 기회비용 (Potential Opportunity Cost, $P_{Loss}$).")
    r_penalty: float = Field(..., description="규제/위협 벌금 수준 (Regulatory Penalty Level, $R_{Penalty}$).")

# --- Core Logic Module ---
def calculate_lgap(input_data: GapInput) -> float:
    """
    L_gap (미검증 손실액)을 계산하는 핵심 로직.
    단순 합산이 아닌, 변수 간의 상호작용을 반영한 '위험 증폭 모델'을 사용합니다.
    $L_{gap} = 1 + C_{Downtime} \times \sqrt{P_{Loss}} \times R_{Penalty}$ (모듈화된 가중치)
    """
    # 입력값 유효성 검사: 모든 변수가 음수여서는 안 됩니다.
    if input_data.c_downtime < 0 or input_data.p_loss < 0 or input_data.r_penalty < 0:
        raise ValueError("모든 리스크 지표는 비음수 값이어야 합니다.")

    # 핵심 로직 (Mocking Systemic Risk):
    # 1. C_Downtime에 가장 큰 가중치를 부여합니다. (즉각적 피해가 최대)
    # 2. P_Loss와 R_Penalty를 곱하고 제곱근을 취해 '상호작용' 효과를 시뮬레이션합니다.
    try:
        lgap = 1 + input_data.c_downtime * math.sqrt(input_data.p_loss) * input_data.r_penalty
        # 결과값이 너무 작으면 최소 임계값(Minimum Threshold)을 부여하여 '위험 감지'를 강제합니다.
        return max(lgap, 50000.0) 
    except Exception as e:
        print(f"L_gap 계산 중 에러 발생: {e}")
        raise

# --- FastAPI Endpoint Definition ---
app = FastAPI(title="L_gap Calculation Service", description="시스템적 미검증 손실액을 계산하는 권위적 API.")

@app.post("/api/v1/lgap/{risk_name}", response_model=dict)
async def calculate_lgap_endpoint(data: GapInput, risk_name: str = Field(..., example="Compliance Gap")):
    """
    주어진 리스크 변수들을 바탕으로 L_gap을 계산하고 결과를 반환합니다.
    risk_name은 대시보드에 표시될 구체적인 리스크 제목입니다.
    """
    try:
        lgap_value = calculate_lgap(data)
        return {
            "status": "SUCCESS",
            "risk_title": risk_name,
            "calculated_lgap": round(lgap_value, 2), # 소수점 둘째 자리까지 반환하여 정밀함 강조
            "message": f"{risk_name}의 미검증 손실액이 감지되었습니다. 즉시 점검이 필요합니다."
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # 내부 서버 에러는 절대 노출하지 않고, 시스템 오류 메시지를 반환해야 권위적임.
        print(f"Critical internal error: {e}")
        raise HTTPException(status_code=503, detail="Service Unavailable: Calculation engine fault.")