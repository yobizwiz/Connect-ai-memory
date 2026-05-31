from pydantic import BaseModel, Field
from typing import Dict, List, Optional

# --- 1. Input Schema: 리스크 입력 데이터 구조 정의 (Writer Form 기반) ---
class RegulatoryRisk(BaseModel):
    """특정 규제 도메인에 대한 위험도와 현재 대응 수준을 담는 스키마."""
    domain_name: str = Field(..., description="규제 영역 이름 (예: GDPR, AI Act)")
    # 1. 기본 벌금 예측치 (Static Base Fine): 해당 법규 위반 시 최소한의 벌금 예측치 (단위: 만 달러)
    base_fine_estimate: float = Field(..., gt=0, description="최소 예상 벌금액.")
    # 2. 내부 통제 시스템 성숙도 점수 (Control Maturity Score): 1(미흡) ~ 5(완벽). 대응책의 질적 평가.
    control_maturity_score: int = Field(..., ge=1, le=5, description="내부 통제 및 컴플라이언스 수준.")
    # 3. 데이터 공백 증폭 계수 (Structural Gap Multiplier): Researcher가 제공한 데이터를 활용하여, 시간 경과에 따른 책임 증가율.
    multiplier_trend: Optional[float] = Field(None, ge=1.0, description="구조적/시간적 위험 증폭 계수.")

class RiskInputPayload(BaseModel):
    """전체 리스크 평가 요청 본문 스키마."""
    report_date: str = Field(..., description="리스크 진단 보고서 작성일 (YYYY-MM-DD).")
    risks: List[RegulatoryRisk] = Field(..., description="평가할 모든 규제 영역의 목록.")

# --- 2. Output Schema: 계산된 리스크 결과 구조 정의 ---
class RiskScoreResult(BaseModel):
    """최종 산출물 (JSON) 스키마."""
    total_maximum_financial_loss_lmax: float = Field(..., description="총 예측 최대 재무 손실액 ($L_{max}$).")
    risk_breakdown: Dict[str, float] = Field(..., description="규제 영역별 기여 리스크 점수 상세 내역.")
    assessment_summary: str = Field(..., description="종합적인 법적 위험성 요약 및 조치 권고 사항.")