// --- 규제 위험 엔진 통합용 TypeScript Interface (v1.0) ---

/**
 * 🚨 위반 시나리오 기반의 재무 리스크 노출도를 정량화하는 핵심 데이터 구조체입니다.
 */
export interface RegulatoryRiskItem {
    // 1. 기본 정보 및 식별자
    regulationCode: 'GDPR' | 'CCPA' | 'DORA' | 'EU_AI_ACT' | 'HIPAA'; // 규제 코드 (API Enum)
    violationCategory: string; // 위반의 광범위한 카테고리 (e.g., Data Sovereignty, Non-Compliance, Lack of Provenance)
    articleReference: string; // 핵심 조항 또는 가이드라인 참조 번호 (Provenance 확보용)

    // 2. 위험 조건 및 작동 논리 (Computational Inputs)
    riskConditionTrigger: {
        description: string; // 위반이 발생하는 구체적인 상황 설명
        dataInputType: 'PII' | 'PHI' | 'Financial_Data' | 'Operational_Process'; // 어떤 종류의 데이터가 관련되는가?
        metric: string; // 위험을 측정할 수 있는 지표 (e.g., PII Count, Failure Count)
    };

    // 3. 영향도 및 페널티 구조화 (Quantifiable Outputs - $L_{max} 계산용)
    financialImpactModel: {
        minFineUSD: number; // 최소 벌금 예상액 ($L_{min}$)
        maxFineUSD: number; // 최대 벌금 예상액 ($L_{max}$)
        settlementRiskFactor: number; // 소송 합의 리스크 계수 (0.1 ~ 5.0) - 재무적 손실 가중치
        indirectLossMultiplier: number; // 시스템 중단/신뢰도 하락에 따른 간접 손실 배율 (1.0 ~ 10.0)
    };

    // 4. 필수 통제 및 방어책 (Solution/Mitigation)
    requiredControl: {
        controlName: string; // 반드시 갖춰야 할 기술적/운영적 제어 장치 이름
        implementationMethod: 'Encryption' | 'Masking' | 'Audit_Trail' | 'Consent_Mechanism';
        priorityLevel: 'Critical' | 'High' | 'Medium';
    };
}

export type GlobalRiskDatabase = RegulatoryRiskItem[];