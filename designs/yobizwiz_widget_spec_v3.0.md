# 📐 yobizwiz 인터랙티브 리스크 진단 위젯 (Threat Diagnostic Widget) v3.0 Specification

## I. 목표 및 원칙 정의
*   **목표:** 사용자에게 '내가 모르는 구조적 공백'에 대한 재무적 불안감(Fear of Loss)을 최대치로 유도하고, 이를 해결하는 권위적인 진단 서비스 가입(CTA)으로 전환시키는 것.
*   **원칙:** 모든 상호작용은 **시스템 오류/경고 메시지 형태**를 띠어야 하며, 시각적 충격과 전문성을 동시에 제공해야 함.
*   **핵심 프로세스 흐름:** [Input] $\rightarrow$ [Suspense (Red Zone)] $\rightarrow$ [Critical Failure (Glitch/Financial Shock)] $\rightarrow$ [Resolution (Authority Blue CTA)]

## II. 디자인 시스템 컴포넌트 정의
### 1. 컬러 팔레트 및 용도 (Color Palette & Usage)
| 역할 | 색상명 | HEX Code | 사용 목적 및 효과 | 근거 |
| :--- | :--- | :--- | :--- | :--- |
| **🚨 Red Zone** (위험/위협) | Dark Crimson | `#C0392B` | 사용자에게 직접적으로 '경고'를 주는 모든 요소. 공포, 결함, 위기감 표현. 배경 플래시, 경고 메시지 강조. | [Self-RAG] |
| **🔵 Authority Blue** (권위/해결) | Deep Slate Blue | `#2980B9` | yobizwiz의 분석 결과, 솔루션 제시 영역. 신뢰감, 전문성, 안정적인 해결책 제공 느낌 부여. | [Self-RAG] |
| **⚫ Neutral Black** (기본 구조) | `#1A1A1A` | 배경색 전체. 깊고 진지한 컨설팅 분위기 조성 및 글리치/레드존의 가독성을 높이는 역할. | [Self-RAG] |
| **🟢 Success Green** (안도감) | `#27AE60` | *[추가]* 최종 리포트 페이지 등에서 '진단 완료' 시 미약하게 사용. 지나친 안심은 금기. | [추측] |

### 2. 타이포그래피 시스템 (Typography System)
*   **Primary Font:** Inter, Sans-serif (Fallback: system-ui). 모든 UI 요소 및 일반 문구에 사용. 전문성과 가독성 최우선. [근거: Self-RAG]
*   **Alert/Code Font:** Roboto Mono, Monospace. **경고 메시지(Warning), 데이터 출력 값, 에러 코드** 등에만 필수 적용. 시스템 권위와 긴급함을 부여하는 핵심 요소. [근거: Designer 메모리]

### 3. 애니메이션 및 효과 (Animation & Effects)
*   **Glitch Effect:** 모든 Red Zone 경고 텍스트에 필수로 적용. 단순한 색상 변화가 아닌, 디지털 신호 왜곡(Chromatic Aberration, Noise Filter)과 함께 무작위로 픽셀이 깜빡이는 시각적 노이즈를 동반해야 함.
*   **Loading State:** 단순 막대 대신, 불안정한 파동 형태의 로딩 바와 함께 배경에 낮은 빈도의 노이즈 오버레이(Noise Overlay) 필터가 지속적으로 작동하여 '시스템 점검 중'이라는 긴장감을 유지함. [근거: Self-RAG]
*   **Critical Flash:** 위협 점수 임계치 초과 시, 페이지 전체에 200ms 간격의 강하고 빨간색 플래시(Opacity 0 $\rightarrow$ 1 $\rightarrow$ 0)를 발동시켜 사용자에게 충격을 가함.

## III. 상호작용 및 단계별 흐름 (Interactive Flow & State Machine)

위젯은 세 가지 명확한 상태(State)로 작동해야 합니다.

