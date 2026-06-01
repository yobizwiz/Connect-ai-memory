# 🚨 YOBIZWIZ: Compliance Gateway - 최종 진단 리스크 보고서 시스템 명세 (V3.0)

**[문서 목적]**
본 문서는 잠재 고객에게 법적 공포(Fear of Loss)를 최대화하고, yobizwiz의 서비스 구매를 '시스템 생존에 필수적인 의무'로 강제하는 인터랙티브 진단 보고서의 최종 개발 명세입니다. 단순한 PDF가 아닌, 실시간 데이터 연동 및 글리치 효과가 핵심인 **‘인지적 인터페이스 아키텍처’**입니다.

**[근거: CEO 지시, Self-RAG]**
---

## 📐 I. 디자인 토큰 (Design Tokens) 시스템 정의

모든 컴포넌트와 애니메이션은 아래의 표준 토큰을 기반으로 하며, 이탈이 허용되지 않습니다.

### 1. 컬러 팔레트 (Color Palette)
| 역할 | 이름 | HEX 코드 | 용도 및 설명 | [근거: Self-RAG] |
| :--- | :--- | :--- | :--- | :--- |
| **배경** | Neutral Black | `#1A1A1A` | 기본 배경색. 깊고 전문적인 데이터 센터 느낌 유지. `background-color: #1A1A1A;` | Self-RAG |
| **위험/공포** | Red Zone Alert | `#C0392B` | 최대 리스크, 경고 메시지, 게이지 임계치 초과 영역. 네온 레드(Neon Red)와 글리치 효과 필수 적용. | Self-RAG |
| **신뢰/권위** | Authority Blue | `#2980B9` | 해결책 제시 섹션 (Solution), CTA 버튼의 기본 색상, 신뢰 데이터 표시. | Self-RAG |
| **데이터/시스템** | Accent Purple | `#8A2BE2` | 시스템 코드 블록, API 응답 메시지, 핵심 수치 강조색. Monospace 폰트와 조합하여 권위 부여. | Self-RAG |
| **텍스트 (Primary)** | White Text | `#F0F0F0` | 일반 본문 텍스트 색상. | [추측] |
| **경계/주의** | Yellow Zone Alert | `#F59E0B` | 경고의 시작점, 주의를 요하는 데이터 변화 영역. Red Zone으로 가기 직전 단계의 시각적 마찰 유도. | Designer 메모리 (V2.0) |

### 2. 타이포그래피 스케일 (Typography Scale)
| 요소 | 서체 (Font Family) | 용도 및 규칙 | [근거: Self-RAG] |
| :--- | :--- | :--- | :--- |
| **Primary Text** | Inter, sans-serif | 일반 설명 텍스트, 헤드라인. 모던하고 가독성이 높아야 함. | Self-RAG |
| **Data/Code** | Roboto Mono, monospace | 리스크 점수($L_{totalMax}$), 법규 조항 번호, 에러 메시지(`status: FAILURE`), 모든 수치 데이터. 시스템적 권위 부여의 핵심. | Self-RAG |

### 3. 애니메이션 토큰 (Animation Tokens)
| 요소 | 속성/효과 | 상세 스펙 및 타이밍 | [근거: Self-RAG] |
| :--- | :--- | :--- | :--- |
| **글리치 노이즈** | Chromatic Aberration + Noise Overlay | 전역 적용 (Opacity 20%). 미세한 색상 왜곡과 저주파 노이즈를 항상 유지. | Self-RAG |
| **데이터 변화** | Glitch Transition on Update | 수치가 변경될 때마다, 기존 숫자 위에 Red Zone Alert 색상의 글리치 라인(수평)이 100ms 동안 지나가며 깜빡임. (Glitch Effect 필수). | Self-RAG |
| **CTA Hover** | Pulse/Float Effect | 핵심 CTA 버튼과 $L_{totalMax}$ 수치에 마우스 오버 시, 미세한 빛의 맥동(Pulse) 효과를 주어 사용자의 주의가 강제 정착되도록 유도. (Scale: 1.02x, Duration: 0.3s). | Designer 메모리 |

