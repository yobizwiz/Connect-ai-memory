from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Literal
import datetime

# --- 1. 사용자 및 리스크 데이터 스키마 ---
class UserInput(BaseModel):
    """사용자로부터 받는 필수 정보 스키마."""
    user_id: str = Field(..., description="고유한 고객 ID (필수)")
    risk_area_of_interest: str = Field(..., description="관심 리스크 영역 (예: 규제 준수, 보안 취약점)")
    data_source_count: int = Field(..., ge=1, description="분석에 사용된 데이터 소스 개수")

class RiskDataPoint(BaseModel):
    """진단 과정에서 수집되는 단일 리스크 지표."""
    metric_name: str = Field(..., description="지표명 (예: PII 마스킹 실패율)")
    value: float = Field(..., ge=0.0, le=1.0) # 0.0 ~ 1.0 사이의 비율
    risk_level: str = Field(..., description="위험 레벨 (Low/Medium/High)")

# --- 2. 진단 결과 보고서 스키마 ---
class DiagnosisReport(BaseModel):
    """최종적으로 사용자에게 제공되는 구조화된 리스크 보고서."""
    report_id: str = Field(..., description="생성된 보고서 고유 ID")
    user_id: str
    total_risk_score: float = Field(..., ge=0.0, le=1.0) # 전체 위험 점수 (0.0 ~ 1.0)
    overall_assessment: str = Field(..., description="종합 평가 메시지 (공포 유발 문구 포함)")
    critical_issues: List[Dict] = Field(..., description="가장 심각한 문제점 리스트")

# --- 3. 결제 요청 및 응답 스키마 ---
class PaymentRequest(BaseModel):
    """결제를 위한 필수 정보와 진단 보고서 ID를 포함하는 요청 스키마."""
    report_id: str = Field(..., description="유효한 리포트 ID (진단 완료 후 접근 가능)")
    amount_usd: float = Field(..., gt=0, description="요청 결제 금액 (달러)")
    currency: Literal["USD"] = "USD"

class PaymentSuccessResponse(BaseModel):
    """결제 성공 시 PG로부터 받는 응답 구조."""
    transaction_id: str
    status: str = "SUCCESS"
    timestamp: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    premium_level: str # 예: Bronze, Silver, Gold (보험 등급화)