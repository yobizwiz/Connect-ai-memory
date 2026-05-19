# 🎨 yobizwiz 핵심 컴포넌트 라이브러리 명세서 (v1.0)

## 🎯 목표: 인터랙티브 스토리텔링 엔진 구축
이 문서는 최종 LPS(랜딩 페이지), 피치 덱, 쇼케이스 등 모든 디지털 접점에서 일관된 위협 체감 및 권위 확립 경험을 제공하기 위한 핵심 컴포넌트 세트의 개발 가이드라인입니다.

---

## I. 공통 스타일 시스템 (Global Styling Rules)

| 역할 | 색상명/코드 | HEX Code | 용도 | Props/조건부 적용 |
| :--- | :--- | :--- | :--- | :--- |
| **Red Zone Alert** | Critical Warning | `#C0392B` | 위험, 결함, 위협 체감. 모든 경고 메시지의 메인 컬러. | `isCritical: true` 시 강제 적용. 글리치 효과 필수. |
| **Authority Blue** | Solution/Trust | `#2980B9` | 해결책, 신뢰, 데이터 근거. CTA 배경 및 전문 정보 강조. | `isActiveSolution: true` 시 강제 적용. 평온하고 권위적이어야 함. |
| **Neutral Black** | Base Text / Background | `#1A1A1A` | 기본 텍스트와 깊은 배경색. 가독성을 위한 주된 어둠의 색상. | 모든 섹션에 베이스로 사용. |
| **Accent White** | High Contrast | `#FFFFFF` | 글자색, 강조 요소. Red/Blue 대비를 극대화. | 항상 사용 가능. |

## II. 핵심 인터랙티브 컴포넌트 정의 (The Components)

### 1. `GlitchAlertComponent` (🚨 위협 경고 시스템)
*   **역할:** 고객이 현재 놓치고 있거나 직면한 '존재론적 리스크'를 시각적으로 강하게 주입합니다. 단순한 빨간색 박스가 아닌, **디지털 데이터 오류**처럼 보이게 해야 합니다.
*   **위치:** LPS의 메인 헤드라인 섹션, 피치 덱의 문제 제기 슬라이드(`Slide_01`~`Slide_03`).
*   **Props 정의:**
    *   `title`: (String) 경고 메시지의 제목 (예: "당신의 준수는 안전하지 않습니다.")
    *   `severityLevel`: (Enum: LOW, MEDIUM, HIGH) 심각도 지정. `HIGH`일 때 글리치 강도 최대.
    *   `dataBreachCount`: (Number) 위반된 규정/결함의 개수. 이 숫자에 비례하여 노이즈 오버레이 빈도 증가.
    *   `onGlitchTrigger`: (Function) 컴포넌트가 로드될 때, 1초간 강한 글리치 애니메이션을 발동시키는 이벤트 핸들러.
*   **UX/Animation Spec:**
    1.  **Initial State:** `Red Zone Alert` 배경에 노이즈 오버레이(Opacity: 0.6)가 걸림.
    2.  **Transition:** 로딩 시, 타이포그래피와 이미지에 **좌우로 번쩍이는 글리치 효과 (Chromatic Aberration)**를 최소 3회 반복해야 합니다.
    3.  **Behavior:** 배경색은 `#C0392B` 계열을 유지하되, 데이터가 흐르는 듯한 잔상을 포함하여 '시스템이 무너지고 있다'는 느낌을 주어야 합니다.

### 2. `QLossDataVisualizerComponent` (📊 리스크 수치화 시스템)
*   **역할:** 추상적인 위협을 구체적이고 공포스러운 재정 손실액(QLoss)으로 전환하여 고객에게 심리적 충격을 주는 핵심 컴포넌트입니다.
*   **위치:** 피치 덱의 리스크 시각화 슬라이드 (`Slide_07`), LPS의 '문제점' 섹션.
*   **Props 정의:**
    *   `riskCategory`: (String) 리스크 유형 명칭 (예: "GDPR 위반", "공급망 취약성").
    *   `estimatedQLossValue`: (Number) 추정 손실액 (단위는 $M 또는 $B로 표시). **숫자 크기가 시각적 충격의 핵심입니다.**
    *   `breachFactor`: (Float) 현재 상태 대비 위반 확률 증가 계수. 이 값이 높을수록 경고 강도가 높아집니다.
    *   `visualChartData`: (Array<Object>) 리스크 발생 추이 데이터 (Time Series Data).
*   **UX/Animation Spec:**
    1.  **Interaction:** 컴포넌트 로드 시, 마치 **시스템이 데이터를 '읽어들이는' 듯한 로딩 애니메이션**을 적용해야 합니다. (데이터가 0에서 시작해 빠르게 QLoss 값으로 증가하는 카운터 효과).
    2.  **Visual:** 손실액 숫자는 `Authority Blue` 배경 위에서 `#C0392B` 글리치 폰트로 표시되어야 하며, 숫자 단위($)는 빨간색 경고를 받습니다.

### 3. `ConversionCTAComponent` (✅ 해결책 제시 및 CTA 시스템)
*   **역할:** 공포(Red Zone)의 정점에서 안도감과 권위(Authority Blue)로 전환시키며, 고객이 다음 행동을 취하도록 강하게 유도하는 최종 인터페이스입니다.
*   **위치:** LPS 하단 섹션 (최종 CTA), 모든 컨설팅 자료의 마지막 페이지.
*   **Props 정의:**
    *   `ctaTitle`: (String) 핵심 문구 (예: "더 이상 리스크에 방치하지 마십시오.")
    *   `actionButtonText`: (String) 버튼 텍스트 (예: "무료 리스크 진단 보고서 받기").
    *   `authorityRationale`: (String) 서비스가 제공하는 전문적 이유. (이유가 길수록 신뢰도 상승).
    *   `conversionTrigger`: (Enum: IMMEDIATE, DELAYED_EMAIL) 전환 유도 방식.
*   **UX/Animation Spec:**
    1.  **Transition Logic:** 이 컴포넌트는 **반드시 `GlitchAlertComponent`의 공포가 최고조에 달했을 때(최소 3초 경과 후)** 등장해야 합니다.
    2.  **Visual Shift:** 배경색이 Red Zone에서 Authority Blue로 급격하게 전환되며, 마치 **'경고 시스템 오버라이드(Override)'**되는 듯한 애니메이션을 보여줘야 합니다. 이 시각적 변화 자체가 가장 강력한 설득 장치입니다.
    3.  **CTA 버튼:** 버튼은 `Authority Blue`를 배경으로 하고, 마우스를 올리면 미세하게 빛나는 (Glow) 효과가 적용되어야 하며, 클릭 즉시 다음 단계(폼 제출 또는 다운로드)로의 매끄러운 전환을 보여줍니다.

---
*본 컴포넌트 명세서는 모든 디자인 의사결정 로그 및 Self-RAG에서 확립된 비주얼 스토리텔링 원칙을 기술적으로 구현하기 위한 청사진입니다.*