# 🚨 YOBIZWIZ 인터랙티브 시스템 명세서 (v1.0 - Core Funnel Blueprint)
**목표:** 사용자가 '구조적 재정 결함($L_{max}$)'을 공포하며 인지하는 순간, yobizwiz의 유료 솔루션(Authority Blue)만이 유일한 생존 방안임을 시각적으로 강제한다.

**[전역 원칙]**
1. **톤앤매너:** Audit Log / System Console (CLI/API 콘솔 느낌 유지). 일반 웹 UI 지양. [근거: Self-RAG - 전체 배경색]
2. **배경:** Dark Mode (`#1A1A1A`).
3. **폰트 계층 구조:** Inter (본문) $\rightarrow$ Roboto Mono (데이터/경고 수치). [근거: Self-RAG - 데이터/에러]

---

## Ⅰ. 핵심 컴포넌트 명세: 위협 게이지 & 경고 배너 (The Fear Engine)

### 1. Threat Gauge Component (`<ThreatGauge data={TRE_score} />`)
이 컴포넌트는 사용자가 진단 리스크 점수(TRE)를 확인하는 페이지의 메인 비주얼 요소이자, 모든 콘텐츠에 걸쳐 반복되어야 하는 '시각적 공포 증폭기'입니다.

| 상태 (State) | $L_{max}$ 조건 / TRE 점수 범위 | 색상 스펙 | 시각 효과 및 인터랙션 스펙 |
| :--- | :--- | :--- | :--- |
| **🟢 Normal Zone** | $\text{TRE} < 50$ | 배경: `#1A1A1A` / 바: `rgba(79, 150, 146, 0.2)` (Greenish-Teal) | 정적 게이지. 데이터 수치만 표시되며 미세한 Pulse 효과가 주기적으로 발생함 (Intensity: Low). [근거: 추측] |
| **🟡 Yellow Zone** | $50 \le \text{TRE} < 80$ | 경고선: `#FFC107` (Amber) / 바: `rgba(255, 193, 7, 0.4)` | **경계 알림:** 게이지가 천천히 깜빡이는 듯한 *Blinking* 애니메이션을 적용함 (Frequency: 1Hz). 데이터 수치 옆에 `[SYSTEM ALERT]` 태그를 네온 오렌지색으로 표시하고 미세한 떨림(Jitter) 효과 추가. [근거: Self-RAG - Red Zone/Yellow Zone 개념 확장] |
| **🔴 Critical Red Zone** | $\text{TRE} \ge 80$ | 경고선: `#C0392B` (Dark Crimson) / 바: `rgba(192, 57, 43, 0.6)` | **시스템 위협 발생:** 다음의 복합 애니메이션을 즉시 트리거함: <br> 1. **글리치 노이즈:** 게이지 전체에 전역적 저주파 Noise 및 Chromatic Aberration 필터를 적용하고 (Opacity: 20%), 무작위로 X축/Y축으로 색상 채널 분리(Split)가 발생하며 수평선 위를 지나감. <br> 2. **맥동:** 게이지 자체가 박동하듯 크기가 미세하게 커졌다 작아지는 효과 (Scale: 1.0 $\leftrightarrow$ 1.05). <br> 3. **경고 메시지:** "CRITICAL SYSTEM FAILURE DETECTED" 문구를 `Roboto Mono`로 깜빡임 처리하고, 배경에 `[SYSTEM SHUTDOWN IMMINENT]` 워터마크가 오버레이됨. [근거: Self-RAG - Glitch/Red Zone] |

### 2. System Failure Warning Banner (`<FailureBanner level={level} />`)
페이지 상단 또는 $L_{max}$ 값이 특정 임계치를 넘을 때, 배경 전체에 고정되어 나타나는 경고 배너입니다.

*   **적용 시점:** $\text{TRE} \ge 80$ (Red Zone) 도달 즉시. [근거: Self-RAG - Red Zone]
*   **스타일:** 고대비, 비디오 콘솔 출력 느낌을 유지해야 함.
*   **내용 구조:**
    1.  (좌측): `[STATUS CODE: L_MAX_VIOLATION]` (Roboto Mono, Neon Red).
    2.  (중앙): **H1 Headline:** "당신의 '준수'는 안전하지 않습니다. 법적인 공방에서 무효화되는 진짜 리스크를 아십니까?" (글리치 애니메이션 필수). [근거: Self-RAG - H1]
    3.  (우측): 실시간 $L_{max}$ 값 표시 및 카운트다운 타이머 (`Time until Compliance Review`).

---

