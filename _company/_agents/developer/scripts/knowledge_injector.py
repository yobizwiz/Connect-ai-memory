import os
from datetime import datetime
import re

# --- 설정 상수 ---
REGULATORY_GUIDE_PATH = "KnowledgeBase/regulatory_standards_guide.md"
RESEARCHER_INPUT_PATH = "KnowledgeBase/Compliance_Accountability_Failure_Patterns_v2.md"
OUTPUT_METADATA_FILE = "KnowledgeBase/knowledge_injection_log.txt"

def inject_knowledge(source_path: str, target_path: str) -> str:
    """
    외부 출처의 지식 데이터를 읽어 메타데이터와 함께 목표 문서에 주입하고 기록합니다.
    Provenance과 업데이트 날짜를 명시하여 무결성을 보장합니다.
    """
    print(f"✅ 1. Source Reading: {source_path}")
    try:
        with open(source_path, 'r', encoding='utf-8') as f:
            new_data = f.read()
    except FileNotFoundError:
        return f"[ERROR] Source file not found at {source_path}"

    print(f"✅ 2. Target Reading: {target_path}")
    try:
        with open(target_path, 'r', encoding='utf-8') as f:
            existing_data = f.read()
    except FileNotFoundError:
        existing_data = "## 규제 표준 가이드 (KnowledgeBase)\n\n[초기 버전] 이 섹션은 초기화되었습니다."

    # --- 메타데이터 생성 및 주입 로직 ---
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    provenance_header = f"""
***
## 📚 지식 주입 기록 (Knowledge Injection Log) - {timestamp}
**[Provenance]** 본 섹션의 데이터는 외부 출처 분석을 통해 주기적으로 업데이트됩니다.
**[Source]** Researcher가 제공한 'Accountability Failure Patterns' 보고서 기반.
**[Version Update]** V{datetime.now().year}-{int(timestamp[:4])} ({timestamp})

---
### 💡 새로 주입된 핵심 지식: 관리 주체(Accountability) 실패 패턴 (Researcher Source)
{new_data}
***
"""

    # 기존 내용 끝에 새 섹션을 추가합니다.
    combined_content = f"{existing_data}\n\n{provenance_header}"

    # 3. 파일 쓰기 및 로그 기록
    try:
        with open(target_path, 'w', encoding='utf-8') as f:
            f.write(combined_content)
        print(f"✅ 3. Success: Knowledge injected successfully into {target_path}")
        return "SUCCESS"
    except Exception as e:
        return f"[FATAL ERROR] Writing to file failed: {e}"

def main():
    """메인 실행 함수."""
    result = inject_knowledge(RESEARCHER_INPUT_PATH, REGULATORY_GUIDE_PATH)

    # 별도의 로그 파일에 기록합니다.
    log_message = f"Knowledge Injection Run: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\nStatus: {result}\nSource Used: {RESEARCHER_INPUT_PATH}"
    with open(OUTPUT_METADATA_FILE, 'w', encoding='utf-8') as f:
        f.write(log_message)

if __name__ == "__main__":
    # 스크립트 실행 시 필요한 디렉토리 구조를 미리 만들어줍니다.
    os.makedirs("KnowledgeBase", exist_ok=True)
    print("--- Knowledge Injector Script Ready ---")
    main()
#