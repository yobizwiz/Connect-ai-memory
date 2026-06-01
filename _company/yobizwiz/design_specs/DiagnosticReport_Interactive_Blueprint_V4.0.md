# Diagnosis Report: Interactive Blueprint (v4.0)
## I. 개요 및 목표
**목표:** 사용자의 불안감(Fear of Loss)을 극대화하여, yobizwiz의 Paywall 솔루션을 유일한 해결책으로 인식시키고 진단 요청(Diagnosis Request) 버튼 클릭을 강제한다.
**톤앤매너:** B2B Console / Audit Log / System Alert (권위적, 차갑게).

## II. 비주얼 토큰 시스템
*   **Background:** #1A1A1A
*   **Primary Text:** #E0E0E0
*   **Data/System Code:** Roboto Mono, #A0A0FF
*   **Red Zone (Critical):** #C0392B
*   **Warning Zone:** #FFB700
*   **Authority Blue (Solution):** #2980B9

## III. 핵심 컴포넌트: $L_{totalMax}$ Gauge (State Machine)
| State | Trigger | Range | Visual Effect / Animation Spec | CSS/JS Note |
| :--- | :--- | :--- | :--- | :--- |
| Initial | Load | 0-10% | Slow Pulse, Noise Overlay. | `animation: pulse 4s infinite ease-in-out;` |
| Yellow Zone | Q2-Q3 Answer | 10%-65% | Amber Fill, Flashing Boundary (#FFB700). System Alert Message Output. | State Change Listener (JS) required. |
| Red Zone | Q4+ Answer | 65%-100%+ | Max Glitch Noise Overlay, Full Screen Flicker/Pulse on `#C0392B`. `[SYSTEM ALERT: $L_{totalMax}$ EXCEEDED]` Flash. | High-impact CSS Keyframes & Global Filter application. |

## IV. 인터랙션 흐름 (Funneling Logic)
1. **Interaction:** User clicks an answer option on a Question Card.
2. **Feedback 1 (Local):** Selected option displays `[SCORE ADJUSTMENT: -X% L_{totalMax}]` log message nearby.
3. **Feedback 2 (Global):** The $L_{totalMax}$ Gauge component updates its value and color dynamically, triggering the corresponding animation state (Yellow $\to$ Red).
4. **Goal:** 강제적으로 사용자의 시선을 게이지와 다음 질문으로 이동시켜 불안감을 유지시킨다.

## V. 최종 CTA 컴포넌트 (The Conversion Gate)
*   **Trigger Point:** $L_{totalMax}$가 Critical Red Zone에 도달했을 때, 스크롤 기반으로 자동 노출되어야 함.
*   **Design:** Background: #1A1A1A, Overlay: Authority Blue Gradient Glow.
*   **Copy Structure (3 Phases):**
    * **Phase 1 (Shock):** "경고! 당신의 $L_{totalMax}$는 현재 ${[VALUE]}입니다."
    * **Phase 2 (Problem):** "근거 자료 매핑 엔진(Provenance Gap) 부재로 인한 재정적 최대 위험 노출도($TRE$)가 감지되었습니다."
    * **Phase 3 (CTA):** [SYSTEM REQUIRED] '미개방 책임' 진단 및 방어벽 아키텍처 구축. (Button: Gold Tier, #2980B9)