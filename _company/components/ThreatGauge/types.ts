/**
 * components/ThreatGauge/types.ts
 * @description 시스템 무결성 점수와 상태 정의
 */

// TRE: Threat Risk Evaluation Score (0-100)
export type TREScore = number;

// Gauge State Definitions
export enum GaugeState {
    NORMAL = 'Normal',   // < 50
    WARNING = 'Warning', // 50 - 79
    CRITICAL = 'Critical'  // >= 80
}

/**
 * @interface ComponentProps
 * ThreatGauge 컴포넌트에 필요한 props 정의
 */
export interface ThreatGaugeProps {
    initialScore: TREScore;
    onDiagnosisRequested: (score: TREScore) => void; // 모달 전환 핸들러
}