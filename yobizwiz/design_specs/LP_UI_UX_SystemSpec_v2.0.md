# yobizwiz 랜딩 페이지 UI/UX 시스템 사양서 v2.0

## 🎯 목표: 공포(Fear)를 통한 통제력(Control) 판매
### 핵심 흐름: Red Zone Warning $\rightarrow$ Data Overload $\rightarrow$ Authority Blue Solution $\rightarrow$ CTA Conversion

---

### 🎨 1. 글로벌 디자인 시스템 (Global Design System)

| 요소 | 사양/규칙 | 색상 코드 (HEX) | 구현 노트 (Animation/Effect) |
| :--- | :--- | :--- | :--- |
| **배경색** | Neutral Black (Dark Mode Base) | `#1A1A1A` | 전체 배경. 낮은 채도의 글리치 오버레이(Noise Filter)를 기본 적용하여 불안정성을 유지함. |
| **Red Zone 경고** | Critical Alert/Danger | `#C0392B` | **강제 플래시:** `Opacity 0 $\rightarrow$ 1 (200ms) $\rightarrow$ 0`. 글리치 효과 (`text-shadow: 1px 0 red, -1px 0 blue;`) 필수. |
| **Authority Blue** | Solution/Trust Zone | `#2980B9` | 배경색 및 핵심 컨테이너 색상. '안정화'되는 느낌을 주는 부드러운 그라디언트와 함께 사용. |
| **폰트 (Primary)** | Inter, Sans-serif | N/A | 가독성 최우선. H1/H2에 굵은 글자 사용하여 전문적인 권위 부여. |
| **폰트 (Data/Alert)** | Roboto Mono, Monospace | N/A | 리스크 수치, 에러 코드, 경고 메시지에 *필수* 적용. 시스템의 '데이터'임을 강조. |

### ✨ 2. 컴포넌트별 인터랙티브 사양

#### A. Loss Meter Component (위협 감지)
1.  **상태:** 초기화 $\rightarrow$ 데이터 로드 중 $\rightarrow$ 임계점 도달(Critical).
2.  **애니메이션:** 수치 변화 시 단순 증가가 아닌, **비선형적 점프(Jump)** 애니메이션 사용. (ex: 10% $\rightarrow$ 75%로 즉시 점프하며 플래시 효과 동반).
3.  **트리거:** 마우스 오버 이벤트 발생 시, 실시간으로 계산된 가상의 리스크 수치($R_{score}$)를 강렬한 Red Zone 플래시와 함께 표시해야 함.

#### B. 구조적 무결성 비교 (Before $\rightarrow$ After)
1.  **전환 효과:** 'Before' 섹션은 복잡하고 산만하며, 글리치/노이즈 필터가 가장 많이 적용됨. ('Chaos State').
2.  **솔루션 제시:** 사용자의 스크롤 또는 클릭에 의해 'After' 섹션으로 전환될 때, 배경의 노이즈와 색상 왜곡(Chromatic Aberration)이 **빠르게 사라지며 (Fade Out/Clear)** Authority Blue 톤의 깨끗하고 명료한 구조도(Flowchart)가 등장해야 함.

#### C. CTA 요청 영역 (Conversion Peak)
1.  **배경:** Deep Slate Blue (`#2980B9`)를 기반으로 한 '통제된 시스템 인터페이스' 느낌 부여.
2.  **CTA 버튼:** `[SYSTEM_COMMAND: Free Risk Diagnosis]` 형식의 디자인. 마우스 호버 시, **Red Zone 플래시와 함께 임시 명령어 프롬프트가 깜빡이는 애니메이션**을 적용하여 클릭해야 할 '필수 액션'으로 인식하게 만듦.
3.  **폼 필드:** 필드가 포커스 될 때마다 해당 입력창이 잠재적인 데이터 오류를 경고하는 듯한 **미세하고 빠른 글리치 효과**를 주어, 사용자가 정보를 신중하게 입력해야 하는 '권위적 과정'에 참여한다는 느낌을 강화합니다.

---