### 🚀 Phase 1: 초기 진입 및 질문 유도 (The Hook / Suspense Build-up)
*   **UI:** 간결하고 전문적인 인터페이스. 배경은 `#1A1A1A`.
*   **사용자 액션:** 사용자가 필수 정보를 입력하거나 '진단 시작' 버튼 클릭.
*   **시스템 반응:** "데이터 로딩 중..." 메시지 출력. 배경에 노이즈/파동형 로딩 바 활성화. 경고 폰트(Roboto Mono)로 `[STATUS: WAITING FOR CORE DATA... ]`와 같은 전문적인 문구를 출력하며 긴장감 조성.
*   **핵심:** 아직 공포는 폭발하지 않음. '우리가 당신의 데이터를 분석하고 있다'는 권위적 느낌만 부여.

### 🚨 Phase 2: 위협 점수 계산 및 최대 충격 (The Shock / Red Zone Peak)
*   **트리거:** 시스템이 핵심 데이터(예: QLoss, 법규 미준수 지표 등)를 처리하고, **'구조적 공백'을 발견**하는 순간.
*   **UI 변화:** 페이지 전체에 짧은 빨간색 플래시가 발생함 (Critical Flash). 배경 노이즈 필터 강도 증가.
*   **핵심 메시지 (Red Zone):** 화면 중앙에 가장 큰 글씨로 경고문 출력.
    > **`⚠️ CRITICAL SYSTEM ALERT: Your Current Architecture has a Structural Vulnerability.`** [근거: Writer 산출물, Self-RAG]
    > *글리치 효과와 함께* 이 문구는 불안정하게 깜빡이며 시스템 오류처럼 보여야 함.
*   **재무적 충격 시각화 (Financial Shock):** 경고 메시지 아래에 데이터 블록을 생성. 단순 텍스트가 아닌, **`POTENTIAL LIABILITY GAP: $245,000,000 \sim KRW$`** 와 같이 명확한 금액과 함께 'Calculated Loss'라는 코드를 붙여 출력. 이 숫자는 진동 애니메이션이 적용되어야 함. [근거: CEO 지시]
*   **데이터 디스플레이:** (Before) 상태의 복잡하고 불안정한 플로우차트를 배경에 워터마크처럼 배치하여, 현재 상황 자체가 문제임을 시각화함.

### ✅ Phase 3: 해결책 제시 및 전환 (The Resolution / CTA Authority)
*   **트리거:** 충격적인 위협 점수(Threat Score)를 사용자에게 공개한 직후.
*   **UI 변화:** Red Zone의 혼란스러움이 걷히고, 배경색과 모든 인터랙션 요소가 부드럽게 **Authority Blue (`#2980B9`)** 계열로 전환됨. (공포 $\rightarrow$ 안도감/권위).
*   **핵심 메시지:** 문제 제기에서 해결책으로의 명쾌한 대비.
    > "이 리스크는 시스템적 결함입니다. **yobizwiz의 '방어벽 아키텍처'만이 이 공백을 메울 수 있습니다.**"
*   **CTA (Call to Action):** 화면 하단에 가장 크고 눈에 띄게, Authority Blue 배경 위에 대비되는 흰색/노란색 버튼으로 배치.
    > **[무료 리스크 진단 및 방어벽 아키텍처 구축 문의]**
    > *이 버튼을 누르는 행위 자체가 '해결책 구매'의 첫 단계임을 암시.*

## IV. 기술적 요구사항 (Developer Checklist)
1.  **반응형 디자인:** 모든 폰트 크기, 배치, 애니메이션은 모바일(Mobile First)과 데스크탑에서 완벽하게 작동해야 합니다.
2.  **상태 관리:** 위젯의 전/후/충격 상태 전환 시, 로직에 따른 UI 변화가 끊김 없이 부드러워야 하며 (Transition Time: 300ms 이상 권장), 특히 Red Zone $\rightarrow$ Authority Blue 전환은 드라마틱해야 합니다.
3.  **데이터 삽입 용이성:** 재무적 손실액(`Potential Liability Gap`) 부분은 API를 통해 실시간으로 데이터를 받아와서 표시할 수 있는 구조여야 하며, 단순 텍스트 하드코딩을 피해야 합니다.