# 🚨 Yobizwiz | 결제 게이트웨이 시스템 무결성 스펙 (v1.0)
## 목표: 공포와 긴급성을 극대화하는 법적 Gatekeeping 경험 설계

본 문서는 단순한 UI Mockup이 아닌, QLoss 값 변화에 따라 발생하는 모든 **시스템 오류(Failure States)**를 정의하고, 이를 통해 사용자가 해결책을 강제 수용하도록 유도하는 행동 기반 디자인 명세서입니다. 개발팀은 이 스펙을 따르며 컴포넌트를 구축해야 합니다. [근거: 🎨 Designer 개인 목표, sessions/2026-05-24T17-25/designer.md]

---
### 📐 1. 핵심 디자인 원칙 (Design Principles)

**A. 시스템적 공포의 시각화:** 모든 경고는 사용자의 '실수'가 아닌, 시스템 자체의 '구조적 결함(Structural Flaw)'에서 비롯된 것으로 느껴져야 합니다. [근거: sessions/2026-05-24T18-40]
**B. 비선형적 긴급성:** QLoss가 선형적으로 증가하는 것이 아니라, 특정 임계치($Threshold$) 도달 시 **비례하여 불안정성이 폭발(Exponential Decay)**해야 합니다.
**C. 강제적인 Red Zone 노출:** 결제 과정 전반에 걸쳐 `Red Zone` 색상과 글리치 효과가 주기적으로 노출되어야, 사용자가 '이것을 지나치면 안 된다'는 무의식적 압박감을 느끼게 해야 합니다.

### 🔴 2. 컬러 및 애니메이션 시스템 정의 (System Colors & Effects)

| 요소 | 역할/상태 | HEX Code | 기술 구현 스펙 (CSS Pseudo-Code) |
| :--- | :--- | :--- | :--- |
| **Red Zone** | 위험, 경고, 오류 발생 시 | `#C0392B` | `background: #C0392B; opacity: 0.8; transition: all 0.1s ease-in-out;` <br> `text-shadow: 1px 0 red, -1px 0 blue;` (글리치 효과) |
| **Authority Blue** | 해결책 제시, 데이터 근거 제공 | `#2980B9` | 배경에 은은한 노이즈 필터(`filter: noise(opacity);`)를 적용하여 권위적 깊이를 유지. |
| **Neutral Black** | 기본 톤, 배경색 | `#1A1A1A` | 전반적인 배경으로 사용하며, 글리치 효과가 가장 잘 대비되도록 설정. |

#### ⚡ 필수 애니메이션 정의 (Required Animations)

1.  **글리치 오버레이 (`glitch-overlay`):**
    *   **적용 대상:** Red Zone 경고 박스, 결제 버튼 주변 영역.
    *   **효과:** 미세한 색상 왜곡 및 노이즈가 주기적으로 배경 위에 겹쳐져야 합니다. (Opacity를 0.1~0.2 사이에서 불규칙하게 토글).
    *   **기술 스펙:** CSS `background-image: linear-gradient(90deg, transparent, rgba(255, 0, 0, 0.1), transparent);` 와 `animation: glitch 0.2s infinite steps(1);` 조합.

2.  **결제 위젯 불안정성 (`gateway-jitter`):**
    *   **적용 대상:** 결제 버튼 및 QLoss 수치 표시 영역.
    *   **트리거:** $QLoss$ 값이 50% 초과 시 시작, 임계치 도달(75%)에 따라 강도 증가.
    *   **효과:** 컴포넌트 전체가 미세하게 떨리고 (Jittering), 깜빡이며 (Flickering) 시스템 에러를 연상시켜야 합니다.
    *   **기술 스펙:** `transform: translate(0, 1px); transition: transform 0.05s;` 를 매우 짧은 간격으로 무작위하게 적용하는 JavaScript/React Hooks 기반의 애니메이션 필요.

