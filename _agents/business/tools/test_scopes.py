import os, sys, json, base64, urllib.request, urllib.parse, urllib.error

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")


HERE = os.path.dirname(os.path.abspath(__file__))
CONFIG = os.path.join(HERE, "paypal_revenue.json")

def _load():
    with open(CONFIG, "r", encoding="utf-8") as f:
        return json.load(f)

def main():
    cfg = _load()
    mode = cfg.get("MODE", "sandbox")
    client_id = cfg.get("CLIENT_ID", "")
    client_secret = cfg.get("CLIENT_SECRET", "")
    
    base_url = "https://api-m.paypal.com" if mode == "live" else "https://api-m.sandbox.paypal.com"
    auth = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
    req = urllib.request.Request(
        f"{base_url}/v1/oauth2/token",
        data=b"grant_type=client_credentials",
        headers={
            "Authorization": f"Basic {auth}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            resp = json.loads(r.read().decode())
            print("====================================")
            print("OAuth Response received successfully!")
            print(f"Mode: {mode.upper()}")
            print(f"Scopes: {resp.get('scope')}")
            print("====================================")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
