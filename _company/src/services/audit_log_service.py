import uuid
from datetime import datetime
from typing import Dict, Any
from pydantic import BaseModel, Field

# 🛡️ Defensive Data Model: 모든 API 입력에 대해 명확한 스키마 정의가 필수입니다.
class AttentionLogEntry(BaseModel):
    """Attention Point 로깅을 위한 데이터 구조."""
    user_id: str = Field(..., description="로그인 사용자 고유 ID.")
    session_id: str = Field(..., description="현재 세션의 고유 식별자 (재방문 방지).")
    attention_point_id: str = Field(..., description="사용자가 주목한 리스크 지점의 내부 ID (예: PII_RISK, HALLUCINATION_PROVENANCE).")
    interaction_type: str = Field(..., description="상호작용 유형 (scroll/click/dwell).")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict, description="추가 컨텍스트 정보 (예: 스크롤 위치, 클릭된 요소의 텍스트 등).")

# ------------------------------------------------------------
# 실제 DB 로직을 대체하는 더미 함수. 실제 운영 환경에서는 ORM과 트랜잭션 처리가 필요합니다.
async def log_attention_event(entry: AttentionLogEntry) -> str:
    """
    Attention Log 이벤트를 데이터베이스에 기록하는 비동기 서비스 레이어.
    실제로는 여기에 DB 연결 및 Transaction Commit 로직이 들어갑니다.
    """
    # 🐛 디버깅 포인트: 실제 운영에서는 여기서 트랜잭션 실패(DB Connection Error)를 처리해야 합니다.
    print(f"✅ [AUDIT LOG] User {entry.user_id} detected attention on '{entry.attention_point_id}' via {entry.interaction_type}.")
    # 가상으로 로그 ID 반환
    return str(uuid.uuid4())