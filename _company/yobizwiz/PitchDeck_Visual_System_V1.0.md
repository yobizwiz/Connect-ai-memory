# 🎨 yobizwiz: Compliance Gateway - 최종 시각시스템 아키텍처 (V1.0)

**[개요 및 목표]**
본 디자인 시스템은 고객에게 **'존재론적 불안감(Existential Anxiety)'**을 체계적으로 주입하고, 그 해결책으로 오직 yobizwiz만이 유일한 '방어 아키텍처(Defense Architecture)'임을 강제하는 것을 최우선 목표로 합니다. 전반적인 톤은 **고권위(High Authority), 데이터 중심(Data-Driven), 경고적(Warning)**입니다.

---

## 🎨 I. 디자인 토큰 (Design Tokens) 재정의 및 계층 구조

모든 시각 요소는 아래 정의된 6가지 핵심 토큰을 조합하여 사용해야 합니다.

### A. 컬러 팔레트 (Color Palette)
| 토큰 이름 | HEX Code | 역할/사용처 | 비고 | 근거 |
| :--- | :--- | :--- | :--- | :--- |
| **🔴 CRITICAL_RED** | `#C0392B` | **경고, 위협, 손실 ($TRE$)**. '멈춤', '위험'을 의미하는 모든 요소에 사용. | 가장 높은 대비를 위해 배경과 겹칠 때는 투명도(Opacity) 조절 필수. 글리치 효과의 주 색상. | Self-RAG |
| **🔵 AUTHORITY_BLUE** | `#2980B9` | **해결책, 신뢰, 데이터 근거**. yobizwiz 솔루션 제시 영역 및 핵심 통계 그래프에 사용. | 차분하지만 딥(Deep)한 느낌을 유지하여 '지성적 확신' 전달. | Self-RAG |
| **⚫ NEUTRAL_BLACK** | `#1A1A1A` | 기본 배경색 (Dark Mode). 전문성과 깊이감을 제공하는 메인 컨테이너 색상. | 전체 슬라이드의 90% 이상을 차지하며, 콘텐츠의 진중함을 유지. | Self-RAG |
| **🟡 WARNING_YELLOW** | `#FFC300` | *보조 경고*. '주의', '잠재적 문제' 등 Critical 직전 단계의 위협에 사용. | Red Zone으로 급격히 상승하는 리스크를 보여주는 계단식 구조(Staged Warning)에 활용. | [추가 정의] |
| **⚪ TEXT_LIGHT** | `#E0E0E0` | 본문 및 일반 텍스트 색상. 블랙 배경 위에서 가독성을 최우선으로 함. | 대비를 유지하며 시각적 피로도를 낮춤. | Self-RAG |

### B. 타이포그래피 (Typography)
| 토큰 이름 | Font Family | 역할/사용처 | 크기/굵기 원칙 | 근거 |
| :--- | :--- | :--- | :--- | :--- |
| **H1 (Headline)** | Inter, Sans-serif | 보고서의 핵심 주장을 관통하는 제목. 공포감 극대화. | 56pt 이상, ExtraBold. | Self-RAG |
| **BODY_MAIN** | Inter, Sans-serif | 일반적인 설명 및 서론 본문. 신뢰도 있는 정보 전달. | 20pt ~ 24pt, Regular/SemiBold. | Self-RAG |
| **DATA_CODE** | Roboto Mono, Monospace | 데이터 시각화, 에러 메시지, 법률 조항 인용 등 모든 '코드적' 요소. | 16pt ~ 18pt, Medium. 고정폭 사용으로 시스템의 권위 부여. | Self-RAG |

---

## ✨ II. 핵심 레이아웃 청사진 (Slide Blueprints)

### 💡 Blueprint A: [🚨 리스크 노출도 경고 슬라이드] - The Fear Inducer
**목표:** 고객이 '지금 상태로는 안 된다'는 강렬한 심리적 압박을 받게 한다. ($TRE$ 시각화에 최적화).
**구조:** 3단 구성 (헤딩 $\rightarrow$ 위협 데이터 오버레이 $\rightarrow$ 경고 코드 박스)

1.  **배경:** `NEUTRAL_BLACK` 배경 위에, 낮은 빈도의 노이즈(Noise) 및 크로마틱 어베레이션(Chromatic Aberration) 필터 전역 적용 (`background-image: radial-gradient(...)`).
2.  **헤딩 (H1):** `CRITICAL_RED` 색상과 함께 **글리치 애니메이션(`text-shadow`)** 필수 적용. (예시: *당신의 '준수'는 안전하지 않습니다.*)
3.  **데이터 시각화:** 일반적인 그래프 대신, **파동(Wave)** 형태의 데이터 라인 차트를 사용하고, 특정 위반 지점마다 `CRITICAL_RED` 플래시 효과 및 텍스트 경고 박스(`[ERROR: CRITICAL FAILURE]`)를 강제 삽입.
4.  **애니메이션 (CSS/JS):** 슬라이드가 로드되면, 가장 먼저 배경 노이즈가 서서히 나타나며, 곧바로 `CRITICAL_RED` 플래시(200ms Opacity 0 $\rightarrow$ 1 $\rightarrow$ 0)와 함께 핵심 경고 메시지가 깜빡이며 등장해야 함.

### 💡 Blueprint B: [🛡️ yobizwiz 솔루션 제시 슬라이드] - The Authority
**목표:** 위기감을 해소하고, yobizwiz의 솔루션을 '명확한 구원'으로 포지셔닝한다.
**구조:** 대비 극대화 (Red $\rightarrow$ Blue)

1.  **배경/톤:** 배경은 `NEUTRAL_BLACK`을 유지하되, 경고의 혼란스러움을 걷어내기 위해 **여백(Whitespace)**과 명확한 그리드 시스템을 전면에 내세웁니다.
2.  **색상 전환:** 데이터 분석 영역(`CRITICAL_RED`)에서 갑자기 `AUTHORITY_BLUE` 계열의 색상이 지배적으로 사용되며, 이는 '질서'와 '해결책'의 상징이 됩니다.
3.  **레이아웃 패턴:** 복잡한 플로우차트 대신, **단순하고 강력한 3단계 아키텍처 다이어그램**을 활용합니다. (Step 1: 진단 $\rightarrow$ Step 2: 방어벽 설계 $\rightarrow$ Step 3: 자동화/통제). 각 단계에 `AUTHORITY_BLUE`를 적용하고, 화살표는 직선적이고 명확해야 합니다.
4.  **텍스트:** 솔루션 설명은 간결한 불릿 포인트와 함께 **데이터 기반의 '구체적인 효과(Benefit)'**만 강조합니다.

---

## 🚀 III. 디자인 가이드라인 및 구현 원칙 (Implementation Principles)

1.  **일관성 유지:** 모든 슬라이드의 상하단에는 `yobizwiz` 로고와 함께 **"Compliance Gateway: Total Risk Exposure Analysis"**라는 하위 헤딩을 고정 배치합니다.
2.  **데이터 우선주의:** 어떤 섹션을 디자인하든, '글'이 아니라 **차트/다이어그램/테이블 형태의 시각화된 데이터**가 70% 이상을 차지해야 합니다. (근거: Designer 메모리)
3.  **애니메이션 전략:** 모든 전환은 점진적(Gradual)이어야 하며, 특히 경고 섹션에서는 **'시스템 오류 메시지'처럼 갑작스럽게(Abrupt)** 등장하여 충격 효과를 극대화합니다.