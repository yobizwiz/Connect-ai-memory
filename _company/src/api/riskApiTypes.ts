/**
 * src/api/riskApiTypes.ts
 * 🚨 시스템적 리스크 케이스 스터디 데이터 모델 및 타입 정의
 */

// Quantitative_Risk_Case_Studies.md 기반의 구조화된 인터페이스
export interface RiskCaseStudy {
    id: number;
    industry: string; // 산업/위반 유형 (예: AI 의료 진단 시스템)
    violationType: string; // 주요 위반 유형 (예: 출처 불명확성)
    regulationBasis: string; // 규제 근거 (예: HIPAA, GDPR)
    description: string; // 상세 설명
    lTotalMaxEstimate: number; // $L_{totalMax}$ 추정치 (백분율 또는 단위 금액)
    shockFactorScore: number; // 충격도 점수 (1~100, 높을수록 공포 유발)
}

// Mock 데이터를 임시로 정의합니다. 실제로는 KnowledgeBase에서 파싱되어야 합니다.
export const MOCK_RISK_DATABASE: RiskCaseStudy[] = [
    {
        id: 1,
        industry: "AI 의료 진단 시스템",
        violationType: "출처 불명확성 (Provenance Failure)",
        regulationBasis: "HIPAA / FDA Guidelines",
        description: "AI 모델의 학습 데이터 출처가 불분명하여 오진 판정이 발생할 경우, 책임 소재와 법적 리스크가 전 산업에 영향을 미칩니다.",
        lTotalMaxEstimate: 120000000, // $1.2억 USD
        shockFactorScore: 95, // 가장 충격적인 사례로 설정
    },
    {
        id: 2,
        industry: "금융 거래 시스템",
        violationType: "데이터 무결성 침해 (Data Integrity Breach)",
        regulationBasis: "SOX / GDPR",
        description: "고객의 금융 데이터가 변조되거나 유출될 경우 발생하는 막대한 벌금과 소송 비용.",
        lTotalMaxEstimate: 80000000, // $8천만 USD
        shockFactorScore: 75,
    },
    {
        id: 3,
        industry: "공급망 관리 (SCM)",
        violationType: "물류 통제권 상실 (Loss of Control)",
        regulationBasis: "국가 안보 관련 법규",
        description: "핵심 공급망의 병목 현상이나 제3국 의존성으로 인한 운영 중단 기회비용이 예측 불가능합니다.",
        lTotalMaxEstimate: 45000000, // $4천5백만 USD
        shockFactorScore: 60,
    },
];

/**
 * 리스크 점수(L_totalMax)를 기반으로 가장 충격적인 사례를 반환하는 로직을 시뮬레이션합니다.
 * @param riskScore - 계산된 총 위험 점수 (예: API 호출 결과로 받은 최종 L_totalMax).
 * @returns 최고 충격도의 RiskCaseStudy 또는 null.
 */
export const getMostShockingRisk = (riskScore: number): RiskCaseStudy | null => {
    if (!MOCK_RISK_DATABASE || MOCK_RISK_DATABASE.length === 0) {
        return null;
    }

    // 이 로직은 실제로는 DB/KnowledgeBase에서 복잡한 가중치 계산을 거칩니다.
    // 여기서는 단순하게, 입력된 riskScore가 특정 임계치를 넘으면 가장 충격적인 사례를 반환합니다.
    const criticalThreshold = 100_000_000; // $1억 USD
    if (riskScore >= criticalThreshold) {
        console.warn(`[Risk API Mock] Critical threshold ($${criticalThreshold.toLocaleString()}) exceeded. Returning highest shock factor.`);
        return MOCK_RISK_DATABASE.reduce((prev, current) => 
            (current.shockFactorScore > prev.shockFactorScore ? current : prev), 
            MOCK_RISK_DATABASE[0]!
        );
    } else if (riskScore >= 50_000_000) {
         console.warn(`[Risk API Mock] Warning threshold met ($${(criticalThreshold / 2).toLocaleString()}). Returning mid-shock case.`);
        return MOCK_RISK_DATABASE.find(r => r.id === 2) || null;
    } else {
        return null; // 위험도가 낮으면 경고 표시 안 함 (가장 낮은 충격도의 사례를 반환할 수도 있음)
    }
};

export type RiskApiResponse = {
    flashCase: RiskCaseStudy | null;
    status: 'OK' | 'HIGH_RISK';
};