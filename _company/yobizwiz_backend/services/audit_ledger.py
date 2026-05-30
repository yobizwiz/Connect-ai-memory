import hashlib
import json
import time
from typing import Dict, List, Any

class AuditLedgerService:
    """
    SHA-256 해시체인 기반의 Immutable 감사 로그 원장 서비스입니다.
    이전 블록의 해시를 다음 블록이 참조하여 데이터 무결성을 보증합니다.
    """
    def __init__(self):
        # 메모리 기반 데이터 스토어 (실 사용 시에는 DB로 마이그레이션 가능)
        self.ledger: List[Dict[str, Any]] = []
        self._genesis_hash = "0" * 64

    def _calculate_hash(self, block: Dict[str, Any]) -> str:
        """
        블록의 무결성을 대표하는 SHA-256 해시값을 계산합니다.
        """
        # 해시 일관성을 확보하기 위해 키 정렬 후 JSON 문자열로 변환하여 인코딩
        serialized_block = json.dumps(
            {
                "id": block.get("id"),
                "user_id": block.get("user_id"),
                "action": block.get("action"),
                "details": block.get("details"),
                "timestamp": block.get("timestamp"),
                "previous_hash": block.get("previous_hash")
            },
            sort_keys=True
        )
        return hashlib.sha256(serialized_block.encode("utf-8")).hexdigest()

    def append_log(self, user_id: str, action: str, details: Dict[str, Any]) -> Dict[str, Any]:
        """
        새 감사 로그 블록을 생성하고 이전 블록과 해시체인으로 연결하여 원장에 추가합니다.
        """
        # [방어 가드 적용] 인자 데이터 무결성 검증
        if not user_id or not action:
            raise ValueError("감사 로그 기록을 위한 user_id와 action은 필수 항목입니다.")

        # 1. 이전 블록 해시 가져오기
        previous_hash = self._genesis_hash
        next_id = 1
        
        if self.ledger:
            last_block = self.ledger[-1]
            previous_hash = last_block.get("hash", self._genesis_hash)
            next_id = last_block.get("id", 0) + 1

        # 2. 블록 빌드
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        new_block = {
            "id": next_id,
            "user_id": user_id,
            "action": action,
            "details": details,
            "timestamp": timestamp,
            "previous_hash": previous_hash
        }

        # 3. 해시 계산 및 할당
        new_block["hash"] = self._calculate_hash(new_block)

        # 4. 원장 적재
        self.ledger.append(new_block)
        return new_block

    def verify_chain(self) -> bool:
        """
        전체 해시체인 원장의 위변조 무결성을 검증합니다.
        단 하나의 로그 데이터라도 조작되거나 끊어지면 False를 반환합니다.
        """
        for i in range(len(self.ledger)):
            current_block = self.ledger[i]
            
            # 1. 현재 블록 데이터 기준 해시 재계산 및 불일치 여부 검증
            recalculated = self._calculate_hash(current_block)
            if recalculated != current_block.get("hash"):
                return False

            # 2. 해시 체인 연결고리 검증 (이전 블록의 해시와 현재 블록의 previous_hash 일치 검사)
            if i > 0:
                previous_block = self.ledger[i - 1]
                if current_block.get("previous_hash") != previous_block.get("hash"):
                    return False
            else:
                # 첫 블록의 previous_hash 검증
                if current_block.get("previous_hash") != self._genesis_hash:
                    return False
                    
        return True

    def get_logs(self) -> List[Dict[str, Any]]:
        """
        전체 감사 로그 리스트를 가져옵니다.
        """
        return self.ledger
