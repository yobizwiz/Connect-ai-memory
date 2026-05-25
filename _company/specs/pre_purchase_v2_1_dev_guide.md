# ⚙️ QLoss Pre-Purchase Page: 최종 빌드 디자인 가이드 (Developer Specification)
**버전:** v2.1
**작성일:** 2026-05-25
**대상:** Front-End/Interaction Developer

## 🎯 핵심 목표 및 원칙
1. **Conversion Gatekeeping:** 결제 API 호출을 인터셉트(Intercept)하여, 실제 구매 여부와 관계없이 '위험 진단 시퀀스'를 강제 실행해야 합니다. (UX가 곧 Funnel입니다.)
2. **애니메이션 우선:** 모든 전환은 단순 페이드(Fade)가 아닌, 글리치 및 플래시 효과가 포함된 구조적 애니메이션이어야 합니다.

## 🎨 기술 스펙 요약
*   **Primary Font:** Inter (Sans-serif) - General text.
*   **Secondary/Alert Font:** Roboto Mono (Monospace) - Error logs, codes, warnings.
*   **Red Zone Color:** `#C0392B` (Dark Crimson). Must be used for all failure states.

## ⚡️ 단계별 인터랙션 플로우 (Time-Based Sequence)

### A. Initial State & Interception (t=0s to t=0.5s)
*   **Trigger:** User clicks Buy Button.
*   **Action:** `event.preventDefault()`를 사용하여 결제 모달 호출을 막습니다.
*   **State Change:** 전역 애니메이션 클래스 (`is-glitch-active`)를 추가하고, 배경 전체에 노이즈/크로마틱 에버레이션 필터(CSS Filter)를 적용합니다.

### B. Critical Failure Sequence (t=0.5s to t=1.5s)
*   **Flash:** `body` 태그에 200ms 동안 `#C0392B` 배경색을 강제 적용하고, Opacity Transition을 통해 깜빡이는 효과를 구현합니다.
*   **Alert Box:** 화면 중앙 상단에 고정된 모달/경고 박스 (`Critical System Alert`)를 표시합니다. 이 박스는 `Roboto Mono` 서체를 사용하며, 텍스트가 주기적으로 강하게 깜빡여야 합니다. (깜빡임 주기는 불규칙성을 유지해야 함).
*   **Content Blockage:** 모든 기존 CTA와 콘텐츠는 임시 비활성화(Opacity: 0) 처리됩니다.

### C. Data Overload & Diagnosis Simulation (t=1.5s to t=3.0s)
*   **Display:** '데이터 로딩 중...' 상태를 시각화합니다.
    *   **Animation:** 스크롤되는 에러 로그(pseudo-code/API log 형식).
    *   **Logic:** 최소 20줄 이상의 가짜 실패 코드를 `setInterval` 기반으로 지속적으로 출력해야 합니다. (시간당 증가하는 데이터를 모방).
    *   **Highlight:** 특정 라인(`[DATA: $X_GAP]`)은 글리치 효과와 함께 빨갛게 강조되어야 합니다.

### D. Solution Re-engagement (t=3.0s to End)
*   **Transition:** `is-glitch-active` 클래스를 제거하고, 배경을 부드러운 Authority Blue 톤으로 전환합니다.
*   **CTA Injection:** 화면 하단에 새로운 '패치' 박스 (`Pre-Audit Recommendation`)를 배치합니다. 이 패치는 오류가 해결되는 과정을 시각적으로 보여주며, 유일하게 작동 가능한 CTA 버튼을 포함해야 합니다.

---