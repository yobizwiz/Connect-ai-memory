from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List
import os

# 로컬 임포트 경로 설정 (실제 프로젝트 구조에 맞게 조정 필요)
# 이 가정 하에서는 src/services가 상위 레벨에 있다고 간주합니다.
from src.services.risk_service import run_system_diagnosis, DiagnosisResult 


class DiagnoseRequest(BaseModel):
    """API 요청 바디 스키마 (Pydantic 사용으로 자동 유효성 검증 확보)"""
    company_size: int = Field(..., description="고객사 규모 (직원 수). 1 이상이어야 합니다.")
    data_storage_years: int = Field(..., ge=1, description="핵심 데이터 보존 기간 (년). 최소 1년이 필요합니다.")
    is_using_ai: bool = Field(True, description="AI 기술 활용 여부. 현재의 규제 리스크 가중치에 반영됩니다.")


router = APIRouter()

@router.post("/diagnose", response_model=dict, status_code=status.HTTP_200_OK)
async def diagnose_system(request: DiagnoseRequest):
    """
    [POST /api/v1/diagnose] 
    사용자의 시스템 운영 공백을 진단하고 재정적 최대 잠재 손실액($L_{max}$)을 계산합니다.
    
    Args:
        request: DiagnosisRequest 객체 (Pydantic 유효성 검사 통과 필요).

    Returns:
        진단 결과가 담긴 JSON 딕셔너리.
    """
    try:
        # Pydantic validation이 이미 company_size, data_storage_years의 타입 및 경계값을 보장합니다.
        
        # 서비스 레이어 호출 (핵심 비즈니스 로직)
        diagnosis_result: DiagnosisResult = run_system_diagnosis(
            company_size=request.company_size,
            data_storage_years=request.data_storage_years,
            is_using_ai=request.is_using_ai
        )

        # Mock 데이터 사용 계획 명시: 
        # 이 결과물은 현재 하드코딩된 Mock 로직이며, 향후 Researcher가 제공하는 
        # '글로벌 규제 법률 조항 DB'와 연동하여 실시간으로 $L_{max}$를 재계산해야 합니다.
        print("💡 [WARNING] API 성공적으로 호출되었으나, 결과값은 현재 Mock 데이터입니다.")

        return diagnosis_result.to_dict()

    except ValueError as e:
        # 비즈니스 로직 레벨에서 발생한 오류 (예: 입력값이 유효하지 않은 경우)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        # 예상치 못한 시스템 에러 처리 (최후의 방어선 역할)
        print(f"🚨 [CRITICAL ERROR] Unhandled exception in diagnose_system: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="시스템 진단 처리 중 알 수 없는 오류가 발생했습니다. 관리자에게 문의하세요.")