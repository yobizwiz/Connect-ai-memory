// src/lib/riskCalculator.ts

import { RegulatoryRiskDataset } from '../data/regulatory_risk_dataset'; // 가상의 타입 정의 파일 가정

/**
 * @typedef {object} RiskInput - 사용자가 입력하는 개별 리스크 지표
 * @property {string} id - 리스크 ID (예: GDPR-2019-A)
 * @property {number} score - 현재 준수 점수 (0~100)
 */

/** @type {import('./../data/regulatory_risk_dataset.json')} */
// 실제 JSON 데이터를 타입으로 정의하고 가져온다고 가정합니다.
const RISK_DATASET: RegulatoryRiskDataset = {}; // 임시 placeholder

/**
 * 규제 데이터셋을 로드하고, 입력된 지표들을 기반으로 최대 재무적 손실액(Lmax)과 종합 위험 점수를 계산하는 순수 함수.
 * @param {RiskInput[]} inputs - 사용자가 입력한 리스크 지표 배열.
 * @returns {{lMax: number, riskScore: number, passed: boolean}} 계산된 결과 객체.
 */
export const calculateRiskExposure = (inputs: Array<{ id: string; score: number }>): { lMax: number, riskScore: number, passed: boolean } => {
    if (!inputs || inputs.length === 0) {
        return { lMax: 0, riskScore: 100, passed: true };
    }

    let totalLmax = 0;
    let cumulativeRiskScore = 0;
    let isSystemicFailure = false;

    for (const input of inputs) {
        // Defensive Check: 입력된 리스크 ID가 데이터셋에 존재하는지 확인합니다.
        if (!RISK_DATASET || !RISK_DATASET[input.id]) {
            console.warn(`[CALCULATOR WARNING] Missing data for case_id: ${input.id}`);
            continue; 
        }

        const riskCase = RISK_DATASET[input.id];
        
        // Defensive Check: 사용자가 입력한 점수가 유효 범위 내인지 확인합니다.
        if (typeof input.score !== 'number' || input.score < 0 || input.score > 100) {
            console.error(`[CALCULATOR ERROR] Invalid score provided for ${input.id}. Must be 0-100.`);
            // 유효하지 않은 입력은 해당 리스크를 제외하고 계산합니다.
            continue; 
        }

        // 핵심 로직: Lmax는 (데이터셋의 최대 벌금) * (준수율 역산 가중치)로 결정됩니다.
        // 예시: 준수 점수가 낮을수록 (100 - score) 값이 커져서 Lmax가 증가합니다.
        const complianceFailureRate = 1 - (input.score / 100); // Failure rate (0 to 1)
        
        // Lmax 계산 로직 (최대 벌금 * 위반 정도 반영).
        // $L_{max}$는 최소 운영 손실액($L_{min}$)을 기준으로 잡고, 실패율에 따라 가중치를 적용합니다.
        const lmaxContribution = riskCase.estimatedMinLoss * (1 + complianceFailureRate * 3); 

        totalLmax += lmaxContribution;
        
        // 리스크 점수 계산: 데이터셋의 심각도와 현재 위반 정도를 결합
        cumulativeRiskScore += (riskCase.severityWeighting * (1 - complianceFailureRate));
    }

    const averageRiskScore = cumulativeRiskScore / inputs.length;
    const passed = totalLmax < 1000000; // 임계값 설정: $1M 이하면 통과로 간주

    return { 
        lMax: Math.round(totalLmax), 
        riskScore: Math.min(100, Math.max(0, averageRiskScore)), // 점수 범위 제한 (0~100)
        passed: passed 
    };
};


/**
 * A/B 테스트 로그를 시뮬레이션하는 함수. 실제 API 호출을 대체합니다.
 * @param {string} experimentGroup - 'A' 또는 'B'.
 * @param {number} riskScore - 계산된 리스크 점수.
 */
export const logABTestEvent = async (experimentGroup: 'A' | 'B', riskScore: number): Promise<boolean> => {
    console.log(`[API MOCK] Logging A/B Test Event: Group=${experimentGroup}, Score=${riskScore}`);
    // 실제 환경에서는 axios.post 등으로 API를 호출해야 합니다.
    await new Promise(resolve => setTimeout(resolve, 300)); // 네트워크 지연 시뮬레이션
    return true;
};

export { calculateRiskExposure, logABTestEvent };