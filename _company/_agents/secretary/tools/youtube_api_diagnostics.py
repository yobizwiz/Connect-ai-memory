#!/usr/bin/env python3
import os, sys, json, time, urllib.request, urllib.parse, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
# Resolve root directory: Connect AI
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))

ACCOUNT_JSON = os.path.join(ROOT, "_agents", "youtube", "tools", "youtube_account.json")
OAUTH_JSON = os.path.join(ROOT, "_agents", "youtube", "oauth.local.json")
REPORT_PATH = os.path.join(HERE, "youtube_api_diagnostics_report.md")

def log(msg):
    print(msg)
    sys.stdout.flush()

def main():
    log("==================================================")
    log("🔍 YouTube API & OAuth 연동 상태 정밀 진단 시작")
    log("==================================================")
    
    if not os.path.exists(ACCOUNT_JSON):
        log(f"❌ 설정 파일 없음: {ACCOUNT_JSON}")
        sys.exit(1)
        
    with open(ACCOUNT_JSON, "r", encoding="utf-8") as f:
        acct = json.load(f)
        
    api_key = acct.get("YOUTUBE_API_KEY", "").strip()
    channel_id = acct.get("MY_CHANNEL_ID", "").strip()
    channel_handle = acct.get("MY_CHANNEL_HANDLE", "").strip()
    client_id = acct.get("YOUTUBE_OAUTH_CLIENT_ID", "").strip()
    client_secret = acct.get("YOUTUBE_OAUTH_CLIENT_SECRET", "").strip()
    
    log(f"  API 키 확인: {'✅ 설정됨' if api_key else '❌ 미설정'}")
    log(f"  채널 ID 확인: {channel_id or '❌ 미설정'}")
    log(f"  채널 핸들 확인: {channel_handle or '❌ 미설정'}")
    
    data_api_success = False
    channel_title = "N/A"
    sub_count = "N/A"
    view_count = "N/A"
    
    # 1. YouTube Data API 통신 테스트
    if api_key and channel_id:
        try:
            log("📡 1. YouTube Data API 서버와 핸드셰이크 요청 중...")
            url = f"https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id={channel_id}&key={api_key}"
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=10) as response:
                res_data = json.loads(response.read().decode())
                items = res_data.get("items", [])
                if items:
                    data_api_success = True
                    snippet = items[0].get("snippet", {})
                    stats = items[0].get("statistics", {})
                    channel_title = snippet.get("title", "N/A")
                    sub_count = stats.get("subscriberCount", "0")
                    view_count = stats.get("viewCount", "0")
                    log(f"  ✅ Data API 연동 성공!")
                    log(f"  📺 채널명: {channel_title}")
                    log(f"  👥 구독자수: {int(sub_count):,}명")
                    log(f"  👁️ 누적조회수: {int(view_count):,}회")
                else:
                    log("  ❌ Data API 응답 오류: 채널 정보를 찾을 수 없습니다. (ID 확인 필요)")
        except Exception as e:
            log(f"  ❌ Data API 통신 실패: {e}")
    else:
        log("  ❌ API Key 또는 채널 ID가 설정되지 않아 Data API 테스트를 건너뜁니다.")
        
    # 2. OAuth 토큰 및 애널리틱스 연동 테스트
    oauth_success = False
    oauth_scope_details = ""
    oauth_expires_in = "N/A"
    
    if os.path.exists(OAUTH_JSON):
        try:
            log("📡 2. 로컬 OAuth 토큰 유효성 검증 중...")
            with open(OAUTH_JSON, "r", encoding="utf-8") as f:
                oauth_data = json.load(f)
            
            access_token = oauth_data.get("access_token", "")
            expires_at = oauth_data.get("expires_at", 0)
            
            # Check Token Info via Google API
            tokeninfo_url = f"https://www.googleapis.com/oauth2/v3/tokeninfo?access_token={access_token}"
            req = urllib.request.Request(tokeninfo_url)
            try:
                with urllib.request.urlopen(req, timeout=10) as response:
                    info = json.loads(response.read().decode())
                    oauth_success = True
                    oauth_scope_details = info.get("scope", "")
                    oauth_expires_in = info.get("expires_in", "N/A")
                    log("  ✅ OAuth 엑세스 토큰 검증 성공! (현재 토큰이 유효합니다)")
                    log(f"  🔑 승인된 권한 범위(Scopes): {oauth_scope_details}")
                    log(f"  ⏳ 남은 만료 시간: {oauth_expires_in}초")
            except urllib.error.HTTPError as he:
                # Token might be expired, try refreshing if refresh_token is present
                refresh_token = oauth_data.get("refresh_token", "")
                if refresh_token and client_id and client_secret:
                    log("  ⚠️  엑세스 토큰이 만료되어 리프레시 토큰으로 자동 갱신을 시도합니다...")
                    # Try refresh
                    refresh_url = "https://oauth2.googleapis.com/token"
                    payload = urllib.parse.urlencode({
                        "client_id": client_id,
                        "client_secret": client_secret,
                        "refresh_token": refresh_token,
                        "grant_type": "refresh_token"
                    }).encode("utf-8")
                    refresh_req = urllib.request.Request(refresh_url, data=payload, method="POST")
                    with urllib.request.urlopen(refresh_req, timeout=10) as refresh_resp:
                        refresh_res_data = json.loads(refresh_resp.read().decode())
                        new_access_token = refresh_res_data.get("access_token", "")
                        new_expires_in = refresh_res_data.get("expires_in", 3600)
                        
                        # Save new token
                        oauth_data["access_token"] = new_access_token
                        oauth_data["expires_at"] = int(time.time() * 1000) + (new_expires_in * 1000)
                        with open(OAUTH_JSON, "w", encoding="utf-8") as f_w:
                            json.dump(oauth_data, f_w, indent=2)
                        
                        oauth_success = True
                        oauth_expires_in = str(new_expires_in)
                        oauth_scope_details = "유튜브 애널리틱스 및 데이터 (갱신 성공)"
                        log("  ✅ 리프레시 토큰을 이용한 액세스 토큰 자동 갱신 완료!")
                        log(f"  ⏳ 새 토큰 만료 시간: {new_expires_in}초")
                else:
                    log(f"  ❌ OAuth 토큰 만료 및 갱신 실패 (클라이언트 ID/시크릿 혹은 리프레시 토큰 미비): {he}")
        except Exception as e:
            log(f"  ❌ OAuth 검증 실패: {e}")
    else:
        log("  ❌ oauth.local.json 파일이 존재하지 않아 OAuth 테스트를 건너뜁니다.")
        
    # Generate Report
    report_content = f"""# 📊 YouTube 연동 정밀 진단 보고서
_작성 일시: {time.strftime('%Y-%m-%d %H:%M:%S')}_

유튜브 데이터 API 및 애널리틱스 OAuth 권한의 실제 서버 통신 상태를 정밀 체크한 진단서입니다.

---

## 📡 1. YouTube Data API 통신 상태
*   **API 연결 상태:** {"🟢 정상 작동 (Success)" if data_api_success else "🔴 연결 실패 (Failed)"}
*   **채널 이름:** `{channel_title}`
*   **구독자 수:** `{int(sub_count):,}명` (비공개인 경우 0으로 표기 가능)
*   **누적 조회수:** `{int(view_count):,}회`
*   **진단 세부 정보:** {"성공적으로 구글 유튜브 데이터 서버와 핸드셰이크를 완료했습니다." if data_api_success else "API 키가 올바르지 않거나 하루 쿼터(할당량)를 초과했을 수 있습니다."}

---

## 🔐 2. YouTube 애널리틱스 OAuth 권한 상태
*   **OAuth 인증 상태:** {"🟢 정상 인증 (Authenticated)" if oauth_success else "🔴 인증 실패/미연동 (Unauthenticated)"}
*   **보안 토큰 유효 시간:** `{oauth_expires_in}초`
*   **승인된 권한 범위(Scopes):** `{oauth_scope_details}`
*   **진단 세부 정보:** {"구글 OAuth 서버가 유저님의 로그인 인증서(AccessToken)를 정식 승인 완료했습니다." if oauth_success else "OAuth 연동이 완료되지 않았거나 토큰이 완전히 유효하지 않습니다."}

---

## 🎯 종합 진단 및 권장 액션
{"✅ **API 및 애널리틱스 권한이 모두 정상 연동되었습니다!** 이제 비디오를 업로드하시거나 레오 에이전트에게 정밀 보고서를 언제든 요청하실 수 있습니다." if (data_api_success and oauth_success) else "⚠️  **일부 연동 상태에 점검이 필요합니다.** 오류 로그를 참조하여 설정을 확인해 주세요."}
"""
    
    with open(REPORT_PATH, "w", encoding="utf-8") as f_r:
        f_r.write(report_content)
        
    log("==================================================")
    log(f"✅ 진단 완료 및 보고서 저장 성공! ({REPORT_PATH})")
    log("==================================================")

if __name__ == "__main__":
    main()
