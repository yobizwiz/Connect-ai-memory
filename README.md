# Connect-ai-memory

Connect AI 1인 기업 에이전트 시스템의 메모리 저장소입니다.

## ⚠️ 에이전트 작업 가이드라인 (Agent Workspace Boundary Rules)

* **작업 범위 제한**: 모든 AI 에이전트는 `C:\Users\jinoh\Desktop\Connect AI` 폴더 내부에서만 활동해야 합니다.
* **바탕화면 직접 생성 금지**: 바탕화면(`C:\Users\jinoh\Desktop`)에 직접 파일, 폴더, 혹은 캐시 디렉터리(예: `.pytest_cache`, `yobizwiz` 등)를 생성하는 행위는 엄격히 금지됩니다.
* **명령어 실행 컨텍스트**: Python, pytest, npm 등 모든 터미널 명령어는 `Connect AI` 폴더 및 그 하위 디렉터리(예: `_company`) 내에서 실행되어야 하며, 바탕화면 경로에서 실행해서는 안 됩니다.
