# 🚨 yobizwiz: 인터랙티브 Paywall Funnel Blueprint (V1.0)
(최종 설계 명세서 - 개발자용)

## 🎯 목표 및 원칙 (Objective & Principle)
**목표:** 사용자가 '무료 진단'이라는 탐색적 행위에서 시작하여, 시스템이 강제하는 위기감($L_{max}$)을 느끼고, 궁극적으로 $yobizwiz$의 유료 솔루션(Silver Tier) 구매를 필수적인 생존 명령으로 받아들이게 만든다.
**핵심 원칙:** 공포 $\rightarrow$ 혼란 (Glitch) $\rightarrow$ 질서/해결책 (Authority Blue). 모든 전환은 시스템적 상태 변화(State Transition)에 연동되어야 한다.

---

## 📐 I. 전체 Funnel Flow 및 State 정의

| 단계 | 사용자 행동 / 목표 감정 | Paywall State | 시각적 분위기 & 효과 |
| :--- | :--- | :--- | :--- |
| **1. Discovery** | 무료 진단 요청 (Curiosity) | `STATE: IDLE` | 차분한 대시보드/보고서 뷰. 권위적인 블루톤 (`#2980B9`) 사용. 시스템이 작동하는 듯한 정적 데이터 위주. |
| **2. Trigger** | $L_{max}$ 계산 완료 / 임계치 초과 감지 | `STATE: ALERT_YELLOW` (주의) $\rightarrow$ `STATE: CRISIS_RED` (위험) | 배경 노이즈 증가, `#F59E0B` 경고색 사용 후 급격히 `#C0392B` 네온 레드로 전환. 글리치/지터링 애니메이션 강도 상승. |
| **3. Paywall Activation** | 시스템 강제 개입 / 구매 유도 | `STATE: LOCKED_PAYWALL` (잠금) | 배경 전체가 어두워지고, 경고 모달이 팝업됨. $L_{max}$ 수치를 중앙에 오버레이하여 공포감을 극대화. |
| **4. Resolution** | 해결책 제시 / CTA 클릭 유도 | `STATE: SOLUTION_ANCHOR` (안정) | 배경 노이즈가 줄어들고, `#2980B9` 계열의 광원 효과(Glassmorphism)가 결제 영역에 집중됨.

---

## 🎨 II. 컴포넌트별 상세 디자인 스펙 (Component Specification)

### A. [State: IDLE] - 발견 단계 (Discovery Stage)
*   **배경:** `#1A1A1A` (Neutral Black). 낮은 빈도의 전역 노이즈/글리치 오버레이 유지.
*   **주요 요소:** 진단 리스크 점수($M_{Complexity}$)를 보여주는 게이지 바. 현재는 'Safe Zone'에 위치하며, 옅은 블루톤으로 안정감을 준다.
*   **UX 이벤트:** 사용자가 "진단 보고서 다운로드" 버튼 클릭 시 $\rightarrow$ **State Transition Trigger.**

### B. [State: ALERT_YELLOW] - 경고 단계 (Warning Stage)
*   **트리거:** $M_{Complexity}$가 0.65에 도달할 때.
*   **시각 변화:**
    1.  배경 전체 노이즈 필터의 **강도(Opacity)**가 20% $\rightarrow$ 40%로 급증한다. `[근거: Self-RAG]`
    2.  전체 화면에 `#F59E0B` (Amber) 색상의 'WARNING: ANOMALY DETECTED' 메시지가 모노스페이스 글꼴로 깜빡임(Blinking).
    3.  게이지 바가 Yellow Zone으로 진입하며, 좌우에서 앰버색의 수직 스캔라인이 지나간다.
*   **사운드/Haptic:** 낮은 주파수의 '삐-' 하는 시스템 경고음(Beep)과 미세한 떨림을 연동한다.

