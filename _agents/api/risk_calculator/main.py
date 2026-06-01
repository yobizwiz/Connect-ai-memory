from fastapi import FastAPI, Body, HTTPException
from typing import List
import uvicorn # 서버 실행을 위한 라이브러리
# 로컬 모듈 임포트 (path: services/risk_engine)
from .services.risk_engine import get_risk_calculation_result
from .schemas import CompanyInput, RiskCalculationResult

# API 인스턴스화
app = FastAPI(title="Risk Assessment Engine", version="v1")


@app.post("/api/v1/calculate-risk", response_model=RiskCalculationResult)
async def calculate_risk_endpoint(company_data: CompanyInput = Body(...)):
    """
    클라이언트가 전송한 기업 데이터를 받아 통합 위험 점수(TRE Score)와 
    Top 3 리스크를 계산하여 반환하는 핵심 엔드포인트.
    
    Defensive Check: 입력 데이터 유효성 검증을 최우선으로 합니다.
    """
    print(f"\n[API 호출 감지] 분석 시작: {company_data.company_name}")
    
    # Pydantic 모델의 데이터를 dict로 변환하여 엔진에 전달 (type casting 방지)
    input_dict = company_data.model_dump()

    try:
        # 핵심 비즈니스 로직 호출
        result = get_risk_calculation_result(input_dict)
        print(f"✨ 계산 완료. 최종 위험 레벨: {result.overall_risk_level}")
        return result
        
    except Exception as e:
        # 예상치 못한 내부 오류는 500 Internal Server Error로 처리
        print(f"🚨 치명적 엔진 에러 발생: {e}")
        raise HTTPException(status_code=500, detail="Internal Risk Calculation Failure. Check server logs.")


if __name__ == "__main__":
    # 로컬 테스트 실행을 위한 명령어 (실제 배포는 Docker/Cloud Function 사용 권장)
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)