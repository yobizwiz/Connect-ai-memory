# 📄 Paywall V6.0 UX Blueprint: The Fear Funnel (고권위도 인터랙티브 설계)

## 🎯 목표 및 컨셉
*   **목표:** 사용자의 '시스템적 불안'을 자극하고, 해결책의 필요성(Opportunity Cost)을 재무적으로 각인시켜 유료 진단 체험으로 전환시킨다.
*   **핵심 테마:** 공포 (Red Zone/글리치) $\rightarrow$ 권위 (Blue/데이터) $\rightarrow$ 위기감 (Cost/$).

## 🖥️ 인터랙션 시퀀스 상세 설계
| 단계 | 시간대(Time Stamp) | 액션 / 트리거 | UI 변경 및 애니메이션 지침 | 핵심 메시지 | 근거 |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **1. 진입** (Build-Up) | 0s ~ 2s | 데이터 입력 완료 후, '진단 실행' 클릭 시. | 전체 배경에 노이즈 필터(Opacity 15%) 적용. 모든 요소가 짧게 깜빡이는 플래시 효과 발생. 로딩 바는 불안정한 파동 형태(`Loading...`). | `SYSTEM ANALYSIS IN PROGRESS` (권위적 고정폭 서체) | [Self-RAG] |
| **2. 충격** (Shock) | 2s ~ 3s | 백엔드에서 Critical Error 응답 수신 시. | **🚨 Red Zone 플래시:** 화면 전체에 빨강색 빛이 짧게 지나감(Flash). 배경 노이즈 강도 급상승. 모든 폰트가 글리치 효과를 동반하며 일렁거림. | `⚠️ CRITICAL FAILURE DETECTED` (Red Zone 컬러, Mono Font) | [Self-RAG], [코다리 작업] |
| **3. 문제 심화** (Diagnosis) | 3s ~ 6s | 분석 결과 로드 완료. | 화면이 '분할 구조'로 전환됨. 좌측(Before)과 우측(After) 영역을 명확히 분리하고, 데이터 코드가 스크롤되며 나타나는 듯한 애니메이션 적용. | `당신은 무엇을 놓치고 있습니까?` (H1 재강조) | [Self-RAG] |
| **4. 공포 극대화** (Climax) | 6s ~ 9s | 핵심 리스크(Top 3)와 Opportunity Cost가 동시에 제시됨. | 좌측: 리스크별 경고 코드 블록(`Roboto Mono`)이 강하게 깜빡이며 나타남. 우측: **Opportunity Cost($X)** 수치가 화면 중앙을 차지하며, 주변으로 Red Zone 플래시가 간헐적으로 발생함 (위협감). | `미해결 리스크 요약 및 잠재적 손실액:` (권위적인 질문) | [회사 공동 목표], [Self-RAG] |
| **5. 행동 유도** (CTA) | 9s ~ 끝 | 사용자 시선이 CTA 버튼에 집중되도록 유도. | CTA 버튼만 Authority Blue(`#2980B9`)로 선명하게 대비되며, 마우스 오버 시 Red Zone 경고가 짧게 번쩍이며 '긴급성'을 부여함. | **✅ 리스크 요약 보고서 요청 (무료 진단 체험)** | [Self-RAG] |

## 📐 디자인 및 시스템 지침
1.  **Color Palette:**
    *   🚨 Red Zone: `#C0392B` (위협/경고)
    *   🔵 Authority Blue: `#2980B9` (해결책/신뢰)
    *   ⚫ Neutral Black: `#1A1A1A` (기본 배경/깊이)
2.  **Typography:** 경고 및 데이터는 **Roboto Mono**를 필수적으로 사용합니다. 메인 헤드라인은 Inter의 굵은 서체를 유지하여 권위를 부여합니다.
3.  **데이터 시각화:** '미해결 리스크' 섹션에는 단순한 텍스트가 아닌, 시스템 로그 파일(`[ERROR]`, `[FAILURE]`) 같은 코딩 인터페이스 느낌을 주어야 합니다.