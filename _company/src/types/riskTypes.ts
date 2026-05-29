/**
 * @description 시스템 리스크 측정 관련 타입 정의 (TypeScript Strict Mode 준수)
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskMetrics {
  totalRiskExposureUSD: number; // 총 위험 노출도 ($TRE$)
  riskLevel: RiskLevel;         // 현재 리스크 레벨
  structuralGapFound: boolean; // 구조적 공백 발견 여부
}

/**
 * @description 임의의 사용자 데이터로부터 TRE를 계산하는 핵심 비즈니스 로직.
 * (이 함수가 실제로는 백엔드의 수학적 모델을 반영합니다.)
 */
export function calculateTRE(data: any): RiskMetrics {
  // 예시 로직: 데이터 내에 'PII'와 'Lack of Audit Log' 키워드가 모두 있으면 위험도를 급상승시킵니다.
  let baseScore = 10_000; // 기본 노출도 (USD)

  if (data?.containsPII && data?.hasComplianceGap === false) {
    baseScore += 8_000;
  }
  if (data?.lacksAuditLog || typeof data.processingFlow === 'undefined') {
     baseScore += 15_000; // 구조적 공백 발견 시 큰 폭 상승
  }

  const totalRiskExposureUSD = baseScore * Math.random() * 1.2;

  let riskLevel: RiskLevel;
  if (totalRiskExposureUSD >= 30_000) {
    riskLevel = 'CRITICAL'; // 임계치 초과
  } else if (totalRiskExposureUSD >= 15_000) {
    riskLevel = 'HIGH';
  } else if (totalRiskExposureUSD >= 5_000) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }

  return {
    totalRiskExposureUSD: parseFloat(totalRiskExposureUSD.toFixed(2)),
    riskLevel: riskLevel,
    structuralGapFound: totalRiskExposureUSD >= 15_000,
  };
}