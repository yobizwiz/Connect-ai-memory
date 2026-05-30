// src/components/StatusGauge/types.ts

/**
 * 리스크 점수 게이지의 상태 정의를 위한 Enum 타입입니다.
 */
export enum RiskStatus {
  NORMAL = 'Normal',      // 정상 범위 (초기 진입)
  WARNING = 'Warning',    // 경고 단계 (임계값 초과, Yellow Zone)
  CRITICAL = 'Critical'   // 위기 단계 (최대 위험, Red Zone/Paywall 임박)
}

/**
 * StatusGauge 컴포넌트가 받을 Props 정의입니다.
 */
export interface StatusGaugeProps {
  /** 현재 측정된 리스크 점수 (0 ~ 100). */
  currentRiskScore: number;
  /** A/B 테스트를 위한 그룹 ID ('control' 또는 'treatment'). */
  abTestGroup: string;
}

/**
 * 가상의 API 호출 결과를 정의합니다. 실제 구현 시에는 서버 응답 스키마를 따라야 합니다.
 */
export interface DiagnosisReport {
    reportId: string;
    diagnosisDate: string;
    riskScoreSummary: number;
    actionRequired: 'Consultation' | 'Investment';
}

export type GaugeStatus = RiskStatus;