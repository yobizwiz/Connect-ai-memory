from typing import Optional, Dict, Any
import hashlib
from pydantic import BaseModel, Field

class ImmutableAuditLog(BaseModel):
    """
    [시스템 무결성 확보] 모든 리스크 계산 결과에 첨부되는 불변의 감사 로그 블록 구조.
    SHA-256 체인 구조를 강제합니다.
    """
    timestamp: str = Field(description="로그 기록 시점 (ISO 8601)")
    data_payload: Dict[str, Any] = Field(description="실제 리스크 계산에 사용된 입력 데이터 요약")
    previous_hash: Optional[str] = Field(default=None, description="이전 블록의 SHA-256 해시 값 (체인 무결성)")
    current_data_summary: str = Field(description="현재 거래/진단에 대한 핵심 결과 요약")
    hash_value: str = Field(description="이 블록 전체 데이터의 SHA-256 해시 값 (불변 증명)")

def calculate_log_hash(log_data: 'ImmutableAuditLog') -> str:
    """
    주어진 로그 객체의 모든 내용을 문자열로 직렬화하여 SHA-256 해시를 계산합니다.
    이 함수가 블록의 불변성을 보장하는 핵심입니다.
    """
    # 안정적인 해싱을 위해 순서대로 정렬된 JSON 문자열 사용
    data_string = f"{log_data.timestamp}{log_data.data_payload}{log_data.previous_hash or ''}{log_data.current_data_summary}"
    return hashlib.sha256(data_string.encode('utf-8')).hexdigest()