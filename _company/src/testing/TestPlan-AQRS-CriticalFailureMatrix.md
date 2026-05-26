# 🚨 AQRS 시스템 통합 테스트 계획: Critical Failure 시나리오 매트릭스
## 목적
개발된 리스크 점수 계산 엔진(`calculateRiskScore`)이 단순한 로직 검증을 넘어, 사용자가 **'시스템적 생존 위협(Systemic Survival Threat)'**을 체감하도록 설계되었는지 5가지 핵심 변수를 기반으로 검증한다.

## 테스트 대상 (Target Variables)
1. PII_Leakage_Index (민감 정보 노출)
2. Compliance_Drift_Score (절차 누락)
3. Source_Attribution_Deficit (근거 미제시)
4. Knowledge_Silo_Depth (지식 단절)
5. Scope_Violation_Flag (범위 이탈)

## 테스트 시나리오 매트릭스 (Critical Path Test Cases)

| # | 시나리오 제목 | Trigger Input (Input Data) | 예상 Failure Point (Worst Case) | 목표 AQRS Score Range | UX/Visual Requirement (Designer Focus) |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **T-01** | PII 노출 및 근거 없는 조언 결합 | 👤 고객 이름, 주민번호, 법적 자문 요청 (근거 없음). | `PII_Leakage` + `Source_Attribution_Deficit`. 데이터 유출과 함께 잘못된 해결책 제시. | **Critical (최고 위험)**: 점수 합산의 가중치가 극대화되어야 함. | 🔴 경보창(🚨), 게이지 최대치, 배경에 글리치 효과 필수. "STOP! 법적 조치를 취해야 합니다."라는 강제 메시지 출력. |
| **T-02** | 규정 누락 및 지식 사일로 결합 | ✅ 승인 절차 1단계 누락 + 내부 매뉴얼 A와 B의 상충된 정보 참조 요청. | `Compliance_Drift` + `Knowledge_Silo`. 프로세스가 무효화되고, 모순된 결과를 받게 함. | **High (높은 위험)**: 합리적이지만 치명적인 오류를 유도. | 🟠 경고색(⚠️). 흐름도가 끊어지는 시각 효과(Disruption Visuals). "이 과정은 수동 검토가 필요합니다."라는 명시적 경고. |
| **T-03** | 범위 이탈 및 컴플라이언스 위반 | 💰 금융/세무 분야의 복잡한 문제를 요청했으나, 시스템이 '일반 컨설팅'으로 오인하여 답변함. | `Scope_Violation` + (낮은) `Compliance_Drift`. 법적 책임 영역을 침범하는 행위. | **Critical (최고 위험)**: 서비스 자체의 한계를 명확히 경고해야 함. | 🔴 강제 인터럽트(Force Interruption). "경고: 본 서비스는 전문 자문을 제공할 수 없습니다."라는 강력한 거부 메시지 출력. |

## 검증 체크리스트
- [ ] 모든 시나리오에서 AQRS 점수 계산이 정확히 수행되는가? (개발팀)
- [ ] 최고 위험 시나리오(T-01, T-03) 발생 시, 사용자 경험 흐름이 위기감을 극대화하도록 설계되었는가? (디자인팀/작가)