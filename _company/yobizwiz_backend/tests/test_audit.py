import pytest
from fastapi.testclient import TestClient
from yobizwiz_backend.main import app, audit_service
from yobizwiz_backend.services.audit_ledger import AuditLedgerService

# 1. FastAPI TestClient 인스턴스 생성
client = TestClient(app)

@pytest.fixture(autouse=True)
def run_before_and_after_tests():
    """각 테스트 실행 전 감사 원장을 초기화합니다."""
    audit_service.ledger.clear()
    yield

def test_audit_ledger_service_direct():
    """AuditLedgerService의 기본 기능 및 해시체인 형성 무결성을 직접 검증합니다."""
    service = AuditLedgerService()
    
    # Genesis Block 해시 확보
    assert service._genesis_hash == "0" * 64
    
    # 1. 첫 번째 감사 로그 적재
    block1 = service.append_log(user_id="USR_001", action="DIAGNOSIS", details={"tre": 750.5})
    assert block1["id"] == 1
    assert block1["user_id"] == "USR_001"
    assert block1["action"] == "DIAGNOSIS"
    assert block1["previous_hash"] == service._genesis_hash
    assert len(block1["hash"]) == 64
    
    # 2. 두 번째 감사 로그 적재 (이전 해시 연결 검증)
    block2 = service.append_log(user_id="USR_001", action="PAYMENT", details={"amount": 299000})
    assert block2["id"] == 2
    assert block2["previous_hash"] == block1["hash"]
    
    # 3. 체인 무결성 검사
    assert service.verify_chain() is True

def test_audit_ledger_tampering_detection():
    """감사 원장 내의 데이터가 미세하게 위변조되었을 때, 해시 무결성 검증이 이를 정확히 걸러내는지 검증합니다."""
    service = AuditLedgerService()
    
    service.append_log(user_id="USR_002", action="DIAGNOSIS", details={"tre": 120.0})
    service.append_log(user_id="USR_002", action="PAYMENT", details={"amount": 299000})
    
    assert service.verify_chain() is True
    
    # 데이터 변조 시도 (details 내용 수정)
    service.ledger[0]["details"]["tre"] = 9999.0
    
    # 검증 실패 감지
    assert service.verify_chain() is False

def test_audit_endpoints_via_api():
    """감사 API 엔드포인트를 통한 감사 로그 적재 및 검증 API를 테스트합니다."""
    # 1. 감사 로그 추가 API 호출
    payload = {
        "user_id": "USR_API_TEST",
        "action": "DIAGNOSIS",
        "details": {"score": 850, "alert": True}
    }
    response = client.post("/api/audit/logs", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["user_id"] == "USR_API_TEST"
    assert data["action"] == "DIAGNOSIS"
    assert "hash" in data
    
    # 2. 검증 API 호출
    verify_response = client.get("/api/audit/verify")
    assert verify_response.status_code == 200
    verify_data = verify_response.json()
    assert verify_data["is_valid"] is True
    assert "완벽하게 증명" in verify_data["message"]

def test_calculate_risk_auto_logging():
    """calculate_risk API를 호출하면 감사 원장에 자동으로 DIAGNOSIS 로그가 추가되는지 검증합니다."""
    payload = {
        "user_data": {
            "user_profile": {
                "user_id": "USR_AUTO_LOG",
                "data_storage_location": ["AWS S3"],
                "has_consent": {"GDPR": True, "HIPAA": False},
                "data_type_inventory": {"PII": 150, "PHI": 20}
            }
        }
    }
    
    # calculate_risk 호출
    response = client.request("GET", "/api/calculate_risk", json=payload)
    assert response.status_code == 200
    
    # 원장에 기록이 적재되었는지 확인
    logs = audit_service.get_logs()
    assert len(logs) == 1
    assert logs[0]["user_id"] == "USR_AUTO_LOG"
    assert logs[0]["action"] == "DIAGNOSIS"
    assert logs[0]["details"]["violation_count"] == 1
    
    # 전체 체인 무결성 검증 통과 여부
    assert audit_service.verify_chain() is True
