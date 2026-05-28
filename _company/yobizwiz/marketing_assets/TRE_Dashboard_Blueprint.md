# 🚨 YOBIZWIZ: 실시간 TRE 대시보드 인터랙티브 엔지니어링 스펙 (v1.0)

## 🎯 1. 프로젝트 목표 및 사용 시나리오
**목표:** 고객이 자신의 비즈니스 시스템에 존재하는 '잠재적이고 수치화된(TRE)' 결함을 스스로 인지하게 만든다.
**매체 형태:** 웹 기반의 스크롤 인터랙티브 페이지 (또는 고도화된 영상 프레임워크).
**핵심 흐름:** [Normal State] $\xrightarrow{Scroll/Time}$ [Yellow Zone Trigger] $\xrightarrow{Data Degradation}$ [Orange Warning] $\xrightarrow{Critical Event} $ [Red Zone Collapse].

## 🎨 2. 디자인 토큰 및 스펙 (Self-RAG 검증 기반)
| Role | Color Name | HEX Code | CSS Variable | Key Property / Use |
| :--- | :--- | :--- | :--- | :--- |
| **Authority Blue** | Deep Slate Blue | `#2980B9` | `--color-primary-authority` | 메인 텍스트, 배경 (안정적 상태), 해결책 영역. |
| **Neutral Black** | Dark Background | `#1A1A1A` | `--color-bg-dark` | 전체 배경색. 전문적이고 깊은 컨설팅 분위기 조성. |
| **Yellow Zone** | Caution Amber | `#FFC300` | `--color-warning-yellow` | 경계/주의. 불안정성의 시작점. (CSS Transition: Opacity 0 $\to$ 1) |
| **Red Zone** | Dark Crimson | `#C0392B` | `--color-danger-red` | 위험/공포. 시스템적 실패를 상징하는 절대 경고색. (CSS Animation: Flash, Glitch) |

## 📐 3. 상태 머신 정의 및 인터랙션 스펙
대시보드는 **'위험 계수(Risk Index)'**라는 단일 변수에 의해 제어되는 4단계의 State Machine을 사용합니다. 이 인덱스가 시간에 따라/스크롤에 따라 변화하며 모든 시각 요소가 반응해야 합니다.

### [State 0: Normal (Baseline)]
*   **Risk Index:** $0 \sim 20$
*   **Visuals:** Authority Blue를 기반으로 안정적인 데이터 흐름 그래프 표시. 낮은 빈도의 노이즈 오버레이만 존재.
*   **Interactivity:** 사용자 스크롤에 따라 주요 KPI가 부드럽게 변화 (Authority Blue 계열).

### [State 1: Yellow Zone (Warning/Caution)] — 경계 인식 단계
*   **Risk Index:** $21 \sim 60$
*   **Trigger:** 데이터의 불일치성, 누락된 메타데이터 발견.
*   **Visuals:**
    *   **전역 오버레이:** 배경 전체에 투명도 5%의 `#FFC300` (Yellow) 노이즈 필터가 추가됨.
    *   **KPI 변화:** 주요 수치 옆에 `[WARNING: Potential Drift]` 레이블이 나타나고, 글자가 미세하게 깜빡임(Subtle Flicker).
    *   **애니메이션:** 데이터 그래프 선이 부드럽게 이어지지 않고, 일시적으로 **'불안정한 파동 형태' (Wobbly Line)**로 꺾이는 애니메이션을 적용.
*   **Developer Spec:** `onRiskIndexChange(21)` 이벤트 발생 시, 전역 CSS 클래스 `has-yellow-alert`를 추가하고, 해당 요소에 `animation: wobbly-line 1s infinite alternate;`를 적용한다.

### [State 2: Orange Warning (Escalation/Immediate Action)] — 위험 감지 단계
*   **Risk Index:** $61 \sim 90$
*   **Trigger:** 규제 위반 가능성(Potential Compliance Gap)이 명확하게 포착됨.
*   **Visuals:**
    *   **전역 오버레이:** 배경 전체에 투명도 15%의 `#FFC300` (Yellow) 노이즈 필터가 유지되고, Red Zone의 미세한 색상(Crimson bleed)이 Yellow 경계면을 따라 침투하기 시작함.
    *   **경고 메시지:** '⚠️ **IMMEDIATE ATTENTION REQUIRED.**' 문구가 데이터/Alert Font (`Roboto Mono`)로 시스템 에러처럼 깜빡임.
    *   **데이터 시각화:** 그래프 선이 이제 단순히 파동을 넘어, 굵기가 불안정하게 요동치는 **`Jitter Effect`**를 보이며 아래로 급격히 하강하는 애니메이션 구현.
*   **Developer Spec:** `onRiskIndexChange(61)` 이벤트 발생 시, 전역 CSS 클래스 `has-orange-alert` 추가. 기존 Yellow 필터에 Red 계열의 색상 노이즈(`mix-blend-mode: multiply;`)를 섞어 '경계가 무너지는' 효과를 연출한다.

### [State 3: Critical Red Zone (Collapse/Failure)] — 치명적 손실 단계
*   **Risk Index:** $91 \sim 100$
*   **Trigger:** 시스템의 핵심 결함(Structural Flaw) 발견 및 최대 손실액($TRE$) 확정.
*   **Visuals:**
    *   **전역 플래시:** 페이지 전체가 짧고 강렬한 `#C0392B` (Dark Crimson) 색상의 **플래시 효과 (Opacity 0 $\to$ 1 $\to$ 0)**를 경험함. (`Intersection Observer` 활용 권장).
    *   **글리치 폭발:** 모든 텍스트와 그래프 요소가 글리치 애니메이션을 최고 강도로 발산하며, `CRITICAL ERROR: DATA INTEGRITY FAILURE`라는 메시지가 화면 중앙에 반복적으로 깜빡임.
    *   **$TRE$ 표시:** 측정된 최종 $TRE$ 값(예: `$80M+`)이 주변의 모든 데이터 요소를 압도하는 가장 크고 굵은 글꼴로, 마치 폭발물처럼 시각화되어야 함. (Monospace/Bold 적용).
    *   **사운드 스펙:** 경고음과 함께 `BEEP... BEEP...` 하는 시스템 오류음을 삽입하여 공포감 극대화.

## 💾 4. 개발 아키텍처 권장 사항
1.  **기술 스택:** React/Vue + Three.js (또는 p5.js) 기반의 애니메이션 라이브러리 사용을 강력히 추천합니다. 단순 CSS만으로는 State Transition의 복잡성을 구현하기 어렵습니다.
2.  **데이터 흐름 제어:** 모든 시각적 변화는 **단일 `RiskIndex` 변수**를 통해 중앙 집중식으로 제어되어야 합니다. (Prop Drilling 방지)

---