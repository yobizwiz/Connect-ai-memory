# 🚨 yobizwiz: Ultimate Compliance Failure Report - Interactive UI Blueprint (v1.1)

## 📄 프로젝트 목표
단순 보고서 전달 $\rightarrow$ **[공포 증폭]** $L_{totalMax}$ 수치로 인한 시스템적 위기 감지 $\rightarrow$ **[권위 부여]** 상세 리스크 분석을 통한 공감대 형성 $\rightarrow$ **[강제 행동 유도]** Paywall 진입(Diagnosis Request)

## 🎨 Global Design Tokens (재확인)
| 요소 | 목적 | HEX Code | 타이포그래피 | 노트 |
| :--- | :--- | :--- | :--- | :--- |
| **Background** | 기본 배경 | `#1A1A1A` | Inter | 어둡고 깊은 데이터 센터 톤 유지. |
| **Red Zone Alert** | 공포/위험 | `#C0392B` (Dark Crimson) | Roboto Mono | 시스템 경고, $L_{totalMax}$ 위험 구간. |
| **Authority Blue** | 해결책/신뢰 | `#2980B9` (Deep Slate Blue) | Inter | 솔루션 섹션, CTA 버튼 기본색. |
| **Data Font** | 수치 데이터 | N/A | Roboto Mono | 모든 리스크 점수, 법규 조항 등 시스템적 권위 부여. |

---

## 🧩 Component Spec 1: $L_{totalMax}$ Critical Alert Overlay (공포 증폭 메커니즘)

이 컴포넌트는 보고서의 핵심 데이터 섹션(예: 'Compliance Gap' 분석 결과)을 가로지르는 **최상위 인터럽트 레이어**입니다. 사용자가 특정 임계점을 넘는 $L_{totalMax}$ 수치를 인지하는 순간 트리거됩니다.

### ⚙️ State & Trigger
*   **Trigger:** 백엔드 API가 계산한 `L_calculated` 값이 보고서 설정의 임계치(`L_threshold`)를 초과할 때 ($L_{calculated} > L_{threshold}$).
*   **State:** `#overlay-critical-alert` (전체 화면 또는 섹션 오버레이)

### 🖼️ Visual Specification
1.  **Overlay Background:** 반투명한 어두운 그라데이션 블랙 (`rgba(26, 26, 26, 0.95)`).
2.  **Primary Element (System Alert Box):** 중앙에 위치하며, `Red Zone Alert` 색상으로 테두리 및 배경의 하이라이트가 들어간 박스.
3.  **Animation & Effect:**
    *   **Initial Load:** 화면 전체에 노출되는 2초간의 **글리치 노이즈(Glitch Noise)**와 함께 나타나야 합니다 (Self-RAG 패턴 재사용).
    *   **Visual Artifact:** 오버레이 배경 위에 낮은 빈도의 `Chromatic Aberration` 필터가 적용되어, 마치 시스템 자체가 불안정하게 작동하는 듯한 시각적 착시를 유도합니다.
4.  **Content Structure (Mandatory Text):**
    ```
    [!!! SYSTEM ALERT: CRITICAL FAILURE DETECTED !!!]
    STATUS: $L_{totalMax}$ EXCEEDED THRESHOLD.
    DETECTED GAP: [API_ERROR_CODE 0xDEADBEEF].
    IMPACT: Current Compliance Posture is UNSUSTAINABLE.
    ACTION REQUIRED: Manual Audit & Re-engineering Mandated. (Time Sensitive)
    ```

---

## 🧩 Component Spec 2: Risk Factor Hover Card / Tooltip (권위 구축 메커니즘)

보고서의 리스크 테이블 또는 목록에 있는 각 개별 위협 요소(예: 'GDPR 데이터 주권 문제') 옆에 배치되는 컴포넌트입니다. 클릭이나 호버링을 통해 깊이 있는 정보를 제공하며, yobizwiz의 전문성을 간접적으로 입증합니다.

### ⚙️ State & Trigger
*   **Trigger:** 마우스 포인터가 리스크 요인 요소 (`<div class="risk-item">`) 위에 진입했을 때 (`:hover`).
*   **State:** `#tooltip-expanded` (Toolbox/Card 형태)

### 🖼️ Visual Specification
1.  **Transition:** `0.3s ease-out`의 부드러운 애니메이션으로, 리스크 항목의 측면에서 슬라이딩되어 나타나야 합니다. (갑작스러운 출현보다 '데이터가 로딩됨'을 연출).
2.  **Structure (Three Pillars):**
    *   **[Impact Scope]:** 이 리스크가 미치는 영향 범위(예: 다중 관할권 충돌, 고객 데이터 주권 침해)를 명시합니다. 여기에 `Roboto Mono` 폰트를 사용한 구체적인 기술 용어(e.g., 'Cross-Jurisdictional Liability')를 배치하여 권위를 높입니다.
    *   **[Mitigation Gap]:** 현재 시스템이 부족한 지점을 빨간색 경고와 함께 강조합니다 (예: "내부 통제는 존재하나, 법적 증거 자료로 매핑되지 않음").
    *   **[Actionable Insight]:** 이 문제를 해결하기 위한 방향성을 제시하며, **Authority Blue**의 미세한 배경광을 사용하여 '여기가 해답의 시작점'임을 암시합니다.

---

## 🧩 Component Spec 3: Diagnosis Request Visual Anchor (행동 강제 유도 메커니즘)

보고서 스크롤의 마지막 지점에서 사용자의 시선과 행동(스크롤 정지, 버튼 클릭)을 강력하게 앵커링하여, 결제 퍼널로 강제 진입시키는 핵심 컴포넌트입니다.

### ⚙️ State & Trigger
*   **Trigger:** 사용자 스크롤이 보고서의 'Solution/Paywall' 섹션에 도달했을 때 (Viewport Visibility).
*   **State:** `#cta-anchor-active` (강력한 시각적 강조)

### 🖼️ Visual Specification
1.  **Anchor Container:** CTA 버튼 자체를 감싸는 특수 박스 형태의 컨테이너입니다. 이 박스는 일반적인 섹션 경계가 아닌, **시스템 로그 파일의 마지막 항목이 '완료됨'을 알리듯 디자인되어야 합니다.** (예: `[ANALYSIS COMPLETE]`)
2.  **Animation:**
    *   **Pulsing Effect:** CTA 버튼 주변에 `Authority Blue`와 미세한 `#8A2BE2` (Electric Purple)의 광원 효과(Glow)가 0.8초 주기로 맥동합니다. 이 빛은 마치 '시스템이 활성화되어 대기 중'인 것처럼 느껴져야 합니다.
    *   **Depth Shift:** 버튼 전체에 미세한 패럴랙스 스케일링 효과를 적용하여, 단순히 평면적인 웹 요소가 아닌, **클릭 가능한 물리적 장치(Physical Device)**처럼 보이게 만듭니다. (Glassmorphism의 광택/입체감 활용).
3.  **Micro-Copy:** 버튼 위에 다음과 같은 문구를 배치하여 긴장감을 높입니다.
    > "진단 요청은 단순한 결제가 아닙니다. **귀사의 생존을 위한 법적 보험에 대한 시스템 승인 과정입니다.**"