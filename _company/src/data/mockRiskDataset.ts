// src/data/mockRiskDataset.ts

/** 
 * Designer와 Researcher가 정의한 구조적 리스크 데이터를 타입으로 정의합니다.
 */
export interface RiskCase {
    caseId: string; // GDPR-2019-A 등
    description: string;
    severityWeighting: number; // 위반 심각도 가중치 (예: 1.5)
    estimatedMinLoss: number; // 최소 운영 손실액 (API 계산에 사용될 값)
}

/**
 * 전체 규제 리스크 데이터셋을 임시로 정의합니다. 실제 환경에서는 외부 JSON 파일 로딩이 필요합니다.
 */
export const mockRiskDataset: Record<string, RiskCase> = {
    "GDPR-2019-A": {
        caseId: "GDPR-2019-A",
        description: "개인 식별 정보(PII) 유출 및 처리 불명확.",
        severityWeighting: 3.5, // 높은 가중치 부여
        estimatedMinLoss: 500000, // 최소 $50만 손실 가정
    },
    "CCPA-2020-B": {
        caseId: "CCPA-2020-B",
        description: "캘리포니아 거주자의 데이터 판매 동의 미획득.",
        severityWeighting: 2.8,
        estimatedMinLoss: 300000,
    },
    "HIPAA-2016-C": {
        caseId: "HIPAA-2016-C",
        description: "의료 정보(PHI) 비인가 접근 및 보관 위반.",
        severityWeighting: 5.0, // 가장 높은 가중치 부여
        estimatedMinLoss: 800000,
    }
};

// calculateRiskExposure가 이 데이터를 사용하도록 강제 주입합니다.
export const regulatory_risk_dataset = mockRiskDataset;