# 🎨 yobizwiz 시스템 아키텍처 다이어그램 v1.0 사양서
## 💡 목표: 구조적 우위의 시각화 (Systemic Superiority Visualization)

### A. 컬러 팔레트 및 코드 적용 규칙
| 역할 | 색상명 | HEX Code | 사용 방식 |
| :--- | :--- | :--- | :--- |
| **Red Zone/경고** | Dark Crimson | `#C0392B` | Failure Flow의 모든 경계, 경고 팝업, 파열된 라인. |
| **Authority Blue** | Deep Slate Blue | `#2980B9` | Success Flow의 메인 흐름, 성공 노드 배경색, 통제 시스템 강조. |
| **Neutral Background** | Dark Matter | `#1A1A1A` | 전체 배경 및 기본 컨설팅 톤. |
| **Inactive/Hidden Data** | Dim Gray | `#333333` | 실패 흐름의 비활성 데이터 노드 색상. |

### B. 타이포그래피 및 서체 규칙 (Typography)
*   **Primary Font:** Inter (Sans-serif). 가독성이 높은 권위적 폰트.
*   **Data/Process Font:** Roboto Mono, Monospace. 모든 과정 이름, 코드명(D-Check, API Call 등), 데이터 값 표기에 필수 적용하여 '시스템 기록'의 느낌 부여.

### C. 애니메이션 및 인터랙션 가이드 (UX Flow)
1.  **Failure Flow 활성화:** 마우스 오버 시, 노드 주변에 `#C0392B`가 흐르듯 깜빡이는 `Glitch Effect`를 적용하여 불안정함을 유발합니다.
2.  **Success Flow 하이라이트:** 사용자가 '통제 시스템' 섹션(오른쪽)으로 마우스를 이동시키면, 모든 파란색 연결선에 따라 데이터가 마치 전기가 흐르듯 부드럽게 **파동 애니메이션 (Ripple Effect)**을 일으켜 안정성을 강조합니다.
3.  **Critical Alert Trigger:** Failure Flow의 가장 끝 지점에서 '❌ Critical Risk Detected'라는 경고 박스가 `#C0392B` 플래시와 함께 강하게 팝업되어야 합니다.

---
## [실행 스크립트]
1. **Fail State (좌측):** 불규칙한 다이어그램 배치 $\rightarrow$ Red Zone 애니메이션 적용 $\rightarrow$ `D-Check Failure`, `Data Silo Break`, `Reactive Panic` 등의 텍스트 포함.
2. **Success State (우측):** 구조적이고 연결된 다이어그램 배치 $\rightarrow$ Blue Wave Animation 적용 $\rightarrow$ `Real-Time Validation`, `Integrated Core System`, `Proactive Prediction` 등의 텍스트 포함.

---