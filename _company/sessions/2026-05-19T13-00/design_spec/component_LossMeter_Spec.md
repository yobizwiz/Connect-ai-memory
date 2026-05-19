# 📊 Component Spec: 구조적 취약성 손실 측정기 (Structural Vulnerability Loss Meter)

**버전:** 1.0
**작성일:** 2026년 5월 19일
**목표:** 고객에게 추상적인 '리스크'가 아닌, **구체적이고 움직이는 재무 손실 규모(Quantified Financial Loss)**를 시각적으로 경험하게 한다. 권위적 긴급성을 극대화하는 인터랙티브 인포그래픽 컴포넌트다.

---

## 1. 핵심 디자인 원칙 및 역할 정의

| 요소 | 역할 | 시각적 목표 | 근거 |
| :--- | :--- | :--- | :--- |
| **전체 분위기** | 시스템 오류, 비상 경보 (System Failure Alert) | 데이터가 불안정하고 통제 불가능한 상태의 느낌 부여. | [근거: 🗣️ 스크립트 - Red Zone 경고] |
| **Loss Meter** | 위험도 측정 지표 (Criticality Index) | 단순 게이지가 아닌, *분석 중인* 역동적인 데이터 흐름을 표현해야 함. | [근거: CEO 지시] |
| **데이터 텍스트** | 정량화된 재무 위협 메시지 | 시스템 콘솔 출력물처럼 보이게 하여 '객관적 증명'의 권위를 부여. | [근거: Self-RAG, Roboto Mono 사용 원칙] |

## 2. 시각 요소 및 스타일 가이드

### A. 색상 팔레트 (Color Palette)
*   **배경:** `#1A1A1A` (Neutral Black) - 지속적인 전문성 유지.
*   **정상 상태/기준값:** `#4CAF50` (Safe Green) $\rightarrow$ **(사용 안 함)**: 위험 시나리오이므로, 녹색은 사용하지 않음.
*   **경고 수준 (Warning):** `Amber Warning`: `#FFC107` (밝은 노란색) - 시스템 경고 단계의 초기 위협감.
*   **치명적 리스크 (Critical):** **🚨 Red Zone:** `#C0392B` (Dark Crimson) + Glow/Glitch 효과.
*   **해결책/안정화:** **🔵 Authority Blue:** `#2980B9` (Deep Slate Blue).

### B. 타이포그래피 (Typography)
1.  **메인 메시지 (H1):** Inter, Sans-serif (굵게). (가독성 및 전문성 유지)
2.  **수치/데이터 출력:** **Roboto Mono**, Monospace (필수 적용). 모든 손실액($, 원), 비율 등은 이 폰트로만 표시하여 '코드' 같은 느낌을 강화한다.

### C. 애니메이션 효과 (Motion & Interactivity)
1.  **Loss Meter 게이지:** 단순한 채워짐이 아닌, **불안정하게 진동하거나 깜빡이는(Flickering/Jittering)** 움직임을 주어 신뢰성을 저해해야 한다.
2.  **데이터 출력:** 모든 수치(`$XXXM`, `XX%`)는 타이핑 효과나 점진적 오버레이 방식으로 나타나야 하며, 이 과정에서 **미세한 글리치(Glitch) 노이즈 오버레이**가 필수적으로 발생해야 한다.
3.  **최종 충격 (Critical Peak):** 리스크 값이 최고점에 도달하거나 'FAILURE' 상태에 진입할 때, 화면 전체가 200ms 동안 강렬한 Red Zone 플래시와 함께 전역적인 노이즈 오버레이를 발생시킨다.

## 3. 컴포넌트 동작 로직 (Development Flow)

| 단계 | 트리거 조건 | 시각적/데이터 변화 | 개발자 가이드라인 (코다리에게) |
| :--- | :--- | :--- | :--- |
| **Step 0: 초기 진입** | 페이지 스크롤 또는 API 호출 시작. | 배경에 낮은 빈도의 노이즈 필터(`Noise Filter`)가 전역적으로 적용된다. Loss Meter의 수치 창은 비어있거나 'INITIATING...' 메시지를 표시한다. | CSS `filter: url(#noise-pattern)`를 사용하여 미세한 시각적 불안정성을 조성한다. |
| **Step 1: 데이터 로딩** | 백엔드에서 가상 리스크 데이터를 수신 (`status: "LOADING"`). | Loss Meter의 바(Bar)가 불규칙하게 진동하며, 'ANALYZING STRUCTURE...'와 같은 메시지가 Roboto Mono로 출력된다. <br> *수치 텍스트는 타이핑 애니메이션을 적용.* | 데이터 로딩 시 `setInterval` 기반으로 무작위 글리치 클래스 토글(`glitch-active`)을 구현한다. |
| **Step 2: 리스크 측정 (Warning)** | 첫 번째 구조적 취약점(Minor Failure) 감지 (`status: "WARNING"`). | Loss Meter 바가 Amber Yellow로 채워지고, `CURRENT EXPOSURE: $X Million`와 같은 메시지가 출력된다. <br> *글리치 효과가 텍스트에 부분적으로 적용되기 시작한다.* | Red Zone 경고 색상과 대비되는 Warning 컬러를 사용하여 위협의 '단계'를 구분하는 것이 중요하다. |
| **Step 3: 최종 충격 (Critical Failure)** | 결정적인 취약점 발견 또는 API 실패 (`status: "CRITICAL"`). | 1. Loss Meter 바가 강렬한 `#C0392B`로 빠르게 채워지며, 최고점에 도달한다. <br> 2. **페이지 전체에 빨간색 플래시(Flash)** 발생 (Opacity 0 $\rightarrow$ 1 $\rightarrow$ 0). <br> 3. `CRITICAL FAILURE: Structural Vulnerability Detected.` 메시지가 글리치 효과와 함께 중앙에 고정된다. | 이 단계는 사용자 경험의 하이라이트다. **애니메이션 지연 시간(Timing)**과 **색상 대비(Contrast)**가 가장 중요하다. (200ms 플래시, 300ms 노이즈 지속) |

---