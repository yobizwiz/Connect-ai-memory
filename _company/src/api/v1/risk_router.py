from fastapi import APIRouter, Depends, HTTPException
# 절대 경로 참조 주의! 방금 만든 파일을 임포트합니다.
from src.services.risk_engine.calculator import calculate_ltotalmax, RiskInputPayload, LTotalMaxResult

router = APIRouter(prefix="/v1", tags=["RiskEngine"])

@router.post("/calculate_risk", response_model=LTotalMaxResult)
async def calculate_financial_risk(payload: RiskInputPayload):
    """
    주요 관할권 충돌을 분석하여 종합적인 $L_{totalMax}$를 계산합니다.
    입력 데이터는 여러 규제 위반 시나리오를 포함해야 합니다.
    """
    try:
        # 핵심 로직 호출 (비즈니스 로직 분리)
        result = calculate_ltotalmax(payload)
        return result
    except Exception as e:
        print(f"🚨 Critical Error during risk calculation: {e}") # 로그 기록 필수
        raise HTTPException(status_code=500, detail="Risk Engine 처리 중 알 수 없는 오류가 발생했습니다. 입력 데이터 구조를 확인해주세요.")