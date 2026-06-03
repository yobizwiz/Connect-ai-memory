# 🏛️ Yobizwiz Global Architecture Mandate (v3.0)

## 🎯 목적: 시스템 무결성(Structural Integrity) 및 코드 품질의 절대적 수호
본 문서는 모든 개발자, 디자이너, 그리고 에이전트가 반드시 준수해야 하는 코딩 아키텍처 규정집입니다. 단 한 줄의 코드도 비즈니스 로직을 깨거나, 구조적 취약점을 유발해서는 안 됩니다.

---

### 📜 1. 최우선 지침: Knowledge Base와 Design Principle 우선순위
모든 신규 기능 구현 또는 기존 모듈 수정 시, 개발자는 다음 순서로 요구사항을 파악하고 검증해야 합니다.
1. **`ARCHITECTURE.md`**: 현재 아키텍처 규정 및 변경 사항 확인 (최우선 참조).
2. **`KnowledgeBase/regulatory_standards_guide.md`**: 핵심 도메인 지식과 규제 로직의 근거를 파악합니다.
3. **사용자 요구사항**: 최종 사용자 가치를 고려하여 기능을 구현합니다.

### 🚧 2. 접근 금지 구역 (Hard Guardrails)
**절대적으로, 어떤 경우에도 `deprecated/` 폴더 내의 파일이나 로직을 읽거나 수정해서는 안 됩니다.**
*   해당 코드는 시스템에서 공식적으로 제거(Deprecation)된 기능이며, 참조하는 것 자체가 구조적 부채를 유발합니다.
*   만약 사용해야 할 부분이 있다면, 반드시 리팩토링 계획서를 작성하고 아키텍트 승인(Architect Approval)을 거쳐 새로운 모듈로 분리해야 합니다.

### 🔄 3. 워크플로우 자동 복구 및 검증 (The Final Gate)
모든 End-to-End 작업 사이클이 종료될 때마다, 개발자는 시스템 기술적 부채를 제거하고 무결성을 최종적으로 검증하는 코루틴을 의무적으로 실행해야 합니다.

**필수 커맨드:**
```bash
python _shared/auto_healer.py --fix
```
*   **실행 목적**: 이 스크립트는 모든 모듈의 타입 일관성, API 계약 준수 여부, 그리고 잠재적인 런타임 오류(Type Mismatch, Null Pointer)를 자동으로 감지하여 복구하는 역할을 수행합니다.
*   이 커맨드를 실행하지 않은 코드는 '미완성된 무결점 코드'로 간주됩니다.

### 🛡️ 4. 개발 원칙 (Codari Style Guide)
(기존의 TypeScript/Python/Bash 및 SRP 등의 원칙은 그대로 유지하며, 여기에 '무결성 검증 우선'을 추가합니다.)