// src/api/riskService.ts

/** @interface RiskScoreResult */
export interface RiskScoreResult {
    treScore: number; // Time-Risk Amplification Score (0 to 100)
    isCritical: boolean; // Paywall Barrier 발동 여부
    reportData: Record<string, any>; // 추가 리포트 데이터
}

/** @enum State enum for clarity. */
export enum PitchDeckState {
    CALM_DECEPTION = 'Calm Deception', // 초기 상태 (안심)
    WARNING_ALERT = 'Warning Alert',   // 경고 단계 (위협 노출)
    PAYWALL_BARRIER = 'Paywall Barrier' // 강제 결제장벽 (최종 목적지)
}

/**
 * Mock API: 규제 리스크를 분석하여 TRE 점수와 시스템 상태를 반환합니다.
 * @param inputData 사용자가 진단하려는 데이터를 시뮬레이션합니다.
 * @returns Promise<RiskScoreResult>
 */
export const fetchSystemicRiskAnalysis = async (inputData: Record<string, any>): Promise<RiskScoreResult> => {
    console.log("[API Mock] Running Systemic Risk Analysis...");

    // --- [시뮬레이션 로직 시작] ---
    let tre: number;
    let isCritical: boolean;
    
    // Mock 데이터 기반으로 TRE 점수 결정 (예시)
    if (inputData?.hasRegulatoryGap === true && inputData?.dataVolume > 100) {
        tre = Math.floor(Math.random() * 40) + 60; // 높게 설정: 60~100점
        isCritical = tre >= 85; // Critical Threshold (높은 점수일수록 Paywall 발동 가능성 증가)
    } else if (inputData?.hasRegulatoryGap === true && inputData?.dataVolume > 10) {
        tre = Math.floor(Math.random() * 30) + 40; // 중간 설정: 40~70점
        isCritical = tre >= 85;
    } else {
        tre = Math.floor(Math.random() * 20); // 낮게 설정: 0~19점
        isCritical = false;
    }

    // 임계치 로직 (Hardcoded for demonstration)
    const CRITICAL_THRESHOLD = 85; 
    const WARNING_THRESHOLD = 40;

    if (tre >= CRITICAL_THRESHOLD) {
        isCritical = true;
    } else if (tre >= WARNING_THRESHOLD) {
        // 경고 단계는 Critical은 아니지만, Warning 임계치를 넘으면 '경고'로 판단합니다.
        isCritical = false; 
    }

    // --- [시뮬레이션 로직 끝] ---
    
    return {
        treScore: tre,
        isCritical: isCritical,
        reportData: {
            regulatoryGapsFound: inputData?.hasRegulatoryGap ? 'Yes' : 'No',
            timeLossEstimateHrs: Math.ceil(Math.random() * 5) + 1, // 최소 1~6시간 손실 추정
        }
    };
};

/**
 * 상태 전이에 따른 Paywall 메시지를 생성합니다.
 * @param score 현재 점수
 * @param lossEstimateHrs 시간 손실 추정치
 * @returns 강제 CTA 카피
 */
export const generatePaywallCopy = (score: number, lossEstimateHrs: number): string => {
    return `🚨 [SYSTEM ALERT] 당신의 리스크 점수 (${score}점)는 즉각적인 조치를 요구합니다. ${lossEstimateHrs}시간 이상의 재정적 손실을 막기 위해 yobizwiz 시스템 인증이 필수입니다. 지금 바로 보안 패키지 구독을 진행하십시오.`;
};

export { PitchDeckState };