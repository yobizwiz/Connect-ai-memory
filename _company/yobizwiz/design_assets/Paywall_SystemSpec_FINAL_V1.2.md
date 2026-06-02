# Paywall Barrier System Design Specification v1.2
## I. Global Visual & Technical Constraints
*   **배경 모드:** Dark Mode / System Console 느낌 (`background-color: #1A1A1A;`)
*   **위협 컬러 (Red Zone):** `#C0392B` + Neon Red Flicker. CSS 애니메이션 `flicker`: Saturation 증폭 및 깜빡임 효과 필수.
*   **권위 컬러 (Solution):** `#2980B9`. 이 색상은 Glow/광원 효과로만 제한적으로 사용하며, 배경색이 아닌 *강조점*으로 활용해야 함.
*   **애니메이션 필터:** 전역 노이즈 및 글리치 오버레이 유지 (Opacity 20%). `background-image: repeating-linear-gradient(...)` 기반의 미세한 왜곡 필수.

## II. Component Specifications & Hierarchy
1. **Overlay Container (Z-index: 9999):** Absolute position, `#0A0A0C` background. Focus Trap 구현이 최우선.
2. **System Alert Header:** `[SYSTEM CRITICAL ALERT]` 문구는 Roboto Mono 사용. 애니메이션은 Pop-in 및 주기적 스크래치 효과 적용.
3. **The Risk Gauge ($L_{totalMax}$):** 게이지 수치는 노이즈와 글리치를 동반하며 데이터가 상승하는 형태(Data Surge)로 설계. 임계치 초과 시 네온 레드 영역 폭발적 점유.
4. **Solution/CTA Panel:** Authority Blue 배경의 Glassmorphism 광원 효과를 주어, 문제 해결이라는 감정적 안도감을 극대화. CTA 버튼은 지속적인 펄스 애니메이션(`pulse-glow`)을 적용하여 클릭 유도를 강제함.

## III. Animation Timing Sheet (6초 시퀀스)
*   **T + 0.0s ~ T + 2.0s:** [TRIGGER] $\rightarrow$ [ALERT]. 시스템 오류 플래시 및 $L_{totalMax}$ 수치 폭발적 등장(Pop-in, Glitch).
*   **T + 2.0s ~ T + 4.5s:** [BLOCKADE]. Paywall Overlay가 강렬하게 슬라이드 인하며 모든 상호작용을 차단하고 (Focus Trap), 게이지가 데이터 서지 애니메이션으로 급격히 상승함.
*   **T + 4.5s ~ T + 6.0s:** [SOLUTION]. 게이지 정지 $\rightarrow$ Authority Blue 영역에 광원 효과 집중. CTA 버튼이 가장 밝게 빛나며 최종 결제를 유도함.

## IV. Focus Trap Interaction Protocol
*   스크롤 방지: `overflow: hidden` 강제 적용.
*   외부 클릭 이벤트: No Event 처리 + 노이즈 필터 미세 강화 피드백 제공.
*   포커스 순서: Header $\rightarrow$ Gauge $\rightarrow$ CTA 버튼으로 고정.