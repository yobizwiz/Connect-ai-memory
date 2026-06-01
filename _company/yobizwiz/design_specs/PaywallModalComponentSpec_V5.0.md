# 🚨 yobizwiz: Critical State Gate (Paywall Modal) - 디자인 시스템 스펙 v5.0

## 🎯 목적
공포(Fear)를 극대화하여 사용자의 심리적 압박을 유도하고, 해결책(Solution) 구매가 **시스템적 생존 필수 의무 조치**임을 강제적으로 인식시키는 인터랙티브 게이트웨이 컴포넌트.

## 📐 I. Global Design Tokens
*   **Background:** `#1A1A1A` (Neutral Black). 전체 배경에 낮은 빈도의 `Noise/Chromatic Aberration` 필터 오버레이 유지.
*   **Primary Font:** Inter (Sans-serif) - 일반 설명, 제목.
*   **Data/Alert Font:** Roboto Mono (Monospace) - 리스크 수치, 에러 코드 (`status: FAILURE`).
*   **Color Palette:**
    *   **Red Zone Alert (Danger):** `#C0392B` (Dark Crimson). 경고 및 위기 시각화.
    *   **Authority Blue (Trust/Solution):** `#2980B9` (Deep Slate Blue). 해결책, 안정성, CTA 영역의 배경색.
    *   **Accent:** `#F39C12` (Amber). 강조된 필수 조치 버튼.

## 🕰️ II. State Transition & Timing Map
| Stage | Duration (Cumulative) | Key Visual Trigger | User Emotion Focus |
| :--- | :--- | :--- | :--- |
| **STATE\_INITIAL** (Entry Shock) | $0 \rightarrow 1.5s$ | Red Glitch Blast, $L_{max}$ Flashing | Panic / Fear |
| **STATE\_PROCESSING** (Threat Build-up) | $1.5 \rightarrow 4.0s$ | Data Log Stream, Severity Gauge Fluctuation | Anxiety / Need for Control |
| **STATE\_TRANSITION** (Anchor Point) | $4.0 \rightarrow 4.5s$ | Noise Decay $\rightarrow$ Blue Focus Shift | Doubt / Seeking Stability |
| **STATE\_FINAL** (Solution Reveal) | $4.5s \rightarrow End$ | Glassmorphism Pop-up, CTA Highlight | Relief / Compliance (구매 강제) |

## ✨ III. 애니메이션 및 인터랙션 스펙 (The Core Logic)

### 1. [STAGE 1 $\to$ STAGE 2] Entry Shock $\to$ Threat Build-up
*   **Transition:** Red Glitch Blast $\rightarrow$ Structured Console Feed
*   **Action:** 초기 모달 화면 전체를 `#C0392B`의 글리치 노이즈가 덮고 있다가, $1.5s$ 지점에서 `opacity`와 `scale`을 급격히 줄이며 사라집니다. 이와 동시에 배경은 어두운 콘솔 그리드 패턴으로 전환되며, 데이터 로그 스크롤 애니메이션이 시작됩니다.
*   **CSS Hint:** `transition: opacity 0.3s ease-out; transform: scale(1.1) -> scale(1);`

### 2. [STAGE 2 $\to$ STAGE 3] Threat Build-up $\to$ Transition Anchor (The Pivot Point)
*   **Transition:** High Data Density $\rightarrow$ Controlled Calmness
*   **Action:** 모든 데이터 로그 스크롤이 갑자기 멈추고, 화면 전체의 정보 밀도가 급격히 낮아지며(Data Fog Effect), 오직 모달 중앙에 Authority Blue (`#2980B9`) 영역만 부드러운 광원 효과와 함께 살아남는 것처럼 보입니다. **이것이 사용자의 시선을 강제적으로 멈추게 하는 비주얼 앵커입니다.**
*   **CSS Hint:** `filter: blur(1px)`를 짧은 시간 적용하여 주변을 흐릿하게 만들고, Blue 영역만 선명도를 유지(`backdrop-filter: brightness(1.2);`)합니다.

### 3. [STAGE 3 $\to$ STAGE 4] Transition Anchor $\to$ Solution Reveal
*   **Transition:** Calm Focus $\rightarrow$ Pop-up Authority Gate
*   **Action:** Blue 영역의 중앙에 `Glassmorphism` 효과를 가진 요금 카드(Silver Tier)가 마치 물리적으로 '팝'하며 등장합니다. 이 과정에서 주변 배경은 여전히 차분한 권위적 분위기를 유지하되, CTA 버튼(`[필수 의무 조치 진행]`)만 네온 레드/앰버 색상의 펄스 광원 효과를 받으며 사용자의 시선을 최종적으로 끌어당깁니다.
*   **CSS Hint:** `animation: pop-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);`