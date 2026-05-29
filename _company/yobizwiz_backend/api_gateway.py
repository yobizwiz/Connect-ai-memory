from fastapi import FastAPI, HTTPException, status
from typing import Dict, Any
# [근거: self-import] 내부적으로 정의된 스키마와 서비스 레이어를 사용합니다.
from .schemas import RiskInput, TREResult 
from .services.risk_engine import diagnose_risk

app = FastAPI(
    title="Yobizwiz API Gateway",
    description="구조적 리스크 진단 및 총 위험 노출도 (TRE) 계산 게이트웨이 v1.0"
)

@app.post("/api/v1/calculate_tre", response_model=TREResult, status_code=status.HTTP_200_OK)
async def calculate_tre_endpoint(input: RiskInput):
    """
    클라이언트가 제출한 데이터를 받아 TRE를 계산하고 구조적 리스크 진단 결과를 반환합니다.
    이 엔드포인트는 단순 API 호출을 넘어, '시스템 경고' 경험을 사용자에게 제공하는 핵심 무기입니다.
    """
    try:
        # 1. 서비스 계층 호출 (비즈니스 로직 실행)
        tre_value, risk_level, structural_gap, alert_message = diagnose_risk(input)

        # 2. 결과 모델 생성 및 반환
        return TREResult(
            calculated_tre=tre_value,
            risk_level=risk_level,
            structural_gap_identified=structural_gap,
            is_critical=(tre_value >= 50.0), # 로직 재확인 (코드의 일관성)
            alert_message=alert_message
        )

    except Exception as e:
        # 예상치 못한 시스템 오류 발생 시, 고객에게 '시스템 에러' 경험 제공
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
            detail={
                "error": "SYSTEM_FAILURE",
                "message": f"진단 서비스가 일시적으로 다운되었습니다. (내부 오류 코드: {type(e).__name__}). 데이터 무결성 검증이 필요합니다.",
                "retry_suggestion": True
            }
        )