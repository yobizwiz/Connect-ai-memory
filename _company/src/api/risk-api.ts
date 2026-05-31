import { RiskScoreResult, PaywallEventLog } from '../types/paywall-state';

/**
 * [Mock API] 백엔드에서 실시간 리스크 점수를 비동기적으로 계산하는 함수를 시뮬레이션합니다.
 * 실제로는 FastAPI 엔드포인트 (e.g., /api/v1/risk/calculate) 호출이 이루어집니다.
 */
const fetchRiskScore = async (userId: string): Promise<RiskScoreResult> => {
    console.log(`[API] Starting risk calculation for user: ${userId}`);
    // 네트워크 지연 시간 시뮬레이션 (3초)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // **🚨 중요:** 여기서 실제 DB 조회 및 복잡도 계산 로직이 돌았다고 가정합니다.
    const currentComplexity = Math.random() * 1.5; // 임의 값 생성
    const isHighRisk = currentComplexity > 0.65; // 임계치 0.65

    // 리스크 결과 객체 반환
    return {
        isHighRisk: isHighRisk,
        complexityMValue: parseFloat(currentComplexity.toFixed(4)),
        estimatedLossLMax: Math.floor(Math.random() * (1_000_000) + 500_000), // $50만 ~ $100만
        recommendationMessage: isHighRisk ? "규제 준수 측면에서 치명적인 공백이 발견되었습니다." : "현재 리스크는 허용 가능한 범위 내에 있습니다.",
    };
};

/**
 * [Logging Hook] 모든 중요한 상태 전환 시 감사 로그를 기록하는 함수.
 * 이 함수는 실제로는 Audit Log Ledger (Immutable Blockchain)에 트랜잭션으로 기록되어야 합니다.
 */
export const recordAuditLog = async (event: PaywallEventLog): Promise<string> => {
    console.warn(`[AUDIT LOG] Recording immutable transaction for ${event.eventAction}...`);
    // 실제 백엔드 호출: await axios.post('/api/v1/audit/log', event);
    await new Promise(resolve => setTimeout(resolve, 500)); // 로깅 지연 시뮬레이션

    // 성공적으로 기록된 트랜잭션 해시 반환 (Proof of Action)
    return `TXN_HASH_${Math.random().toString(16).substring(2)}`;
};

export { fetchRiskScore };