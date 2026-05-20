# 🚨 Loss Meter 인터랙티브 컴포넌트 시스템 명세서 (v1.0)
**프로젝트:** yobizwiz - 구조적 리스크 진단 시스템
**역할:** Lead Designer / UI/UX & 애니메이션 아키텍처 확정
**목표:** 고객에게 '재무적 위협의 구체화'를 경험하게 하여, 서비스의 권위성과 긴급성을 극대화하고 컨설팅 요청(Audit Request)을 유도한다.

---

## Ⅰ. 컴포넌트 개요 및 목적 (The Hook)
Loss Meter는 사용자가 입력한 데이터(PII Leakage, Compliance Drift 등)를 기반으로 잠재적 재무 손실액($QLoss)을 실시간 계산하고 시각화하는 핵심 인터랙티브 요소입니다. 이 컴포넌트는 단순히 '점수'를 보여주는 것이 아니라, **위험이 누적되어 임계치(Threshold)에 도달하는 과정 자체**를 공포감 높은 경험으로 디자인해야 합니다.

*   **핵심 지표:** $QLoss (Quantitative Loss)
*   **상태 변화:** Normal $\rightarrow$ Warning $\rightarrow$ Critical Red Zone (3단계 필수)
*   **사용 근거:** Self-RAG - [2026-05-19] 데이터 시각화 통합, Designer 메모리 - '위험하다'는 느낌을 주는 경고 UI

## Ⅱ. 디자인 시스템 및 가이드라인 확정 (The Authority)

### 1. 컬러 팔레트 (Color Palette)
| 역할 | 색상명/코드 | HEX Code | 사용 목적 및 효과 | 비고 |
| :--- | :--- | :--- | :--- | :--- |
| **🚨 Red Zone** | Critical Warning | `#C0392B` | 고객이 현재 처한 위험, 결함, 공포를 시각적으로 강하게 압박. 플래시, 노이즈의 주 색상. | 경고 임계치 도달 시 전역 적용 |
| **🔵 Authority Blue** | System Solution | `#2980B9` | yobizwiz가 제공하는 해결책, 시스템적 안정감, 데이터 근거. 배경 및 메인 텍스트 색상. | 신뢰도와 권위 부여 (CTA/Success) |
| **⚫ Neutral Black** | Base Tone | `#1A1A1A` | 기본 배경색, 깊이 있는 컨설팅 분위기 조성. 시각적 피로도를 낮추면서 전문성 유지. | 전체 페이지 배경 |
| **⚠️ Accent Yellow** | Caution/Warning | `#F39C12` | 경고 단계 진입 (Yellow Warning)에만 사용하며 Red Zone과 대비를 이룸. | 임계치 직전 구간 |

### 2. 타이포그래피 시스템 (Typography System)
*   **Primary Font:** Inter, Sans-serif (Fallback: system-ui). **사용처:** H1, H2, 일반 설명 문구 등 가독성이 높은 곳. [근거: Self-RAG - Primary Font]
*   **Data/Alert Font:** Roboto Mono, Monospace. **사용처:** $QLoss 수치 표시, 에러 메시지(`CRITICAL ERROR`), 데이터 표 및 코드 블록 전반에 사용. 시스템적 권위와 긴급함 부여가 목적. [근거: Self-RAG - Data/Alert Font]

## Ⅲ. 인터랙티브 컴포넌트 명세 (The Experience)

### 1. Loss Meter 상태 정의 (State Definition)
| 상태 | $QLoss 범위 | 시각적 효과 | 시스템 메시지 예시 | 필수 액션 |
| :--- | :--- | :--- | :--- | :--- |
| **✅ Normal** | 0 - Low Threshold | Authority Blue 기반의 안정적인 그래프. 미세한 데이터 흐름 애니메이션만 존재. | "현재 리스크 수준은 관리 가능한 범위에 있습니다." | 다음 단계로 진행 (문제 심화 유도) |
| **⚠️ Warning** | Low $\rightarrow$ Medium Threshold | 배경 노이즈(Noise Overlay, Opacity 10%) + Accent Yellow 하이라이트. 데이터 라인에 파동성 추가. | "🚨 경고: 특정 프로세스에서 법규 위반 가능성이 감지되었습니다." | 주의 환기 (Deep Dive 유도) |
| **❌ Critical Red Zone** | Medium $\rightarrow$ High Threshold | 1. 배경 전체에 `#C0392B` 플래시(Opacity 0 $\rightarrow$ 1 $\rightarrow$ 0, 200ms 간격). <br>2. 글리치 효과 (Chromatic Aberration + 깜빡임) 전역 적용. <br>3. 데이터 수치가 **Roboto Mono**로 강하게 깜빡임. | "⚠️ CRITICAL ERROR: 구조적 취약점 발견. 잠재 손실액 $X$ 발생." | 즉각적인 행동 유도 (CTA: Audit Request) |

### 2. 애니메이션 및 인터랙션 프레임워크 (The Core Spec)
이 컴포넌트의 성공은 '느낌'에 달려있으므로, 다음 기술적 요소를 의무화합니다.

*   **글리치/노이즈 오버레이:** 모든 경고(Warning 이상) 페이지에서 배경 전체에 투명도 10~20%의 노이즈 필터(`CSS Filter: noise`)를 지속적으로 적용해야 합니다. [근거: Self-RAG - Red Zone Overlap]
*   **Red Flash Trigger:** $QLoss가 임계치를 초과하는 순간(클릭/데이터 로드 시), JavaScript로 `document.body`에 전역 클래스 `.red-flash`를 추가하고, 200ms 후 제거합니다. (플래시 효과). [근거: Self-RAG - 경고 발생]
*   **Data Loading State:** 데이터가 계산되는 과정(Mock Report 실행 시)에서는 단순 로딩 바 대신, 불안정한 파동 형태의 그래프와 함께 **`LOADING...`이라는 텍스트가 노이즈를 동반하며 깜빡이는** 애니메이션을 적용해야 합니다. [근거: Self-RAG - 데이터 로드]

## Ⅳ. 최종 아웃풋 에셋 (Developer Handover)
1.  **Loss Meter 컴포넌트 가이드:** Figma/Sketch 파일 (상태별 Mockup, 위아래 사이즈 지정).
2.  **애니메이션 스프라이트 시트:** Red Zone 플래시 및 글리치 노이즈 패턴의 프레임워크.
3.  **개발자용 CSS/JS 스니펫:** `red-flash` 클래스 토글 로직, Noise 필터 적용 코드.

---
[Design Lead's Note]
이 사양서는 단순한 디자인 가이드가 아닙니다. 이는 **yobizwiz의 권위(Authority)**를 사용자에게 강제하는 시스템적 장치입니다. 모든 에셋은 '공포 $\rightarrow$ 불안정성 $\rightarrow$ 명확한 해결책 제시'라는 3단계를 완벽하게 따라야 합니다.