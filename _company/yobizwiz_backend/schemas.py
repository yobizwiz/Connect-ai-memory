from pydantic import BaseModel, Field
from typing import Dict, Any

# --- 입력 스키마 (Master Risk Schema 기반) ---
class RiskInput(BaseModel):
    """
    사용자로부터 받는 비정형 리스크 데이터를 구조화합니다. 
    이 데이터가 TRE 계산의 근거 자료가 됩니다.
    """
    client_identifier: str = Field(..., description="진단 대상 고객사 ID")
    data_source_type: str = Field(..., description="데이터 출처 (예: WebLog, InternalDB)")
    raw_risk_metrics: Dict[str, float] = Field(..., description="원시 리스크 지표 맵 (KPI들 포함)")

# --- 출력 스키마 (TRE 계산 결과) ---
class TREResult(BaseModel):
    """
    시스템이 최종적으로 제공하는 구조화된 진단 결과입니다.
    위협 경고 로직을 담기 위해 추가 필드를 두었습니다.
    """
    calculated_tre: float = Field(..., description="Total Risk Exposure (TRE) 값")
    risk_level: str = Field(..., description="진단 레벨 (e.g., CRITICAL, WARNING, SAFE)")
    structural_gap_identified: bool = Field(..., description="구조적 공백 진단 여부")
    is_critical: bool = Field(False, description="임계값 초과로 인해 즉각적인 조치가 필요한지 (Glitch Trigger)")
    alert_message: str = Field("시스템 무결성 감사 필요", description="사용자에게 노출할 경고 메시지")