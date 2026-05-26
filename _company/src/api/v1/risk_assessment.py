# src/api/v1/risk_assessment.py

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import typing as t
from ..services.risk_engine import calculate_ele, RiskInputData, ELEResult

router = APIRouter()

# ==============================================================================
# 📄 API 스키마 정의 (Swagger/OpenAPI Spec 기준)
# ==============================================================================

class AssessmentRequest(BaseModel):
    """
    클라이언트가 전송할 리스크 지표 데이터.
    이 구조는 프론트엔드와 일치해야 합니다.
    """
    data: RiskInputData

# ------------------------------------------------------------------------------
@router.post("/v1/risk/assess", response_model=ELEResult)
async def assess_risk(request: AssessmentRequest, is_mock_mode: t.Optional[bool] = None):
    """
    고객의 리스크 지표를 받아 '추정 손실 노출액'과 위험 점수를 계산합니다.

    Args:
        request: MECE로 분류된 고객 데이터.
        is_mock_mode: 모드 설정 (True=Mock, False/None=Live). 필수적으로 명시해야 합니다.
                       (테스트 시 Mock 사용 권장)

    Returns:
        ELEResult 객체 - 최종 위험 점수 및 손실 노출액.
    """
    input_data = request.data
    
    # 🚨 시스템 무결성 검증 (Critical Check)
    if is_mock_mode is None and not hasattr(assessment_risk, '_is_live'):
        # 실제 배포 시 환경 변수를 통해 모드를 결정해야 함
        print("⚠️ WARNING: Mock Mode Flag Missing. Assuming Live Mode.")
        is_mock = False
    else:
        is_mock = bool(is_mock_mode)

    try:
        # 핵심 로직 호출 (Domain Layer 실행)
        result = calculate_ele(input_data, is_mock)
        return result
    except Exception as e:
        print(f"🔴 CRITICAL ERROR during risk assessment: {e}")
        raise HTTPException(status_code=500, detail="리스크 분석 엔진에서 처리할 수 없는 오류가 발생했습니다.")

# ------------------------------------------------------------------------------
# 테스트를 위한 의존성 주입 Mock (실제 운영 시 제거)
def mock_mode_dependency():
    """테스트 환경에서 강제로 Mock Mode로 설정하는 가짜 함수."""
    return True # always returns true for mocking

# ------------------------------------------------------------------------------