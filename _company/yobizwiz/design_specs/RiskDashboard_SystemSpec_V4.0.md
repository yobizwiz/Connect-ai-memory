# 🚨 yobizwiz: 사례별 리스크 대시보드 (Case Study Risk Dashboard) 시스템 명세서 v4.0

**목표:** 고객에게 '시스템적 구조 결함'을 체험하게 하고, $L_r$ 및 $TRE$의 정량화된 위험성을 극대화하여 yobizwiz 솔루션 구매를 필연적으로 유도한다.
**톤앤매너:** 고권위 (High Authority), 경고성 (Alarming), 데이터 중심 (Data-Driven).
**주요 변화:** Yellow $\to$ Red 상태 전환 시, 물리적 충격과 디지털 오류 경험을 결합한 '최종 비주얼 브리프'를 적용.

---

## 📐 I. 전체 레이아웃 구조 및 컴포넌트 정의

| 영역 | 구성 요소 (Component) | 설명 및 기능 | 데이터 바인딩/출력 값 |
| :--- | :--- | :--- | :--- |
| **헤더** | 타이틀, 현재 리스크 레벨 표시기 | `yobizwiz: Compliance Gateway` / 실시간 상태(Yellow/Red)를 전역적으로 고지. | 텍스트 (H1), Dynamic State Indicator (색상 변화 필수) |
| **섹션 A** | **위험 요인 입력 컨트롤 패널** (Input Controls) | 사용자가 시뮬레이션할 핵심 변수들($W_{Reg}$, $L_{Multiplier}$ 등)을 슬라이더로 제공. 데이터 변경에 따라 실시간 계산 로직 트리거. | 3개 이상의 `Slider Component`와 `Output Readout Component` 결합. |
| **섹션 B** | **핵심 리스크 지표 (KPI)** | 대시보드의 핵심 결과물. $L_r$과 $TRE$를 가장 크고 충격적으로 표시하는 영역. 상태 변화에 따라 시각적 임팩트가 극대화되어야 함. | 2개 메인 KPI Card (`$TRE`, `잠재 손실액`) |
| **섹션 C** | **리스크 구조 분석 (Visualization)** | Before/After 플로우 차트 또는 법률 프로세스 흐름도. 데이터 오버레이 필터와 함께 '취약점'을 시각적으로 강조하는 영역. | SVG 기반의 애니메이션 플로우차트. 텍스트 및 노이즈 레이어 필수. |

---

## ✨ II. 컬러 팔레트 및 타이포그래피 시스템 (Self-RAG 재확인)

| 역할 | 색상명/코드 | 사용 목적 및 효과 | 적용 위치 |
| :--- | :--- | :--- | :--- |
| **🚨 Red Zone** (경고/위협) | `#C0392B` (Dark Crimson) + Opacity 조절 | 고객이 현재 처한 위험, 결함, 공포를 시각적으로 강하게 압박. 글리치 및 노이즈 오버레이의 주 색상. | KPI 배경 플래시, 경고 팝업 메시지, Red Zone Indicator. |
| **🔵 Authority Blue** (권위/해결) | `#2980B9` (Deep Slate Blue) | yobizwiz가 제공하는 해결책, 시스템적 안정감, 데이터의 근거. 신뢰감을 주는 메인 텍스트 및 CTA 배경. | Solution 제시 섹션, 핵심 설명 문구. |
| **⚫ Neutral Black** (기본/배경) | `#1A1A1A` | 전문적이고 깊이 있는 컨설팅 분위기 조성. 모든 기본 배경색. | 전체 배경, 패널 배경. |
| **Mono Font** | Roboto Mono / Inter Monospace | 데이터 출력, 에러 메시지, 리스크 코드를 표시하여 '시스템 코드' 같은 권위와 긴급함을 부여. | KPI의 수치값, 경고 메시지의 텍스트. |

---

## 🕹️ III. 인터랙션 및 상태 변화 Blueprint (Critical Path)

### A. [Yellow Zone] 진입 스펙 (경계/주의 단계)
1.  **트리거:** $L_r$ 값이 기준 임계값($Threshold_{Y}$)을 초과할 때.
2.  **시각적 피드백:**
    *   전체 배경색에 미세한 `Chromatic Aberration` 필터가 적용됩니다. (투명도 5%, Frequency: Low). [근거: Self-RAG]
    *   KPI Card의 테두리(Border)가 `#2980B9`에서 점진적으로 주황빛을 띠는 경고색으로 변합니다.
    *   헤더에 '⚠️ CAUTION: Monitoring Required' 메시지가 낮은 빈도로 깜빡입니다.
3.  **애니메이션:** 모든 데이터 수치는 이전 대비 **증가세(Upward Trend)**를 보여주며, 숫자에 작은 파동 애니메이션이 적용되어 불안정성을 암시합니다.

### B. [Critical Red Zone] 도달 스펙 (최대 위험/공포 단계)
1.  **트리거:** $L_r$ 값이 최대 임계값($Threshold_{R}$)에 도달하거나, 슬라이더 값 변경 후 계산된 $TRE$가 급증했을 때.
2.  **시스템 반응 (The Glitch Event):**
    *   **(T=0ms) 초기 충격:** 페이지 전체에 짧고 강렬한 **빨간색 플래시(Opacity 0 $\to$ 1 $\to$ 0)**가 지나갑니다. [근거: Self-RAG] (Duration: 200ms).
    *   **(T=50ms) Glitch Activation:** 배경 전체에 노이즈와 색상 왜곡 필터(Noise/Chromatic Aberration)가 **최대 강도**로 적용됩니다. 글자들은 짧게 수평으로 밀리는(Shift) 효과를 동반합니다.
    *   **(T=100ms ~ T=500ms) Critical Message:** 헤더 및 KPI 영역의 핵심 메시지는 `Roboto Mono` 서체와 함께 강렬하게 깜빡이는 **글리치 텍스트 애니메이션**을 발동시킵니다. (예: "CRITICAL ERROR: Structural Void Detected!") [근거: Self-RAG]
    *   **(T=500ms~) 지속 상태:** 경고 메시지는 배경의 노이즈 필터를 통해 낮은 빈도로 계속 깜빡이며, 사용자가 심리적으로 압박감을 느끼게 합니다.

---

## 📑 IV. 개발자 구현 가이드라인 (Action Items for Developer)

1.  **데이터 구조 스키마 정의:** 모든 계산 로직은 백엔드 API가 제공하는 JSON Schema를 완벽하게 준수해야 합니다.
    *   `{ "status": ["Green", "Yellow", "Red"], "tre_value": 1234567, "lr_change_ratio": 0.89 }` [근거: Self-RAG]
2.  **컴포넌트 분리:** 모든 UI 컴포넌트는 독립적인 상태 관리(State Management)를 가져야 하며, `Prop Drilling`을 최소화합니다. 특히 슬라이더 입력값 변화는 반드시 Debounce 로직을 거쳐 API 호출을 트리거해야 합니다. [근거: Self-RAG]
3.  **성능 최적화:** 모든 애니메이션(특히 Glitch Effect)은 GPU 가속(`transform: translate3d`, `will-change`)을 사용하여 60fps를 유지하도록 설계합니다.

---