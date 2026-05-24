// src/utils/riskCalculators.ts: QLoss 시간 감쇠 및 증폭 로직 관리 (핵심 비즈니스)

/**
 * 초기 리스크 손실액을 계산하는 함수. (기존 구현 활용 가정)
 */
export const calculateInitialLoss = (formData: FormData): number => {
    // ... (Existing complex calculation logic using formData)
    console.log("Calculating initial loss...");
    return 1000; // Mock Initial Loss $1,000
};

/**
 * 시간 경과에 따른 리스크 손실액(QLoss)을 증폭시키는 핵심 로직. (Time Decay)
 * @param prevLoss 이전의 손실액
 * @param currentTime 현재 시간 (ms)
 * @returns 증가된 QLoss 값
 */
export const calculateTimeDecay = (prevLoss: number, currentTime: number): number => {
    const elapsedSeconds = Math.floor((currentTime - window.initialLoadTime) / 1000); // 가정된 초기 로드 시간 사용
    if (elapsedSeconds < 5) return prevLoss;

    // Time Decay Formula: Loss increases by a factor based on the logarithm of time elapsed.
    const decayFactor = Math.pow(2, elapsedSeconds / 60); // 매 분마다 2의 승수로 증가
    let newLoss = prevLoss * decayFactor;

    // Max QLoss Cap (e.g., $10,000)
    return Math.min(newLoss, 10000);
};

export const calculateFinalAuditPrice = (qLoss: number): number => {
    // Paid Audit Price is a premium calculated based on the maximum detected risk.
    const premiumMultiplier = 0.8; // QLoss의 80%를 최소 보험료로 설정
    return qLoss * premiumMultiplier + 500; // 기본 서비스 비용 $500 추가
};