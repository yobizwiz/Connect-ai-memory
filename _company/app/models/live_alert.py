from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class RiskCaseStudy(BaseModel):
    """Researcher가 제공한 개별 고위험 사례 연구의 구조화된 데이터."""
    case_id: str
    violation_law: str  # 예: EU AI Act
    focus: str          # 핵심 위험 영역 (예: Provenance Mandate)
    estimated_max_fine_lmax: str # 최대 벌금액 강조 문자열
    impact_focus: str   # 법적/재무적 영향
    severity_score: float = 0.0

class LiveAlertData(BaseModel):
    """프론트엔드에 노출될 최종 경고 데이터 패키지."""
    timestamp: datetime
    alert_level: str  # CRITICAL, WARNING, INFORMATIONAL
    primary_risk_title: str # 가장 강력한 제목 (Writer의 카피 활용)
    secondary_risks: List[RiskCaseStudy] = [] # 하위 위험 목록
    suggested_action: str # 해결책 제시 (yobizwiz 구매 유도)
    visual_direction_hint: Optional[str] = "Glitch Noise / Red Flashing"