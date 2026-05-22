# 💻 Paywall Mockup 상세 컴포넌트 가이드 (Developer Reference)

이 문서는 실제 개발에 필요한 모든 애니메이션, 좌표, 상호작용(Interaction) 규칙을 정의합니다.

## 1. 전역 스타일 및 레이아웃
*   **폰트:** Inter (Primary), Roboto Mono (Data/Alert).
*   **레이아웃:** 중앙 정렬된 단일 칼럼 구조를 유지하며, 섹션 간의 전환 시 '데이터 스트림 로드(Data Stream Load)' 효과를 사용합니다.

## 2. 컴포넌트별 상호작용 규칙 (Interaction Rules)

### A. [Component: Loss Graph]
*   **상태:** 초기 로딩 $\rightarrow$ 데이터 로딩 중 $\rightarrow$ 결과 출력.
*   **데이터 로딩 중 애니메이션:** 그래프의 Y축 값(손실액)이 0부터 최고치까지 **비선형적이고 급격하게 상승하는 애니메이션**을 사용합니다. (단순한 곡선 증가가 아닌, 공포심 유발용).
*   **기술 구현 지침:** `SVG Path`를 사용하여 그래프 라인 자체에 `Stroke-Dasharray`와 CSS Keyframe Animation으로 **'데이터 왜곡/노이즈 효과'**를 입힙니다.

### B. [Component: Mandatory Timer]
*   **상태:** 항상 활성화 (Always On).
*   **애니메이션:** 타이머 숫자가 틱(Tick)하는 것이 아니라, 마치 시스템 코드가 계속 재계산되는 것처럼 **숫자 자릿수 전체가 짧게 깜빡이거나 글리치 노이즈를 동반하며 업데이트**되어야 합니다.
*   **시각적 효과:** 경고 임계점에 도달하기 24시간 전부터 빨간색 `Critical Red Zone`으로 색상이 변하고, 주변에 `#C0392B`의 짧은 플래시가 간헐적으로 발생해야 함.

### C. [Component: CTA Button Group]
*   **상태:** 비활성화 $\rightarrow$ 활성화 직전 $\rightarrow$ 클릭 완료.
*   **비활성화 상태 (Default):** 버튼을 누를 수 없도록 처리하고, 대신 "필수 진단이 완료된 후 시스템 검토가 진행됩니다..." 같은 문구를 표시합니다.
*   **활성화 직전 애니메이션 (Critical Step):** 사용자가 $49 결제 버튼에 마우스를 올리는 순간(Hover), 버튼 전체와 주변 영역에 **`Red Zone Alert Box`의 강렬한 플래시 효과(Opacity 0 $\rightarrow$ 1 $\rightarrow$ 0)**를 2회 연속 발생시켜, 결정의 순간마저 위협적인 경험으로 만듭니다.

## 3. 최종 점검 체크리스트
*   [ ] 모든 텍스트는 권위적이고 비장한 (Dramatic & Authoritative) 어투여야 한다.
*   [ ] 데이터 표시는 반드시 `Roboto Mono`를 사용하고, 배경에 시스템 코드가 출력되는 듯한 효과가 있어야 한다.
*   [ ] Paywall 전반에 걸쳐 '시간', '돈', '위험' 이 세 가지 키워드의 긴급성이 지속적으로 느껴져야 한다.