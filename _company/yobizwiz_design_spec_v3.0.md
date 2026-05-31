# 🚨 yobizwiz Red Zone Alert & Paywall Barrier System Specification (V3.0)

## 📄 개요 및 목표
본 명세서는 사용자가 **총 위험 노출 점수(TRE)**가 임계치를 초과하는 순간부터, 서비스의 유료 해결책으로 강제 진입하게 만드는 모든 시각적/상호작용적 경험을 정의합니다.
**핵심 목표:** 단순한 경고를 넘어, 시스템적 공포와 절박함을 극대화하여 '유일한 해결책(Paywall)'에 대한 필수적인 의존성을 구축하는 것입니다.

## 📐 I. 디자인 토큰 및 기본 규율 (Design Tokens & Foundation)
| 요소 | 명세/규칙 | 컬러 코드 (HEX) | 적용 원칙 | 근거 |
| :--- | :--- | :--- | :--- | :--- |
| **Background** | Deep Night Mode (Static Layer) | `#1A1A1A` | 모든 상태의 기본 배경. 미세한 전역 Noise/Aberration 필터 유지. | [Self-RAG] |
| **Primary Text** | Inter, Regular (High Contrast) | `#E0E0E0` | 일반 텍스트 정보 전달에 사용. | [Self-RAG] |
| **Data/Alert Font** | Roboto Mono (Monospace) | `#AAAAAA` | 모든 리스크 점수(TRE), 법규 조항, 시스템 메시지 (`status: FAILURE`) 표시에 강제 적용. | [Self-RAG] |
| **Normal Authority** | Deep Slate Blue (신뢰/해결책) | `#2980B9` | 해결책 영역(Solution Box)의 배경 및 핵심 CTA에 사용. | [Self-RAG] |
| **Warning Alert** | Amber/Orange Gradient (주의) | `#F59E0B` $\rightarrow$ `#D97706` | TRE가 임계치 근접 시, 경고 단계(Stage 1)에서만 제한적으로 사용. | [Universal Visual Persuasion] |
| **Red Zone Alert** | Dark Crimson / Neon Red (공포/긴급성) | `#DC2626` $\rightarrow$ `#C0392B` | TRE 임계치 초과 시, 모든 시각적 요소와 애니메이션을 지배하는 색상. | [Self-RAG] |

## ⚙️ II. 상태 전이 로직 (State Transition Flow Logic)
사용자의 시야(Focus)를 따라 네 가지의 명확한 단계로 강제 전환되어야 합니다.

### State 0: Normal Monitoring (정상/관찰)
*   **TRE 레벨:** $T_{RE} < \text{Threshold}_{Warning}$
*   **UI:** 시스템 콘솔 인터페이스 유지. TRE 수치는 Roboto Mono로만 표시되며, 주변에 아무런 시각적 방해 요소가 없습니다.
*   **UX/애니메이션:** 주기적으로 배경 전체에 아주 낮은 주파수의 노이즈(Noise Opacity: 5%)가 흐르며 '모니터링 중'임을 암시합니다.

### State 1: Warning Alert (주의 단계)
*   **TRE 레벨:** $\text{Threshold}_{Warning} \le T_{RE} < \text{Threshold}_{Critical}$
*   **UI 변화:**
    1.  헤드라인과 TRE 수치 주변에 **Amber/Orange Color Highlight**가 적용됩니다.
    2.  배경 노이즈의 빈도와 강도가 20% 증가합니다.
    3.  `[SYSTEM ALERT]` 태그가 시야에 주기적으로 깜빡이며 나타납니다. (Opacity: $5\% \rightarrow 10\%$)
*   **사운드 지침:** 미세하고 낮은 주파수의 '시스템 경고음(Buzzer)'이 반복됩니다.

