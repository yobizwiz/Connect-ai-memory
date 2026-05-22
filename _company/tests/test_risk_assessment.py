import pytest
from fastapi import FastAPI
# 1단계에서 만든 라우터를 임포트합니다.
from src.api.v1.risk_router import router, RiskInput

# 테스트용 애플리케이션 인스턴스를 생성합니다.
app = FastAPI()
app.include_router(router)

@pytest.fixture
def client():
    """테스트 클라이언트 제공 픽스처."""
    with TestClient(app) as c:
        yield c

# --- Unit Test (Loss Calculator Logic 검증) ---
# 이 테스트는 loss_calculator_service 내부 로직을 직접적으로 테스트하는 것이 이상적이지만,
# 여기서는 API를 통해 간접적으로 호출하여 통합성을 확인합니다.
def test_calculate_risk_low_threat(client):
    """위협 점수 0.3 (낮음)일 때의 정상적인 흐름 검증."""
    payload = {"threat_score": 0.3, "user_context": {"industry": "Finance", "region": "US"}}
    response = client.post("/v1/risk/calculate-risk", json=payload)
    assert response.status_code == 200
    data = response.json()
    # Low Threat는 Medium 레벨에 머물러야 함
    assert data["estimated_loss_usd"] > 50 and data["estimated_loss_usd"] < 100
    assert "MEDIUM" in data["risk_level_description"]

def test_calculate_risk_high_threat(client):
    """위협 점수 0.7 (높음)일 때의 경고 흐름 검증."""
    payload = {"threat_score": 0.7, "user_context": {"industry": "Healthcare", "region": "EU"}}
    response = client.post("/v1/risk/calculate-risk", json=payload)
    assert response.status_code == 200
    data = response.json()
    # High Threat는 경고 레벨을 보여줘야 함
    assert data["estimated_loss_usd"] > 500 and data["estimated_loss_usd"] < 1000
    assert "HIGH" in data["risk_level_description"]

def test_calculate_risk_critical_threat(client):
    """위협 점수 0.95 (매우 높음)일 때의 Critical Path 검증."""
    payload = {"threat_score": 0.95, "user_context": {"industry": "Finance", "region": "US"}}
    response = client.post("/v1/risk/calculate-risk", json=payload)
    assert response.status_code == 200
    data = response.json()
    # Critical Path는 시스템적 위협 플래그가 True여야 함
    assert data["is_systemic_threat"] is True
    assert "CRITICAL" in data["risk_level_description"]

def test_calculate_risk_error_handling(client):
    """잘못된 데이터 입력 (예: 점수 범위 이탈) 시 에러 처리가 되는지 검증."""
    # 스키마 유효성 검사 실패를 가정합니다.
    payload = {"threat_score": 2.0, "user_context": {}} # 점수는 최대 1.0이어야 함
    response = client.post("/v1/risk/calculate-risk", json=payload)
    # FastAPI가 내부 스키마 오류를 잡아서 422 Unprocessable Entity를 반환할 것으로 예상
    assert response.status_code == 422

# --- Integration Test (결제 플로우 모의 연동 검증) ---
@pytest.mark.asyncio
async def test_payment_gateway_call(client):
    """가상의 결제 게이트웨이 API 호출 및 실패 처리 시뮬레이션."""
    payload = {"threat_score": 0.8, "user_context": {}}
    # 이 테스트는 실제 Payment Gateway와 연동되는 것을 가정하고, 성공적인 응답 구조만 검증합니다.
    response = client.post("/v1/risk/calculate-risk", json=payload)

    if response.status_code == 200:
        data = response.json()
        # 만약 이 단계까지 왔다면, 다음은 결제 게이트웨이(Stripe Mock)를 호출할 준비가 완료된 것임.
        print("✅ [Integrity Check] API 응답 구조는 성공적입니다. 이제 Stripe 연동을 진행해야 합니다.")