from fastapi import FastAPI, HTTPException, Body
from typing import List, Dict, Any
# 로직 모듈 임포트 (절대 경로 사용 원칙 준수)
from src.api.risk_service import calculate_total_max_loss, SimulationRequest

app = FastAPI(title="Risk Simulation API", version="v1")

@app.get("/healthcheck")
def health_check():
    """API 서버의 기본적인 동작 여부를 확인하는 엔드포인트."""
    return {"status": "Operational", "message": "Risk Engine Ready"}


@app.post("/risk-simulation")
async def run_risk_simulation(request: SimulationRequest = Body(...)):
    """
    산업군 및 사업 모델을 입력받아 총합 최대 손실액 (L_totalMax)을 계산하는 핵심 엔드포인트.
    데이터 무결성 검증 후 시뮬레이션을 수행합니다.
    """
    print(f"\n--- [API CALL] 요청 수신: Industry={request.industry}, Model={request.business_model} ---")

    # 1. 입력 유효성 검사 (Pydantic이 기본적으로 처리하지만, 추가적인 비즈니스 규칙 강제)
    if not request.industry or not request.business_model:
        raise HTTPException(status_code=400, detail="Industry와 Business Model은 필수 값입니다.")

    # 2. 핵심 로직 호출 및 데이터 검증
    simulation_result = calculate_total_max_loss(request.industry, request.business_model)
    
    if not simulation_result["success"]:
        raise HTTPException(status_code=503, detail=f"데이터 서비스 장애: {simulation_result['error']}")

    # 3. 성공 응답 반환 (Response Model을 명시적으로 사용하여 데이터 무결성을 보장)
    return {
        "message": "L_totalMax 시뮬레이션이 성공적으로 완료되었습니다.",
        "total_max_loss": simulation_result["total_max_loss"],
        "details": simulation_result["detailed_risk_breakdown"]
    }

# 서버 실행 명령어 (사용자 참고용)
# run_command: uvicorn src.api.main_api:app --reload