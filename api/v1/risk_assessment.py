from fastapi import APIRouter, HTTPException
from pydantic import ValidationError
from typing import Dict, Any
from .schemas import RiskInputVariables, RiskAssessmentResponse
from .risk_engine import ComplianceRiskEngine

# FastAPI 라우터 설정 (실제 API 엔드포인트 역할을 수행)
router = APIRouter()

# Singleton 패턴을 사용하여 리소스 관리를 단순화합니다.
_risk_engine = ComplianceRiskEngine()

@router.post("/api/v1/risk-assessment", response_model=RiskAssessmentResponse, summary="구조적 생존 위험 진단 API")
async def get_risk_assessment(variables: RiskInputVariables) -> Dict[str, Any]:
    """
    요청받은 핵심 변수들을 기반으로 구조적 재무 리스크를 계산하고 경고 JSON을 반환합니다.
    이 엔드포인트는 yobizwiz의 '영업 무기' 역할을 수행합니다.
    """
    try:
        # 1. 도메인 로직 호출 (핵심 비즈니스 규칙 적용)
        risk_level, loss_amount, message = _risk_engine.assess_risk(variables)

        # 2. 결과 구조화 및 반환 (JSON Schema 준수)
        response_data = RiskAssessmentResponse(
            risk_level=risk_level,
            loss_detected_usd=loss_amount,
            message=message,
            is_critical=(risk_level == "CRITICAL")
        )

        return response_data.model_dump()

    except ValidationError as e:
        # 스키마 유효성 검증 실패 처리 (API 계약 위반 시)
        raise HTTPException(status_code=400, detail=f"잘못된 입력 데이터 형식입니다. {e}")
    except Exception as e:
        # 예상치 못한 내부 오류 처리 (시스템 장애 감지 및 보고)
        print(f"CRITICAL API ERROR: {e}") # 로그 기록
        raise HTTPException(status_code=500, detail="내부 시스템 오류로 리스크 분석을 수행할 수 없습니다. 관리자에게 문의하세요.")