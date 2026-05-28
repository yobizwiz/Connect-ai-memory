/**
 * 🚨 YOBIZWIZ 리스크 대시보드 타입 정의 (Source of Truth)
 * 이 인터페이스들은 모든 데이터 흐름의 계약(Contract) 역할을 합니다.
 */

export type RiskStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';

/**
 * @typedef {object} SystemRiskPayload
 * 백엔드 API가 전송하는 구조화된 리스크 데이터 페이로드입니다.
 */
export interface SystemRiskPayload {
    // 1. 핵심 상태 정보 (State Machine)
    status: RiskStatus;
    level: number; // 1 (Normal), 2 (Warning), 3 (Critical)
    
    // 2. 리스크 지표 (Metrics)
    treValue: number;     // Total Financial Loss Estimate (핵심 값)
    pigScore: number;     // KPI 2: Potential Impact Gap Score
    arsIndex: number;     // KPI 3: Attack Resilience Score
    cdrRatio: number;     // KPI 4: Compliance Deviation Ratio
    ailFactor: number;    // KPI 5: Artificial Intelligence Loss Factor
    ksdDeviation: number; // KPI 6: Knowledge System Decay Rate

    // 3. 시스템 메시지 및 경고 플래그
    message: string;      // 사용자에게 보여줄 경고 문구 (예: "Yellow Zone 진입")
    isGlitchActive: boolean;// Yellow/Red 구간에서 Glitch Effect 활성화 여부
}

/**
 * @typedef {object} StateChangeLog
 * 상태 변화 발생 시 로깅되는 구조체입니다.
 */
export interface StateChangeLog {
    timestamp: string;
    previousStatus: RiskStatus | null;
    newStatus: RiskStatus;
    triggerReason: string; // 예: "TRE가 임계치 1.5배 초과"
}

/**
 * @typedef {object} CombinedDashboardData
 * 컴포넌트에 전달되는 최종 조합 데이터 구조입니다.
 */
export interface CombinedDashboardData extends SystemRiskPayload, StateChangeLog {}