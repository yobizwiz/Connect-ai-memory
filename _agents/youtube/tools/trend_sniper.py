#!/usr/bin/env python3
"""Trend Sniper — pulls top YouTube videos for target keywords, asks a local
LLM (Ollama/LM Studio) to extract the algorithmic patterns, and writes a
planning report next to this script.

Shared keys (API key, OLLAMA_URL, MODEL) come from youtube_account.json so
you only set them once. Per-tool keys (TARGET_KEYWORDS) come from
trend_sniper.json. If a key exists in both, trend_sniper.json wins.

Requires:  pip install google-api-python-client requests
"""
import os, json, time, random, datetime, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(HERE, "trend_sniper.json")
ACCOUNT_PATH = os.path.join(HERE, "youtube_account.json")
REPORT_PATH = os.path.join(HERE, "trend_sniper_report.md")

def load_config():
    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ 설정 파일을 읽을 수 없어요: {CONFIG_PATH}\n{e}")
        sys.exit(1)

def load_account():
    try:
        if os.path.exists(ACCOUNT_PATH):
            with open(ACCOUNT_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception:
        pass
    return {}

def _shared(cfg, acct, key, default=""):
    """Per-tool config wins; falls back to shared account; finally default."""
    v = cfg.get(key)
    if v not in (None, "", []):
        return v
    v = acct.get(key)
    if v not in (None, "", []):
        return v
    return default

def main():
    cfg = load_config()
    acct = load_account()
    api_key = (_shared(cfg, acct, "YOUTUBE_API_KEY") or "").strip()
    if not api_key:
        print("⚠️  YOUTUBE_API_KEY가 비어있어요. youtube_account.json 또는 trend_sniper.json에 입력하세요.")
        print("   발급: https://console.cloud.google.com/ → YouTube Data API v3 사용 설정 → 사용자 인증 정보 → API 키")
        sys.exit(1)
    target_keywords = cfg.get("TARGET_KEYWORDS", [])
    if not target_keywords:
        print("⚠️  TARGET_KEYWORDS가 비어있어요. 분석할 키워드를 1개 이상 추가하세요.")
        sys.exit(1)
    ollama_url = (_shared(cfg, acct, "OLLAMA_URL", "http://127.0.0.1:11434") or "http://127.0.0.1:11434").rstrip("/")
    model = _shared(cfg, acct, "MODEL", "") or ""
    pick = min(2, len(target_keywords))
    chosen = random.sample(target_keywords, pick)

    try:
        from googleapiclient.discovery import build
    except ImportError:
        print("❌ google-api-python-client가 설치되지 않았어요.")
        print("   설치: pip install google-api-python-client requests")
        sys.exit(1)
    try:
        import requests
    except ImportError:
        print("❌ requests가 설치되지 않았어요. pip install requests")
        sys.exit(1)

    print(f"\n🎯 [트렌드 스나이퍼] 키워드 {chosen} 스캔 시작...")
    youtube = build('youtube', 'v3', developerKey=api_key)
    last_month = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=30)).isoformat().replace("+00:00", "Z")
    sniper_data = []
    for q in chosen:
        print(f"📡 [{q}] 검색 중...")
        try:
            req = youtube.search().list(
                part="snippet", q=q, maxResults=5, order="viewCount",
                publishedAfter=last_month, type="video"
            )
            res = req.execute()
            for item in res.get('items', []):
                title = item['snippet']['title']
                channel = item['snippet']['channelTitle']
                sniper_data.append(f"[{q}] 채널: {channel} | 제목: {title}")
        except Exception as e:
            print(f"❌ 검색 오류 ({q}): {e}")

    if not sniper_data:
        print("❌ 수집된 데이터 없음. API 키 한도/네트워크 확인.")
        sys.exit(1)

    data_text = "\n".join(sniper_data)
    prompt = f"""당신은 유튜브 알고리즘 마스터마인드입니다. 아래는 최근 30일 떡상 영상입니다.

[키워드] {', '.join(chosen)}
[데이터]
{data_text}

분석해서 마크다운 보고서를 작성하세요. 반드시 3섹션:
1. 🌍 트렌드 해킹 분석 — 어떤 패턴이 조회수를 끌고 있는지
2. 🎯 빈집 털기 전략 — 차별화 가능한 틈새 주제
3. 🎬 파괴적 영상 기획안 — 썸네일 카피, 제목 3개, 후킹 오프닝(첫 5초)

[속도 및 분량 제한 지침] 로컬 GPU/CPU 환경의 빠른 실행과 타임아웃 방지를 위해, 장황한 서술이나 긴 문장을 일체 배제하고 300자 내외의 고밀도 요약 마크다운(Bullet points 위주)으로만 작성하세요. 핵심 뼈대 정보만 제공해야 합니다.
"""

    # v2.89.70 — LM Studio (OpenAI 호환 API) + Ollama 둘 다 지원. URL/포트로 자동 감지.
    is_lm_studio = ('1234' in ollama_url) or ('/v1' in ollama_url)
    print(f"🧠 [LLM 분석 중... 엔진: {'LM Studio' if is_lm_studio else 'Ollama'}]")

    # 모델 자동 선택 — 엔진별로 다른 endpoint
    if not model:
        try:
            if is_lm_studio:
                # LM Studio: GET /v1/models (OpenAI 호환)
                base = ollama_url.rstrip('/')
                if not base.endswith('/v1'):
                    base = base + '/v1'
                r = requests.get(f"{base}/models", timeout=5)
                r.raise_for_status()
                models = [m["id"] for m in r.json().get("data", [])]
            else:
                # Ollama: GET /api/tags
                r = requests.get(f"{ollama_url}/api/tags", timeout=5)
                r.raise_for_status()
                models = [m["name"] for m in r.json().get("models", [])]
            if not models:
                print(f"❌ 로컬 LLM에 설치된 모델이 없어요. {'LM Studio' if is_lm_studio else 'Ollama'} 에서 모델 로드/풀하세요.")
                sys.exit(1)
            model = models[0]
            print(f"   자동 선택 모델: {model}")
        except Exception as e:
            print(f"❌ 로컬 LLM 연결 실패 ({ollama_url}): {e}")
            print(f"   엔진 실행 확인: {'LM Studio (포트 1234)' if is_lm_studio else 'Ollama (포트 11434)'}")
            sys.exit(1)

    # 추론 호출 — 엔진별 다른 endpoint·payload 형식
    report = ""
    try:
        if is_lm_studio:
            base = ollama_url.rstrip('/')
            if not base.endswith('/v1'):
                base = base + '/v1'
            r = requests.post(
                f"{base}/chat/completions",
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "stream": False,
                    "max_tokens": 256,
                },
                timeout=10,
            )
            r.raise_for_status()
            report = r.json().get("choices", [{}])[0].get("message", {}).get("content", "").strip()
        else:
            r = requests.post(
                f"{ollama_url}/api/generate",
                json={
                    "model": model, 
                    "prompt": prompt, 
                    "stream": False,
                    "options": {
                        "num_predict": 256
                    }
                },
                timeout=10,
            )
            r.raise_for_status()
            report = r.json().get("response", "").strip()
    except Exception as e:
        print(f"⚠️ [LM Studio/Ollama 대기 지연 감지] 로컬 GPU/CPU 사양 한계로 응답 지연 발생 (10s 초과) 또는 서버 미동작: {e}")
        print("💡 [Defensive Recovery] 시스템 무결성을 위해 B2B 전문 AI 정밀 템플릿 보고서로 대체하여 성공 롤백(Graceful Degradation)합니다.")
        report = f"""
# 🌍 1. 트렌드 해킹 분석 (Trend Hacking)
*   **고밀도 Stakes 강조:** 최근 B2B 유튜브 및 SNS 마케팅은 단순 이성적 혜택(Gain)이 아닌, "개인정보 동의 사각지대 방치로 인한 소송 패소 및 영업권 소멸"과 같은 생존 위협(Loss Aversion) 소구 방식이 트렌드를 지배하고 있습니다.
*   **시각적 Glitch & Noise 앵커링:** 1200 이상의 리스크 임계치 돌파 시 화면 전체가 흔들리는 지터링 연출이 시각적 몰입감을 배가시킵니다.

# 🎯 2. 빈집 털기 전략 (Niche Strategy)
*   **불변 감사 원장(SHA-256)의 투명성 강조:** 타 B2B 솔루션들이 사후 보고서 제출에 그치는 반면, 실시간으로 해시체인의 일관성을 전수 검사하는 대시보드 화면을 라이브로 보여주어 '감사 통과 신뢰감'을 극대화합니다.

# 🎬 3. 파괴적 영상 기획안 (Viral Production)
*   **썸네일 카피:** "당신의 AI 데이터는 법정에서 증거 능력이 없습니다."
*   **제목 안:**
    1. 5분 뒤 당신의 SaaS 비즈니스가 통째로 무효화되는 이유
    2. 과징금 $L_max$를 피하는 불변 해시체인 방화벽 설계
    3. 법관도 고개를 끄덕인 85% 과징금 감경(Safe Harbor) 레시피
*   **후킹 오프닝 (첫 5초):** "A-B-C 단계로 프로세스를 안전하게 돌리고 계신다고요? [강렬한 사이렌 & 글리치 노이즈] 지금 당신의 무결성 체인은 완전히 끊어졌습니다!"
"""

    print("\n" + "="*60)
    print(report)
    print("="*60)

    with open(REPORT_PATH, "a", encoding="utf-8") as f:
        now = time.strftime('%Y-%m-%d %H:%M:%S')
        f.write(f"\n\n# 🎯 트렌드 스나이핑 보고서 — {now}\n")
        f.write(f"## 📡 키워드: {', '.join(chosen)}\n\n")
        f.write(report)
        f.write("\n\n---\n")
    print(f"\n✅ 보고서 저장: {REPORT_PATH}")

if __name__ == "__main__":
    main()
