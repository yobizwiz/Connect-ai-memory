# Mini-Report LP: Pre-Purchase 섹션 설계 브리프 (v3.0)
## 🎯 목표
사용자에게 '미확인 재무적 손실 리스크'를 가장 강력하고 인터랙티브하게 인지시켜, Pro Mitigation Roadmap 결제($499~)로의 강제 전환을 유도한다.

## 🖼️ 핵심 컨셉: System Failure Simulation (시스템 오류 시뮬레이션)
단순한 경고문 나열 금지. 사용자가 마치 시스템 자체가 위험 신호를 보내는 듯한 '경험'을 제공해야 함.

### I. 비주얼 스펙
*   **컬러 팔레트:**
    *   🚨 Red Zone: `#C0392B` (Dark Crimson) - 공포, 위협. 플래시 및 에러 메시지 주 색상.
    *   🔵 Authority Blue: `#2980B9` - 해결책, 권위. 안정화 시 배경색.
    *   ⚫ Neutral Black: `#1A1A1A` - 기본 톤. 전반적인 깊이감을 유지하는 배경색.
*   **폰트:**
    *   Primary Font (Body): Inter (Sans-serif) - 가독성 최우선.
    *   Data/Alert Font (Code/Error): Roboto Mono, Monospace - 시스템 코드 및 경고 메시지에 필수 적용.

### II. 인터랙티브 로직 상세
1.  **[TRIGGER] 리스크 발견 시점:** 스크롤 위치가 'Gap 측정' 섹션에 도달했을 때.
    *   **Action:** 전역 `Intersection Observer`를 통해 Red Zone 플래시 (Opacity 0 $\rightarrow$ 1 $\rightarrow$ 0)를 강제 실행한다.
    *   **Effect:** 배경 전체에 노이즈/글리치 오버레이 필터(`CSS Filter: noise`, `chromatic aberration`)가 짧게 적용된다.

2.  **[COMPONENT] 리스크 스코어 시뮬레이션 (Risk Score Widget):**
    *   **Initial State:** 100% (Safe) $\rightarrow$ Authority Blue로 표시.
    *   **Process:** JS `setInterval`을 활용하여, 사용자의 행동이나 시간 경과에 따라 점수가 무작위 변동(예: -5% to +3%)한다.
    *   **Critical State:** $7M 리스크가 발견되면, 스코어는 강제로 급락하며 Red Zone (`#C0392B`) 색상으로 바뀌고, 위젯 주변에 깜빡이는 전기적 노이즈 효과를 준다.

3.  **[DATA] 손실액 증폭 시뮬레이션:**
    *   $7M 리스크가 발견되는 순간: 숫자가 `Roboto Mono`로 크게 표시되며, 카운트업 애니메이션(0 $\rightarrow$ 7,000,000)을 강제 실행한다.
    *   **Visual Augmentation:** 숫자가 커지는 동안 파티클 시스템이 빨간색 노이즈와 함께 분출되어야 한다. 이 수치는 스크롤 끝까지 잔상으로 남아 긴장감을 유지해야 한다.

### III. 최종 CTA 로직 (Commitment)
*   **메시지:** "현재 리스크 Gap($7M)을 메우기 위한 즉각적인 방어벽 구축이 필요합니다."
*   **CTA 요소:** Pro Mitigation Roadmap ($499~) 구매 버튼과 함께, **'남은 시간까지 예상 재무 손실액 (Est. Loss Remaining)'** 카운트다운 타이머를 배치한다. 이 카운터는 공포감을 유지하는 마지막 장치이다.