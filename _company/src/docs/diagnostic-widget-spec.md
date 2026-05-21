# Diagnostic Engine Widget (Calculator Widget) Technical Specification
## 🎯 목표: 단순 계산 $\rightarrow$ 시스템적 생존 위협 체험 유도
본 위젯은 사용자 입력 데이터를 받아 '합법적인 리스크 점수'를 산출하고, 이 점수가 특정 임계치를 초과하거나 구조적으로 결함이 발견된 경우 **시스템의 실패 경험(Failure Experience)**을 의도적으로 제공하는 것을 핵심 목표로 합니다.

## 🧪 데이터 흐름 및 로직 분기 (Data Flow & Logic Branching)
1. **[Input]**: 사용자 입력 데이터 (e.g., `user_data: { type: string, value: number }`)를 받습니다.
2. **[Processing]**: 백엔드 시뮬레이션 API 호출 (`/api/v1/analyze-risk`). 이 과정에서 비동기 로딩 상태(`isLoading=true`)와 함께 **지연 시간(Latency)**을 의도적으로 부여합니다 (Time Pressure 유발).
3. **[Output State Determination]**:
    *   **State A: Success (Normal Flow):** 계산된 리스크 점수(Risk Score)가 허용 범위 내에 있고, 구조적 결함이 발견되지 않음. $\rightarrow$ `result_status: 'OK'`
    *   **State B: Warning (Red Zone Trigger):** 리스크 점수가 임계치를 초과하거나, 분석 로직 자체에서 내부 오류/결함을 감지한 경우. $\rightarrow$ `result_status: 'CRITICAL'`

## 🎨 UI/UX 시나리오별 요구사항
| 상태 | 결과 코드 | 필수 비주얼 요소 | 사용자 경험(Emotion) | 컴포넌트 사용 |
| :--- | :--- | :--- | :--- | :--- |
| **Loading** | N/A | Red Zone 경고 오버레이, 애니메이션 로딩 스피너 (시스템 분석 중), 전문적인 로그 스트리밍 효과. | 긴장감, 기대감, 시스템의 권위. | Loading Spinner + Red Overlay |
| **Success** | `OK` | 계산 결과 카드 표시. 리스크 점수와 개선 방향 제시. 배경은 안정적이지만 경계는 유지 (완벽하지 않음). | 안도감(일시적), 하지만 지속적인 불안감 고취. | Result Card Component |
| **Failure** | `CRITICAL` | **SystemFailureDisplay 컴포넌트 강제 호출.** 전문 에러 코드 (`503`, `400`)와 위기감을 고조시키는 Red Zone 경고 메시지 출력. | 공포, 무력감, 해결책에 대한 절박한 갈망 (Need for Help). | SystemFailureDisplay + Red Overlay |

## 🛠️ 기술 스펙 요약
*   **Frontend:** React/TypeScript 기반 상태 관리 및 조건부 렌더링 (`isLoading`, `isCritical`).
*   **Backend Simulation:** 로직은 프론트엔드에서 시뮬레이션하나, 실패 경로는 반드시 구조적 오류 코드를 반환하는 것처럼 동작해야 함.