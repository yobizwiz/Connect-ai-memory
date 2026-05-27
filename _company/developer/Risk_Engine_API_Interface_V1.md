# ⚙️ [코다리] 리스크 엔진 API 인터페이스 요구사항 명세서 (V1.0)
## 🎯 목적: 비즈니스 KPI 산출에 필요한 데이터 구조와 계산 로직을 확정한다.

현빈 에이전트가 정의한 재무적 임팩트를 정확히 계산할 수 있도록, 기존의 스키마 설계(Schema)를 다음과 같이 보강하고 인터페이스 명세를 확정합니다. 이 API는 최종적으로 KPI 3가지(TRE, PIG, ARS)를 산출하는 데 사용됩니다.

### 1. 핵심 엔티티 및 구조적 요구사항
*   **`Compliance_Rule` 테이블 강화:** 단순 법규명 외에 다음 필드를 추가하여 가중치 계산의 근거를 마련해야 합니다.
    *   `rule_id`: (PK)
    *   `risk_severity`: ('Low', 'Medium', 'High', **'Critical'**) $\leftarrow$ 현빈의 가중치 입력 데이터.
    *   `impact_cost_estimate`: (Integer/Decimal) 해당 규정 위반 시 예상 최소 피해 비용 (예: 10,000,000).

### 2. 주요 계산 로직 API Endpoint 정의
| EndPoint | 설명 | Input Parameter | Output Structure | 사용 목적 | [근거] |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/calculate_tre` | Total Risk Exposure 산출 | `company_size`: (Decimal), `risk_factor_list`: ([Rule ID, Weight]) | `{ "TRE": Decimal, "detail_by_risk": [ {rule_id: Int, weighted_cost: Decimal} ] }` | 가장 중요한 판매 지표 계산. | 현빈의 KPI ① 기반. |
| `/calculate_pig` | Process Integrity Gap 산출 | `process_flow_json`: (JSON), `required_steps_count`: (Int) | `{ "PIG_score": Float, "missing_step_list": [String] }` | 워크플로우 강제 기능을 통해 개선 가능성을 측정. | 현빈의 KPI ② 기반. |
| `/calculate_ars` | Audit Readiness Score 산출 | `audit_scope`: (JSON), `data_source_count`: (Int) | `{ "ARS": Float, "improvement_area": [String] }` | Gold/Enterprise Tier 판매를 위한 확장성 지표 제공. | 현빈의 KPI ③ 기반. |

### 3. 데이터 전처리 규칙
*   **가중치(Weighting):** 모든 계산은 초기 입력된 `risk_severity`에 따라 가중치가 적용되어야 하며, 이 가중치는 **반드시 명시적으로 기록(Logging)** 되어야 합니다. (투명성 확보)

---