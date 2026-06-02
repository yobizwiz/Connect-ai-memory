from pydantic import BaseModel, Field
from typing import List, Dict, Optional

# --- API Input Schema ---
class ClientInput(BaseModel):
    """클라이언트가 시스템에 입력하는 핵심 사업 정보."""
    industry_sector: str = Field(description="업종 섹터 (예: FinTech, HealthCare)")
    operational_history_years: int = Field(description="운영 기간 (년)")
    ai_integration_level: float = Field(ge=0.0, le=1.0, description="AI 의존도 (0.0 ~ 1.0). 높은 값일수록 규제 리스크 증가.")

# --- API Output Schema ---
class RiskCalculationResult(BaseModel):
    """최종 계산된 리스크 점수 및 상세 내역."""
    l_total_max: float = Field(description="총 최대 잠재 손실액 (Total Maximum Loss, USD).")
    detailed_breakdown: Dict[str, float] = Field(description="각 구성 요소별 세부 금액 분해.")
    risk_level_description: str = Field(description="계산된 점수를 기반으로 한 경고 레벨 설명.")

# --- 내부 데이터 모델 (KnowledgeBase 구조 반영) ---
class RegulatoryViolation(BaseModel):
    """개별 규제 위반 시나리오의 파라미터."""
    regulation_code: str = Field(description="규정 코드")
    min_fine_usd: float = Field(description="최소 예상 벌금액 (Min Fine)")
    max_settlement_cost_usd: float = Field(description="합의 가능한 최대 비용")

# 전역 데이터셋 (KnowledgeBase/regulatory_standards_guide.md 기반 시뮬레이션)
REGULATORY_DATASET: List[RegulatoryViolation] = [
    RegulatoryViolation(regulation_code="GDPR-Art17", min_fine_usd=50000, max_settlement_cost_usd=200000), # 데이터 삭제 권한 미준수
    RegulatoryViolation(regulation_code="HIPAA-Sec3", min_fine_usd=30000, max_settlement_cost_usd=150000),  # 의료 정보 보호 규정 위반
    RegulatoryViolation(regulation_code="SEC-Mislead", min_fine_usd=10000, max_settlement_cost_usd=50000)   # 투자자 기만 행위
]