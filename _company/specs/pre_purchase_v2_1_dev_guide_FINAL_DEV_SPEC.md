# 🛠️ [개발자 전달용] QLoss Gatekeeper System V2.1 최종 명세서

## I. 개요 및 목표 (Goal & Scope)
*   **목표:** 사용자가 결제 직전, 시스템적 오류(System Intervention)를 체감하게 하여 '구조적 리스크'를 인지시키고, 유료 진단 보고서 구매를 강제 전환시키는 것이 목적입니다.
*   **경험 유형:** 일반적인 UI 오류 메시지가 아닌, 권위적이고 위협적인 **시스템 경고(System Warning)** 경험을 제공해야 합니다.
*   **사용 에셋:** Red Zone Alert Box (주요 액션), 데이터 로딩 화면 (미세 애니메이션).

## II. 비주얼 시스템 재확인 (Visual System Review)
| 역할 | 색상명/코드 | HEX Code | 용도 및 구현 방식 | [근거: Self-RAG] |
| :--- | :--- | :--- | :--- | :--- |
| **🚨 Red Zone** (위협) | Dark Crimson | `#C0392B` | 경고 메시지, 플래시 효과 주 색상. 글리치 노이즈의 메인 컬러. | [근거: Self-RAG] |
| **🔵 Authority Blue** (해결책) | Deep Slate Blue | `#2980B9` | yobizwiz 로고/CTA 버튼, 해결책 제시 텍스트 색상. 권위와 안정감 부여. | [근거: Self-RAG] |
| **⚫ Neutral Black** (기본 구조) | Dark Background | `#1A1A1A` | 전체 배경색 (Dark Mode). 전문적이고 깊이 있는 컨설팅 분위기 유지. | [근거: Self-RAG] |
| **Data/Alert Font** | Monospace | N/A | 모든 경고 메시지, 코드 블록(`status: FAILURE`), 리스크 데이터 표기 시 필수 적용 (예: `Roboto Mono`). 시스템적 권위 부여. | [근거: Self-RAG] |

## III. 핵심 컴포넌트 상세 스펙 및 인터랙션 로직 (Component Specs & Interaction Logic)

### 1. Red Zone Alert Box (`CRITICAL ERROR`)
**[상태 변화 플로우]:** 평온 $\rightarrow$ 시스템 경고 발생 $\rightarrow$ 메시지 고정 $\rightarrow$ 해결책 제시 (CTA).

| 상호작용 | 구현 로직 상세 스펙 | 애니메이션 타이밍 및 CSS/JS 요구사항 | [근거: Self-RAG] |
| :--- | :--- | :--- | :--- |
| **A. 경고 발생 (Trigger)** | API 인터셉션 기반으로 `status: "FAILURE"` 응답 수신 시 즉시 트리거. 페이지 전체에 강렬한 Red Zone 플래시가 지나감. | 1. **Flash:** Opacity $0 \rightarrow 1$ (`#C0392B`) $\rightarrow 0$. (Duration: 200ms). <br>2. **Global Overlay:** 배경에 짧은 `Noise/Glitch Overlay` 필터 적용 및 제거. | [근거: 코다리 작업] |
| **B. 경고 메시지 표시** | "CRITICAL ERROR: 구조적 무결성 실패" 등 핵심 리스크 메시지가 화면 중앙에 고정됨. | 1. **글리치 효과:** `text-shadow: 1px 0 red, -1px 0 blue;` 를 주기적으로 미세하게 깜빡이며(CSS Keyframes), 불안정성을 강조. <br>2. **폰트:** Roboto Mono 적용. 글자 크기 및 굵기를 강제하여 권위 부여. | [근거: Self-RAG] |
| **C. Hover/Focus 상태** | 사용자가 경고창에 마우스를 올리거나 포커스할 경우. | 커서 모양을 시스템 기본 커서(`cursor: default;`)로 고정하고, 배경의 노이즈 오버레이 강도를 15% 증가시켜 긴장감을 유지함. (Transition: Smooth Opacity 변화). | [추측] |
| **D. Dismiss/Dismissible** | 사용자가 '확인' 버튼을 눌러 경고창을 닫으려는 시도. | `disabled` 상태로 고정하거나, 클릭해도 다음 단계(CTA)로 강제 리다이렉션함. (사용자 선택권 차단). | [근거: Self-RAG] |

### 2. 데이터 로딩 화면 (`LOADING`)
**[상태 변화 플로우]:** 초기화 $\rightarrow$ 데이터 처리 중 $\rightarrow$ 오류 감지 (Critical) 또는 완료.

| 상호작용 | 구현 로직 상세 스펙 | 애니메이션 타이밍 및 CSS/JS 요구사항 | [근거: Self-RAG] |
| :--- | :--- | :--- | :--- |
| **A. 초기 노이즈 오버레이** | 데이터 로딩 시작 시 배경 전체에 낮은 빈도의 Noise와 Chromatic Aberration 필터 적용. | 1. **Filter:** `background-image: url('noise_pattern.svg');` 를 사용하여 전역적으로 미세한 노이즈를 유지함. <br>2. **Transition:** 부드러운 Fade-in (Duration: 500ms). | [근거: Self-RAG] |
| **B. 로딩 바 형태** | 단순 막대형이 아닌, 불안정한 파동 형태의 로딩 애니메이션을 구현. | `setInterval`과 CSS Keyframes를 사용하여 로딩 바가 불규칙하게 출렁이는(Wobble) 효과를 주어 시스템적 불안정성을 시각화함. | [근거: Self-RAG] |
| **C. 실패/성공 메시지 전환** | 데이터 처리 중 `FAILURE` 감지 시, 로딩 바 애니메이션을 멈추고 즉시 Red Zone Alert Box로 Transition (Transition Time: 100ms). 성공 시에는 Authority Blue의 안정적인 파동으로 전환. | JS State Management를 통해 현재 시스템 상태(Loading $\rightarrow$ Error/Success)에 따라 CSS 클래스를 토글해야 함. | [근거: Self-RAG] |

## IV. 결론 및 개발 우선순위
1.  **최우선:** `CRITICAL ERROR` 플래시와 글리치 효과 구현 (가장 핵심적인 공포 자극 장치).
2.  **차순위:** 데이터 로딩 화면의 불안정한 파동 애니메이션 구현.
3.  **확인 요청:** 최종 CTA 버튼(`View Full Report / Buy Insurance`)은 Red Zone과 대비되는 가장 명료한 Authority Blue 톤으로, 사용자에게 **유일하고 확실한 출구(Exit)**처럼 보이도록 디자인해야 합니다.

---