from pydantic import BaseModel, Field
from typing import Dict, Any

# 1. 입력 스키마: 클라이언트가 전송할 핵심 변수 정의 (필수 항목만 명시)
class RiskInputVariables(BaseModel):
    """Loss Meter를 구동하는 데 필요한 핵심 운영 데이터를 받습니다."""
    regulatory_compliance_score: float = Field(..., description="규제 준수 지표 (0.0 ~ 1.0)")
    operational_efficiency_rate: float = Field(..., description="운영 효율성 비율 (0.0 ~ 1.0)")
    market_volatility_index: float = Field(..., description="시장 변동성 지수 (낮을수록 안정적)")

# 2. 출력 스키마: API가 반환할 구조화된 경고 JSON 형식 정의
class RiskAssessmentResponse(BaseModel):
    """위험 평가 결과 및 구체적인 재무 손실액($X)를 담는 응답 객체."""
    risk_level: str = Field(..., description="전반적인 위험 등급 (CRITICAL, HIGH, MEDIUM, LOW)")
    loss_detected_usd: float = Field(..., description="구조적 결함으로 인해 예상되는 재무 손실액 ($X).")
    message: str = Field(..., description="사용자에게 보여줄 경고 메시지 및 행동 유도 문구.")
    is_critical: bool = Field(..., description="위험 등급이 'CRITICAL'인지 여부. UI 강제 적용 플래그.")

# 3. API 호출 성공 시 메타 정보 (추가)
class ServiceStatusResponse(BaseModel):
    """API가 정상적으로 작동함을 알리는 상태 응답."""
    status: str = "SUCCESS"
    timestamp: str = Field(..., description="응답 시간")