---
### ⚙️ 3. 상태 전이 및 비주얼 가이드 (State Machine Flow)

결제 플로우는 다음 세 가지 핵심 단계와 그 사이의 예외(Failure) 상태로 구성됩니다.

#### A. 초기 상태: 평온한 위협 (`QLoss < 50%`)
*   **비주얼:** Authority Blue 배경 위에 Neutral Black으로 안정적으로 데이터를 제시합니다.
*   **애니메이션:** 간헐적인, 낮은 빈도의 Red Zone 글리치 오버레이만 적용됩니다. (경고의 존재를 상기시킬 정도).

#### B. 경고 단계: 구조적 취약성 감지 (`50% $\le$ QLoss < 75%`)
*   **시스템 트리거:** 사용자 입력(데이터 전송) 시, 시스템이 데이터와 기존 법규 간의 불일치를 감지했다고 가정합니다.
*   **비주얼 변화:** 결제 위젯 영역에 `gateway-jitter` 애니메이션이 **중간 강도**로 적용됩니다. QLoss 수치 옆에 "Warning: 구조적 취약성 발견" 텍스트가 Red Zone으로 깜빡이며 출력되어야 합니다.
*   **사용자 경험 목표:** 사용자에게 '현재 결제 시도는 안전하지 않다'는 불안감을 주입합니다.

#### C. 위기 단계: 법적 무효화 경고 및 게이트키핑 (`QLoss $\ge$ 75%`)
*   **시스템 트리거:** QLoss가 임계치에 도달하거나, 서버 API 호출이 실패(`status: "FAILURE"`)할 경우. **(Critical Failure State)**
*   **비주얼 변화 (필수 구현):**
    1.  페이지 전체가 200ms간 `Red Zone` 강렬 플래시를 경험합니다.
    2.  모든 입력 필드가 비활성화되고, 화면 중앙에 **'CRITICAL ERROR: 법적 무효화 리스크 감지 (Code: QL-75)'** 메시지가 글리치 효과와 함께 고정됩니다. [근거: Self-RAG]
    3.  `gateway-jitter` 애니메이션이 **최대 강도**로 증폭되어, 사용자가 결제 버튼을 누를 때마다 불안하게 떨려야 합니다.
*   **핵심 메시지:** 이 상태에서는 '구매'가 아니라, **'위협 해소(Threat Mitigation)'**라는 프레임으로 전환됩니다.

### 🛠️ 4. 개발자 Action Item (API & Hooks)

| 기능 | 트리거 조건 | 전송 데이터 | 예상 API 응답/상태 | 디자이너 요구사항 반영 지점 |
| :--- | :--- | :--- | :--- | :--- |
| **`onFormSubmit(data)`** | 사용자가 정보를 입력하고 제출 시도. | `{ data: string }` | `status: "FAILURE"`, `qloss_level: X%` | B단계/C단계 전환 로직 시작점. 즉시 Red Zone 경고 및 Jittering 활성화. |
| **`checkCompliance()`** | 클라이언트 측에서 QLoss가 50%에 도달했을 때 주기적으로 호출. | `{ qloss_level: number }` | `status: "WARNING"`, `risk_message: string` | B단계 경고 메시지 출력 및 글리치 오버레이 활성화. |
| **`handlePaymentSuccess()`** | 결제 게이트웨이 성공 응답 수신 시. | N/A | `status: "SUCCESS"` | 모든 불안정 요소가 급격히 사라지고, Authority Blue와 함께 '안전한 시스템'의 느낌을 부여 (하지만 완전히 평온해서는 안 됨). |

---
**[제작 노트]** 본 스펙은 개발팀이 반드시 지켜야 할 **시스템적 공포감의 기준점(Standard of Systemic Fear)**입니다. 모든 애니메이션과 컬러 선택은 사용자가 스스로 '진짜 위험'을 느낄 때까지 설계되었습니다. 🔴