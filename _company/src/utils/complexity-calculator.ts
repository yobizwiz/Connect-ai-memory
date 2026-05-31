import { MasterRiskDataset, ComplexityScore } from "./risk-types";
export { fetchMasterRiskDataset } from "./risk-types";
export type { ComplexityScore };

/**
 * @description 마스터 구조적 리스크 데이터셋을 기반으로 M_Complexity 점수를 계산합니다.
 * @param dataset - 분석할 리스크 데이터셋.
 * @returns ComplexityScore 객체 (점수, 임계값 초과 여부, 메시지).
 */
export const calculateComplexityScore = (dataset: MasterRiskDataset): ComplexityScore => {
    if (!dataset || !dataset.risk_scenarios) {
        return { value: 0, isCritical: false, message: "데이터를 로드할 수 없습니다." };
    }

    let totalWeightedScore = 0;

    // 리스크 시나리오들을 순회하며 가중치 계산 (가장 핵심적인 부분)
    for (const scenario of dataset.risk_scenarios) {
        try {
            // Defensive Programming: 모든 필요한 속성이 존재하는지 체크합니다.
            const regulatoryWeighting = scenario.regulatory_weighting ?? 0;
            const probabilityScore = scenario.probability_score ?? 0;
            const impactScore = scenario.impact_score ?? 0;

            // M_Complexity 계산 로직 (예시: 가중 평균 + 로그 스케일링)
            // 공식은 비즈니스 요구사항에 따라 달라지나, 구조적 무결성을 보여주는 것이 중요함.
            const score = Math.min(1.0, regulatoryWeighting * 2 + probabilityScore * 1.5 + impactScore / 3);
            totalWeightedScore += score;

        } catch (e) {
            console.error("🚨 [Calc Error] 리스크 시나리오 계산 중 예외 발생:", e);
            // 에러가 나더라도 전체 로직이 깨지지 않도록 무시하고 진행합니다.
        }
    }

    // 최종 점수는 평균값 또는 합산값을 사용 (여기서는 단순 평균을 가정)
    const avgScore = totalWeightedScore / dataset.risk_scenarios.length;

    // 임계값 검증 및 상태 플래그 설정
    let isCritical = false;
    let message = "시스템은 현재 안정적인 운영 범주에 있습니다.";

    if (avgScore >= 0.85) { // Critical Threshold
        isCritical = true;
        message = "⚠️ [경고] 구조적 리스크가 임계점을 초과했습니다! 즉각적인 시스템 점검이 필요합니다.";
    } else if (avgScore >= 0.6) { // Warning Threshold
        isCritical = false;
        message = "🚨 주의: 일부 규제 영역에서 잠재적 위험 신호가 감지되었습니다. 모니터링을 강화해야 합니다.";
    }

    return { 
        value: parseFloat(avgScore.toFixed(3)), 
        isCritical, 
        message 
    };
};