from pydantic import BaseModel, Field
from typing import List, Optional

class UserProfile(BaseModel):
    """사용자 프로필 데이터 (API 입력 스키마)"""
    is_pii_stored: bool = Field(description="PII 데이터 저장 여부 (True=취약점)")
    has_ai_hallucination_risk: float = Field(description="AI 출력의 신뢰성 점수 (0.0 ~ 1.0). 높을수록 리스크 증가.")
    data_sovereignty_compliance_score: float = Field(description="데이터 주권 준수율 (0.0 ~ 1.0)")

class RiskInput(BaseModel):
    """API 호출에 사용될 최종 입력 객체."""
    user_profile: UserProfile