---

## ⚙️ II. 인터랙티브 진단 리포트 플로우 설계 (The Mandate Path)

사용자는 다음의 4단계 흐름을 **강제적으로** 거치도록 설계되어야 합니다.

### Step 1: 충격 유발 (Impact Zone - 공포 극대화)
*   **목표:** 사용자의 '현재 준수'가 불완전함을 각인시키고, 시스템적 위험에 대한 경각심을 최고조로 끌어올립니다.
*   **UI 요소:** **[Headline]** (`H1`): "당신의 '준수'는 안전하지 않습니다. 법적인 공방에서 무효화되는 진짜 리스크를 아십니까?" (Red Zone Alert, 글리치 애니메이션 적용) [근거: Self-RAG]
*   **UX:** 페이지 진입과 동시에 배경에 낮은 빈도의 `Noise/Chromatic Aberration` 필터가 작동하며, 모든 섹션의 경고 메시지는 Red Zone으로 처리됩니다.

### Step 2: 시스템 분석 (Audit Log Simulation - 의존성 구축)
*   **목표:** 단순한 위협 나열을 넘어, yobizwiz만이 접근할 수 있는 '내부 데이터'를 보는 듯한 권위를 부여합니다.
*   **UI 요소:** **[Violation Evidence Block]**: Writer/Leo가 제공한 5가지 시나리오별로 데이터를 마치 시스템 로그처럼(코드 블록) 제시합니다. (Roboto Mono 사용 필수). 각 시나리오마다 '미비점'이 빨간색으로 강조되고, `[SYSTEM ALERT]` 태그를 붙입니다. [근거: Self-RAG]
*   **인터랙션:** 사용자 스크롤 시, 배경에 데이터 패킷 전송을 연상시키는 미세한 파란색/빨간색 그리드 패턴 애니메이션(Subtle Grid Movement)이 작동하여 몰입도를 높입니다.

### Step 3: 리스크 측정 및 공포 수치화 (The Crisis Point - $L_{totalMax}$ Counter)
*   **목표:** 추상적 위험을 구체적인 재정적 손실액($L_{totalMax}$)으로 전환시켜, 감정적 패닉(Panic) 상태를 유발합니다. **이 섹션은 가장 중요한 인터랙티브 컴포넌트입니다.**
*   **컴포넌트:** **$L_{totalMax}$ 실시간 리스크 카운터 (Live Risk Counter)**
    *   **구조:** 중앙에 배치된 대형 모노스페이스 숫자 디스플레이. 배경은 `#1A1A1A` 위에 붉은 경고 오버레이가 걸립니다.
    *   **데이터 연동:** API로부터 리스크 데이터(Mock Data)를 수신할 때마다, 카운터 숫자는 **글리치 트랜지션 애니메이션**을 거쳐 업데이트되어야 합니다. [근거: Self-RAG]
    *   **상태 변화 스펙 (Critical):**
        1.  **Yellow Zone 진입:** $L_{totalMax}$가 임계치를 넘으면, 숫자의 색상이 `Accent Purple` $\rightarrow$ `Yellow Zone Alert` (`#F59E0B`)로 점진적으로 변하고, 주변에 경고 박스가 나타납니다.
        2.  **Red Zone 도달:** $L_{totalMax}$가 최종 임계치(예: $3M)를 넘으면, 카운터 전체에 **최대 강도의 Red Zone Alert 필터**가 적용되고, 배경 노이즈와 함께 **강력한 맥동 애니메이션 (Pulsing Glow)**이 1초 주기로 발생합니다.
*   **CTA 유도:** 리스크 수치 바로 아래에 "현재 상태로는 방어벽 구축 불가. 즉각적인 진단 및 조치가 필요합니다."라는 문구와 함께 **[Diagnosis Request]** 버튼을 배치합니다.

