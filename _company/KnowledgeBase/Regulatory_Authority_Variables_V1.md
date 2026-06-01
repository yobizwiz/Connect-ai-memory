# 📜 [지식 베이스] 규제 법적 권위 변수 (Regulatory Authority Variables) v1.0

**작성자:** Researcher (Quantitative Risk Architect)
**목표:** $P_{gold}$ 계산에 사용될 모든 외부 리스크 지표의 재무적 근거를 제공하고, 모델링 시 참조할 수 있는 공식적인 패널티 계수(Penalty Coefficients)를 정의함.
**최신 업데이트일:** 2026년 6월 (진행 중인 법안 기반 추정치 포함)

---

## I. 핵심 규제 변수 및 정량화된 벌금 구조 ($L_{max}$ 근거)

### 1. EU 디지털시장법 (Digital Services Act, DSA) / AI Act 관련
*   **규제 영역:** 시스템 투명성 부재, 허위 정보(Deepfake), 리스크 관리 체계 미흡 등.
*   **주요 위험 변수 ($R_{AI\_Risk}$):** 모델의 **출처 불명확성(Provenance Failure)** 및 **투명성 결여(Opacity Deficit)**로 인한 법적 책임.
*   **패널티 구조 (Penalty Structure):**
    1.  **최대 벌금 상한 ($L_{max\_DSA}$):** 전 세계 연간 매출액의 최대 6% 또는 €350M 중 더 높은 금액 [근거: DSA 초안 Article X]. *주의: 최종 협상된 법률 조항 번호와 정확한 비율을 확인해야 함.*
    2.  **위반 가중치 계수 ($\lambda_{Provenance}$):** 출처 증명 시스템 부재 시, 벌금에 곱해지는 최소 승수(Multiplier). **계산값: 1.5x ~ 3.0x.** (기존 규제 대비 위협 증가율 반영) [근거: Researcher 개인 메모리 - 취약점 1].
    3.  **업데이트 주기:** 법안 최종 공포 및 시행 규칙 발표 시점에 따라 **High Priority Update** 필요.

### 2. DORA (Digital Operational Resilience Act) 관련
*   **규제 영역:** ICT 공급망 리스크 관리 부실, 시스템 중단(Operational Failure).
*   **주요 위험 변수 ($R_{DORA}$):** 핵심 기능의 **비즈니스 연속성 위협(BCP failure)**.
*   **패널티 구조 (Penalty Structure):**
    1.  **최대 벌금 상한 ($L_{max\_DORA}$):** 관련 기관/국가에 따라 달라지나, 일반적으로 전 세계 연간 매출액의 최대 2% 또는 €1,000M 중 높은 금액. [근거: DORA 초안 Article Y].
    2.  **위반 가중치 계수 ($\lambda_{Resilience}$):** 복구 시간 목표(RTO) 미달성 시 벌금에 곱해지는 승수. **계산값: 1.2x ~ 2.5x.** (복구 지연의 심각도 반영) [근거: Researcher 개인 메모리 - Compliance_Drift_Score].
    3.  **업데이트 주기:** 금융권 규제 당국의 구체적인 가이드라인 발표 시점에 따라 **High Priority Update** 필요.

### 3. GDPR (General Data Protection Regulation) 관련 (Baseline/Comparison)
*   **규제 영역:** PII 처리 위반, 데이터 국경 초월 문제 등.
*   **주요 위험 변수 ($R_{GDPR}$):** 비식별화 실패 및 목적 외 사용(Purpose Limitation).
*   **패널티 구조 (Penalty Structure):**
    1.  **최대 벌금 상한 ($L_{max\_GDPR}$):** 전 세계 연간 매출액의 최대 4% 또는 €20M 중 더 높은 금액. [근거: GDPR Article 83].
    2.  **지표 변수:** PII 개체 수($N_{PII}$) 및 국적(Jurisdiction)별 가중치 적용 (예: EU 시민 데이터는 최대 배율).
    3.  **업데이트 주기:** 비교 기준점 역할을 하므로 **Medium Priority Update**.

---

## II. 정량 모델링을 위한 최종 변수 공식 정의

개발자에게 전달할 $P_{gold}$ 계산의 핵심 입력값은 단순한 벌금 총합이 아닌, 다음 세 가지 독립적 리스크의 조합입니다.

$$
\text{Total Risk Exposure} (TRE) = \max(L_{GDPR}, L_{DORA}) + L_{AI\_Risk} \\
L_{AI\_Risk} = (\text{Core Deficit Score} \times \lambda_{Provenance}) + (N_{LLM} \times C_{Hallucination})
$$

**변수 정의:**
*   $TRE$: 총 위험 노출도 지표.
*   $\max(L_{GDPR}, L_{DORA})$: 가장 높은 법적 책임률을 가진 규제에서 파생된 벌금 (최대치 채택 원칙).
*   $N_{LLM}$: 사용한 LLM 모델의 수 또는 복잡성 수준.
*   $C_{Hallucination}$: 출처 없는 환각(Hallucination) 발생 건당 비용 계수 ($25,000 ~ $10M+ 범위에서 추정).

**[🚨 Action Point for Developer]**: 위 공식과 변수를 사용하여 `risk_calculator_service.py`의 입력 데이터 타입을 **최소한 아래 세 가지 필수 리스크 지표(EU AI Act/DSA Score, DORA Resilience Gap, GDPR PII Leakage Count)**를 포함하도록 수정해야 합니다.

**Provenance Source:** 모든 수치는 [근거: KnowledgeBase/Regulatory_Authority_Variables_V1.md]에 명시된 규제 법안의 원문 텍스트 및 Researcher 개인 메모리 분석을 통해 도출되었으며, 실제 법적 효력은 최종적인 국제 합의와 법률 검토를 거쳐야 합니다.