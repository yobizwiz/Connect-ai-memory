/**
 * @description Core Business Logic Layer (Risk Calculation & Status Determination)
 * 이 파일은 어떠한 외부 프레임워크 의존성 없이 순수하게 비즈니스 로직만을 처리합니다.
 */

import { UserInputData, RiskCalculationResult, PaywallStatus } from '../types/apiTypes';
// Researcher님이 정의한 스키마를 메모리상에서 불러왔다고 가정하고 상수로 정의합니다.
const LMAX_WEIGHTS = {
  REGULATORY: 0.6, // 규제 위반이 가장 큰 비중을 차지해야 함 (가장 불안감 유발)
  LITIGATION: 0.3,
  OPERATIONAL: 0.1,
};

/**
 * @description Lmax 점수를 계산하는 핵심 로직.
 * L_max = (RegFine * W_reg) + (LitCost * W_lit) + (OpLoss * W_op)
 * @param userData - 사용자로부터 받은 구조적 위험 데이터.
 * @returns 총 위험 노출도 점수 (0~100).
 */
export const calculateLmaxScore = (userData: UserInputData): number => {
  // 1. 각 변수에 가상의 재무적 잠재 손실액(Potential Loss)을 매핑합니다.
  const regulatoryFinePotential = userData.piiLeakageRecords * 50 + userData.complianceGapsFound * 20; // PII Leakage가 핵심 driver
  const litigationCostPotential = userData.operationalFailureInstances * 30;
  const operationalLossPotential = Math.max(0, (userData.piiLeakageRecords + userData.complianceGapsFound) / 5);

  // 2. 가중치 기반으로 최종 L_max 점수를 계산합니다.
  let lmaxScore = (regulatoryFinePotential * LMAX_WEIGHTS.REGULATORY) + 
                   (litigationCostPotential * LMAX_WEIGHTS.LITIGATION) +
                   (operationalLossPotential * LMAX_WEIGHTS.OPERATIONAL);

  // 점수는 0점에서 100점 사이로 클램핑 (Clamp)하여 안정성을 확보합니다.
  return Math.min(100, Math.max(0, Math.round(lmaxScore)));
};


/**
 * @description Lmax 점수를 기반으로 Paywall 상태를 결정하고 메시지를 생성합니다.
 * 현빈님의 비즈니스 로직을 구현합니다. (Critical/Alert/Compliant)
 * @param score - 계산된 총 위험 노출도 점수 (0~100).
 * @returns { status: PaywallStatus, message: string }
 */
export const determinePaywallStatus = (score: number): { 
  status: 'GREEN_COMPLIANT' | 'YELLOW_ALERT' | 'RED_CRITICAL';
  message: string;
} => {
  let status: 'GREEN_COMPLIANT' | 'YELLOW_ALERT' | 'RED_CRITICAL';
  let message: string;

  if (score >= 80) {
    // Critical Zone: 공포 유발, 즉각적 개입 강제.
    status = 'RED_CRITICAL';
    message = "🚨 CRITICAL FAILURE ZONE: 현재 비즈니스 구조가 심대한 위협에 노출되어 있습니다. 즉시 전문 진단 및 해결책이 필요합니다. (Lmax 기반)";
  } else if (score >= 50) {
    // Alert Zone: 경고, 행동 촉구.
    status = 'YELLOW_ALERT';
    message = "⚠️ ALERT ZONE: 잠재적인 구조적 결함(Structural Gap)이 감지되었습니다. 미검증 리스크를 포착하고 개선해야 합니다.";
  } else {
    // Compliant Zone: 안도감과 동시에 경계심 부여 (사각지대 경고).
    status = 'GREEN_COMPLIANT';
    message = "✅ BASELINE STATUS: 현재는 안정적이나, 잠재적인 사각지대에 리스크가 존재합니다. 선제적 관리가 필요합니다.";
  }

  return { status, message };
};


/**
 * @description 통합 위험 분석을 수행하고 최종 결과를 구조화하여 반환하는 메인 함수.
 * 모든 로직의 오케스트레이션 역할을 합니다.
 * @param userData - 사용자 입력 데이터.
 * @returns 최종 RiskCalculationResult 객체.
 */
export const calculateRiskReport = (userData: UserInputData): RiskCalculationResult => {
  // 1. Lmax 점수 계산
  const lmaxScore = calculateLmaxScore(userData);

  // 2. Paywall 상태 및 메시지 결정
  const statusAndMessage = determinePaywallStatus(lmaxScore);

  // 3. 최종 결과 구조화
  return {
    totalRiskExposureScore: lmaxScore,
    paywallStatus: statusAndMessage.status,
    userFacingMessage: statusAndMessage.message,
    details: {
      regulatoryFinePotential: Math.round(lmaxScore * 0.5), // 임시 비율
      litigationCostPotential: Math.round(lmaxScore * 0.3),
      operationalLossPotential: Math.round(lmaxScore * 0.2),
    }
  };
};

/**
 * @description 단일 진단 테스트 및 통합 리스크 판정을 위한 입력 인터페이스
 */
export interface RiskInput {
  piiLeakageRecords?: number;
  complianceGapsFound?: number;
  operationalFailureInstances?: number;
  score?: number;
}

/**
 * @description 리스크 계산 결과와 페이월 트리거 여부를 조합한 통합 리스크 판정 구조체
 */
export interface RiskAggregatedResult {
  level: 'Normal' | 'Warning' | 'Red Zone';
  isPaywallTriggered: boolean;
}

/**
 * @description 비동기적으로 리스크 데이터를 분석하여 리스크 영역(Normal/Warning/Red Zone)과 페이월 트리거 여부를 판정합니다.
 * @param data - 진단할 리스크 정보
 * @returns 리스크 영역 등급 및 페이월 트리거 여부
 */
export const calculateAggregatedRiskScoreAndGate = async (data: RiskInput): Promise<RiskAggregatedResult> => {
  // 가드 로직: 데이터가 비어있거나 무효한 스코어 범위인 경우 구조적 예외를 던집니다.
  if (!data) {
    throw new Error("RISK_ENGINE_ERROR");
  }

  if (
    data.score === undefined &&
    data.piiLeakageRecords === undefined &&
    data.complianceGapsFound === undefined &&
    data.operationalFailureInstances === undefined
  ) {
    throw new Error("RISK_ENGINE_ERROR");
  }

  if (data.score !== undefined && (data.score < 0 || data.score > 1.0)) {
    throw new Error("RISK_ENGINE_ERROR");
  }

  let finalScore = 0;
  if (data.score !== undefined) {
    finalScore = data.score;
  } else {
    // Lmax 점수 기반 계산 후 0.0 - 1.0 범위로 규격화
    const normalizedInput = {
      piiLeakageRecords: data.piiLeakageRecords || 0,
      complianceGapsFound: data.complianceGapsFound || 0,
      operationalFailureInstances: data.operationalFailureInstances || 0,
    };
    finalScore = calculateLmaxScore(normalizedInput) / 100;
  }

  let level: 'Normal' | 'Warning' | 'Red Zone';
  let isPaywallTriggered = false;

  if (finalScore < 0.5) {
    level = 'Normal';
  } else if (finalScore < 0.85) {
    level = 'Warning';
  } else {
    level = 'Red Zone';
    isPaywallTriggered = true;
  }

  return { level, isPaywallTriggered };
};