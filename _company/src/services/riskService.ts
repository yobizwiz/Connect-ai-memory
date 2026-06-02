import { RiskCaseData, TotalRiskReport, PAYWALL_THRESHOLD } from './risk-types';

/**
 * @description 모든 개별 리스크 케이스 데이터를 받아 시스템의 총 최대 재무 노출도(Lmax)를 계산합니다.
 * @param riskCases - 분석할 규제 위반 사례들의 배열입니다.
 * @returns TotalRiskReport 객체: 합산된 Lmax 값과 임계치 초과 여부를 포함합니다.
 * @throws {Error} 리스크 데이터가 유효하지 않거나 필수 항목이 누락되었을 경우 발생합니다.
 */
export const calculateTotalRisk = (riskCases: RiskCaseData[]): TotalRiskReport => {
    if (!Array.isArray(riskCases) || riskCases.length === 0) {
        throw new Error("RISK_SERVICE_ERROR: Input must be a non-empty array of risk case data.");
    }

    let totalLmaxUSD = 0;

    try {
        for (const caseData of riskCases) {
            // Defensive Coding: 필수 데이터가 누락되었는지 확인하고, 강제 계산을 막습니다.
            if (!caseData || !caseData.risk_quantification) {
                console.warn(`[Warning] Skipped invalid or incomplete risk case data for ID: ${caseData?.case_id ?? 'UNKNOWN'}`);
                continue; // 다음 데이터로 넘어갑니다.
            }

            const q = caseData.risk_quantification;

            // Core Calculation Logic (Lmax)
            // Lmax = [Regulatory Fine] + [Operational Downtime Loss * Critical Days] + [Litigation Settlement]
            // 여기서는 단순 합산을 원칙으로 하되, 필요에 따라 가중치를 부여할 수 있도록 구조화합니다.
            const caseLmax = q.regulatoryFineEstimate + 
                              (q.operationalDowntimeLossAnnualized / 365) * 4 // 예시: 최대 4일 마비 가정 후 일별 손실을 계산하여 추가
                              + q.litigationSettlementEstimate;

            totalLmaxUSD += caseLmax;
        }

    } catch (e) {
        // Catch-all for unexpected runtime errors during calculation
        console.error("FATAL_RISK_CALCULATION_ERROR:", e);
        throw new Error(`RISK_SERVICE_FAILURE: Cannot calculate total risk due to internal error.`);
    }

    const report: TotalRiskReport = {
        totalLmaxUSD: parseFloat(totalLmaxUSD.toFixed(2)), // 소수점 둘째 자리까지 고정
        exceedsThreshold: totalLmaxUSD > PAYWALL_THRESHOLD,
    };

    return report;
}