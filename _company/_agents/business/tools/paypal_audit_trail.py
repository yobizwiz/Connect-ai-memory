#!/usr/bin/env python3
# version: paypal_audit_trail_v1
"""PayPal API 권한 감사 시스템 (Audit Trail) MVP

이 도구는 현재 등록된 PayPal API 자격증명(Client ID / Secret)의 권한 범위를 진단하고,
비즈니스 통합에 필수적인 6대 핵심 권한의 획득 여부를 Pass/Fail 형태로 상세 감사하여 보고서를 생성합니다.
"""
import os, sys, json, base64, urllib.request, urllib.parse, urllib.error
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
CONFIG = os.path.join(HERE, "paypal_revenue.json")
REPORT_DIR = os.path.join(HERE, "..", "..", "..", "Strategy_Documentation")
REPORT_PATH = os.path.join(REPORT_DIR, "paypal_api_audit_report.md")

REQUIRED_SCOPES = {
    "https://uri.paypal.com/services/reporting/search/read": {
        "name": "Transaction Search (매출 조회 권한)",
        "purpose": "일별/주별/월별 매출 및 거래 내역 수집",
        "risk_if_missing": "CRITICAL (매출 대시보드 마비 및 $QLoss$ 시뮬레이션 불가)"
    },
    "https://uri.paypal.com/services/disputes/read-seller": {
        "name": "Dispute Read (분쟁 조회 권한)",
        "purpose": "고객 환불 소송 및 분쟁(Dispute) 내역 실시간 모니터링",
        "risk_if_missing": "HIGH (분쟁 발생 시 자동 대응 불가, 강제 환불 리스크 노출)"
    },
    "https://uri.paypal.com/services/disputes/update-seller": {
        "name": "Dispute Write (분쟁 대응 권한)",
        "purpose": "분쟁 건에 대한 자동 입증 및 증적 제출 자동화",
        "risk_if_missing": "MEDIUM (분쟁 발생 시 수동 서류 제출 필요로 비용 증가)"
    },
    "https://uri.paypal.com/services/invoicing": {
        "name": "Invoicing (인보이스 관리 권한)",
        "purpose": "자동 감사 영수증 및 보증서 인보이스 발행",
        "risk_if_missing": "HIGH (구조 무결성 보증 인보이스 자동 발행 불가)"
    },
    "https://uri.paypal.com/services/subscriptions": {
        "name": "Subscriptions (구독 결제 관리)",
        "purpose": "Bronze/Silver 등급의 자동 갱신 결제 정보 연동",
        "risk_if_missing": "HIGH (구독 취소/갱신 상태 추적 불능으로 미결제 자원 누출)"
    },
    "https://uri.paypal.com/services/payments/payment/authcapture": {
        "name": "Payment Capture (결제 처리 권한)",
        "purpose": "컴플라이언스 진단 승인 즉시 자동 실결제 캡처",
        "risk_if_missing": "CRITICAL (즉각적인 게이트웨이 매출 발생 차단)"
    }
}

def _load_config():
    if not os.path.exists(CONFIG):
        print(f"❌ 설정 파일을 찾을 수 없습니다: {CONFIG}", file=sys.stderr)
        sys.exit(1)
    with open(CONFIG, "r", encoding="utf-8") as f:
        return json.load(f)

def get_oauth_scopes(base_url: str, client_id: str, client_secret: str) -> list:
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
            return (resp.get("scope") or "").split()
    except Exception as e:
        print(f"❌ OAuth 인증 실패: {e}", file=sys.stderr)
        sys.exit(1)

def build_audit_report(mode: str, client_id: str, scopes: list) -> str:
    now = datetime.now(timezone.utc)
    lines = []
    lines.append(f"# 🛡️ PayPal API 권한 감사 결과 보고서 (Audit Trail)")
    lines.append(f"진단 시점: `{now.strftime('%Y-%m-%d %H:%M:%S UTC')}` | 운영 모드: **{mode.upper()}**")
    lines.append(f"대상 Client ID: `{client_id[:12]}...{client_id[-12:]}`")
    lines.append("")
    lines.append("## 📊 권한 획득 요약표")
    lines.append("")
    lines.append("| 권한 구분 | 목적 | 상태 (Status) | 미확보 시 리스크 등급 |")
    lines.append("|---|---|---|---|")
    
    passed_count = 0
    total_count = len(REQUIRED_SCOPES)
    
    for scope_uri, spec in REQUIRED_SCOPES.items():
        has_scope = scope_uri in scopes
        if has_scope:
            status_str = "🟢 **PASS** (획득 완료)"
            passed_count += 1
        else:
            status_str = "🔴 **FAIL** (미인증)"
            
        lines.append(f"| **{spec['name']}** | {spec['purpose']} | {status_str} | {spec['risk_if_missing']} |")
        
    lines.append("")
    lines.append(f"### 🛡️ 무결성 점수: **{int((passed_count / total_count) * 100)}%** ({passed_count} / {total_count} 확보)")
    lines.append("")
    
    lines.append("## 🔍 상세 취약성 진단 및 대응 가이드")
    lines.append("")
    
    for scope_uri, spec in REQUIRED_SCOPES.items():
        if scope_uri not in scopes:
            lines.append(f"### ❌ 미확보: {spec['name']}")
            lines.append(f"- **위험 레벨:** `{spec['risk_if_missing']}`")
            lines.append(f"- **미확보 영향:** {spec['purpose']} 기능이 완전히 차단되어 자동 복구 프로세스가 작동하지 않습니다.")
            lines.append(f"- **즉시 조치 가이드:**")
            lines.append(f"  1. [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications) 접속")
            lines.append(f"  2. **{mode.upper()}** 모드 탭 선택 후 해당 애플리케이션 클릭")
            lines.append(f"  3. 하단 **Features** 목록에서 해당 권한 항목(체크박스) 체크")
            lines.append(f"  4. **Save Changes** 버튼을 눌러 승인 프로토콜 갱신")
            lines.append("")
            
    if passed_count == total_count:
        lines.append("🎉 **보안 무결성 확보 완료:** 모든 핵심 비즈니스 API 권한이 성공적으로 인가되었습니다. 데이터 흐름에 대한 완전한 가시성 확보가 준비되었습니다.")
        
    return "\n".join(lines)

def main():
    cfg = _load_config()
    mode = cfg.get("MODE", "sandbox")
    client_id = cfg.get("CLIENT_ID", "")
    client_secret = cfg.get("CLIENT_SECRET", "")
    
    base_url = "https://api-m.paypal.com" if mode == "live" else "https://api-m.sandbox.paypal.com"
    
    print("🚀 [Step 1] Requesting OAuth access token to fetch granted scopes...")
    scopes = get_oauth_scopes(base_url, client_id, client_secret)
    
    print("🚀 [Step 2] Executing system security audit trail...")
    report = build_audit_report(mode, client_id, scopes)
    
    # Save the report to Strategy_Documentation folder
    os.makedirs(REPORT_DIR, exist_ok=True)
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write(report)
        
    print(f"✅ 감사 완료! 보고서가 성공적으로 저장되었습니다: {REPORT_PATH}")
    print("\n---------------- REPORT PREVIEW ----------------")
    # Output the table portion
    table_lines = [l for l in report.split("\n") if "|" in l or "무결성 점수" in l]
    for tl in table_lines[:15]:
        print(tl)
    print("------------------------------------------------")

if __name__ == "__main__":
    main()
