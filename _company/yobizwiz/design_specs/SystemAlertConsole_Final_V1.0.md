# 🚨 yobizwiz: System Alert Console - Final Design Specification v1.0 (Figma Blueprint)

## I. 🎯 디자인 목표 및 핵심 원칙
**목표:** 잠재 고객(CFO, CTO 등 의사결정권자)에게 '현재 비즈니스 프로세스는 구조적으로 매우 위험하며, 즉각적인 외부 전문 진단이 필요하다'는 위압적이고 전문적인 불안감을 주입하여, **진단 요청(Diagnosis Request)** 버튼 클릭을 유도한다.
**톤앤매너:** System Alert / Audit Log (최고 권위의 시스템 에러 콘솔) [근거: Self-RAG]
**핵심 대비 원리:** 공포 극대화 (Red Zone) $\leftrightarrow$ 통제력 제공 (Silver Tier Solution)

## II. 🎨 컬러 및 타이포그래피 정의 (Design Tokens)
| 요소 | 명칭 | HEX 코드 | 역할/설명 | 적용 방식 | [근거] |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Background** | Neutral Black | `#1A1A1A` | 전체 배경. 어둡고 깊은 데이터 센터 느낌 유지. | `background-color: #1A1A1A;` | Self-RAG |
| **Text Primary** | Inter/White | `#F0F0F0` | 일반적인 설명 텍스트, 제목 등 기본 정보 전달. | Inter (Sans-serif) | Self-RAG |
| **Data/Alert Font** | Roboto Mono | N/A | 리스크 점수, 코드 블록, 시스템 메시지 (`status: FAILURE`). **시스템적 권위 부여.** | `font-family: 'Roboto Mono', monospace;` | Self-RAG |
| **Red Zone Alert** | Dark Crimson | `#C0392B` | 모든 위험 신호(Risk), 경고 메시지, 구조적 결함. | 🚨 (필수) 글리치/노이즈 효과와 조합 필수. | Self-RAG |
| **Authority Blue** | Deep Slate Blue | `#2980B9` | 해결책 제시 섹션(Solution), CTA 버튼 배경, 신뢰 데이터 강조. | 안정감과 전문성 부여. | Self-RAG |
| **Success/Stable** | Soft Green | `#2ECC71` | (선택적) 리스크가 낮은 '최소한의 안전 상태'를 나타낼 때만 사용. | 경고색을 희석시키지 않도록 주의. | [추측] |

## III. 📐 레이아웃 및 섹션별 상세 스펙

### A. Section 1: 문제점 진단 (Red Zone - 공포 유발)
**목적:** 사용자에게 '현재 상태는 심각하게 위험하다'는 위협을 각인시키고, 데이터 주권의 부재를 깨닫게 한다.
**시각 요소:**
1. **전역 효과:** 배경 전체에 낮은 빈도의 `Noise/Chromatic Aberration` 필터 오버레이(Opacity 20%)를 적용하여 불안정한 느낌을 지속적으로 부여한다. [근거: Self-RAG]
2. **헤드라인 (H1):** `#C0392B` 컬러와 글리치 애니메이션 필수. 예: `당신의 '준수'는 안전하지 않습니다. 법적인 공방에서 무효화되는 진짜 리스크를 아십니까?` [근거: Self-RAG]
3. **위험 지표 (Key Metric):** 핵심 지표 $\text{TRE}$와 같은 수치는 반드시 `Roboto Mono` 폰트로, `#C0392B` 배경의 경고 박스 안에 배치한다. 이 숫자는 마치 시스템 에러 코드처럼 강조되어야 한다.
4. **진단 결과 시각화:** '구조적 공백(Structural Gap)'을 발견할 때마다 주변에 깜빡이는 `[SYSTEM ALERT]` 배지를 사용하고, 텍스트 옆에 `#C0392B`의 빨간색 밑줄과 점멸 효과를 적용한다.
5. **애니메이션:** 민감 데이터가 처리되는 과정(Masking)은 Pixelation $\rightarrow$ Glitch Overlay (빨강/파랑 글리치 라인) 과정을 반드시 거쳐 시각적 충격을 극대화한다. [근거: Self-RAG]

### B. Section 2: 해결책 제시 및 Paywall 진입 유도 (Silver Tier - 권위 확보)
**목적:** 혼란스러운 Red Zone을 지나, 오직 '통제된 시스템'만이 안전할 수 있다는 확신을 심어준다.
**시각 요소:**
1. **전환점 디자인:** 섹션 시작 시 배경의 노이즈와 글리치 효과가 급격히 감소하며, `#2980B9` (Authority Blue) 계열의 정돈된 톤으로 전환되어야 한다. 이는 심리적 안정을 유도한다.
2. **콘텐츠 구조:** 해결책은 단순한 장점 나열이 아닌, '우리가 제공하는 시스템 아키텍처'처럼 다이어그램화해야 한다. (Flowchart 또는 Layered Diagram 형태).
3. **핵심 강조:** 모든 기능 설명 옆에 작은 `[STATUS: SECURED]` 와 같은 녹색/파란색의 안정화 배지를 붙여 시각적 대비를 준다.

### C. 💰 Section 3: CTA 및 Paywall (최대 전환 유도 영역)
**가장 중요한 섹션입니다.** Red Zone에서 Silver Tier로 이동한 사용자가 느끼는 '긴급함'과 '안도감'이 교차하는 지점입니다.
1. **레이아웃:** 중앙 정렬, 최소 요소 배치 원칙을 따른다. 주변의 모든 시각적 소음(Noise)을 제거하고 CTA에만 초점을 맞춘다.
2. **CTA 버튼 (Diagnosis Request):**
    *   **초기 상태 (Resting State):** `Authority Blue` (`#2980B9`) 배경, 흰색 텍스트. 부드러운 직사각형 형태를 유지한다.
    *   **Hover/Focus State:** 마우스를 올리거나 포커스가 생길 때, 버튼 주변에 미세한 파란색 네온 빛(Glow Effect)이 감돌게 한다. (클릭할 수 있다는 *신뢰성*을 시각적으로 강조).
    *   **Animation:** 클릭 직전에는 짧은 `system booting` 사운드와 함께 배경의 글리치 노이즈가 일시적으로 강화되는 미세한 연출(Micro-interaction)을 추가하여, 버튼 클릭 자체가 '중대한 시스템 액션'처럼 느껴지게 한다.
3. **텍스트 앵커:** CTA 위에는 반드시 "시스템 점검은 필수입니다."와 같이 최종적인 경고성 문구를 배치하여 심리적 압박을 유지한다.

## IV. 🛠️ Figma 구현 지침 (Action Items for Designer)
1. **Component Library 구축:** 위에 정의된 모든 컬러 코드, `Roboto Mono` 컴포넌트, Red/Blue Alert 박스 등을 재사용 가능한 Component로 즉시 구축해야 합니다.
2. **애니메이션 프로토타이핑:** Figma의 Prototype 기능을 사용하여, Red Zone에서 Silver Tier로 넘어갈 때 배경 노이즈와 색감이 부드럽게 (하지만 극적으로) 전환되는 3단계 애니메이션을 반드시 구현합니다.
3. **반응형 체크:** 모바일(Mobile Viewport)에서도 핵심적인 Red/Blue 대비가 깨지지 않도록, '데이터 지표'의 가독성 확보에 가장 많은 공을 들여야 합니다.