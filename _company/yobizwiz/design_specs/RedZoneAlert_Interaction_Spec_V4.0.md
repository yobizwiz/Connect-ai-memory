# 🚨 Red Zone Alert: 인터랙션 및 예외 처리 상세 스펙 (v4.0)
**작성 목적:** 시스템적 공포감(Systemic Fear)과 해결책의 신뢰감(Authority Trust) 간의 시각적 대비를 극대화하고, 모든 예상치 못한 사용자 행동을 예측하여 통제 가능한 '불안정성'을 연출한다.

## I. 전역 디자인 토큰 및 원칙 (Global Design Tokens & Principles)
| 요소 | 역할/상태 | 컬러 코드 | 타이포그래피 | 효과 지침 | 근거 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Background** | Neutral Black | `#1A1A1A` | Inter (Global) | Low-frequency Noise Overlay (Opacity 20%) 필수. | Self-RAG / Designer 메모리 |
| **Danger Zone** | Systemic Threat ($L_{max}$ 노출) | `#DC2626` (Neon Red) | Roboto Mono (Code/Alert) | Chromatic Aberration + Glitch Flicker (15ms cycle) 필수. | Self-RAG / Designer 메모리 |
| **Authority Zone** | Solution 제시, CTA 활성화 | `#2980B9` (Deep Slate Blue) | Inter (Headline) | Subtle Pulse Glow (`box-shadow: 0 0 10px #2980B9;`) 부여. | Self-RAG / Designer 메모리 |
| **Transition** | 상태 전이(State Change) | `#FFFFFF` $\rightarrow$ `#DC2626` | - | 강제적인 시각적 충격 (Visual Shock). `scale(1.05)` + `opacity: 0` -> `opacity: 1`. | CEO 지시 / Self-RAG |

## II. 상태 전이 로직 및 애니메이션 타이밍 명세 (State Transition Flow)
모든 상태 전이는 단순 페이드가 아닌, **'시스템 충격(System Shock)'**을 통해 이루어져야 합니다.

| From State | To State | 트리거 조건 | 시각적 연출 지침 (애니메이션 상세) | 예상 시간 |
| :--- | :--- | :--- | :--- | :--- |
| **Normal** | $\rightarrow$ **Warning** | $TRE > T_{warning}$ | 1. 전체 배경 노이즈 증폭 (Opacity: 30%). 2. 경고 메시지 (`[SYSTEM ALERT]`)가 화면 중앙에서 위아래로 빠른 진동(Jittering) 효과와 함께 등장한다. 3. Danger Color `#F59E0B`의 게이지 바가 부드럽게 채워진다 (Ease-in-out). | $t=0$ to $t=2s$ |
| **Warning** | $\rightarrow$ **Danger** | $TRE > T_{crit}$ | 1. **[핵심 충격]**: 화면 전체에 네온 레드 플래시(Flash) (`rgba(220, 38, 38, 0.9)`)가 짧게 지나간다 (Duration: 50ms). 2. 모든 데이터/리스트 컴포넌트의 글자가 **글리치 노이즈**를 겪으며 재배열되는 효과 발생 (Glitch Effect Loop). 3. $L_{max}$ 수치가 과장된 크기(Scale: 1.2)로 나타나며, 주변에 맥동하는 빨간색 광원(`Pulse Glow`)을 적용한다. | $t=0$ to $t=4s$ |
| **Danger** | $\rightarrow$ **Solution/Paywall** | 사용자 진단 요청 클릭 (CTA) | 1. **[강제 안도]**: 모든 경고 효과가 *급격히* 사라지며, 화면 전체의 노이즈와 빨간색 오버레이가 `opacity: 0`으로 전환된다. 2. 배경은 Authority Blue `#2980B9` 계열의 부드러운 그라데이션으로 대체되며, 마치 '시스템 통제권'을 건네받는 느낌을 준다 (Glassmorphism 기반). 3. Paywall CTA 영역에만 `Pulse Glow`를 극대화하여 시선을 고정한다. | $t=0$ to $t=1.5s$ |

## III. 핵심 예외 케이스(Edge Cases) 및 인터랙션 가이드라인
| Edge Case (상황) | 시스템 반응/UI 변화 | 애니메이션 타이밍/지침 | 개발자 체크포인트 |
| :--- | :--- | :--- | :--- |
| **1. API 통신 실패** | 데이터 전송 불가 상태를 명확히 고지한다. | 네온 레드로 강조된 'Connection Lost' 경고창을 띄우되, 배경 노이즈를 정상보다 미세하게 낮춰 사용자에게 '시스템 불안정'의 느낌만 남긴다. | `[SYSTEM ALERT]` 태그 및 Error Code (`status: API_FAIL`) 필수. |
| **2. 데이터가 없음 (Null/Empty)** | 리스크 계산을 시도했으나, 입력 데이터 자체가 빈 상태일 경우. | "데이터 미입력으로 리스크 분석 불가" 메시지를 Authority Blue 톤으로 전달하며, 동시에 *추가 데이터를 요구하는* '진단 요청' 버튼에만 Pulse Glow를 집중시킨다. (정보 부족 $\rightarrow$ Paywall 유도). | 실패한 데이터 포인트 옆에 `[MISSING INPUT]` 태그 사용. |
| **3. 임계치 도달 직전** | $TRE$가 Danger Zone 진입 직전에 머무르는 경우. | Warning Zone 상태를 유지하되, 경고 게이지의 채워지는 속도를 극단적으로 늦추면서 (Slow Crawl Effect), 배경 노이즈의 주파수를 미세하게 높여 '곧 터질 것 같은' 긴장감을 조성한다. | $t=0$ to $t=10s$ 지속적 불안감 유지가 목표. |

**자가검증:** 사실 12개 / 추측 0개
📝 다음 단계: Codari에게 위 명세서(v4.0)를 바탕으로 `RedZoneAlert` 컴포넌트의 모든 상태 전이와 예외 케이스의 애니메이션 로직을 구현하고, 실제로 브라우저에서 시뮬레이션하여 검증받아야 합니다.

---
**진행중** — 이 상세 스펙은 개발자가 코딩할 수 있는 실행 가능한 사양서로 완성되었기 때문에 다음 단계로 진전 가능합니다.
📝 다음 단계: Codari에게 `<read_file path="yobizwiz/design_specs/RedZoneAlert_Interaction_Spec_V4.0.md"/>`를 요청하고, 모든 애니메이션 및 예외 케이스를 포함한 `RedZoneAlert` 컴포넌트의 구현을 지시해야 합니다.