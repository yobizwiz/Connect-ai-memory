/**
 * @fileOverview yobizwiz Gatekeeper System Core Logic (State Machine)
 * @description 사용자의 입력 데이터를 받아 시스템적 리스크를 분석하고, 3단계 게이트키퍼 상태를 결정합니다.
 */

// --- 1. Type Definitions & Enums ---

export enum RiskLevel {
    SAFE = 'Safe',          // 초기 진단 단계 (Green Zone)
    WARNING = 'Warning',    // 임계치 초과 경고 (Yellow/Red Flash Warning)
    CRITICAL_GATEKEEPER = 'CriticalGatekeeper' // 강제 결제 유도 구간 (Hard Stop / Red Zone)
}

export enum SystemState {
    INPUT_CAPTURED,        // 사용자 입력 완료 직후
    ANALYZING,             // 시스템 분석 진행 중 (Time Pressure)
    RESULT_DISPLAYED,      // 최종 리포트 표시됨
    INTERVENTION_REQUIRED  // 게이트키퍼 액션 필요 상태
}

/**
 * @typedef {object} UserInputData - 사용자로부터 받은 기본 데이터 구조.
 * @property {string} industry - 산업 분야 (예: Finance, Healthcare)
 * @property {number} employeeCount - 직원 수
 * @property {boolean} hasComplianceCheck = true - 컴플라이언스 검사 진행 여부
 */

/**
 * @typedef {object} RiskReportPayload - 시뮬레이션 후 반환되는 최종 보고서 데이터.
 * @property {RiskLevel} riskLevel - 결정된 리스크 레벨 (Safe, Warning, Critical)
 * @property {SystemState} nextState - 시스템이 다음으로 요구하는 상태
 * @property {{score: number, reason: string}} lossMeterData - 손실 측정기 데이터 (수치화된 공포)
 * @property {boolean} isGatekeeperTriggered - 게이트키퍼 작동 여부 (결제 강제 유도)
 */

// --- 2. Mock API Simulation Function ---
/**
 * 가상의 외부 법규 DB 및 분석 엔진을 호출하여 리스크 점수를 계산하는 함수를 시뮬레이션합니다.
 * @param {UserInputData} input - 사용자 입력 데이터.
 * @returns {Promise<{score: number, reason: string}>} 계산된 리스크 점수와 근거.
 */
const mockExternalApiCall = async (input) => {
    // 3초 지연을 주어 로딩 상태를 체감하게 만듭니다. (Time Pressure 유도)
    await new Promise(resolve => setTimeout(resolve, 3000));

    let score = Math.random() * 10; // 기본 점수 부여
    let reason = "기본 시스템 검토 완료.";

    // 복잡한 비즈니스 로직을 시뮬레이션합니다. (예: 금융 산업 + 소규모 기업)
    if (input.industry === 'Finance' && input.employeeCount < 50) {
        score += 3; // 감점 요인 추가
        reason = "금융 분야의 초기 단계 기업은 내부 통제 리스크가 높습니다.";
    }

    // 컴플라이언스 체크 누락 시 가장 높은 위험도를 부여합니다. (Critical Path)
    if (!input.hasComplianceCheck || input.industry === 'Healthcare') {
        score += 8; // 매우 큰 가중치 부여
        reason = "핵심 법규(HIPAA/GDPR 등) 준수 여부가 불명확하여 치명적인 리스크가 감지되었습니다.";
    }

    // 최종 점수를 100점 만점으로 정규화하고, 임계치를 설정합니다.
    const finalScore = Math.min(Math.max(score, 20), 95);
    return { score: parseFloat(finalScore.toFixed(2)), reason };
};

// --- 3. Core State Machine Logic ---

/**
 * 사용자의 입력 데이터를 기반으로 '시스템적 생존 위협'을 분석하여 게이트키퍼 상태를 결정합니다.
 * @param {UserInputData} input - 사용자에게서 받은 초기 데이터.
 * @returns {Promise<RiskReportPayload>} 최종 리스크 보고서 페이로드.
 */
export const analyzeSystemicRisk = async (input) => {
    // 1. 분석 엔진 호출 및 대기 (State Transition: INPUT_CAPTURED -> ANALYZING)
    const lossMeterData = await mockExternalApiCall(input);

    let riskLevel;
    let isGatekeeperTriggered = false;
    let nextState = SystemState.RESULT_DISPLAYED;

    // 2. 리스크 점수에 따른 게이트키퍼 로직 실행 (The Core Logic)
    if (lossMeterData.score >= 75) {
        // [Critical Gatekeeper] - 시스템 생존에 직접 위협이 되는 경우
        riskLevel = RiskLevel.CRITICAL_GATEKEEPER;
        isGatekeeperTriggered = true;
        nextState = SystemState.INTERVENTION_REQUIRED; // 결제 강제 유도 상태로 전환
    } else if (lossMeterData.score >= 40) {
        // [Warning Gatekeeper] - 경고 단계, 즉시 액션 필요
        riskLevel = RiskLevel.WARNING;
        nextState = SystemState.INTERVENTION_REQUIRED; // 추가 진단 요청 유도 상태로 전환
    } else {
        // [Safe State] - 일단 안정적이지만, '무료 진단'을 통해 더 큰 공포를 주입할 여지 탐색
        riskLevel = RiskLevel.SAFE;
        nextState = SystemState.RESULT_DISPLAYED; // 리포트만 보여주고 끝낼 것인가? (전환율 최적화 필요)
    }

    // 3. 최종 페이로드 구성 및 반환
    return {
        riskLevel,
        nextState,
        lossMeterData: { score: lossMeterData.score, reason: lossMeterData.reason },
        isGatekeeperTriggered
    };
};

export const getRiskLevelDisplay = (level: RiskLevel): string => {
    switch(level) {
        case RiskLevel.SAFE: return "✅ Green Zone - 안전";
        case RiskLevel.WARNING: return "⚠️ Yellow/Red Flash - 경고!";
        case RiskLevel.CRITICAL_GATEKEEPER: return "🚨 Red Zone - 생존 위협 발생! 즉시 조치 필요.";
    }
};

// ----------------------------------------------------
// NOTE: 이 서비스 파일은 모든 프론트엔드 컴포넌트에서 비동기적으로 호출되어야 합니다.
// ----------------------------------------------------