from fastapi import FastAPI, HTTPException
from app.models import ClientInput, RiskCalculationResult
from app.services.risk_engine import calculate_l_total_max, determine_risk_level

# API 인스턴스 초기화
app = FastAPI(title="TRE Risk Calculator API", version="1.0.0")

@app.post("/api/v1/calculate-risk", response_model=RiskCalculationResult)
async def calculate_risk_endpoint(input: ClientInput):
    """
    클라이언트 입력값을 받아 총 최대 리스크 노출액 (L_totalMax)을 계산합니다.
    이 API는 B2B 서비스의 잠재적 법적/운영적 위험을 정량화하는 핵심 엔드포인트입니다.
    """
    try:
        # 1. Core Logic 실행 및 디버깅 결과 받기
        detailed_breakdown, l_total_max = calculate_l_total_max(input)

        # 2. 최종 위험 레벨 결정 (비즈니스 로직 적용)
        risk_level = determine_risk_level(l_total_max)

        # 3. 결과 모델 반환
        return RiskCalculationResult(
            l_total_max=round(l_total_max, 2),
            detailed_breakdown=detailed_breakdown,
            risk_level_description=risk_level
        )
    except Exception as e:
        # 치명적인 에러는 사용자에게 노출하지 않고, 시스템 오류로 처리합니다.
        print(f"🚨 CRITICAL ERROR during risk calculation: {e}")
        raise HTTPException(status_code=500, detail="Internal system error occurred during risk evaluation. Please check API logs.")