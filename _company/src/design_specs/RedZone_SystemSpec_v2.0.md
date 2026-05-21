# 🔴 Red Zone System Specification v2.0: 불안을 코드로 구현하다 (Technical Blueprint)

## 🎯 개요 및 목표
본 사양서는 yobizwiz가 제공하는 '시스템적 리스크'의 공포를 극대화하기 위해 랜딩 페이지 전체에 적용될 UI/UX 애니메이션 및 비주얼 시스템을 정의합니다. 단순한 색상 변화가 아닌, **"기술적 오류(Glitch)"**와 **"경고 시스템 작동(System Alert)"**이라는 경험을 통해 사용자에게 '존재론적 불안'을 체감하게 만드는 것이 목표입니다.

### ⚙️ 핵심 원칙
1.  **불안정성(Instability):** 모든 경고는 예측 불가능한 간격과 속도로 발생해야 합니다. (Random Timing, Non-linear animation).
2.  **권위적 위협(Authoritative Threat):** 오류 메시지는 마치 최첨단 보안 시스템이 감지한 '진짜 위협'처럼 보이게 해야 합니다. (Monospace Font, Code Block Format).
3.  **명확한 대비(Contrast):** Red Zone 경고가 나타날 때마다 배경의 권위적이고 차분한 톤(Neutral Black)과 극단적으로 충돌해야 시각적 쇼크를 줍니다.

---

## 🎨 디자인 시스템 명세 (Design Tokens)

| 요소 | 역할/상태 | 색상 코드 (HEX) | 설명 및 적용 방식 |
| :--- | :--- | :--- | :--- |
| **Background** | 기본 배경 | `#1A1A1A` (Neutral Black) | 전문적이고 깊은 느낌을 유지하며, 모든 빛과 색상이 이 위에 '오류'처럼 떠야 함. |
| **Primary Text** | 일반 텍스트 | `#E0E0E0` (Light Grey) | 가독성을 위해 사용. 경고가 아닐 때의 기본 톤. |
| **🚨 Red Zone** | 경고/위협 강조 | `#C0392B` (Dark Crimson) | 위험 임계치 도달 시 메인 색상. 강렬한 플래시 효과와 글리치에 사용됨. |
| **🔵 Authority Blue** | 해결책/신뢰 | `#2980B9` (Deep Slate Blue) | yobizwiz 솔루션을 설명하는 구간의 주된 톤. Red Zone과 대비되는 안정감 제공. |
| **⚙️ Data Font** | 데이터 출력/오류 코드 | `Roboto Mono` / Monospace | 모든 경고 메시지, 리스크 지표 값($Y$), 에러 로그 등은 반드시 이 폰트를 사용해야 합니다. |

---

## ✨ 컴포넌트별 애니메이션 사양 (CSS & JS Guideline)

### 1. 기본 글리치 오버레이 (`.glitch-overlay`)
*   **목적:** 페이지 전반에 걸쳐 미세한 디지털 시스템 오류의 노이즈를 부여합니다.
*   **구현 방식:** CSS Filter와 배경 애니메이션 조합.
*   **CSS Pseudo-Code:**
    ```css
    /* 1. 전역 필터 적용 (Global Scope) */
    body {
        filter: url(#chromaticAberration); /* SVG Filter 사용 권장 */
        background-image: repeating-linear-gradient(0deg, transparent, rgba(255, 0, 0, 0.03), transparent);
        animation: noise_pulse 15s linear infinite; /* 낮은 주파수의 노이즈 애니메이션 */
    }

    /* @keyframes noise_pulse { ... } : 배경에 무작위로 변하는 미세한 점 패턴을 만듭니다. */

    /* 2. 글리치 효과 구현 (Text Glitch Effect) - Critical Element에만 적용 */
    .glitch-text {
        position: relative;
        font-family: 'Roboto Mono', monospace;
        animation: glitch-anim 0.1s infinite alternate step-end; /* 매우 짧고 불규칙하게 반복 */
    }

    /* ::before 와 ::after Pseudo-elements를 이용해 색상 왜곡(Chromatic Aberration)을 만듭니다. */
    .glitch-text::before, .glitch-text::after {
        content: attr(data-text); /* 원본 텍스트 반복 사용 */
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        /* 색상 분리 및 오프셋 효과를 통해 아날로그적 노이즈 느낌 부여 */
    }
    ```

### 2. 경고 발생 (Critical Alert/Red Flash)
*   **트리거:** 리스크 지표가 임계치에 도달하거나, 핵심 카피(예: 'CRITICAL LEGAL EXPOSURE DETECTED')를 만났을 때.
*   **애니메이션 흐름 (JavaScript Control):**
    1.  **(Pre-Flash):** 경고 요소(`div`)의 투명도를 점진적으로 높이며 글리치 효과가 증가합니다. (`opacity: 0` $\rightarrow$ `opacity: 0.8`).
    2.  **(Impact Flash):** 짧은 순간(50ms) 동안 배경 전체에 강렬한 `#C0392B` 플래시를 적용합니다. (CSS Class Toggle: `.red-flash`).
    3.  **(Warning State):** 플래시 직후, 경고 메시지 텍스트가 **글리치 효과와 함께 깜빡이면서(Flicker)** 화면 중앙에 강하게 고정됩니다. 이때 `setInterval`을 이용해 무작위로 색상 왜곡(`text-shadow`)을 토글하여 불안감을 유지합니다.
*   **CSS Pseudo-Code:**
    ```css
    /* 1. 플래시 효과 (매우 짧게, 순간적인 충격) */
    @keyframes red-flash {
        0% { background-color: transparent; opacity: 1; }
        50% { background-color: rgba(192, 57, 43, 0.8); opacity: 1; } /* Red Zone 컬러 사용 */
        100% { background-color: transparent; opacity: 1; }
    }
    /* JS가 .red-flash 클래스를 추가/제거하며 타이밍을 제어해야 합니다. */

    /* 2. 깜빡이는 경고 메시지 (Flickering Alert) */
    @keyframes flicker {
        0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
        20%, 24%, 55% { opacity: 0.8; text-shadow: none; } /* 간헐적인 깜빡임 */
    }
    ```

### 3. 손실액($Y$) 수치화 및 데이터 로딩 (`QLoss Display`)
*   **목적:** 숫자를 단순 보고가 아닌, 시스템이 '계산하는 위협'으로 보이게 합니다.
*   **애니메이션 흐름 (JS Control):**
    1.  **(Pre-Load):** "ANALYZING SYSTEM INTEGRITY..." 와 같은 코드가 빠르게 스크롤되는 텍스트를 배경에 배치합니다 (Code Ticker Effect).
    2.  **(Data Load):** 손실액($Y$) 수치(예: $3,450,000)는 일반적인 `+=` 로직이 아닌, **'불규칙한 카운트업 애니메이션'**을 사용합니다. 마치 시스템이 불안정하게 계산 값을 산출해내는 듯한 느낌을 줘야 합니다 (Randomized Increment).
    3.  **(Display):** 최종 숫자가 나타날 때 글리치 효과를 한 번 더 짧게 적용하여 '확정된 위협 수치'임을 각인시킵니다.

---

## 📊 요약 및 개발팀 전달 사항

*   **필수 기술 스택:** CSS 애니메이션 (Keyframes, Filter), JavaScript (Intersection Observer, Random Timing Logic).
*   **주의사항:** 모든 경고 요소는 `display: flex` 구조 내에서 위치해야 하며, Red Zone 배경색은 `#1A1A1A` 위에 **오버레이(Overlay)** 형태로만 작동해야 합니다. 절대 기본 배경색을 덮어서는 안 됩니다.