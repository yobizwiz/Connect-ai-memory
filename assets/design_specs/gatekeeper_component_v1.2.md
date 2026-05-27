# 🚨 게이트키핑 섹션 디자인 시스템 컴포넌트 스펙 (V1.2)

**목표:** 사용자의 무의식적 불안감을 자극하여, '지금 행동하지 않으면 재정적으로 손해를 볼 것'이라는 공포(Systemic Fear)를 극대화하는 인터랙티브 경험을 구현한다.
**대상 팀:** 개발팀 (Front-end/Animation Engineer)

---

## 1. 핵심 컬러 및 타이포그래피 사양 (Color & Typography Standards)

| 요소 | 역할 | HEX Code | CSS Variable | 설명 및 사용 지침 | [근거: Self-RAG] |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **🚨 Red Zone** | 위협, 경고, 위험 노출 | `#C0392B` | `--color-red-zone` | 모든 긴급 메시지, $QLoss$ 플래시의 메인 색상. 일반 텍스트가 아닌 '경보'의 느낌을 주어야 함. | [근거: Self-RAG] |
| **🔵 Authority Blue** | 해결책, 신뢰성, 데이터 근거 | `#2980B9` | `--color-authority-blue` | 우리의 솔루션(CTA)과 핵심 정보를 전달할 때 사용. Red Zone과의 명확한 대비가 필수. | [근거: Self-RAG] |
| **⚫ Neutral Black** | 기본 배경/글자색 | `#1A1A1A` | `--color-neutral-black` | 전체적인 다크 모드 톤 유지. 시각적 피로도를 낮추면서 진지함을 유지해야 함. | [근거: Self-RAG] |
| **⚠️ Warning Yellow** | 경미한 주의/필수 입력 누락 | `#FFD700` | `--color-warning-yellow` | (신규 추가) 사용자가 작은 실수를 했을 때의 '경고' 레벨. Red Zone보다 톤이 낮아야 함. | [추측] |

**폰트 사양:**
*   **Primary Font:** Inter, Sans-serif (`font-family: 'Inter', sans-serif;`) - 가독성 확보.
*   **Alert/Data Font:** Roboto Mono, Monospace (`font-family: 'Roboto Mono', monospace;`) - 모든 $QLoss$ 값, 경고 메시지, 데이터 표기 시 필수 적용. **시스템 코드처럼 보이게 함.**

---

## 2. 컴포넌트별 인터랙티브 로직 스펙 (Component & Interaction Logic)

### A. QLoss 게이지 바 (`<LossGaugeBar>`)
*   **목적:** 사용자가 놓치고 있는 재정적 리스크($QLoss$)를 시각화.
*   **애니메이션:** 단순한 선형(Linear) 증가가 아닌, **불안정한 파동 형태(Unstable Wave)**의 애니메이션을 적용해야 함.
*   **로직 스펙:**
    1.  **초기값 (Time 0):** $QLoss$ = 0%. 게이지는 Authority Blue 계열의 낮은 채도로 시작한다.
    2.  **시간 경과 증가:** `setInterval`을 통해 시간당 고정된 비율로 값이 상승하며, 이 과정에서 **노이즈/글리치 오버레이 필터**가 배경에 낮은 빈도로 적용된다. (CSS Filter: Noise & Chromatic Aberration)
    3.  **행동 트리거 증가:** 사용자가 폼 작성을 완료하지 않거나, 잘못된 정보를 입력할 경우(예: 유효성 검사 실패), $QLoss$ 상승 속도가 **일시적으로 급격히 빨라지며 (Rate Increase)**, 게이지 바의 색상이 Authority Blue에서 Red Zone으로 빠르게 전환되어야 한다.

### B. 크리티컬 경고창 (`<CriticalAlertPopup>`)
*   **트리거:** $QLoss$가 특정 임계치(예: 70% 이상)에 도달하거나, 사용자가 CTA를 무시할 때 발동.
*   **애니메이션 (Flash Timing):**
    1.  **Pre-Flash (경고 전):** 배경 전체에 투명도 20%의 Red Zone 글리치 오버레이가 지속된다.
    2.  **Critical Flash:** `Intersection Observer` 또는 특정 이벤트 발생 시, **페이지 전체를 강하고 빨간색(`#C0392B`)으로 채우는 플래시 효과**가 발생해야 한다. (Duration: 150ms)
    3.  **디스플레이:** 플래시 후, 경고창이 중앙에 나타나며 글리치 효과와 함께 메시지를 출력한다.

*   **애니메이션 스펙 예시 (CSS/JS):**
    ```css
    /* Red Zone Flash */
    body { background-color: #1A1A1A; transition: background-color 0.15s ease-out; }
    .flash-active { background-color: #C0392B !important; opacity: 0.8; transition: background-color 0.15s; } /* 150ms 동안만 유지 */

    /* Glitch Effect (텍스트에 적용) */
    @keyframes glitch { from { transform: translate(0); text-shadow: 1px 0 red, -1px 0 blue; } to { transform: translate(-2px, 2px); text-shadow: -1px 0 green, 1px 0 magenta; } opacity: 0.9;}
    .glitch-text { animation: glitch 2s infinite alternate linear; }
    ```

### C. CTA '최후 통첩' 버튼 (`<FinalCTAButton>`)
*   **목적:** 최종적인 행동 유도(Action). 게이트키핑의 목적지.
*   **상태 변화 로직:**
    1.  **Normal State (QLoss < 50%):** Authority Blue 배경, 일반 버튼 애니메이션.
    2.  **Warning State (50% <= QLoss < 80%):** Red Zone 경고색으로 테두리가 깜빡이기 시작하며, 마우스를 올릴 때(Hover) 미세한 글리치 노이즈가 발생한다.
    3.  **Critical State (QLoss >= 80%):** 버튼 전체의 배경과 텍스트에 **강렬한 Red Zone 플래시 효과**가 주기적으로 발생해야 하며, 클릭 가능한 상태를 유지하되 시각적 공포가 극대화되어야 한다.

---
*본 문서는 개발팀이 게이트키핑 섹션의 모든 비주얼 로직과 애니메이션 타이밍을 구현하는 데 필요한 최종 승인 문서입니다.*