/**
 * @fileoverview 핵심 위험 계산 로직을 담는 유틸리티 파일입니다.
 * 순수 함수(Pure Function) 형태로 분리하여 테스트 용이성을 극대화했습니다.
 * 이 모듈은 비즈니스 규칙(Domain Logic)만을 담당하며, UI나 API 호출과는 독립적입니다.
 */

// 🚨 타입 정의 (Type Safety 확보)
export interface RiskInput {
    userIndustry: string; // 사용자가 선택한 산업군 (예: 'FinTech', 'Healthcare')
    employeeCount: number; // 직원 수
    complianceScore: number; // 현재 준수 점수 (0-100)
}

/**
 * 리스크 데이터 구조체. API 호출 시뮬레이션의 반환 타입입니다.
 */
export interface RiskReport {
    totalRiskExposureUSD: number; // 총 위험 노출액 ($): 가장 높은 숫자여야 함.
    identifiableGapCount: number; // 식별 가능한 구조적 결함 개수.
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; // 위협 레벨.
    analysisDurationMs: number; // 분석에 걸린 시간 (마케팅용).
}

/**
 * [핵심 로직] 입력된 데이터를 기반으로 총 위험 노출액을 계산합니다.
 * 이 공식은 yobizwiz의 영업 논리에 맞춰 '공포'를 극대화하도록 설계되었습니다.
 * @param input 사용자 리스크 데이터 
 * @returns RiskReport 객체
 */
export const calculateTotalRiskExposure = (input: RiskInput): RiskReport => {
    // 1. 산업군별 기본 위험 가중치 적용 (Domain Knowledge)
    let baseWeight: number;
    switch (input.userIndustry) {
        case 'FinTech':
            baseWeight = 50000; // 금융은 규제 리스크가 높음
            break;
        case 'Healthcare':
            baseWeight = 45000; // 의료는 민감 정보 및 법적 책임이 높음
            break;
        case 'Manufacturing':
            baseWeight = 30000;
            break;
        default:
            baseWeight = 20000;
    }

    // 2. 직원 수 기반 복잡성 페널티 적용 (Complexity Penalty)
    const complexityPenalty = input.employeeCount * 1500; // 인원이 많을수록 위험도 증가

    // 3. 컴플라이언스 점수 역산 (The Core Fear Factor)
    // Score가 낮을수록(위험할수록) 가중치가 급격히 올라가야 함.
    const complianceMultiplier = Math.pow((100 - input.complianceScore) / 100, 2);
    const riskPenaltyFromCompliance = baseWeight * complianceMultiplier;

    // 총 위험 노출액 (Total Risk Exposure): 세 가지 요소를 합산합니다.
    const totalRiskExposureUSD = Math.round(baseWeight + complexityPenalty + riskPenaltyFromCompliance / 100);

    // 결함 개수 추정 (Gap Count)
    const identifiableGapCount = Math.min(Math.floor((20 - input.complianceScore / 5)), 7);


    // 위협 레벨 결정
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (totalRiskExposureUSD > 150000) {
        riskLevel = 'CRITICAL'; // 시스템적 생존 위협 수준
    } else if (totalRiskExposureUSD > 80000) {
        riskLevel = 'HIGH';
    } else if (totalRiskExposureUSD > 30000) {
        riskLevel = 'MEDIUM';
    } else {
        riskLevel = 'LOW';
    }

    return {
        totalRiskExposureUSD: Math.max(1000, totalRiskExposureUSD), // 최소값 보장
        identifiableGapCount: identifiableGapCount,
        riskLevel: riskLevel,
        analysisDurationMs: 3000, // 강제된 로딩 시간 (마케팅 요소)
    };
};

/**
 * [핵심 비즈니스 로직] 총 위험 노출액을 기반으로 최소 보험료(해결 비용)를 역산합니다.
 * 이 공식은 '총 손실 - 제거 가능한 손실 = 필요한 해결 비용'이라는 논리를 따릅니다.
 * @param totalExposure USD로 측정된 총 위험 노출액.
 * @returns MinimumInsurancePremium USD (최소 보험료).
 */
export const calculateMinimumInsurancePremium = (totalExposure: number): number => {
    // 1. 제거 가능한 손실 추정치 (예: 법적 절차/시간 소모로 인해 일부 비용은 이미 발생함)
    const solutionRemovableLossFraction = 0.2; // 총 위험액의 20%는 이미 노출된 손실로 간주
    const removableLoss = totalExposure * solutionRemovableLossFraction;

    // 2. 최소 보험료 (Minimum Insurance Premium): [총 위험 노출액] - [제거 가능 손실액]
    // 이 금액이 바로 Gold Tier 컨설팅의 '가치'로 포지셔닝됩니다.
    const minimumPremium = Math.round(totalExposure * (1 - solutionRemovableLossFraction));

    return Math.max(500, minimumPremium); // 최소 가격 보장
};

export type RiskCalculatorUtils = {
    calculateTotalRiskExposure: (input: RiskInput) => RiskReport;
    calculateMinimumInsurancePremium: (totalExposure: number) => number;
}