from pydantic import BaseModel, Field, validator
from typing import List, Optional

class AuditRequest(BaseModel):
    """사용자로부터 받는 감사 요청 데이터 구조."""
    client_name: str = Field(..., description="진단 대상 고객사 이름.")
    industry_sector: str = Field(..., description="산업 분야 (예: 금융, 의료, 제조).")
    regulatory_concern: str = Field(..., description="가장 우려되는 규제 준수 영역 (예: PII 마스킹, 감사 추적).")
    current_process_description: Optional[str] = Field(None, description="현재 사용하고 있는 프로세스에 대한 상세 설명.")

    @validator('client_name')
    def validate_client_name(cls, v):
        if not v.strip():
            raise ValueError('클라이언트 이름은 필수입니다.')
        return v.strip()

class AuditReport(BaseModel):
    """시스템이 반환하는 진단 보고서의 최종 구조."""
    report_id: str = Field(..., description="발급된 보고서의 고유 ID.")
    generated_at: str = Field(..., description="보고서 생성 시간 (ISO 8601).")
    overall_risk_score: float = Field(..., ge=0.0, le=10.0, description="종합 리스크 점수 (10점 만점, 높을수록 위험).")
    compliance_status: str = Field(..., description="진단 상태 ('High Risk', 'Moderate Risk', 'Compliant').")
    critical_vulnerabilitys: List[str] = Field(..., description="발견된 치명적 취약점 목록.")
    recommendations: List[str] = Field(..., description="즉각적인 개선 및 감사 권고 사항 목록.")