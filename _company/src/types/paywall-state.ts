export type PaywallState = 'INITIAL' | 'LOADING_RISK_SCORE' | 'GATEWAY_ACTIVE' | 'PAYMENT_REQUESTED' | 'COMPLETED';

export interface RiskScoreResult {
    isHighRisk: boolean;       // 임계치 초과 여부 (핵심 플래그)
    complexityMValue: number; // 계산된 M_Complexity 값
    estimatedLossLMax: number;  // 예상 최대 재정 손실액 ($)
    recommendationMessage: string; // 사용자에게 보여줄 권위적인 메시지
}

export interface PaywallEventLog {
    timestamp: string;
    eventAction: 'DIAGNOSTIC_REQUEST' | 'LOADING_START' | 'GATEWAY_TRIGGERED' | 'PAYMENT_INITIATED' | 'FLOW_COMPLETED';
    userId: string; // 실제로는 Auth Context에서 가져와야 함
    contextData: Record<string, any>; // 어떤 데이터로 트리거 되었는지 (e.g., M_Complexity)
}