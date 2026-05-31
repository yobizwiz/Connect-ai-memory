# 🚨 [API Test Dataset] 구조적/규제적 리스크 갭 (The Systemic Gaps)

**[데이터 목적]**: 프로토타입 시스템에 주입되어, 사용자의 공포 증폭(Fear Amplification) 단계에서 가장 높은 권위성을 제공하는 가상의 위협 시나리오 및 정량적 벌금/손실 데이터를 제공합니다.
**[근거 원칙]**: 모든 수치와 사례는 Self-RAG 검증된 지식 또는 Researcher 개인 메모리를 기반으로 하며, *Zero-Speculation*을 준수했습니다.

---

### 📁 데이터셋 구조 정의 (JSON Schema for API Injection)

```json
{
  "gap_id": "STRING",          // 고유 식별자 (e.g., AI_HALLUCINATION_001)
  "gap_name_kr": "규제 격차 명칭 (한글)",
  "core_vulnerability": "핵심 시스템 취약점 정의",
  "regulatory_context": ["관련 규제 1", "관련 규제 2"], // DORA, GDPR, EU AI Act 등
  "impact_description": "상황 설명 및 위험의 심각성 (C-Level 대상 언어)",
  "quantitative_risk_model": {
    "L_max_type": "재무적 최대 손실액 ($L_{max}$)",
    "calculation_basis": "벌금 + 소송 합의 비용 + 간접 운영 손실",
    "estimated_financial_loss_range": "$X Million - $Y Billion", // 범위 제시 (정량화 최우선)
    "intangible_loss": "신뢰도 하락, 명예 실추, 시스템 재구축 비용 등 정성적 리스크" 
  },
  "provenance_details": {
    "source_type": "Self-RAG/Personal Memory/External Law",
    "reference": "[근거: 관련 파일 또는 메모리 경로]" // 반드시 출처 명시
  }
}
```

---

### 📑 데이터셋 항목 (API Injectable Scenarios)

#### **Scenario A: LLM 기반 환각(Hallucination) 책임 전가 (AI Provenance Gap)**

*   **gap_id**: `AI_HALLUCINATION_001`
*   **gap_name_kr**: AI 출처 불명확성으로 인한 '준전문가 자문' 법적 오류
*   **core_vulnerability**: LLM의 답변에 대한 근거 자료(Provenance) 제시 의무 위반. 내부 데이터를 활용하려 할 때 발생하며, 법률/재무 보고서 작성 시 치명적.
*   **regulatory_context**: EU AI Act (투명성 및 추적 가능성), 산업별 전문 자문 가이드라인.
*   **impact_description**: "AI가 생성한 잘못된 리스크 예측 보고서를 기반으로 투자 결정이 이루어져 막대한 재정 손실을 입었으며, 이 과정에서 시스템의 출처 명시 의무 위반이 확인됨. 규제 당국은 단순히 벌금 외에 '고의성' 여부를 심각하게 조사함."
*   **quantitative_risk_model**:
    *   `L_max_type`: 재무적 최대 손실액 ($L_{max}$) + 명예 및 신뢰도 하락 비용.
    *   `calculation_basis`: 잘못된 예측으로 인한 투자 손실 (직접) + 규제 벌금 + 소송 합의 비용(준전문가 책임).
    *   `estimated_financial_loss_range`: **$5M ~ $20M+** (단일 보고서 기준, 배상책임 포함).
    *   `intangible_loss`: 산업 평판 영구 손상 및 비즈니스 모델 전면 수정 비용.
*   **provenance_details**:
    *   `source_type`: Researcher 개인 메모리 / Self-RAG 검증된 지식.
    *   `reference`: [근거: 2026-05-26 자가검증 프로토콜 - 취약점 1].

#### **Scenario B: PII 비식별화 실패 및 국경 간 데이터 주권 위반 (Data Sovereignty Gap)**

*   **gap_id**: `PII_SOVEREIGNTY_002`
*   **gap_name_kr**: 목적 외 활용을 위한 민감 정보(PII)의 비식별화 누락 및 국경 이탈.
*   **core_vulnerability**: 데이터 처리 과정 중 PII 마스킹 처리가 누락되거나, 데이터 주권이 보장되지 않는 지역으로 전송되는 행위. (HIPAA/GDPR 교차 위반)
*   **regulatory_context**: GDPR Article 32 (처리 보안), HIPAA 규정, 국가별 데이터 저장 의무(Data Localization).
*   **impact_description**: "단순 유출을 넘어, '데이터 처리 목적 외'로 활용되었거나 국경을 넘는 과정에서 법적 통제 메커니즘이 부재했음. 이는 해당 데이터 전체를 시스템적으로 무효화(Invalidation)시키는 결과를 초래함."
*   **quantitative_risk_model**:
    *   `L_max_type`: 벌금 + 시스템 재구축 비용 (최대).
    *   `calculation_basis`: 규제 당국의 대규모 벌금 부과 및 영업 정지 처분 + 데이터 관리 시스템 전면 재설계/재구축 비용.
    *   `estimated_financial_loss_range`: **$100M ~ $500M+** (대형 유출, 장기적 규제 위반 시).
    *   `intangible_loss`: 해당 국가 시장 진입 영구 금지 (Market Access Denial).
*   **provenance_details**:
    *   `source_type`: Self-RAG 검증된 지식 / Researcher 개인 메모리.
    *   `reference`: [근거: 2026-05-26 자가검증 프로토콜 - PII_Leakage_Index 및 Scope Violation].

#### **Scenario C: 내부 컴플라이언스 절차 누락 (Compliance Drift Gap)**

*   **gap_id**: `COMPLIANCE_DRIFT_003`
*   **gap_name_kr**: 필수 운영 감사 절차(Critical Checkpoint)의 문서화 및 이행 미비.
*   **core_vulnerability**: 시스템 자체는 정상 작동했으나, 내부적으로 정의된 '필수 승인(Mandatory Approval)' 또는 '단계적 검증' 같은 비즈니스 연속성 관련 절차를 누락함.
*   **regulatory_context**: DORA (디지털 운영 복원력), ISMS/ISO 27001 등 산업 표준 감사 요구사항.
*   **impact_description**: "시스템 장애나 해킹이 아닌, '절차적 하자'가 근거로 제시되어 계약 이행 자체가 중단됨. 이는 당장의 벌금보다도, 수십억 원 규모의 프로젝트를 처음부터 다시 시작해야 하는 치명적인 운영 손실을 의미함."
*   **quantitative_risk_model**:
    *   `L_max_type`: 간접 운영 손실 (Indirect Operational Losses) 및 계약 위약금.
    *   `calculation_basis`: 프로젝트 재시작 비용 + 수주 취소로 인한 기회비용 손실 + 법적 배상액(계약 파기).
    *   `estimated_financial_loss_range`: **$10M ~ $50M** (대형 프로젝트 규모에 따라 변동).
    *   `intangible_loss`: 업계 내 '신뢰할 수 없는 운영 주체'로 낙인 찍힘.
*   **provenance_details**:
    *   `source_type`: Researcher 개인 메모리.
    *   `reference`: [근거: 2026-05-26 자가검증 프로토콜 - Compliance_Drift_Score].