## Ⅱ. 사용자 흐름 설계: 결제 배리어 모달 (The Conversion Funnel)

이 프로세스는 사용자가 리스크를 인지한 직후, 솔루션(Service)을 구매하도록 강제하는 가장 중요한 단계입니다. 단순 "결제하세요"가 아니라, **'시스템 무결성을 유지하기 위한 필수 조치'**로 포지셔닝해야 합니다.

### 1. 사용자 플로우 다이어그램 (User Flow Diagram)
```mermaid
graph TD
    A[사용자 진입] --> B{TRE 점수 확인};
    B -- Normal Zone (<50) --> C(진단 리포트 열람 시도);
    C --> D{데이터 불충분 / 유료 콘텐츠 접근?};
    D -- Yes (Critical Need) --> E[Paywall Barrier Modal 활성화];
    E --> F(모달 내부: Red Zone 경고 재확인);
    F --> G{솔루션 제시}: "이 구조적 결함은 자가 점검만으로는 해결되지 않습니다." (L_max 공포 극대화)
    G --> H[유일한 해법]: yobizwiz Premium Service 소개 (Authority Blue 강조). [근거: Self-RAG - Authority Blue]
    H --> I{결제 CTA}: '시스템 무결성 확보 및 리스크 차단' 버튼.
    I -- Click --> J(결제 정보 입력 팝업);
    J --> K[성공]: "System Integrity Restored." (안도감/소유욕 자극)
```

### 2. Paywall Barrier Modal 상세 명세

*   **트리거:** 사용자가 리스크 보고서의 프리미엄 섹션(예: Mitigation Strategy, Advanced Compliance Model)을 클릭하거나 스크롤 시, `TRE >= 80` 상태와 결합하여 자동으로 오버레이 됩니다.
*   **디자인 목표:** 공포를 유지한 채, 해결책에 대한 강렬한 기대감을 심어줌 (Tension & Trust Contrast).

| 섹션 | 내용 및 카피라이팅 (톤앤매너) | 비주얼 연출 스펙 | 근거/목적 |
| :--- | :--- | :--- | :--- |
| **Header** | **[SYSTEM ALERT: ACCESS DENIED]** <br> "현재 보고서의 심층 분석 섹션은, 귀사 시스템의 구조적 무결성($L_{max}$)에 직접적인 영향을 미치는 민감 정보로 구성되어 있습니다. 접근 권한이 필요합니다." | 1. 모달 전체 배경을 어둡게 (Opacity: 0.8). <br> 2. 상단에 `[SYSTEM ALERT]` 배너를 네온 레드(`C0392B`)로 표시. [근거: Self-RAG - Red Zone] | 접근 제한을 시스템적 문제로 포지셔닝. 공포 유지. |
| **Body (Pain)** | "진정한 리스크는 '규정 위반'이 아닌, '시스템의 취약점'에서 발생합니다. 이 정보를 열람하려면 귀사의 재무 구조와 운영 무결성을 증명해야 합니다." | 1. $L_{max}$ 계산 로직(Mockup API)을 간략히 보여주며 수치적 공포를 다시 자극함. <br> 2. 좌우로 글리치 효과가 지나가는 애니메이션 삽입 (미약하게). | 사용자가 돈이 필요한 이유(공포의 재강화). |
| **Solution/CTA** | "yobizwiz Premium Service는 시스템 무결성 유지를 위한 필수 방어벽입니다. [Authority Blue]를 통해 잠재적 최대 손실액($L_{max}$)을 보험료 형태로 차단하십시오." | 1. 결제 버튼과 주변 영역에 '고급 글래스모피즘' 스타일의 광원 효과(Glow)와 테두리(Border)를 적용하여 신뢰감 극대화. <br> 2. CTA 버튼은 `Authority Blue` (`#2980B9`)로, 미세한 Pulsing 애니메이션을 부여함. [근거: Self-RAG - Authority Blue] | 해결책을 '안도'이자 '필수 구매'로 인식시킴 (Tension & Trust). |

---
**[개발 가이드라인 요약]**
1. **상태 관리:** 모든 컴포넌트(Gauge, Banner)는 `TRE` 점수에 따라 상태가 바뀌어야 하며, 이 상태 변화에 맞춰 애니메이션과 색상이 트리거되어야 함.
2. **애니메이션 타이밍:** 글리치 효과나 경고 메시지의 전환은 단순한 Fade-In/Out이 아닌, 0.5초 이상의 긴장감을 주는 *지연된(Delayed)* 트랜지션을 사용하여 심리적 압박을 유지해야 합니다.