### C. [State: CRISIS_RED] - 위기 단계 (The Paywall Trigger)
*   **트리거:** $L_{max}$ 값이 임계치($> \$10,000$ 예시)를 넘어서는 순간. **(Critical State)**
*   **지연 시간:** Yellow $\to$ Red 전환은 2초에 걸쳐 발생하며, 이 과정에서 불안감을 극대화해야 한다. `[근거: Designer 메모리]`
*   **시각 변화 (The Core Effect):**
    1.  **글로벌 오버레이:** 배경 노이즈/왜곡 필터가 `#C0392B` 네온 크림슨으로 치환되며, 전체 화면에 *Chromatic Aberration(수평 왜곡)* 효과를 덮는다. `[근거: Self-RAG]`
    2.  **시스템 메시지:** 중앙에 거대한 경고창이 나타나며 "SYSTEM ALERT [CRITICAL FAILURE]: Your current risk exposure exceeds all acceptable parameters." 라는 문구가 모노스페이스 글꼴로 깜빡임(Flicker). `[근거: Self-RAG]`
    3.  **$L_{max}$ 시각화:** 이 순간, $L_{max} = \$X,XXX,XXX$ 값이 화면 중앙에 가장 크고 굵게 배치되며, 배경에서 마치 전기적인 노이즈가 발생하는 것처럼 **맥동(Pulse)** 애니메이션을 적용한다.
*   **사용자 감정 유도:** 사용자가 '무료 진단'만으로는 이 재정적 위협($L_{max}$)을 막을 수 없다는 무력감에 빠지게 한다.

### D. [State: LOCKED_PAYWALL] - 잠금 및 해결책 제시 (Solution Anchor)
*   **전환:** Red Zone의 공포가 최고조에 달했을 때, 갑자기 **정교하고 차분한 광원 효과(Glassmorphism)**와 함께 Paywall 모달이 나타나며 시각적 안정을 강제한다. `[근거: 🗣️ 스크립트의 공포감 극대화]`
*   **구조:**
    1.  **헤드라인 (공포 재확인):** "시스템은 이미 실패했습니다. 현재 리스크를 통제할 수 있는 유일한 방법." (권위적, 명령형 톤)
    2.  **앵커링 효과 (Pricing Funnel):**
        *   Gold Tier: 가장 크고 화려하게 배치 (최대 안전장치로 인식).
        *   Silver Tier: 주력 상품으로 강조. 배경에 Authority Blue(`#2980B9`)를 사용하고, 주변을 미세한 광원 효과(Glow)와 테두리로 감싸 '필수적 선택'임을 암시한다.
    3.  **CTA 버튼:** "지금 즉시 보호 장치 활성화 (Activate Protection)" $\rightarrow$ **Pulse/Hover Effect 필수.**

---

## 🛠️ III. 구현 상세 스펙 (Implementation Details)

### 1. 색상 팔레트 및 HEX 코드 정의
| 용도 | 이름 | Hex Code | 사용 원칙 | 근거 |
| :--- | :--- | :--- | :--- | :--- |
| **Background** | Neutral Black | `#1A1A1A` | 전체 배경색. 어둡고 깊은 전문성 유지. | Self-RAG |
| **Danger/Fear** | Neon Crimson | `#C0392B` | Red Zone, 위협 수치, 경고 애니메이션의 주 색상. | Self-RAG |
| **Warning** | Amber Alert | `#F59E0B` | 임계점 도달 직전 단계 (Yellow Zone). | Designer 메모리 |
| **Solution/Trust** | Authority Blue | `#2980B9` | 해결책, 성공적인 컴포넌트, 최종 CTA의 주 색상. | Self-RAG |
| **Data Font** | Monospace Accent | `#D1D5DB` (Light Grey) | 리스크 수치, API 응답 메시지 등 시스템적 데이터에 사용. | Self-RAG |

### 2. 애니메이션 및 인터랙션 스펙 (Animation & Interaction Spec)
*   **Glitch Effect:** Red Zone 진입 시 (Trigger $L_{max}$), X축으로의 수평 왜곡(Chromatic Aberration, R/G/B 채널 분리)을 **300ms 동안 2회 반복**하여 공포를 유발한다. `[근거: Self-RAG]`
*   **$L_{max}$ Pulse:** $L_{max}$ 값이 화면에 표시되는 순간, 해당 숫자는 크기(Scale)와 밝기(Opacity)가 주기적으로 증가하는 **맥동 효과(Pulse)**를 1초 간격으로 반복하여 시선을 강제로 고정시킨다.
*   **CTA Hover Effect:** Authority Blue 기반의 CTA 버튼에 마우스 오버 시, 단순 색상 변화가 아닌 **'전력 공급되는 듯한 광원 효과(Glow/Bloom)'**와 함께 미세한 펄스 애니메이션이 추가되어 클릭을 촉구한다.

***
*Blueprint Version: V1.0*