### Step 4: 전환 게이트 (The Mandate Path - 결제 모달)
*   **목표:** 사용자가 리스크를 인지한 순간(Step 3), 즉시 구매가 의무적인 상황으로 몰아넣는 인터페이스입니다.
*   **트리거:** [Diagnosis Request] 버튼 클릭 시, 메인 콘텐츠 위에 **강제로 오버레이되는 시스템 모달**이 작동합니다.
*   **모달 명세서 (Paywall Barrier Modal):**
    1.  **제목/톤:** "ACCESS DENIED: COMPLIANCE MANDATE REQUIRED" (명령조의 붉은 경고).
    2.  **내용 구성:** 현재 리스크 노출도를 재강조하고, 이 위험을 해결할 수 있는 유일한 방법이 '보험료 납부(Premium Payment)'임을 강조합니다. (단순 서비스 구매가 아님을 끊임없이 주입).
    3.  **비주얼 특징:** 모달 자체는 어두운 배경에 `#2980B9`의 Authority Blue 광원 효과를 사용하여, 위험한 Red Zone에서 **안전하지만 비용이 드는 해결책(Tension & Trust Contrast)**으로 시선을 유도합니다.
    4.  **CTA 버튼 (Final Action):** '🛡️ Gold Tier Mandate Payment ($X)' 버튼은 가장 크고 눈에 띄게 배치하며, 클릭 전까지 주기적으로 **'Payment Required Due to High Risk Score'**와 같은 시스템 알림을 깜빡여 강제성을 부여합니다.

---
## ✨ III. 개발 구현 상세 명세 (For Developer)

### 1. CSS/애니메이션 스펙: 글리치 트랜지션 (Glitch Transition)
*   **적용 대상:** $L_{totalMax}$ 카운터, 주요 경고 헤드라인.
*   **구현 방식:** JavaScript 기반의 Intersection Observer와 `requestAnimationFrame`을 사용하여 수동으로 구현해야 합니다. 단순 CSS 애니메이션으로는 불가능합니다.
*   **핵심 로직 (CSS/JS):**
    1.  **State 1 (Base):** 일반적인 모노스페이스 숫자 표시 (`color: #F0F0F0;`).
    2.  **Trigger:** 데이터 업데이트 발생 또는 리스크 임계치 초과 감지.
    3.  **Transition (Glitch Effect):**
        *   `opacity`: 1 $\rightarrow$ 0.5 (매우 짧게)
        *   `transform`: `translateY(-2px)` $\rightarrow$ `translateY(2px)`
        *   **Chromatic Aberration Simulation:** Pseudo-elements (`::before`, `::after`)를 사용하여 Red Channel과 Blue Channel을 약간 어긋나게(`left: -1px;`, `left: 1px;`) 오버레이합니다.
        *   **Timing:** 총 애니메이션 주기는 **150ms** 이내로 완료되어야 합니다.

### 2. 그리드 및 레이아웃 가이드라인 (Grid & Layout)
*   **그리드 시스템:** 16-Column Grid System 기반으로 모든 컴포넌트의 너비와 간격(Spacing: `s-*`)을 정의합니다. [근거: Designer 메모리]
*   **여백 원칙:** 시각적 위압감을 주기 위해, 중요한 리스크 수치 주변에는 일반적인 웹사이트보다 1.5배 큰 여백(Padding/Margin)을 의도적으로 사용하여 '데이터가 숨 쉬는 듯한' 느낌을 주어 전문성을 확보합니다.

---
**[요약 체크리스트]**
*   ✅ 토큰 정의 (색상, 타이포, 애니메이션): 완료
*   ✅ 플로우 설계 (4단계 Mandate Path): 완료
*   ✅ 핵심 컴포넌트 명세 ($L_{totalMax}$ Counter): 완료
*   ✅ 전환 게이트/모달 명세: 완료
*   ✅ 개발자 레벨의 구현 지침 (CSS/JS 애니메이션): 완료