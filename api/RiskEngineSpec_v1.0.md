# ⚙️ Risk Engine Core API Specification (v1.0)
## 🎯 목표: 시스템적 생존 위협(Systemic Survival Threat)의 정량화 및 구조화된 해결책 제시
이 문서는 yobizwiz가 제공하는 모든 리스크 진단 서비스의 기술적 계약서입니다. 이 사양을 따르는 API 호출은 **반드시** 고객에게 '재무 손실 공포'를 유발하고, 궁극적으로 Silver Tier 구독으로 이어지는 구조적인 데이터 흐름(Data Flow)을 목표로 합니다.

---

## I. Endpoint 정의 및 요청 규격 (Request Contract)
### 1. API Endpoint
*   **URI:** `/api/v1/risk-assessment`
*   **Method:** `POST`
*   **Rate Limiting:** 필수 구현 (`X` requests per minute). [근거: sessions/2026-05-19T04-54/developer.md]

### 2. Request Body Schema (JSON Input)
클라이언트(Front-end/Partner API)는 반드시 다음 구조를 준수해야 합니다. 입력 데이터의 품질이 결과물의 신뢰도를 결정합니다.

```json
{
  "customer_id": "string",
  "industry_id": "string", 
  "process_data": {
    "description": "Analysis 대상 프로세스에 대한 간략한 설명 (e.g., '승인서 검토 및 보관 프로세스')",
    "manual_step_count": "integer", 
    "data_source_type": "string", // 예: 'Internal DB', 'Manual Review', 'External API'
    "compliance_status_list": [
      {
        "rule_id": "string", // 법적/내부 규정 ID (e.g., GDPR-A, ISO27001-B)
        "is_compliant": "boolean", 
        "deviation_reason": "string | null", // 미준수 시 사유 명시 필수
        "severity_score": "integer" // 1(경미) ~ 5(치명적)
      }
    ],
    "data_integrity_metrics": {
        "audit_trail_available": "boolean", 
        "retention_period_days": "integer | null",
        "key_control_points": "array<string>" // 핵심 통제 포인트 목록
    }
  },
  "user_context": {
      "customer_segment": "string", // 예: 'SMB', 'Enterprise'
      "assessment_date": "string (ISO 8601)"
  }
}
```

---

## II. 리스크 계산 로직 흐름 및 출력 정의 (Logic & Output Definition)
### 1. Core Logic Flow (Risk Engine 내부 처리 과정)
1. **데이터 수집/정규화:** `process_data`를 받아 표준 데이터 모델로 변환합니다. [근거: sessions/2026-05-19T04-56/developer.md]
2. **결함 감지 (Failure Detection):** `compliance_status_list`와 `data_integrity_metrics`를 순회하며, 규정 위반 또는 프로세스 결함을 식별합니다.
3. **위험 점수 산출:** 각 결함에 대해 Severity Score(5점 만점)와 Manual Step Count 등을 조합하여 종합적인 Risk Score를 계산합니다.
    $$RiskScore = \sum_{i=1}^{N} (SeverityScore_i \times WeightFactor) + (\text{ManualStepCount} / 10)$$
4. **재무 손실액 예측 (Loss Meter):** 리스크 점수와 고객 세그먼트(Enterprise/SMB)를 기반으로, *구조적 결함이 발생했을 때* 예상되는 재무 손실액($X)을 산출합니다. 이 과정은 독립된 모듈(`loss_calculator`)에서 처리되어야 합니다.
5. **해결책 제시:** 단순히 위험만 보고하는 것이 아니라, [근거: sessions/2026-05-20T02-55/] 사전에 정의된 표준 프로세스 개선안(Solution Pattern)을 매칭하여 리포트에 포함합니다.

### 2. Loss Meter 출력 포맷 (필수 요구사항)
Loss Meter는 단순한 숫자가 아니라, **위협의 구체적인 출처와 근거**를 제시해야 합니다.

*   **`loss_amount_usd`:** 예측되는 재무 손실액 ($X).
*   **`justification`:** 이 금액이 도출된 핵심 원인 요약 (예: "규정 미준수 및 감사 추적 불가로 인한 잠재적인 법률 벌금").
*   **`root_cause_references`:** 근거가 된 규정, 법령, 또는 회사 내부 매뉴얼의 **구체적인 출처/문단 번호**를 배열 형태로 제공해야 합니다. (예: `["GDPR Article 17, Paragraph 3", "Internal Policy v2.1, Section 4.b"]`)

---

## III. API 응답 구조 정의 (Response Schema)
### 1. HTTP Status Codes
*   **`200 OK`:** 리스크 진단 및 보고서 생성이 성공적으로 완료되었음.
*   **`400 Bad Request`:** 요청 본문(Request Body) 스키마가 유효하지 않거나 필수 필드가 누락됨.

### 2. Response Body Schema (JSON Output)
```json
{
  "success": "boolean",
  "message": "string",
  "analysis_metadata": {
    "assessment_id": "uuid string",
    "timestamp": "ISO 8601 date-time",
    "risk_level": "enum (CRITICAL, HIGH, MEDIUM, LOW)", // Red Zone 등급 결정
    "calculated_score": "number", // 최종 Risk Score
    "recommendation_tier": "string" // Silver Tier를 유도하는 카피라이팅용 키워드: 'STRUCTURAL_STABILITY' 
  },
  "financial_impact": {
    "loss_amount_usd": "number (float)", // $X 금액. 소수점 0이 아닌 경우 위협 체감에 유리함.
    "justification": "string", 
    "root_cause_references": ["array<string>"] // 근거 문서 목록
  },
  "detailed_findings": {
    "failure_count": "integer",
    "critical_failures": [
      {
        "rule_id": "string",
        "description": "지적된 결함의 상세 설명.",
        "severity": "integer (1-5)",
        "impact_area": "string", // 예: 'Compliance', 'Auditability', 'Process Efficiency'
        "mitigation_strategy_id": "string", // Solution Pattern 매칭 ID (Solution Layer에서 참조)
        "suggested_action": "string" 
      }
    ],
    "process_improvement_suggestions": [
      {
        "suggestion_title": "개선 제안 제목",
        "priority": "enum (MUST, SHOULD, COULD)",
        "description": "구체적인 프로세스 개선 방안. (Solution Pattern 기반)"
      }
    ]
  },
  "cta_guidance": {
      "primary_call_to_action": "string", // 예: 'Silver Tier 구독 문의'
      "secondary_info": "다음 단계 진행을 위한 구체적인 액션 아이템."
  }
}
```

---

## 📝 개발 및 검증 주안점 (Codari Notes)
1. **데이터 타입 강제:** 모든 금액($X), 점수(Score)는 부동소수점(Float) 또는 숫자로 처리하고, 문자열로 인한 오류를 방지해야 합니다.
2. **비동기 처리:** 리스크 계산은 외부 DB 호출 및 복잡한 로직을 포함하므로, API 구현 시 반드시 비동기 처리를 염두에 두어야 합니다.
3. **테스트 케이스 확장:** 성공/실패 경우 외에도 '경계 조건(Boundary Condition)' 테스트가 필수입니다. (예: 모든 필드가 완벽히 준수된 최적의 경우 vs. 모든 필드가 결함이 있는 극단적인 경우).