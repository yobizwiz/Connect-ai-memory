# 🎨 yobizwiz - 통합 비주얼 시스템 명세서 (v1.0)

**작성 목적:** 모든 B2B 마케팅 접점(Pitch Deck, 랜딩 페이지, 이메일, 웹사이트 등)에서 일관되게 '권위적 위협'의 톤앤매너를 유지하기 위한 시각 표준 규격 정의.
[근거: Designer 메모리 통합]

## I. 컬러 팔레트 (Color Palette & Semantics)
모든 색상은 #1A1A1A 배경(Dark Mode)을 기준으로 하며, 채도가 낮고 명도 대비가 강해야 합니다.

| 역할 | 이름 | HEX Code | 사용 목적 및 효과 | Usage Ratio (권장 비율) | 근거 |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **🚨 Red Zone** | Critical Danger | `#C0392B` | 고객이 현재 처한 위험, 결함, 공포. 가장 시각적으로 압박해야 하는 메시지(H1 경고 문구, 플래시 배경). | 5% 이하 (경고에만 사용) | Self-RAG |
| **🔵 Authority Blue** | Solution/Trust | `#2980B9` | yobizwiz가 제공하는 해결책, 시스템적 안정감, 데이터의 근거. 핵심 CTA 버튼 및 성공적인 프로세스 시각화. | 25~35% (주요 액션 영역) | Self-RAG |
| **⚫ Neutral Black** | Base/Depth | `#1A1A1A` | 배경색(Background). 전문적이고 깊이 있는 컨설팅 분위기 조성. 모든 기본 텍스트와 구조의 바탕. | 60% 이상 (전체 배경) | Self-RAG |
| **💡 Accent White** | Highlight Text | `#EBEBF5` | 주 텍스트(Body Text). #1A1A1A 배경 위에서 최대 가독성을 확보하는 기본 전경색. | N/A (기본 폰트 색상) | 일반 디자인 원칙 |
| **⚠️ Warning Yellow** | Caution | `#F39C12` | '주의' 레벨의 리스크(Critical보다 낮음). 데이터 로딩 실패, 경고 메시지 등 부가적 위험 표시. | 5~10% (보조 경고) | Self-RAG (확장 적용) |

## II. 타이포그래피 시스템 (Typography Scale)
폰트는 디지털 시스템 오류의 느낌을 주기 위해 산세리프를 유지하며, 역할별로 서체를 분리하여 '시스템적 권위'를 부여합니다.

| 요소 | 폰트 (Font Stack) | 용도 및 특징 | 크기(Size) 예시 | 근거 |
| :---: | :---: | :---: | :---: | :---: |
| **H1 (Headline)** | Inter, Sans-serif; *Bold* | 가장 충격적이고 권위적인 메시지. 슬로건 또는 핵심 경고 문구에 사용. 고대비가 필수. | 48px - 64px | Self-RAG |
| **H2/H3 (Sub-Headline)** | Inter, Sans-serif; *SemiBold* | 섹션 구분 및 문제점 설명. H1 대비 차분하지만 여전히 강한 존재감을 유지해야 함. | 28px - 36px | Self-RAG |
| **Body Text** | Inter, Sans-serif; *Regular* | 일반적인 설명 문구. 가독성 최우선 원칙을 지키며 배치. | 16px - 20px | Self-RAG |
| **Code/Alert Data** | Roboto Mono, Monospace | **모든 데이터 출력, API 에러 메시지, 규정 조항 등 '시스템 코드'처럼 보일 때 필수 적용.** 이 서체는 시스템의 권위를 부여함. | 12px - 14px (Fixed Width) | Self-RAG |

## III. 핵심 인터랙션 및 비주얼 효과 (Animation & UX Blueprint)
이 세 가지 효과는 단순한 꾸밈 요소가 아닌, **정보 전달에 필수적인 경고 프로토콜**로 취급되어야 합니다.

### 1. Red Zone Alert Protocol (Critical Failure State)
*   **트리거:** 사용자가 '위협을 인지'했거나, 시스템이 '치명적 오류'를 감지했을 때 (e.g., 데이터 불일치).
*   **시각 효과:**
    1.  **플래시:** 200ms 동안 강렬한 `#C0392B` 플래시 배경 오버레이 (`opacity: 0 -> 1 -> 0`).
    2.  **글리치 (Glitch):** 경고 문구는 일반 애니메이션 대신, X축/Y축으로 짧게 떨리는 노이즈 및 색상 왜곡(Chromatic Aberration) 효과를 동반해야 합니다 (`text-shadow`와 `transform: translate()` 조합).
    3.  **사운드:** (선택적이지만 권장) 낮은 주파수의 시스템 경고음 또는 '삐-' 하는 디지털 비프음이 짧게 삽입되어야 함.

### 2. Data Load Protocol (진단 과정)
*   **트리거:** 랜딩 페이지에서 진단 요청(Diagnosis Request)을 하거나, 복잡한 데이터를 로드할 때.
*   **시각 효과:**
    1.  **배경 노이즈:** 배경 전체에 낮은 빈도의 **노이즈 필터 (Noise Filter)**와 색상 왜곡 (`CSS Filter: noise(0.1)`)를 전역적으로 적용합니다.
    2.  **로딩 바:** 단순 막대가 아닌, 불안정한 파동 형태의 애니메이션을 사용하며, 로딩 과정 자체가 '불안정성'을 내포해야 합니다.

### 3. Structure 대비 (The Before/After Flow)
*   **원칙:** 문제점(Before)은 무질서하고 복잡한 플로우차트와 모호한 데이터 오버레이로 표현되어야 합니다. 해결책(After)은 단순화되고, 중앙에 깔끔하게 정렬된 권위적 파란색 블록(`🔵 Authority Blue`)으로 대비시켜 명쾌함을 강조해야 합니다.
*   **전환:** 'Before'에서 'After'로 넘어갈 때, 데이터 노이즈와 혼돈의 시각 효과가 강렬한 빛(Authority Blue)과 함께 **급격히 정지하고 정리되는 애니메이션**을 사용합니다.

---