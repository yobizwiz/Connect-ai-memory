# Yobizwiz: Compliance Gateway Pro Landing Page Copy Assets

## 🎯 Overall Tone & Voice Guidelines
*   **Tone:** 권위적(Authoritative), 학술적(Academic), 경고성(Warning). (A high-level risk consultancy report style.)
*   **Voice:** 우리는 '돕는다'가 아니라, '위험을 알려주고 필수적인 시스템을 제공한다'는 위치에 있어야 합니다. 전문 용어 사용을 주저하지 마십시오.
*   **금기 사항:** 과장된 비속어나 지나친 친근함. 모든 문장은 "데이터 기반의 치명적 리스크"라는 전제를 깔아야 합니다.

---

## 🔴 Section 1: Hero & Above the Fold (The Initial Shock)

**[목표]**: 사용자가 '지금 안전하다'고 느끼는 안도감을 즉시 파괴하고, 본질적인 문제(구조적 무결성 부족)를 던져 공포를 극대화합니다.
**[위치 매핑]:** `src/pages/index.tsx`의 가장 상단 섹션.

### 1. Headline (H1 - The Crisis Statement)
> **"당신의 프로세스는 작동하는 것이 아니라, '운영되는 것'에 불과합니다."**
> *(Your process is not functioning; it is merely operating.)*
> *[강조 포인트]:* 기능(Functioning) vs. 운영(Operating). 이 미묘한 차이로 시스템의 근본적 결함을 지적하며 권위를 부여합니다.

### 2. Sub-Headline (H2 - The Warning)
> **"겉보기엔 완벽해도, 법적 공방에서 가장 취약한 '구조적 무결성'을 갖추지 못했습니다."**
> *[설명]:* 단순히 규정 미준수(Non-compliance)가 아닌, **존재 자체의 리스크(Existential Risk)**임을 강조합니다.

### 3. Body Copy (Introductory Text)
> "대부분의 기업은 '실무적 프로세스'를 중심으로 시스템을 설계합니다. 접수 $\rightarrow$ 처리 $\rightarrow$ 완료. 하지만 법적 관점에서 볼 때, 이 흐름 사이에는 반드시 존재해야 하는 **‘규제 강제 검증 지점(Mandatory Regulatory Checkpoint)’**이 누락되어 있습니다. 저희는 그 간극에서 발생하는 '인간의 기억' 의존성을 분석했습니다. 그리고 그것이 곧 가장 치명적인 재무적 리스크임을 경고합니다."
> *[사용 유도]:* 이 문장으로 자연스럽게 Loss Meter 섹션으로 시선을 이동시킵니다.

---

## 🟡 Section 2: The Loss Meter Interaction (Quantifying the Fear)

**[목표]**: 사용자에게 추상적인 '위험'이 아닌, 구체적이고 **숫자로 계산된 손실액($X)**을 느끼게 하여 무력감과 공포를 극대화합니다.
**[위치 매핑]:** `LossMeterComponent` 주변의 텍스트 필드.

### 1. Section Title (H3 - The Challenge)
> **"지금, 당신이 간과하고 있는 리스크는 얼마입니까? [Live Loss Meter]"**
> *[지침]:* 이 문구와 함께 사용자가 데이터(예: 처리 건수, 평균 법규 변화 빈도 등)를 입력하게 합니다.

### 2. Instructional Copy (The Prompt)
> "현재 운영 중인 비즈니스 플로우의 가상 데이터를 입력해 주십시오. 저희 시스템은 최신 국제 규제 DB와 비교하여, 현재 프로세스에 내재된 **'구조적 결함 지수(Structural Deficiency Index)'**를 실시간으로 산출합니다. 이 숫자는 단순한 '벌금 예측'이 아닌, **시스템 실패로 인한 공회전 비용(Idle Cost)**을 의미합니다."
> *[톤앤매너]:* 질문하는 것이 아니라, 시스템이 결과를 보여주는 듯한 톤을 유지해야 합니다.

---

## 🔴 Section 3: Failure Flow Deep Dive (The Academic Problem Statement)

**[목표]**: 디자이너가 만든 Failure/Success Flow 다이어그램의 양쪽에서 카피를 제공하여, 시각적 공포감을 언어적으로 뒷받침합니다.
**[위치 매핑]:** `ProcessIntegrityDiagram` 컴포넌트 주변.

### 1. Failure Flow Title (H3 - The Diagnosis)
> **"🚨 실패 흐름 분석: 통제되지 않는 프로세스의 구조적 취약점."**
> *(The Failure Flow Analysis: Structural Vulnerabilities in Uncontrolled Processes.)*

### 2. Failure Description Copy (Before/Red Zone):
> "표준적인 비즈니스 플로우는 '사람의 판단'과 '수동 검토'라는 가장 변수가 큰 요소에 의존합니다. [근거: Pain Point #2]. 이 과정은 **규제 변화 속도(Regulatory Velocity)**를 따라잡지 못하며, 법적 리스크가 발생했을 때 이를 증명하는 것이 아니라, 아예 그 위험 자체를 시스템적으로 차단해야 합니다. 현재 구조는 '사후 대응'에 머무르며, 이는 곧 **시스템의 무효화 가능성**을 내포합니다."

### 3. Transition Copy (The Pivot)
> "따라서 단순한 매뉴얼 업데이트나 추가 검토 담당자 배치만으로는 근본적인 해결이 불가능합니다. 필요한 것은 프로세스 자체를 재설계하는, **'강제적 무결성 확보 아키텍처'**입니다."

---

## 🔵 Section 4: CTA & Solution (The Inescapable Necessity)

**[목표]**: 공포에서 해소로 이어지는 마지막 단계. '지금 행동하지 않으면 생존할 수 없다'는 메시지를 강력하게 전달합니다.
**[위치 매핑]:** 페이지의 하단, 가장 눈에 띄는 영역.

### 1. Final Headline (H2 - The Solution Authority)
> **"컴플라이언스 게이트웨이 프로: 법규 준수를 '검토'하는 것이 아니라, 시스템으로 '강제'합니다."**
> *[키워드]:* '검토(Review)' $\rightarrow$ '강제(Enforce)'로의 의미 전환을 통해 서비스의 본질적 우위를 강조합니다.

### 2. Solution Detail Copy (The Proof Points)
> "저희가 제공하는 Compliance Gatekeeper Pro는 세 가지 핵심 축으로 귀사의 비즈니스 생존력을 구조적으로 강화합니다."
> *   **① 실시간 비교 엔진:** 데이터 입력과 동시에 전 세계 최신 법규 DB와 대조하여, 미확인 리스크를 0.1초 만에 경고합니다.
> *   **② 자동 감사 추적(Audit Trail):** 모든 의사결정 과정을 사후 점검용 기록을 넘어, **법적 공방에서 유효한 '증명 가능한 무결성'**으로 남깁니다.
> *   **③ 예측 시뮬레이션:** 규제 변경이 발생하기 수개월 전, 가상의 시스템 환경에서 어떤 부분이 위험해질지 미리 체험하고 대비할 기회를 제공합니다.

### 3. Call To Action Copy (The Final Command) - **[최우선 배치]**
> **"💡 [무료 리스크 진단 요청]**: 귀사의 현재 프로세스가 법적으로 얼마나 취약한지, 객관적인 데이터로 확인하십시오."
> *[버튼 문구]:* "내 비즈니스의 구조적 결함진단 받기 (Free Risk Diagnosis)"
> *[후킹 설명]:* 이 버튼은 '정보 요청'이 아닙니다. **'생존 리스크 진단 의무 프로세스 시작'**이라는 뉘앙스를 풍겨야 합니다.

---