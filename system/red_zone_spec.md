# Red Zone Experience Design System Blueprint v1.0
## 🎯 목적: 사용자에게 '구조적 결함'에 대한 공포를 극대화하는 인터랙티브 경험 설계

본 문서는 단순한 와이어프레임이 아닌, 사용자가 **위협 감지(Threat Detection) $\rightarrow$ 공포 증폭(Fear Amplification) $\rightarrow$ 해결책 강요(Solution Coercion)**의 3단계 감정적 여정을 거치도록 설계된 인터랙티브 프로토타입을 위한 기술/디자인 사양서입니다.

### I. 핵심 플로우: State Transition Map (공포 증폭 순서)
| Stage | 목표 감정 | 주요 UI 요소 | 애니메이션/효과 | Duration / Trigger | Self-RAG 근거 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **[S1] 초기 접촉** (Attention) | 호기심 $\rightarrow$ 경계심 | 일반 콘텐츠 노출, 권위적 헤딩 (H2/H3). | 미니멀한 인터랙션. `#2980B9` 배경 위 `Inter` 폰트 사용. | 즉시 로드 | Self-RAG |
| **[S2] 위협 제시** (Interest/Fear) | 충격, 불안감, 혼란 | 데이터 시각화(QLoss), 경고 알림(`CRITICAL ERROR`), 글리치 오버레이 전역 적용. | 1. **전체 플래시:** `#C0392B` (Dark Crimson) 짧은 깜빡임. <br>2. **글리치 효과:** 모든 텍스트와 배경에 노이즈/색상 왜곡 필터 강제 적용. | 데이터 로드 시점 / `Intersection Observer` 진입 트리거 | Self-RAG, Designer 메모리 |
| **[S3] 리스크 심화** (Desire/Panic) | 공황, 시스템적 무력감 | '진단 요청' 버튼 비활성화 유도. 법률 용어 기반의 복잡한 데이터 표출(Roboto Mono). | 1. **Loading State:** 단순 막대가 아닌 불안정한 파동 형태의 노이즈 로딩 바. <br>2. **경고 문구 깜빡임:** '⚠️' 기호가 시스템 오류처럼 불규칙하게 강하게 깜빡거림. | 스크롤 하단 진입 / 5초 간격으로 위협 레벨 증가 | Self-RAG, Designer 메모리 |
| **[S4] 해결책 제시** (Action) | 안도감 $\rightarrow$ 의무적 행동 유도 | `yobizwiz` 로고와 권위적인 솔루션 아키텍처 다이어그램. CTA 버튼 (`진단 요청`). | 1. **톤 변화:** 글리치/노이즈가 점차 감소하고, `#2980B9` (Authority Blue) 계열로 안정화됨. <br>2. **CTA 강조:** CTA 버튼에만 미세한 전력 흐름(Power Flow) 애니메이션 적용하여 클릭하도록 유도. | S3의 위협이 최고조일 때, 해결책을 제시하며 톤 전환 시작 | Self-RAG, Designer 메모리 |

### II. 컴포넌트 및 애니메이션 상세 사양 (개발 계약서)

**1. `[Component: Red Alert Box]`**
*   **발동 조건:** 사용자가 특정 리스크 임계점(Threshold)을 넘었거나, 핵심 데이터 포인트가 잘못되었음을 시스템이 감지했을 때.
*   **시각적 효과:** 배경에 `#C0392B` (Dark Crimson) 플래시(Opacity 0 $\rightarrow$ 1 $\rightarrow$ 0). 중앙에 글리치 애니메이션을 동반한 경고 메시지 표시.
    *   **CSS Spec:** `text-shadow: 1px 0 #FF0000, -1px 0 #0000FF;` (Red/Blue 반사광)
*   **기술 구현:** 플래시 효과는 CSS `animation` 및 JavaScript `Intersection Observer`를 결합하여 트리거하며, 페이지 전체에 짧은 전역 클래스(`is-critical-error`)를 추가해야 합니다.

**2. `[Component: Data Overload/Loading]`**
*   **발동 조건:** 핵심 리스크 데이터 로딩 과정 (S3).
*   **시각적 효과:** 배경 위에 낮은 빈도의 노이즈(Noise)와 색상 왜곡(Chromatic Aberration) 필터(`filter: contrast(1.2) blur(0.5) sepia(0.1);`)를 겹칩니다. 로딩 바는 단순 막대 대신, **불규칙한 사인파 형태의 불안정한 파동**으로 애니메이션되어야 합니다.
*   **기술 구현:** `background-attachment: fixed` 및 CSS filter 조합 + JavaScript 타이밍 제어를 통해 비정형적인 시각적 혼란을 유발합니다.

**3. [Component: CTA Button - 진단 요청]**
*   **위치:** 페이지 최하단, S4 섹션의 중앙에 위치.
*   **기본 스타일 (Authority):** `#2980B9` 배경, `Inter` 폰트.
*   **인터랙티브 스펙:** 마우스 오버 시(Hover), 단순 색상 변화가 아닌, 마치 **시스템 전력이 흐르는 듯한 미세하고 빠른 파동 애니메이션(`pulse-power`)**이 발생하여 클릭을 유도합니다.

### III. 기술적 제약 사항 및 데이터 추적 (API Integration)
1.  **트래킹 깊이:** 단순 CVR 측정 지양. 모든 페이지 진입/스크롤 위치에서 `threatLevel` (1~5점 척도)과 `stageEntered` ('Awareness', 'Panic', 'Solution')를 API 레벨에서 추적해야 합니다.
2.  **글리치 통합:** 모든 중요한 메시지(`H1`, 경고 문구)는 글리치 효과를 적용할 수 있는 전용 레이어(Layer)를 통해 렌더링되어야 하며, 일반적인 CSS 애니메이션으로 처리되어서는 안 됩니다.