from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, Any
# 로컬 모듈 임포트 (절대 경로 사용)
from .risk_calculator import process_risk_assessment

# --- Pydantic Schema Definition (Type Safety 확보) ---
class UserData(BaseModel):
    """API 요청 본문 스키마: 사용자 비즈니스 데이터를 강제 정의합니다."""
    compliance_score: float = 0.0      # 규정 위반에 따른 점수 (R_score)
    pii_level: str = "low"             # PII 민감도 ('low', 'medium', 'high')
    operational_instability: float = 0.0 # 운영 시스템 불안정 지표
    ai_bias_exposure: float = 0.0     # AI 모델 편향 노출 정도

app = FastAPI(
    title="Yobizwiz Lmax Risk Assessment API",
    description="클라이언트의 비즈니스 데이터를 받아 총 최대 재무 손실액($L_{totalMax}$)을 산출하고 진단 보고서를 생성합니다."
)

@app.post("/api/v1/assess_risk")
async def assess_risk(user: UserData):
    """
    사용자 데이터를 입력받아 리스크를 평가하는 엔드포인트입니다.
    이 API는 클라이언트의 데이터 무결성 검사 및 법적 생존 보험료 책정의 핵심 근거가 됩니다.
    """
    # Pydantic 모델을 딕셔너리로 변환하여 로직에 전달 (타입 안전성 확보)
    user_dict = user.model_dump()

    # 코어 로직 실행
    report = process_risk_assessment(user_dict)

    return {
        "status": "success",
        "data": report
    }

@app.get("/health")
async def health_check():
    """API 서비스의 가용성을 체크합니다."""
    return {"service": "Yobizwiz Lmax API", "status": "Operational"}