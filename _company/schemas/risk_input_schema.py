from pydantic import BaseModel, Field, validator
from typing import Optional

# 사용자가 입력할 가상의 사용자 데이터 구조 정의
class UserProfileInput(BaseModel):
    """위협 게이지 API의 입력을 위한 표준화된 스키마."""
    industry: str = Field(..., description="산업 분야 (예: 금융, 의료, 제조)")
    employee_count: int = Field(..., ge=1, description="직원 수")
    has_compliance_audit: bool = Field(..., description="최근 규정 감사 이력 보유 여부")
    data_storage_size_tb: float = Field(..., gt=0.0, description="저장 데이터 크기 (TB)")

# API 응답 구조 정의
class RiskReportOutput(BaseModel):
    """API 호출의 최종 반환값 스키마."""
    risk_score_tre: float = Field(..., description="위협 점수 (Threat Rating Evaluation) - 0~100")
    is_red_zone: bool = Field(..., description="임계값 초과 여부. Red Zone 진입 시 True.")
    estimated_lmax_usd: float = Field(..., description="$L_{max}$: 최대 잠재 손실액 (USD)")
    threat_messages: list[dict] = Field(..., description="Red Zone일 경우 제시되는 구체적인 위협 메시지 배열.")
    status_code: str = Field(..., description="현재 위험 상태 코드 (Green, Yellow, Red).")