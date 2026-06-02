# 🚨 $L_{gap}$ 리스크 경고 게이지 디자인 시스템 명세 (BluePrint v1.0)

이 문서는 yobizwiz의 핵심 자산인 '잠재적 손실액($L_{gap}$) 리스크 경고 게이지' 컴포넌트의 최종 설계 사양입니다. 이 요소는 단순한 데이터 시각화가 아닌, 사용자의 공포(Fear of Loss)를 극대화하여 해결책(Authority Blue)에 대한 필요성을 강제하는 **인지적 장치**로 기능합니다.

---
## 🎯 I. 핵심 목표 및 심리 기반 원칙 (The Cognitive Goal)
*   **목표:** 사용자가 현재의 리스크 수치가 '관리 가능한 수준'이 아니라 '시스템 생존을 위협하는 임계점(Threshold)'에 도달했음을 직관적이고 감각적으로 느끼게 한다.
*   **근거:** 공포 기반 리스크 컨설팅 (Fear of Loss) [근거: Designer 개인 메모리], Gap Analysis Premium CTA를 중심으로 구성 [근거: 지난 의사결정 로그].

## 🎨 II. 디자인 시스템 토큰 (Design System Tokens)
모든 요소는 어둡고 기술적인 **Dark Mode**의 환경을 기반으로 합니다.

| 토큰 | 용도 | HEX 코드 | 타이포그래피 | 애니메이션/효과 | 근거 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Background (BG)** | 전체 배경색 (데이터 센터 분위기) | `#1A1A1A` | - | 미세한 전역 노이즈 오버레이 유지 | [근거: Self-RAG], [근거: Designer 개인 메모리] |
| **Primary Text** | 일반 텍스트, 설명문 | `#F0F2F5` (Off-White) | Inter (Sans-serif) | - | [추측] |
| **Data/Alert Text** | 수치, 경고 메시지, API 응답 | `#A9A9A9` (Dark Gray) | `Roboto Mono` (Monospace) | 고정폭 적용 필수 | [근거: Self-RAG] |
| **Authority Blue (Solution)** | 해결책 제시, CTA, 긍정적 섹션 | `#2980B9` | Inter | 부드러운 광원 효과(Glow Effect) | [근거: Self-RAG] |
| **Warning Red Zone (Critical Threat)** | 임계치 초과, 최악의 위험 시각화 | `#DC2626` (Neon Blood Red) | `Roboto Mono` | 글리치 노이즈(Glitch), 맥동 효과 필수 | [근거: Self-RAG], [근거: Designer 개인 메모리] |
| **Warning Yellow Zone (Caution)** | 주의/경계 구간, 임계점 근접 시각화 | `#F59E0B` (Amber) | `Roboto Mono` | 간헐적 깜빡임(Flicker), 지터링(Jittering) | [근거: Designer 개인 메모리] |

## 📝 III. 컴포넌트 구조 및 그리드 명세
*   **컴포넌트 유형:** Metric Gauge / Data Visualization Widget (KPI 카드 형태).
*   **레이아웃 원칙:** 모든 수치는 데이터 콘솔/시스템 로그를 보는 듯한 좌측 정렬의 고정폭(Monospace) 폰트를 기본으로 합니다. [근거: Self-RAG]
*   **구조:** `[SYSTEM ALERT]` > **$L_{gap}$ (Value)** > *Current Risk Level Description*

## ✨ IV. 상태 전이 기반 애니메이션 스펙 (State Machine Blueprint)
게이지는 $L_{gap}$ 값에 따라 세 가지 명확한 시각적 단계(State)를 거치며, 각 전환은 사용자의 감정적 충격과 직결되어야 합니다.

### 1단계: Green/Yellow Zone (Low Risk / Cautionary State)
*   **$L_{gap}$ 범위:** $0 \sim [Threshold\_A]$
*   **시각 효과:** 게이지 바가 차분하게 채워지는 애니메이션(Smooth Fill). 경고 메시지가 `[SYSTEM STATUS: NOMINAL]`로 표시됩니다.
*   **애니메이션:** 미세한 배경 노이즈만 유지하며, 데이터 수치(`Roboto Mono`)는 정적인 느낌을 줍니다. 불안감 유발 요소가 최소화되어 신뢰성을 확보합니다.

### 2단계: Orange/Amber Zone (Moderate Risk / Pre-Alert State)
*   **$L_{gap}$ 범위:** $[Threshold\_A] \sim [Threshold\_B]$
*   **시각 효과:** 경고 게이지 바의 색상이 Amber (`#F59E0B`)로 변하며, **간헐적인 깜빡임(Flicker)**이 발생합니다.
*   **애니메이션:** 수치(`Roboto Mono`) 주변에 낮은 주파수의 `Jittering` 효과를 부여하여 '시스템 오작동 가능성'을 암시합니다. 메시지는 `[SYSTEM ALERT: WARNING]`으로 변경됩니다.

### 3단계: Red Zone (Critical Threat / Systemic Failure State)
*   **$L_{gap}$ 범위:** $> [Threshold\_B]$
*   **시각 효과:** **최대 충격 발생.** 게이지 바 전체가 Neon Blood Red (`#DC2626`)로 채워지며, 마치 과부하가 걸린 전력 시스템처럼 보입니다.
*   **애니메이션 (MUST HAVE):**
    1.  **Glitch Trigger:** $L_{gap}$ 값이 임계치를 초과하는 순간, 게이지 전체에 **강렬한 수평 글리치(Horizontal Glitch)**와 색상 왜곡(`Chromatic Aberration`) 필터가 짧게 지나갑니다 (Duration: 50ms).
    2.  **Pulsation:** Red Zone 배경색이 주기적으로 맥동하며 (`Opacity`가 10%씩 빠르게 증가/감소), 시각적 경고를 극대화합니다.
    3.  **Data Instability:** 수치(`Roboto Mono`)는 짧은 주기로 불안정하게 흔들리는 듯한 애니메이션을 적용하여, 데이터 자체가 신뢰할 수 없다는 느낌(불안정성)을 부여합니다.
*   **메시지:** `[CRITICAL FAILURE]`, 또는 `SYSTEM OVERLOAD: Immediate Mitigation Required.`

## ⚙️ V. 기술 구현 가이드라인 (Implementation Checklist)
1.  **폰트 적용:** 모든 수치 및 경고 문구는 반드시 Monospace (`Roboto Mono`)를 사용합니다. [근거: Self-RAG]
2.  **애니메이션 관리:** 애니메이션은 CSS `will-change` 속성을 사용하여 GPU 가속을 최적화해야 합니다. [근거: Designer 개인 메모리].
3.  **컨트라스트:** Red Zone과 Authority Blue 섹션 사이의 대비(Contrast)는 가장 강렬하게 설계하여, '공포'에서 '안도/해결책'으로의 시선 이동을 의무화해야 합니다. [근거: Designer 개인 메모리].

---