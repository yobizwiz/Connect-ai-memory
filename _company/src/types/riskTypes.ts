/**
 * @module riskTypes
 * 리스크 엔진 및 Paywall 컴포넌트에서 사용되는 핵심 타입 정의 파일.
 */

export type RiskDataInput = {
    industry: string; // 예: 'Financial Services', 'Tech' 등
    duration: number;  // 운영 기간 (년)
};

export type StatusLevel = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * 리스크 분석의 최종 결과 구조. 이 구조가 Paywall UI를 구동합니다.
 */
export interface AnalysisResult {
    riskScore: number; // 0.0 ~ 10.0
    status: StatusLevel;
    financialLossEstimate: number; // $ 단위로 추정된 재무적 손실액 (USD)
    recommendedSolutionCost: number; // 최소한의 해결 비용/보험료 ($)
    timeOpportunityCost: number; // 시간적 기회비용 ($)
    summaryText: string; // 사용자에게 보여줄 공포 유발 요약 텍스트
}

// 추가 타입 정의는 필요에 따라 여기에 추가합니다.