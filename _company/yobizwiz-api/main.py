from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import time
import random

app = FastAPI()

# 요청 본문 스키마 정의
class RiskInput(BaseModel):
    user_id: str
    data_payload: dict  # 예시 데이터 페이로드
    context: str

@app.post("/api/v1/calculate-risk")
async def calculate_risk(input_data: RiskInput):
    """
    가상 리스크 계산 API 엔드포인트. 
    부하 테스트를 위해 지연 시간과 실패 가능성을 의도적으로 포함함.
    """
    print(f"--- [API] 요청 수신: {input_data.user_id} ---")
    
    # 1. 부하 시뮬레이션 (지연 시간)
    latency = random.uniform(0.2, 1.5)
    time.sleep(latency)
    
    # 2. 장애 조건 시뮬레이션: 5% 확률로 서버 과부하 또는 외부 API 실패 가정
    if random.random() < 0.05:
        print("!!! [API] ERROR: Rate Limit Exceeded / Service Unavailable !!!")
        raise HTTPException(status_code=503, detail="Service Overloaded. Please try again later.")

    # 3. 리스크 로직 실행 (Placeholder)
    try:
        # 실제로는 복잡한 DB 조회, LLM 호출 등이 여기서 발생함.
        risk_score = sum(input_data.data_payload.get(k, 0) for k in ['compliance', 'security']) * random.uniform(1.5, 2.5)
        y_loss = round(risk_score * 1000 + random.randint(100, 999), -3) # $ 단위로 반올림
    except Exception as e:
        print(f"!!! [API] CRITICAL ERROR during calculation: {e}")
        raise HTTPException(status_code=500, detail="Internal processing error. Cannot calculate risk.")

    # 4. 성공 응답 구조화 (시스템 로그 권위 부여)
    report = {
        "status": "SUCCESS",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "risk_level": "CRITICAL" if y_loss >= 5000 else ("HIGH" if y_loss >= 2000 else "LOW"),
        "calculated_y_loss": y_loss,
        "report_id": f"YOB-{int(time.time())}-{random.randint(1000, 9999)}",
        "message": f"Analysis completed successfully. Recommend immediate action to mitigate ${y_loss:,.2f} loss."
    }
    print("--- [API] 성공적으로 응답 처리 완료 ---")
    return report

# API가 정상적으로 시작되는지 확인하는 Root Endpoint 추가
@app.get("/")
def read_root():
    return {"status": "System Online", "api_version": "v1"}