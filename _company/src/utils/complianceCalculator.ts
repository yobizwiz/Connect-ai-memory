// src/utils/complianceCalculator.ts

/**
 * @typedef {Object} InputVariables
 * @property {string} jurisdictionCode - V1: 관할 법규/지역 코드 (예: GDPR-EU)
 * @property {('PII'|'PHI'|'FINANCIAL'|'IP')} dataTypeClassification - V2: 취급 데이터 유형 분류
 * @property {number} dataSubjectCountN - V3: 영향받은 주체 수 (N). 최소 1 이상.
 * // TODO: V4, V5 등 다른 변수들을 추가하여 구조를 확장해야 합니다.
 */

/**
 * @typedef {Object} LossBreakdown
 * @property {string} component - 손실 기여 요인 (예: 법적 벌금, 평판 손실)
 * @property {number} contributionAmount - 해당 요인이 기여하는 금액 ($).
 * @property {string} sourceRule - 근거가 된 규정 또는 논리.
 */

/**
 * @typedef {Object} CalculationResult
 * @property {number} estimatedLossY - 최종 추정 손실액 (Minimum Estimated Loss, $Y$).
 * @property {LossBreakdown[]} breakdown - 산출 과정의 상세 내역.
 * @property {string} riskLevel - 위험 등급 (CRITICAL/HIGH/MEDIUM).
 */


/**
 * 주어진 입력 변수들을 기반으로 최소 추정 손실액 Y를 계산합니다.
 * 이 함수는 yobizwiz 시스템의 핵심 비즈니스 로직입니다.
 * @param {InputVariables} inputs - 필수 컴플라이언스 변수들.
 * @returns {CalculationResult} 최종 손실액과 상세 분석 결과.
 */
export const calculateEstimatedLoss = (inputs) => {
    // 1. 입력 유효성 검증 (Guard Clause)
    if (!inputs || inputs.dataSubjectCountN < 1 || !inputs.jurisdictionCode || !inputs.dataTypeClassification) {
        throw new Error("필수 컴플라이언스 변수가 누락되었습니다. 모든 필드를 채워주세요.");
    }

    let baseRiskScore = 0;
    const breakdown = [];
    let estimatedLossY = 0;

    // 2. 위험 등급 및 기본 점수 산정 로직 (V1: Jurisdiction Code 기반)
    if (inputs.jurisdictionCode === 'GDPR-EU') {
        baseRiskScore += 5; // GDPR은 가장 높은 초기 리스크를 부여합니다.
        breakdown.push({ component: "법적 근거", contributionAmount: 0, sourceRule: "GDPR Article 83 (General Principle)" });
    } else if (inputs.jurisdictionCode === 'CCPA-CA') {
        baseRiskScore += 3;
        breakdown.push({ component: "지역 법규 준수", contributionAmount: 0, sourceRule: "CCPA Consumer Rights" });
    }

    // 3. 데이터 유형 가중치 적용 (V2: Data Type Classification 기반)
    let dataWeight = 1;
    if (inputs.dataTypeClassification === 'PHI') { // 건강정보는 가장 위험함
        dataWeight = 5;
        breakdown.push({ component: "민감도 가중치", contributionAmount: 0, sourceRule: "High Sensitivity Data Penalty" });
    } else if (inputs.dataTypeClassification === 'IP') {
        dataWeight = 3;
    }

    // 4. 핵심 손실액 계산 (V3: N 기반)
    // Y = (기본 리스크 * 데이터 가중치) * N * 기본 상수(10k)
    estimatedLossY = Math.max(1000, baseRiskScore * dataWeight * inputs.dataSubjectCountN * 1000);

    // 최종 산출물 구조화
    const riskLevel = estimatedLossY >= 50000 ? 'CRITICAL' : (estimatedLossY >= 10000 ? 'HIGH' : 'MEDIUM');

    return {
        estimatedLossY: parseFloat(estimatedLossY.toFixed(2)), // 소수점 둘째 자리까지 처리
        breakdown: breakdown,
        riskLevel: riskLevel,
    };
};