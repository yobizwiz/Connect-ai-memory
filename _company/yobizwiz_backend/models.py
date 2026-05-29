from pydantic import BaseModel, Field
from typing import Dict, List

# --- 1. 입력 데이터 스키마 (User Input Validation) ---
class UserProfileData(BaseModel):
    """API가 받을 사용자 프로필 데이터를 정의합니다."""
    user_id: str = Field(..., description="고유한 고객 식별자")
    data_storage_location: List[str] = Field(..., description="개인정보 저장 위치 목록 (예: AWS S3, 온프레미스)")
    has_consent: Dict[str, bool] = Field(..., description="주요 규제 동의 여부 (GDPR: true/false 등)")
    data_type_inventory: Dict[str, int] = Field(..., description="보유 데이터 유형별 개수 (예: 'PII': 100, 'PHI': 5)")


# --- 2. 리스크 점수 출력 스키마 (Structured Output) ---
class RegulationRiskScore(BaseModel):
    """단일 규제에 대한 위험 점수를 구조화하여 반환합니다."""
    regulation: str = Field(..., description="규제 이름 (GDPR, CCPA 등)")
    score: float = Field(..., ge=0.0, le=100.0, description="해당 규제 위반 시의 위험 점수 (0-100)")
    violation_details: str = Field(..., description="위반 사항 요약 및 근거")

class RiskMetricsOutput(BaseModel):
    """전체 리스크 지표를 모아서 반환합니다."""
    total_risk_exposure(TRE): float = Field(..., ge=0.0, le=100.0, description="총 위험 노출도 (Weighted Average). 0이 가장 안전.")
    violation_count: int = Field(..., ge=0, description="발견된 규제 미준수 사항의 총 개수")
    risk_scores: List[RegulationRiskScore] = Field(..., description="규제별 상세 리스크 점수 목록")