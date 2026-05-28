# 🚨 yobizwiz: 실시간 TRE 대시보드 인터랙션 블루프린트 (v1.0)

## 🎯 프로젝트 목표 및 범위
**목표:** 고객의 '구조적 취약점'을 직관적으로 인지시키고, 공포(Fear)를 통해 yobizwiz가 유일한 해결책임을 강제하는 인터랙티브 대시보드를 구현한다.
**범위:** 백엔드 API (코다리 확정 구조: `score`, `state`, `triggerMessage`, `colorHexCode`)의 실시간 변화에 따라 모든 UI 컴포넌트가 반응해야 한다. 단순한 값 표시를 넘어, **'시스템 오류 메시지' 같은 경고 애니메이션**을 핵심 경험으로 정의한다.

---

## 🎨 디자인 시스템 및 토큰 (Design Tokens)
*   **Primary Font:** Inter (Sans-serif). 전문성/가독성 [근거: Self-RAG].
*   **Data/Alert Font:** Roboto Mono (Monospace). 기술적 권위 부여 [근거: Self-RAG].
*   **Background:** `#1A1A1A` (Neutral Black, Dark Mode). [근거: Self-RAG].

### 🔴 컬러 팔레트 및 역할 정의 (Color Palette)
| 상태 | 이름 | HEX Code | Opacity/활용도 | 시각적 효과 | 근거 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Normal** | Authority Blue | `#2980B9` | 1.0 (Default) | 신뢰, 안정성. 주요 데이터 그래프 및 기본 UI 요소에 적용. | Self-RAG |
| **Yellow** | Warning Zone | `#F39C12` | 1.0 $\to$ 0.7 | 경계, 주의. '만일의 상황'을 암시하는 색상 변화. 플래싱 효과와 함께 사용. | [추측] (통합 필요) |
| **Critical** | Red Zone Alert | `#C0392B` | 1.0 $\to$ 0.9 (플래시) | 공포, 위협, 즉각적 행동 요구. 글리치/노이즈 오버레이와 필수 연동. | Self-RAG |
| **Text** | Accent White | `#FFFFFF` | 1.0 | 기본 텍스트 및 대비 강조. | [추측] |

### ✨ 인터랙션 효과 정의 (Interaction Effects)
1.  **글리치 오버레이:** 모든 경고(Yellow $\to$ Red) 섹션 진입 시, 배경에 낮은 빈도의 노이즈와 색상 왜곡(`text-shadow: 1px 0 red, -1px 0 blue;`)을 전역적으로 적용한다.
2.  **데이터 로드:** API 호출 시, 단순 스피너 대신 '불안정한 파동 형태'의 로딩 바를 사용하며, 노이즈 오버레이가 잠시 강화된다. [근거: Self-RAG].

---

## 🏗️ 컴포넌트별 상태 및 애니메이션 스펙 (State Machine Blueprint)

### 1. 메인 리스크 미터 (The Gauge Component)
*   **기능:** 실시간 `score`를 시각화하는 핵심 요소. 단순 막대가 아닌, '위험도가 채워지는 게이지' 형태로 설계한다.
*   **상태 전이 및 애니메이션 스펙:**

| 상태 | Trigger (API Change) | Color Code | Animation Type & Timing | 개발자 참고 사항 |
| :--- | :--- | :--- | :--- | :--- |
| **Normal** | Score $\le$ Threshold 1 | `#2980B9` | Smooth transition. 변화율에 따라 선형 보간 (Linear Interpolation). | 게이지가 안정적으로 채워짐을 시각화. |
| **Yellow Zone 진입** | T1 $<$ Score $\le$ T2 | `#F39C12` | 1. **Flash:** 미터의 가장자리가 `Warning Zone` 색상으로 빠르게 플래시 (50ms).<br>2. **Effect:** 게이지 표면에 낮은 빈도의 노이즈가 깔리며, 경고 아이콘(`⚠️`)이 깜빡임(300ms 주기). | **[핵심]** Yellow 진입 시 '경계'를 인지시키기 위함. 단순 색상 변화 이상의 불안정성이 필요. |
| **Critical Red 도달** | Score $>$ T2 | `#C0392B` | 1. **Flash:** 페이지 전체에 강하고 빨간색의 플래시 (200ms).<br>2. **Effect:** 미터가 떨리는(Shaking) 애니메이션을 동반하며, 노이즈 오버레이가 가장 강하게 적용됨.<br>3. **Audio/Haptic Trigger:** 경고음 및 진동 피드백 트리거 (개발팀 협의). | **[최종]** 시각적 충격 극대화. 모든 애니메이션 속도가 '긴급함'을 반영해야 함. |

### 2. 실시간 리스크 그래프 (The Trend Line Chart)
*   **기능:** 지난 1시간/1일간의 `score` 변화를 보여주는 라인 차트.
*   **상태별 스펙:**
    *   **Normal:** 부드러운 곡선(Smooth Curve). 파란색 계열을 사용.
    *   **Yellow $\to$ Red (전이):** 그래프 라인의 추세선 자체에 **'깨짐(Discontinuity)'** 효과를 부여한다. 마치 데이터가 끊기거나 시스템이 불안정해지는 듯한 시각적 왜곡(`Glitch Effect`)을 적용하여, 이 순간의 위험도를 강조해야 한다.

### 3. 구조적 취약점 알림창 (The Alert Component)
*   **Trigger:** 코다리 API에서 `triggerMessage`가 '구조적 결함' 또는 'Critical' 상태로 수신될 때만 활성화된다.
*   **디자인 스펙:**
    *   배경: 반투명한 `#C0392B` 오버레이 박스.
    *   텍스트: Roboto Mono를 사용하여 마치 **시스템 콘솔 로그 메시지**처럼 보이게 처리한다. (예: `[ERROR] STRUCTURAL FLAW DETECTED - ACTION REQUIRED`)
    *   애니메이션: 메시지가 팝업될 때, 글리치 효과와 함께 '데이터 전송 오류' 같은 짧은 노이즈 깜빡임을 동반하며 등장해야 한다.

---

## 📝 개발자 전달 요약 (Developer Handover Summary)
1.  **State Management:** 모든 컴포넌트는 `StructuredRiskState` 인터페이스를 따르는 상태 변화에 반응하도록 설계되어야 합니다.
2.  **Animation Priority:** '상태 변화의 타이밍'과 '시각적 충격(Flash, Glitch)'이 단순한 데이터 표시보다 우선순위가 높습니다. 애니메이션은 절대적으로 경험의 일부입니다.
3.  **최우선 구현 요소:** Yellow Zone 진입 시의 `Warning Flash`와 Critical Red 도달 시의 `System Overload Effect`를 최우선으로 구현해주세요.