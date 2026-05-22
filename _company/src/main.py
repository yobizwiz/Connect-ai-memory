# API 서버 실행용 진입점 파일
from fastapi import FastAPI
from src.api.risk_calculator import app # 위에서 만든 앱 인스턴스를 가져옵니다.

# 메인 FastAPI 앱을 설정합니다. (실제 프로젝트 구조에 따라 조정 필요)
app = FastAPI(title="Yobizwiz Main API", version="v1")
app.include_router(app, prefix="/api/v1") # 리스크 계산 라우터를 포함시킵니다.

@app.get("/")
def read_root():
    return {"message": "yobizwiz Backend System Operational. /api/v1/risk-assessment 엔드포인트를 사용하세요."}