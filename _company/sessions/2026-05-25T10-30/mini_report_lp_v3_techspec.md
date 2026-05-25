# 🚨 Mini-Report LP v3.0: Shock Reveal Technical Specification Document (TSD)

## 🎯 I. 개요 및 목표
*   **목적:** 무료 진단(Free Scan)에서 유료 전환(Paid Audit)으로 강제 이동시키는 인터랙티브 충격 경험 제공.
*   **핵심 감정:** '불안', '긴급함', '측정된 위협'.
*   **활용 카피 원천:** Writer가 제공한 재무적 손실 경고 Copy.

## 🎨 II. 비주얼 및 애니메이션 사양 (Visual & Animation Specs)

### 2.1 컬러 팔레트 (Color Palette)
| 역할 | 색상명/코드 | 사용 목적 | 참고 사항 |
| :--- | :--- | :--- | :--- |
| **🚨 Red Zone** (위협) | `#C0392B` | 경고, 실패, 리스크 수치. | 플래시 효과(Opacity 0 $\rightarrow$ 1 $\rightarrow$ 0)에 주 사용. |
| **🔵 Authority Blue** (신뢰) | `#2980B9` | 시스템 기본 색상, 성공/안정화된 영역. | 경고와 대비되는 '기준선' 역할을 수행. |
| **⚫ Neutral Black** (기본 배경) | `#1A1A1A` | 전체 배경색 (Dark Mode). | 전문적이고 깊이 있는 컨설팅 톤 유지. |

### 2.2 타이포그래피 및 효과 (Typography & Effects)
*   **메인 폰트:** Inter (Sans-serif)
*   **데이터/경고 폰트:** Roboto Mono (Monospace) - **모든 지표, 점수, 코드 블록에 필수 적용.**
*   **필수 효과:**
    1.  **글리치 오버레이 (Glitch Overlay):** Red Zone 섹션 진입 시 전역적으로 노이즈와 색상 왜곡 필터가 배경 위에 겹쳐야 함. (`filter: hue-rotate(Xdeg) contrast(Y)`)
    2.  **플래시 효과 (Flash Effect):** Critical Error 발생 시, 화면 전체에 짧고 강렬한 Red Zone 플래시를 주입함.

## 💻 III. 인터랙티브 로직 명세 (Interactive Logic Flow)

### Step 1: Audit Trigger & Loading Phase
*   **Event:** CTA 버튼 클릭 (`button#run-audit`).
*   **Action:**
    1.  버튼 비활성화 및 애니메이션 변경 (클릭된 느낌).
    2.  화면 전환 효과: 블랙아웃(0.3s) $\rightarrow$ Red Zone/Noise Overlay 적용.
    3.  로딩 바 시작: 파동 형태의 로딩 바가 불안정하게 움직이며, '데이터 수집 중...' 메시지를 Monospace 폰트로 표시합니다.

### Step 2: Risk Score Revelation (The Counter)
*   **Event:** Loading Phase 완료 직후.
*   **Action:**
    1.  `Risk Score Display` 영역이 활성화됩니다.
    2.  **스코어 애니메이션:** JavaScript를 사용하여 스코어를 `0`에서 최종 임계값(예: 94)까지 **카운트 업 (Counting Up)** 합니다. 이 과정은 3초 내외의 긴장감을 유지해야 합니다.
    3.  **사운드/시각 피드백:** 숫자가 커질 때마다 시스템 알람음과 함께 Red Zone 컬러가 배경에 미세하게 깜빡이는 효과를 연동합니다.

### Step 3: Gap Detection & Shock Copy (The Climax)
*   **Event:** Risk Score가 임계값(94%) 도달 및 안정화.
*   **Action:**
    1.  `Unidentified Risk Index` 섹션이 강렬하게 전면 노출됩니다. 게이지 바 전체가 Red Zone으로 채워지며, "GAP DETECTED"라는 경고 문구가 팝업됩니다.
    2.  **최종 충격 (The Glitch):** 페이지 배경에 최대치의 글리치 효과와 플래시를 적용합니다.
    3.  Writer의 핵심 카피 (`지금의 ‘괜찮음’은 가장 비싼 착각입니다...`)가 마치 시스템 로그처럼, 글리치 애니메이션을 동반하며 중앙에 강하게 고정됩니다.

### 📝 IV. 개발팀 참고 사항 (Developer Notes)
*   **성능 최적화:** 모든 인터랙션은 부드러운 커브(Ease-in/out)를 사용하되, 충격적인 순간에는 의도적으로 **'거친(Jittery)'** 애니메이션을 사용하여 불안정성을 극대화해야 합니다.
*   **A11Y (접근성):** 시각적 과부하가 크므로, Red Zone 경고 텍스트는 반드시 `aria-live="assertive"`를 적용하여 스크린 리더 사용자에게도 '경고'임을 명확히 전달해야 합니다.