/**
 * @fileoverview Lmax 계산을 담당하는 순수 함수 모듈.
 * 시스템적 위험 노출도를 재무적 손실액(Lmax)으로 정량화합니다.
 * 이 로직은 Side Effect가 없도록 분리되어 테스트 용이성을 극대화합니다.
 */

/**
 * @typedef {Object} RiskInputs
 * @property {number} complianceDriftScore - 규정 준수 위반 지연 점수 (0~100).
 * @property {number} dataLeakRiskScore - PII 유출 위험도 (0~100).
 * @property {number} operationalVulnerability - 운영 취약성 정도 (0~100).
 */

/**
 * 시스템적 리스크를 재무적 최대 손실액(Lmax)으로 계산합니다.
 * Lmax = (Compliance Drift * Weight_C) + (Data Leak * Weight_D) * Complexity Multiplier
 * @param {RiskInputs} inputs - 세 가지 핵심 위험 지표 객체.
 * @returns {{lmax: number, complexityScore: number}} 계산된 최대 손실액과 복합성 계수.
 */
export const calculateMaxLoss = (inputs) => {
    // --- [논리 검증] Weighting Factors 및 상수 정의 ---
    const WEIGHT_C = 0.3; // 규제 준수 위반의 중요도 가중치
    const WEIGHT_D = 0.5; // 데이터 유출의 심각성 가중치 (가장 높음)
    const BASE_VULNERABILITY_WEIGHT = 0.2;

    // --- [단계 1] 복합성 계수 ($M_{Complexity}$) 계산 ---
    // 세 가지 위협 요인 중 가장 높은 위험 요소들의 조합에 따라 비선형적으로 증가합니다.
    // Min(1, sum(I_k)) 로직을 단순화하여 구현했습니다.
    const totalRiskInput = inputs.complianceDriftScore / 100 + (inputs.dataLeakRiskScore / 100) + (inputs.operationalVulnerability / 100);
    // 복합성 계수는 최대 2.5를 넘지 않도록 상한선을 두어 안정성을 확보합니다.
    const complexityScore = Math.min(totalRiskInput * 1.5, 2.5);

    // --- [단계 2] Lmax 계산 (가중치 및 복합성 적용) ---
    // Lmax = W_C*D + W_D*L + W_V * M_Complexity * 1000 (단위: 만 원)
    let lmax = (inputs.complianceDriftScore * WEIGHT_C) + 
               (inputs.dataLeakRiskScore * WEIGHT_D);

    // 복합성 계수가 적용되는 최종 손실액 계산 로직
    lmax += inputs.operationalVulnerability * complexityScore * 10; // 가중치 조정 (scale factor)

    // Lmax는 최소값이 100만 원, 최대값이 적절한 범위 내에 있도록 클리핑합니다.
    const finalLmax = Math.max(100, Math.min(lmax * 5 + 100, 5000)); // 최종 단위: 만 원

    return {
        lmax: parseFloat(finalLmax.toFixed(2)),
        complexityScore: parseFloat(complexityScore.toFixed(3))
    };
};