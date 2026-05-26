from fastapi import FastAPI
from src.api.v1.diagnosis_router import router as diagnosis_router

# 🚀 API 게이트웨이 초기화
app = FastAPI(title="yobizwiz Diagnosis Engine", description="시스템적 생존 위협 분석 엔진")

# 라우터 등록
app.include_router(diagnosis_router)


# 실행 명령어 예시 (사용자가 직접 확인하도록 안내)
print("--- API Gateway setup complete ---")
print("To run the service, execute: uvicorn src.main:app --reload")