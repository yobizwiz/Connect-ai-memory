/**
 * @description TARS (Time-Adjusted Risk Score) 계산 서비스.
 * 시간에 따른 규제 리스크 증폭 효과(Temporal Escalation Factor, tau)를 반영합니다.
 * 이 함수는 Core Business Logic 레이어에 위치하여 외부 환경 변화로부터 보호되어야 합니다.
 */

// 타입 정의: 입력값의 명확한 구조화가 필수입니다.
export interface RiskInputs {
    initialTRE: number; // 초기 총 위험 노출도 (TRE_initial)
    estimatedDays: number; // 예상 경과 기간 (Delta t in days)
    alphaMultiplier: number; // 공개성 증폭 계수 (Alpha: Publicity Multiplier)
    betaMultiplier: number;  // 시스템적 취약점 노출 계수 (Beta: Systemic Vulnerability Exposure)
    gammaMultiplier: number; // 법규 변화 민감도 계수 (Gamma: Regulatory Change Sensitivity)
}

/**
 * TARS를 계산하는 핵심 로직. 공식: TRE_final = TRE_initial * (1 + tau).
 * @param inputs 리스크 평가에 필요한 모든 파라미터들.
 * @returns Time-Adjusted Risk Score (TARS).
 */
export const calculateTarsScore = (inputs: RiskInputs): number => {
    // 1. Temporal Escalation Factor (tau) 계산 공식 적용
    // tau = Alpha + Beta + Gamma * log(Time Multiplier)
    // 시간의 흐름이 리스크 증폭에 미치는 비선형적 효과를 반영하기 위해 로그 함수를 사용합니다.
    const timeMultiplierEffect: number = Math.log(inputs.estimatedDays > 0 ? inputs.estimatedDays + 1 : 2);

    // 가중치 조합 (규제 공포 지수를 극대화하는 방향으로 조정)
    let tauValue: number;
    try {
        tauValue = inputs.alphaMultiplier + (inputs.betaMultiplier * timeMultiplierEffect) + (inputs.gammaMultiplier * Math.pow(1.5, 0.1));
    } catch (e) {
        console.error("TARS 계산 중 오류 발생:", e);
        // 안전한 폴백 값: 에러가 나더라도 최소한의 리스크 점수를 반환합니다.
        return inputs.initialTRE * 1.5;
    }

    // 2. 최종 TARS 산출 (최소값을 보장하고, 과도한 증폭을 막기 위해 클리핑 처리)
    let finalTars: number = inputs.initialTRE * (1 + tauValue);

    // 리스크 점수는 0 이상, 1000 이하로 제한하는 것이 UI/UX 관점에서 안전합니다.
    return Math.min(Math.max(finalTars, 0), 1000).toFixed(2) * 1;
};


/**
 * TARS 계산 결과를 바탕으로 시스템의 경고 레벨을 결정합니다. (State Management Source)
 * @param tarsScore 산출된 TARS 점수
 * @returns 'CRITICAL', 'WARNING', 또는 'NORMAL' 중 하나
 */
export const determineRiskLevel = (tarsScore: number): 'CRITICAL' | 'WARNING' | 'NORMAL' => {
    if (tarsScore >= 750) {
        return 'CRITICAL'; // 임계치 초과: 글리치 및 카운트다운 필수 활성화 영역
    } else if (tarsScore >= 300) {
        return 'WARNING';  // 주의 필요: 시각적 경고만 제공하는 영역
    } else {
        return 'NORMAL';   // 정상 범위
    }
};

/**
 * @description Mock API Endpoint for TARS calculation. 실제 프로젝트에서는 Next.js Route Handler 또는 FastAPI endpoint로 구현되어야 합니다.
 */
export const getTarsApiEndpoint = async (inputs: RiskInputs) => {
    const tarsScore = calculateTarsScore(inputs);
    const riskLevel = determineRiskLevel(tarsScore);

    return {
        tarsScore: parseFloat(tarsScore),
        riskLevel: riskLevel,
        timestamp: new Date().toISOString(),
        message: `TARS 계산 완료. 위험 레벨: ${riskLevel}.`
    };
}