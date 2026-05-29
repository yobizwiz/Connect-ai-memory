from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from typing import Dict, Any
from .services.risk_engine import RiskEngineService

app = FastAPI(title="Yobizwiz Risk Engine API", version="1.0")
risk_service = RiskEngineService() # Singleton instance for consistency

# -----------------------------------------------------
# Endpoint 1: GET /api/calculate_risk - 실시간 리스크 점수 계산 및 진단
# -----------------------------------------------------
@app.get("/api/calculate_risk", response_model=Dict[str, Any], summary="실시간 규제 기반 위험 노출도(TRE) 계산")
async def calculate_risk(user_data: dict = Body(..., embed=True)):
    """
    사용자 입력 데이터를 받아 GDPR, CCPA, HIPAA 등 주요 규제별 리스크 점수를 실시간으로 계산합니다.
    이 함수는 시스템의 핵심 지표인 총 위험 노출도(TRE)를 산출하는 역할을 합니다.
    """
    try:
        # 1. 데이터 유효성 검증 (가드 로직)
        if not user_data or "user_profile" not in user_data:
            raise ValueError("필수 사용자 프로필 데이터를 제공해주세요.")

        # 2. 리스크 엔진 호출 및 결과 받기
        results = risk_service.calculate_risk(user_data["user_profile"])

        return {
            "status": "SUCCESS",
            "message": "규제 기반 위험 진단이 완료되었습니다.",
            "risk_metrics": results
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # 예상치 못한 오류는 내부 에러 로그를 남기고 사용자에게 일반적인 실패 메시지를 전달해야 합니다.
        print(f"Internal Server Error during risk calculation: {e}")
        raise HTTPException(status_code=500, detail="시스템 오류로 리스크 계산을 수행할 수 없습니다.")


# -----------------------------------------------------
# Endpoint 2: POST /api/diagnosis_request - 진단 요청 및 구매 유도 로직
# -----------------------------------------------------
@app.post("/api/diagnosis_request", summary="진단 결과를 바탕으로 솔루션 구매 여부 결정 (Paywall Trigger)")
async def request_diagnosis(data: dict = Body(...)):
    """
    클라이언트가 계산된 리스크 점수를 보내 진단 요청을 합니다. 
    리스크 등급이 'Critical'일 경우에만, 다음 단계인 유료 솔루션 구매 모달로의 진입을 트리거합니다.
    """
    # 1. POST Body에서 핵심 데이터 추출 및 검증
    try:
        risk_score = data.get("tre_score")
        violation_count = data.get("violation_count")

        if risk_score is None or violation_count is None:
            raise ValueError("진단 요청을 위해 'tre_score'와 'violation_count'가 모두 필요합니다.")
        
        # 2. 핵심 비즈니스 로직 (Paywall 트리거)
        if risk_score > 75 and violation_count >= 1: # 임계점 설정 (Threshold Logic)
            return {
                "status": "CRITICAL",
                "message": "🚨 경고! 시스템적 생존 위험도가 매우 높습니다. 즉각적인 전문 진단이 필요합니다.",
                "action": "TRIGGER_PAYWALL", 
                "payload": {"recommended_product": "Survival Insurance Plan"} # 프론트엔드에 전달할 정보
            }
        else:
            return {
                "status": "LOW_RISK",
                "message": "현재 리스크 레벨은 관리 가능한 수준입니다. 다음 검토를 권장합니다.",
                "action": "CONTINUE_FREE_TRIAL"
            }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# -----------------------------------------------------
# 프로젝트 초기화 및 실행 지침 (README용)
# -----------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)