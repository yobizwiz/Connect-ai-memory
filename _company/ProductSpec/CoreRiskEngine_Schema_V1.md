# ⚙️ [개발 명세서] Core Risk Engine: 데이터 구조 정의 (V1)
## 🎯 목표
위의 세 가지 핵심 위협 시나리오(PII, Provenance Deficit, Compliance Drift)를 통합적으로 처리할 수 있는 단일 API 게이트웨이 및 백엔드 데이터 스키마를 정의한다. 모든 변수는 재무적 최대 손실액($L_{max}$) 계산에 기여해야 한다.

## 🏗️ I. 핵심 리스크 노출도 지표 (TRE: Total Risk Exposure) 공식
$$TRE = [C_1 \times L_{\text{PII}}] + [C_2 \times L_{\text{Proven}} ] + [C_3 \times L_{\text{Drift}}]$$

*   **$L_{\text{PII}}$ (개인정보 누출 손실액):** PII 유출의 심각도와 규모에 따른 재무적 벌금 및 소송 합의액.
*   **$L_{\text{Proven}}$ (증명력 결함 손실액):** 출처 부재로 인한 준전문가 책임(Hallucination)으로 인한 신뢰도 하락 비용.
*   **$L_{\text{Drift}}$ (운영/절차 누락 손실액):** 거버넌스 프로세스 실패 및 감사 추적성 상실에 따른 사업 중단 및 위약금.
*   **$C_n$ (가중치 계수):** 각 리스크 유형의 산업별 중요도와 법적 우선순위를 반영한 가중치 ($0 \le C_n \le 1$).

## 💾 II. 데이터 스키마 정의 (JSON Schema Proposal)
### A. `PII_Data_Input` 모듈 (Source: Case 1)
| 필드명 | 데이터 타입 | 설명 | 필수 여부 | 계산 기여도 |
| :--- | :--- | :--- | :--- | :--- |
| `data_source_type` | String | 원본 데이터 출처 (예: EHR, CRM, InternalDB) | Yes | High |
| `pii_count` | Integer | 노출된 PII 레코드 총 수. | Yes | Direct ($L_{\text{PII}}$ Scale) |
| `masking_failure_type` | String | 실패 원인 (예: Masking Bypass, Transmisison Error). | Yes | Weighting Factor |
| `jurisdiction` | Enum | 데이터가 속한 법규 관할권 (GDPR, HIPAA 등). | Yes | $C_{\text{PII}}$ Determination |

### B. `Provenance_Audit_Input` 모듈 (Source: Case 2)
| 필드명 | 데이터 타입 | 설명 | 필수 여부 | 계산 기여도 |
| :--- | :--- | :--- | :--- | :--- |
| `claim_type` | String | AI가 생성한 주장/보고서의 유형 (예: 법적 근거 제시, 시장 예측). | Yes | High |
| `source_citation_list` | Array of Object | **반드시** 포함되어야 하는 참조 자료 목록 (제목, 페이지 번호, URL/파일 경로). | Yes | $C_{\text{Proven}}$ Validation |
| `model_confidence_score` | Float | LLM이 자체 보고한 확신도 점수. (낮을수록 위험 증가) | Yes | Risk Multiplier |

### C. `Governance_Audit_Input` 모듈 (Source: Case 3)
| 필드명 | 데이터 타입 | 설명 | 필수 여부 | 계산 기여도 |
| :--- | :--- | :--- | :--- | :--- |
| `checkpoint_missed` | Array of String | 누락된 핵심 검토 단계 목록 (예: Legal Review, CTO Approval). | Yes | $L_{\text{Drift}}$ Scale |
| `audit_trail_completeness` | Float | 모든 의사결정 과정의 기록 완성도 (0.0 ~ 1.0). | Yes | $C_{\text{Drift}}$ Determination |
| `data_source_conflict_count` | Integer | 내부적으로 모순되는 데이터 소스 개수. | No | Penalty Factor |

---