from fastapi import FastAPI, HTTPException
from backend.src.models.risk_inputs import RiskInputsModel, RiskReportModel
from backend.src.services.risk_calculator import calculate_lmax_and_report
import os

app = FastAPI(title="Provenance Audit Layer API", version="1.0.0")

@app.get("/health")
def read_root():
    return {"status": "Operational", "service": "Audit Engine Online"}

@app.post("/api/calculate_risk", response_model=RiskReportModel)
async def calculate_risk(inputs: RiskInputsModel):
    """
    사용자 입력값에 기반하여 $L_{max}$와 구조적 리스크 보고서를 계산하는 엔드포인트입니다.
    이 함수는 이전 블록의 해시가 필요합니다만, 초기 호출 시에는 기본값을 사용합니다.
    (실제 운영 환경에서는 사용자 세션/DB에서 이전 해시를 로딩해야 합니다.)
    """
    try:
        # 임시로 시스템 시작 시점의 더미 해시를 전달합니다. 
        previous_hash = "0" * 64 
        report = calculate_lmax_and_report(inputs, previous_block_hash=previous_hash)
        return report
    except Exception as e:
        # 치명적인 예외 발생 시 에러를 잡아내고 사용자에게 권위적으로 전달합니다.
        print(f"Critical Error during risk calculation: {e}")
        raise HTTPException(status_code=500, detail="SYSTEM FAILURE: 리스크 계산 모듈에 구조적 오류가 발생했습니다. 관리자 개입 필요.")

# FastAPI 실행 명령어는 uvicorn을 통해 외부에서 호출할 것을 가정합니다.