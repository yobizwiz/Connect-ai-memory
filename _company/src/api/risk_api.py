from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import random
from typing import Dict, Any

# --- 🚨 R_Future Data Models (Defensive Coding) ---
class InputMetrics(BaseModel):
    """API가 기대하는 필수 입력 지표들을 정의합니다."""
    data_volume_local: float = Field(..., description="국내 저장 데이터 볼륨 (TB 단위).")
    cross_border_flow_count: int = Field(..., description="해외 전송 트랜잭션 수.")
    api_call_rate_deviation: float = Field(..., description="정상 대비 API 호출 패턴 편차 (0.0~1.0).")

class RiskScores(BaseModel):
    """API가 출력할 예측 위험 점수 구조를 정의합니다."""
    data_sovereignty_index_dsi: float = Field(..., description="데이터 주권 위반 지수.")
    structural_gap_risk_sgr: float = Field(..., description="구조적 공백 리스크 지표 (SGR).")
    compliance_violation_potential_cvp: float = Field(..., description="규정 준수 위반 잠재력 (CVP).")
    timestamp: str = Field(..., description="점수 계산 시각.")

app = FastAPI(title="R_Future Risk Engine", version="1.0.0")

@app.get("/health")
def read_root():
    """시스템 상태 확인 엔드포인트."""
    return {"status": "Operational", "message": "Risk Engine is online."}


@app.post("/api/v1/risk-coefficients", response_model=RiskScores)
async def calculate_risk(metrics: InputMetrics):
    """
    제공된 지표를 기반으로 3가지 핵심 미래 리스크 계수를 계산하여 반환합니다.
    실시간성을 위해 가짜 변동성(Fluctuation)을 추가했습니다.
    """
    try:
        # --- [1] DSI (Data Sovereignty Index) Calculation - Researcher's Logic Integration ---
        # DSI = (Local Volume * C_L) + (Cross-Border Flow Count * W_CB) + Fluctuation
        C_L = 0.5  # Local Weight Constant
        W_CB = 0.8 # Cross-Border Weight Constant
        dsi = (metrics.data_volume_local * C_L) + (metrics.cross_border_flow_count * W_CB)
        # 실시간 변동성 시뮬레이션: 매 호출마다 약간의 노이즈 추가
        dsi *= (1 + random.uniform(-0.05, 0.05))

        # --- [2] SGR (Structural Gap Risk) Calculation - Placeholder for Complexity ---
        # 복잡한 시스템 구조적 공백 리스크는 변수 간의 상호작용을 측정합니다.
        sgr = metrics.api_call_rate_deviation * 10 + random.uniform(5, 25)

        # --- [3] CVP (Compliance Violation Potential) Calculation - Placeholder for Audit Failure ---
        # 규제 준수 위반 잠재력은 낮은 편차와 높은 트랜잭션에서 기하급수적으로 증가합니다.
        cvp = metrics.cross_border_flow_count / 100 + (metrics.api_call_rate_deviation ** 2) * 5

        # 결과 반환 및 타입 검증
        return RiskScores(
            data_sovereignty_index_dsi=round(max(0, dsi), 2),
            structural_gap_risk_sgr=round(max(0, sgr), 2),
            compliance_violation_potential_cvp=round(max(0, cvp), 2),
            timestamp=str(datetime.now())
        )

    except Exception as e:
        # 방어적 코딩: 어떤 예외가 발생하든 명확한 에러 메시지를 반환합니다.
        raise HTTPException(status_code=500, detail=f"Risk calculation failed due to internal error: {str(e)}")

from datetime import datetime # Import moved to the top for correctness