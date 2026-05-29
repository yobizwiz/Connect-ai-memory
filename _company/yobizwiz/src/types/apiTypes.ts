/**
 * @description API Request & Response Types (TypeScript Contracts)
 */

// --- 1. Input Data Structure ---
export interface UserInputData {
  /** PII Leakage records count - R001 기반 */
  piiLeakageRecords: number;
  /** Compliance Gaps found count - 구조적 결함 건수 */
  complianceGapsFound: number;
  /** Operational Failure instances (e.g., system downtime, missed deadlines) */
  operationalFailureInstances: number;
}

// --- 2. Output Data Structure ---
export interface RiskCalculationResult {
  /** Lmax Score: 최대 재무 손실액 지수 (0 ~ 100) */
  totalRiskExposureScore: number;
  /** Paywall Status Code: 현빈이 정의한 상태 코드 (e.g., RED_ZONE, YELLOW_ALERT) */
  paywallStatus: 'GREEN_COMPLIANT' | 'YELLOW_ALERT' | 'RED_CRITICAL';
  /** 사용자에게 노출될 핵심 메시지 (Copy Hook) */
  userFacingMessage: string;
  /** 계산된 상세 위험 지표 (디버깅 및 보고서용) */
  details: {
    regulatoryFinePotential: number;
    litigationCostPotential: number;
    operationalLossPotential: number;
  };
}

// --- 3. Status Constants ---
export const PaywallStatus = {
  RED_CRITICAL: 'RED_CRITICAL',
  YELLOW_ALERT: 'YELLOW_ALERT',
  GREEN_COMPLIANT: 'GREEN_COMPLIANT',
} as const;