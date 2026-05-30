from pydantic import BaseModel, Field
from typing import Literal

class RiskInputsModel(BaseModel):
    """
    클라이언트로부터 받는 리스크 진단 입력 데이터 스키마. (가드 및 타입 강제)
    """
    industry_sector: str = Field(..., description="진단 대상 산업 분야 (예: 의료, 금융, 제조)")
    regulatory_compliance_level: Literal["None", "Basic", "Advanced", "Critical"] = Field(..., 
                                                                      description="현재 규제 준수 수준. Critical일수록 리스크 증가.")
    data_storage_duration_years: int = Field(..., ge=1, le=50, description="핵심 PII 데이터 보존 기간 (년).")
    ai_usage_level: Literal["None", "Internal Only", "Public Facing"] = Field(..., 
                                                            description="AI 기능의 노출 레벨. 높은 노출은 리스크 증가 요인.")


class RiskReportModel(BaseModel):
    """
    API가 반환하는 최종 재무적 리스크 보고서 스키마.
    모든 필드는 명확한 의미를 가져야 합니다.
    """
    calculated_lmax: float = Field(..., description="최대 예상 손실액 (단위: KRW). 1억 ~ 50억 사이 값.")
    risk_score_tre: float = Field(..., description="구조적 재앙 예측 점수 (TRE). 0.0 ~ 100.0 스케일.")
    report_summary: str = Field(..., description="계산된 리스크를 사용자에게 경고하는 권위적인 요약 보고서.")
    audit_log: ImmutableAuditLog = Field(..., description="진단에 사용된 불변의 감사 로그 기록체인 블록.")