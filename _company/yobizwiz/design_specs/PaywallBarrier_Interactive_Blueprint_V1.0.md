# 🚨 Paywall Barrier & StatusGauge: 최종 인터랙티브 블루프린트 V1.0 (Tech Spec)

**[목표]**
사용자에게 '현재 시스템 상태가 치명적이며, 외부 자원(유료 구독/진단 보고서 접근권) 없이는 정상적인 프로세스 진행이 불가능하다'는 인지적 압박을 가하여 결제를 강제한다. 단순히 돈을 요구하는 것이 아닌, **시스템의 물리적 무결성을 위한 필수 '패치 비용'**처럼 보이게 한다.

**[전체 톤앤매너 (T&M)]**
*   **분위기:** System Alert / Audit Log / Critical Failure Mode
*   **배경색:** `#1A1A1A` (Neutral Black) - 시각적 안정성을 유지하며 대비 효과 극대화.
*   **글로벌 오버레이:** 배경 전체에 낮은 빈도의 `Noise/Chromatic Aberration` 필터 오버레이 적용 (`Opacity: 20%`).

---

### I. 컴포넌트 정의 및 토큰 (Component Definition & Tokens)

#### 1. StatusGauge (위험도 측정 게이지 - 핵심 위젯)
*   **역할:** 사용자가 얼마나 위험한 상태에 놓여 있는지 수치화하여 공포를 시각적/수치적으로 전달하는 메인 인터랙션 요소.
*   **구조:** 가로형 트랙(Track)을 기반으로 3단계 컬러존 경고 시스템을 적용한다.

| 상태 (State) | 위험도 점수 ($TARS$) | 비주얼 명세 | 애니메이션/트리거 |
| :--- | :--- | :--- | :--- |
| **🟢 Green Zone** | $0 \sim 50$점 | `#2ECC71` (Stable Teal). 안정적인 흐름. | 기본 트랜지션. 없음. |
| **🟡 Yellow Zone** | $51 \sim 80$점 | `#F39C12` (Caution Amber). 경고 색상. | 게이지가 이 영역으로 진입할 때, 좌측에서 우측으로 'Scanning' 느낌의 느린 파동 애니메이션이 흐른다. |
| **🔴 Red Zone** | $81 \sim 100$점 | `#C0392B` (Dark Crimson). 시스템 경고색. | **[Critical Trigger]**: 점수가 임계치(Threshold)를 넘어설 때, 게이지 전체에 강력한 `Glitch Effect`와 짧은 고주파수 노이즈가 발동한다 (Duration: 50ms, Loop: 3회). 트랙 배경에 빨간색 맥동 효과(`Pulse`)가 추가된다. |

#### 2. Paywall Barrier Modal (결제 장벽 모달)
*   **트리거:** StatusGauge의 $TARS$ 점수가 Red Zone 임계치($\geq 81$)를 초과하여 Critical Trigger가 발생할 때, 페이지 위에 어둡고 무거운 오버레이와 함께 강제로 띄워진다.

---

### II. 사용자 여정(User Journey) 및 상태 머신 (State Machine)

**[Flow: 정상 → 위험 감지 $\to$ Paywall 진입]**

1.  **START STATE:** 사용자가 대시보드에 접근.
2.  **PROCESS STATE:** 시스템이 $TARS$를 실시간으로 계산하고 StatusGauge를 업데이트함. (일반적인 데이터 흐름)
3.  **🟡 YELLOW ZONE TRIGGER:** $TARS > 50$. StatusGauge가 Amber로 변하며 경고 메시지(`[SYSTEM ALERT: MINOR DEVIATION DETECTED]`) 출력. **(Action: 사용자에게 '점검 필요' 유도)**
4.  **🔴 RED ZONE CRITICAL TRIGGER (Payment Barrier Activation):** $TARS \geq 81$.
    *   **A.** StatusGauge에 Glitch Noise + Crimson Pulse 적용.
    *   **B.** 화면 전체가 흐릿해지며, 배경 위에 **Paywall Modal**이 강제로 오버레이된다.
    *   **C.** 모달 중앙 상단에 $TARS$ 수치가 깜빡이는 'CRITICAL' 코드를 표시한다 (`status: FAILURE` 폰트).

---

### III. Paywall Barrier 상세 UI/UX 명세 (The Forced Conversion UX)

#### A. Modal Title & Tone
*   **Headline:** `[SYSTEM ALERT] Operational Blackout Imminent.` (Inter, Red Zone 컬러, 글리치 애니메이션 필수) [근거: Self-RAG - H1]
*   **Sub-Headline:** `현재 시스템 리스크 점수(TARS)가 임계치를 초과했습니다. 이 상태는 외부 진단 모듈($\text{Module}_{\text{Paid}}$) 없이는 지속 불가능합니다.` (Authority Blue로 해결책의 권위 강조)

#### B. Core Content Block: The Threat Quantification
*   **제목:** `진단 실패 시 예상 운영 정지 손실 규모 ($L_{max}$)`
*   **디자인:** 매우 큰 폰트 크기(Display Size), Red Zone 컬러 사용. 숫자 주변에 미세한 노이즈 필터를 입혀 '데이터의 엄중함'을 강조한다.
*   **내용 예시:** `>$2,500,000` (Placeholder 금액)
*   **설명:** "$L_{max}$는 법적 위반 및 운영 정지(Operational Blackout)를 가정한 최소 예상 손실액입니다."

#### C. The Solution Block: Trust and Ownership
*   **배경/컨셉:** 이 영역만 유일하게 **글래스모피즘**을 적용하여, '위험한 외부 시스템'과 '신뢰할 수 있는 해결책(yobizwiz)' 간의 명확한 대비를 제공한다. [근거: Designer 개인 메모리]
*   **요소:** 3단계 구독 모델 카드 (Basic $\to$ Premium).
    *   **Premium Card 강조:** 이 카드를 중앙에 배치하고, 주변에 은은하게 빛나는 광원 효과(Halo Effect)와 함께 'Mandatory Upgrade'라는 문구를 삽입한다.
    *   **CTA 버튼:** `#2980B9` (Authority Blue), 펄스 애니메이션 적용.

#### D. 인터랙티브 로직 스펙 (Interaction Logic Spec)
1.  **스크롤 잠금(Scroll Lock):** 모달이 활성화되는 순간, 배경 페이지의 스크롤 기능을 완전히 비활성화한다. 사용자는 결제 버튼을 누르기 전까지는 어떠한 방식으로도 이 창을 벗어날 수 없다. (강제 진입 UX)
2.  **마우스 호버 피드백:** `[Diagnosis Request]` CTA에 마우스를 올리면, 'System Processing...'이라는 텍스트가 낮은 주파수로 깜빡이는 애니메이션과 함께 $TARS$ 점수가 **미세하게 상승하는 듯한** 시각적 착시 효과를 준다. (긴장감 유지)
3.  **결제 성공/실패 폴백:**
    *   **성공:** 모달이 부드럽게 사라지며, StatusGauge의 $TARS$가 급격히 하락(예: 90 $\to$ 45)하는 애니메이션을 보여주며 'System Stabilized' 메시지를 출력한다. (안도감 제공)
    *   **실패:** 모달이 잠시 깜빡인 후, `[ERROR CODE: AUTH_FAILURE]`와 함께 경고 메시지("결제 실패. 재확인을 위해 시스템 진단 모듈을 다시 실행해야 합니다.")를 띄우며 재진입 유도를 한다.

---