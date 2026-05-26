# 🎨 yobizwiz 디자인 시스템 가이드라인 (최종 확정 v2.1)

## I. 컬러 팔레트 (Color Palette) - '위협'과 '권위'의 대비
| 역할 | 색상명 | HEX Code | RGB | 사용 목적 및 효과 | 근거 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **🚨 Red Zone** (경고/위협) | Dark Crimson | `#C0392B` | 192, 57, 43 | 고객이 현재 처한 위험, 결함, 공포를 시각적으로 강하게 압박. 글리치 및 노이즈의 주 색상. | Self-RAG (명시) |
| **🔵 Authority Blue** (권위/전문성) | Deep Slate Blue | `#2980B9` | 41, 128, 185 | yobizwiz가 제공하는 해결책, 시스템적 안정감. 신뢰감을 주는 메인 배경 및 버튼 색상. | Self-RAG (명시) |
| **⚫ Neutral Black** (깊이/진지함) | Charcoal Base | `#1A1A1A` | 26, 26, 26 | 모든 섹션의 기본 배경색. 전문적이고 깊은 컨설팅 분위기 조성. | Self-RAG (명시) |
| **⚪ Accent White** | Pure White | `#FFFFFF` | 255, 255, 255 | 가장 중요한 정보(KPI 수치)를 강조하는 용도. | N/A |

## II. 타이포그래피 시스템 (Typography System)
1.  **Primary Font:** `Inter`, Sans-serif (Fallback: system-ui).
    *   **용도:** 모든 본문 텍스트, H2, H3 등 가독성이 중요한 영역에 사용합니다. 전문적이고 현대적인 느낌을 유지합니다. [근거: Self-RAG]
2.  **Data/Alert Font:** `Roboto Mono`, Monospace.
    *   **용도:** 데이터 출력, 에러 메시지(`CRITICAL ERROR`), 법률 조항 등 '시스템 코드'나 기계적 권위가 필요할 때만 사용합니다. 긴급함과 객관성을 부여합니다. [근거: Designer 메모리]

## III. 시각 효과 및 애니메이션 (Visual FX & Animation)
1.  **글리치/노이즈 오버레이:** 모든 'Red Zone' 콘텐츠에 필수적으로 적용됩니다. 단순한 색상 변화가 아닌, **디지털 시스템 오류 메시지 같은 왜곡(Chromatic Aberration)**과 짧은 노이즈 필터(`filter: noise(...)`)를 동반합니다. [근거: Self-RAG]
2.  **플래시 트랜지션:** 위협 레벨이 높아지는 순간, 페이지 전체에 `#C0392B`의 강하고 빠른 플래시 효과(Opacity 0 $\rightarrow$ 1 $\rightarrow$ 0)를 주어 충격을 극대화합니다. [근거: Self-RAG]