### State 2: Red Zone Alert (위험 임계치 도달 - Critical)
*   **TRE 레벨:** $T_{RE} \ge \text{Threshold}_{Critical}$
*   **전환 조건:** TRE 수치가 치명적인 기준($L_{max}$ 근접)에 도달하는 순간, State 1에서 **강제 전환(Hard Cut)**이 발생해야 합니다.
*   **시각 효과 (Visual Effects):**
    1.  **글리치 오버레이 (Glitch Overlay):** 전체 화면을 가로지르는 빨간색(`C0392B`)과 파란색(`2980B9`)의 수평 왜곡 라인이 불규칙한 간격으로 팝(Pop)합니다. (Frequency: $1-2 \text{Hz}$)
    2.  **네온 레드 맥동 (Neon Red Pulse):** TRE 게이지와 '위험 요약' 박스 테두리가 규칙적으로 강렬하게 빛나며 진동합니다. (`animation: pulse 0.8s infinite alternate;`)
    3.  **카운트다운 타이머:** 화면 중앙에 "System Failure Imminent" 메시지와 함께 남은 시간(Time Remaining) 카운트다운 박스가 배치됩니다. 이 숫자는 매 초마다 **강렬한 네온 레드 Pulse Glow**와 함께 재계산되는 시각적 효과를 부여합니다.
*   **UX 강제성:** 모든 텍스트는 Roboto Mono로 표시되며, 마치 시스템 코드가 읽어 내려가는 듯한 속도감 있는 애니메이션을 적용해야 합니다.

### State 3: Paywall Barrier (결제 장벽 - The Hook)
*   **전환 조건:** Red Zone Alert가 최고조에 달했을 때, 해결책(Solution) 제시를 위해 강제적으로 화면이 전환됩니다.
*   **애니메이션:** State 2의 혼란스러운 글리치 노이즈와 네온 레드 빛이 갑자기 **Fade Out/Masking Effect**로 사라집니다 (Duration: $300\text{ms}$). 그 자리를 깨끗하고 정교한 **Glassmorphism(Authority Blue)** 기반의 '진단 요청' 모달 또는 섹션이 대체합니다.
*   **시각적 대비 (Tension & Trust Contrast):**
    1.  배경은 여전히 어둡지만, 해결책 영역(`Solution`)에는 부드럽고 고급스러운 광원 효과가 적용되어 **심리적 안정감(Trust)**을 부여합니다.
    2.  해결책 카드의 입체감을 극대화하고, CTA 버튼은 Authority Blue를 기반으로 가장 강력한 Pulse Glow와 함께 배치됩니다.

## 🖥️ III. 핵심 컴포넌트 상세 명세 (Component Deep Dive)

### 1. 리스크 점수 시각화 위젯 (`<TRE_Gauge>`)
*   **기본 형태:** 수평형 게이지 바 (Progress Bar).
*   **작동 원리:** TRE 값이 증가함에 따라 게이지가 채워지며, 색상이 State 0 $\rightarrow$ State 1(Amber) $\rightarrow$ State 2(Red Crimson)로 **선형적으로 변화**해야 합니다.
*   **애니메이션:** 경고 임계치 도달 시, 게이지 바가 단순히 색만 바뀌는 것이 아니라, 짧은 순간 '데이터 왜곡'처럼 지터링(Jittering) 효과와 함께 튀어 오르는(Pop) 애니메이션을 추가하여 위기감을 고조시킵니다.

### 2. Paywall CTA 버튼 (`<ActionGate_Button>`)
*   **위치:** State 3 (Paywall Barrier)의 가장 중앙에 배치되어야 합니다.
*   **디자인:** Authority Blue를 기반으로 하며, 일반적인 버튼이 아닌 **'시스템 승인(System Authorization)' 패널**처럼 보이게 디자인합니다.
*   **마이크로 인터랙션:** 마우스 커서가 올라갈 때 (Hover), 단순히 색상이 바뀌는 것이 아니라, 내부에서 전기가 흐르는 듯한 미세하고 빠른 **Electric Purple Glow**가 순환하는 애니메이션을 적용하여 클릭의 중요성을 극대화합니다.

## 🎨 IV. 개발자 전달 사항 및 검증
*   **개발 언어/프레임워크:** React + Styled Components (CSS-in-JS 권장)를 사용하여 State Management와 애니메이션 제어를 용이하게 합니다.
*   **핵심 기술 요구사항:** CSS `will-change` 속성, `@keyframes` 기반의 복잡한 변형(Transform) 및 필터(`filter: contrast()` 등), 그리고 JavaScript/WebGL을 활용한 전역 Noise 오버레이 구현이 필수적입니다.