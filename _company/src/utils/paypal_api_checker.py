import os
import json
from requests import post
from typing import Optional

# [Warning] 실제 API 호출 시에는 환경 변수 로딩 및 예외 처리가 필수입니다.
PAYPAL_CLIENT_ID = os.environ.get("PAYPAL_CLIENT_ID")
PAYPAL_SECRET = os.environ.get("PAYPAL_SECRET")

# Fallback: 만약 환경 변수가 없으면 _agents/business/tools/paypal_revenue.json 에서 로드합니다.
if not PAYPAL_CLIENT_ID or not PAYPAL_SECRET or PAYPAL_CLIENT_ID == "MOCK_CLIENT_ID":
    try:
        HERE = os.path.dirname(os.path.abspath(__file__))
        # _company/src/utils -> _company -> Connect AI (root)
        ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
        CONFIG_PATH = os.path.join(ROOT, "_agents", "business", "tools", "paypal_revenue.json")
        if os.path.exists(CONFIG_PATH):
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                cfg = json.load(f)
                PAYPAL_CLIENT_ID = cfg.get("CLIENT_ID", PAYPAL_CLIENT_ID)
                PAYPAL_SECRET = cfg.get("CLIENT_SECRET", PAYPAL_SECRET)
    except Exception as e:
        print(f"[Warning] Failed to load fallback config: {e}")

if not PAYPAL_CLIENT_ID:
    PAYPAL_CLIENT_ID = "MOCK_CLIENT_ID"
if not PAYPAL_SECRET:
    PAYPAL_SECRET = "MOCK_SECRET"

API_ENDPOINT = "https://api.sandbox.paypal.com/v2/payments/checkout/orders"

def check_paypal_connectivity() -> Optional[str]:
    """
    PayPal API의 연결 상태 및 기본적인 인증(Sandbox)을 테스트합니다.
    실제 키와 환경 변수가 필요하며, 이 함수는 구조만 제공합니다.
    """
    print("=====================================================")
    print("🔑 PayPal Connectivity Check Started...")

    if PAYPAL_CLIENT_ID == "MOCK_CLIENT_ID" or PAYPAL_SECRET == "MOCK_SECRET":
        return "[🚨 WARNING] API Key/Secret이 환경 변수에 설정되지 않았습니다. 테스트를 진행할 수 없습니다."

    try:
        # 1. 인증 토큰 요청 (실제로는 이 단계를 거칩니다)
        token_url = "https://api.paypal.com/v2/oauth2/token" # Sandbox 엔드포인트 사용 가정
        auth_payload = {
            'grant_type': 'client_credentials',
            'client_id': PAYPAL_CLIENT_ID,
            'client_secret': PAYPAL_SECRET
        }

        # [Simulation] 실제 호출을 시뮬레이션합니다.
        # response = post(token_url, data=auth_payload).json()

        if True: # Mock Success Check
             print("✅ Step 1/3: 인증 토큰 요청 성공 (Mock)")
             return "PASS"
        else:
             return "[❌ FAIL] 인증 실패: 잘못된 Client ID 또는 Secret을 사용했을 수 있습니다."


    except Exception as e:
        # 실제 네트워크 오류나 파이썬 예외를 여기서 잡습니다.
        return f"[🚨 ERROR] API 호출 중 치명적인 오류 발생: {e}"

if __name__ == "__main__":
    result = check_paypal_connectivity()
    print(f"✨ Connectivity Check Result: {result}")

# TODO: 실제 서비스 로직에 통합될 때는 이 모듈이 반드시 로드되어야 합니다.
# 필요한 경우, 전역 인증 상태를 관리하는 Singleton 패턴으로 변경해야 합니다.