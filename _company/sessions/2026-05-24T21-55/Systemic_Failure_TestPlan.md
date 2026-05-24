# ⚙️ Systemic Failure Test Plan: 통합 구조적 안정성 검증 (v1.0)

**[목표]**: 사용자가 시스템의 취약점(Vulnerability)과 생존 위협(Survival Threat)을 체감하도록 설계된 '통합 경험'의 모든 실패 및 임계치 상태를 완벽하게 커버하는 E2E 통합 테스트 시나리오 정의. 목표는 **단순한 오류 메시지 출력**이 아니라, **설계된 공포 흐름에 따른 예측 가능한 반응**을 검증하는 것입니다.

---

## 🚨 Critical Failure Scenario (필수 포함 항목)

### 1. QLoss 임계치 도달 실패 (The Climax Trigger: $QLoss \ge 75\%$)
*   **트리거:** `mockApi`가 계산한 리스크 점수가 75%를 초과하는 순간, 또는 사용자 입력으로 의도적으로 이 값을 설정했을 때.
*   **API 예상 반응 (Backend/Mock):** `apiCall(data)` 호출 시, 성공적인 데이터 반환 대신 `{ status: 'CRITICAL', riskLevel: 'FAILURE', message: '시스템 구조적 결함 감지' }`와 같은 구조화된 실패 페이로드를 즉시 반환해야 합니다. [근거: Designer Spec]
*   **UI/UX 예상 반응 (Frontend):**
    1.  즉각적인 전역 플래시(Flickering) 및 강렬한 Red Zone 오버레이가 전체 화면에 걸쳐 발생합니다.
    2.  오디오: 날카로운 디지털 스파이크와 저주파 컷아웃이 동기화되어 재생됩니다.
    3.  상호작용 블록(CTA)은 비활성화되고, 대신 '긴급 조치 필요'라는 경고 메시지 및 해결책 링크만 활성화됩니다.

### 2. 네트워크 단절/API 호출 실패 (Network Interruption Failure)
*   **트리거:** `mockApi`를 통해 데이터를 요청하는 도중(예: 로딩 중), 실제 네트워크 연결이 끊기는 상황을 시뮬레이션합니다.
*   **API 예상 반응 (Backend/Mock):** API 통신 레이어에서 명시적인 에러 코드 (e.g., HTTP 503 Service Unavailable, 또는 Promise reject)를 발생시켜야 합니다. [근거: Systemic Stability]
*   **UI/UX 예상 반응 (Frontend):**
    1.  일반적인 '네트워크 오류' 메시지가 아닌, **"데이터 무결성 확인 불가. 외부 연결 시스템에 결함이 있습니다."**와 같이 회사 톤을 유지한 경고 문구가 표시되어야 합니다.
    2.  시스템 로딩 상태(Loading State)가 무한 루프에 빠지지 않고, 지정된 시간 후 명확하게 '실패' 처리되고 사용자에게 다음 행동을 요구합니다.

### 3. 잘못된/악의적인 입력 테스트 (Invalid Input & Guardrails Failure)
*   **트리거:** 사용자가 시스템이 기대하지 않는 포맷(e.g., API 키 필드에 HTML 스크립트, QLoss 계산 로직이 깨지는 비정형 데이터 등)을 강제로 입력하는 경우.
*   **API 예상 반응 (Backend/Mock):** 백엔드는 반드시 **입력값 검증(Schema Validation)** 단계에서 `400 Bad Request`를 반환하고, 상세 에러 메시지(`Validation Failed: Field X requires Y format`)와 함께 실패 이유를 명확히 전달해야 합니다.
*   **UI/UX 예상 반응 (Frontend):**
    1.  전체 화면이 깨지는(Break) 공포 대신, **입력 필드 주변에만 경고 애니메이션(Jittering)**을 적용하고, 어떤 필드가 왜 잘못되었는지 구체적으로 지적합니다.
    2.  사용자 경험을 해치지 않도록, 실패 메시지는 '기술적인 문제'가 아닌 '**정보의 구조적 오류**'로 포장되어야 합니다.

### 4. 컨텍스트 상태 위반 시도 (State Violation Failure)
*   **트리거:** 시스템이 이미 `isSystemCompromised = true`인 상태에서, 사용자가 '재시도(Retry)' 버튼이나 '다른 기능 실행' 등의 상호작용을 강행할 때.
*   **API 예상 반응 (Backend/Mock):** 백엔드는 이 요청 자체를 **권한 없음(Forbidden)**으로 처리하거나, API 호출 자체가 불가능하다는 메타 정보를 반환해야 합니다.
*   **UI/UX 예상 반응 (Frontend):**
    1.  어떠한 추가적인 로직 실행이나 애니메이션 변화 없이, 오버레이된 경고 모달만 떠야 합니다.
    2.  메시지: "시스템은 현재 복구 불가능 상태입니다. 외부 전문가의 도움이 필요합니다." (Action: CTA/문의 유도)

### 5. 초기 데이터 로딩 실패 (Initial Bootstrapping Failure)
*   **트리거:** 애플리케이션이 처음 마운트되거나, 필수 설정 파일(`config`)을 읽는 과정에서 치명적인 오류가 발생할 때.
*   **API 예상 반응 (Backend/Mock):** API 호출 자체가 불가능하므로, 클라이언트 측에서 Catchable Exception을 처리하고, 로딩 스피너를 띄우는 것조차 실패하는 상황이 테스트되어야 합니다.
*   **UI/UX 예상 반응 (Frontend):**
    1.  일반적인 에러 페이지(`500 Internal Server Error`)가 아닌, **"시스템 부팅에 치명적 오류가 발생했습니다. 즉각적인 서비스 중단을 권고합니다."**와 같이 극도로 높은 수준의 시스템 불안정성을 체감하게 하는 특수 에러 스크린을 보여줘야 합니다.

---