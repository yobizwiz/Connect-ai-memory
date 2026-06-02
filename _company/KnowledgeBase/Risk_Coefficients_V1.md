# 📊 글로벌 규제 위험 계수 테이블 (Global Regulatory Risk Coefficient Table) V1.0

**목적:** 시스템의 위협 노출도(TRE, Threat Risk Exposure) 및 최대 재정 손실액($L_{max}$) 계산을 위한 정량적 변수 정의. 모든 수치는 벌금, 합의 비용, 기회비용 등 종합된 예상 범위이며, 실제 법률 자문이 필요함.

**[Disclaimer]**: 본 데이터는 과거 선례를 기반으로 한 **정량화 모델링 결과물**이며, 미래 규제 위반에 대한 최종적인 재무적 예측은 아님. 모든 수치에는 [근거: ...] 주석을 명시함.

---

## I. 핵심 리스크 계수 (Core Risk Coefficients)

| 위험 유형 (Risk Category) | 상세 위협 항목 (Threat Item) | 규제 법규/원인 | 재무 영향 범위 ($L_{max}$ 기여도) | 가중치 부여 방식 (Weighting Factor) | 근거 출처 (Provenance) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PII 유출** | 비식별화 실패로 인한 민감 정보 노출. | HIPAA, GDPR 등 데이터 주권 규제 위반. | **최소 $50K ~ 최대 $2M+** (벌금 + 소송 비용) | `(민감정보 수 # * 10k) + (유출 건수 * 50k)` | [근거: sessions/2026-05-26| PII_Leakage_Index] |
| **시스템 오류** | 법적 근거 없는 AI 답변 생성 (Hallucination). | 전문직 책임 규정, 출처 명시 의무 위반. | **$25K ~ $10M+** (전문가 배상 책임 + 신뢰도 하락) | `(보고서 건수 * 25k) + (손해액 규모의 비율)` | [근거: sessions/2026-05-26| Source_Attribution_Deficit] |
| **프로세스 누락** | 필수 절차(승인, 검토 등) 미비 및 문서화 부실. | 내부 감사 규정 위반, 비즈니스 연속성 훼손. | **$100K ~ $5M** (재시작 비용 + 계약 위약금) | `(Critical Checkpoint Failure Count * 계수)` | [근거: sessions/2026-05-26| Compliance_Drift_Score] |
| **범위 초과 자문** | 시스템이 처리 범위를 벗어난 법률 판단 제공. | 전문성 영역 경계 위반, 윤리 규정(Ethical Violation). | **$75K ~ $3M** (법적/광고 책임 및 공신력 훼손) | `(경고 회피 시도 빈도 * 계수)` | [근거: sessions/2026-05-26| Scope_Violation_Flag] |
| **지식 사일로** | 파편화된 데이터 사용으로 모순적 의사결정 도출. | 내부 지식 통합 실패, 의사결정의 비효율성 초래. | **$50K ~ $1M** (기회비용 손실 및 재작업 비용) | `(Conflicting Data Source Count * 계수)` | [근거: sessions/2026-05-26| Knowledge_Silo_Depth] |

---

## II. 규제 변동성 계수 (Regulatory Volatility Coefficients)

| 법규/지역 | 주요 위반 영역 (Focus Area) | 예상 패널티 유형 | 계수화 항목 (Coefficient Component) | 추정되는 최소 재무 부담액 ($L_{min}$) | [근거] |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **EU AI Act** | 고위험 시스템의 투명성 및 데이터 관리 실패. | 규제 준수 비용(Compliance Cost) + 시장 접근 금지. | `AI 모델 위험 등급 * (시스템 복구 비용)` | $10M ~ €35M+ | [근거: Researcher 개인 메모리] |
| **DORA** | 금융 시스템의 IT 운영 중단 및 리스크 보고 실패. | 사업 연속성 상실에 따른 벌금(Systemic Failure Fine). | `운영 중단 일수 * (일별 평균 매출 손실액)` | $50M ~ 억대 규모 | [근거: Researcher 개인 메모리] |
| **GDPR/CCPA** | 국경 간 PII 전송 및 동의(Consent) 관리 실패. | 데이터 주권 침해, 사용 목적 외 활용 금지 위반. | `위반된 사용자 수 * (국가별 벌금 계수)` | $15M ~ 200M+ | [근거: sessions/2026-05-26| PII_Leakage_Index] |

---
**[최종 검토 및 다음 단계 권고]**

본 테이블은 API의 Input Schema로 바로 사용 가능합니다. 특히, 각 위험 유형별 계수화 방식(Weighting Factor)을 명확히 정의하여, 개발팀이 단순히 '위반 여부'가 아닌 **'얼마나 큰 손해를 입었는지'**에 기반한 리스크 점수를 계산하도록 유도해야 합니다.