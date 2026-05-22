export type ThreatScore = {
  // 0 (안전) 부터 100 (심각) 사이의 점수입니다.
  score: number;
  details?: Record<string, number>; // 세부 위험 요소별 기여도
};

/**
 * API 응답 구조를 정의합니다. 이 객체는 모든 클라이언트(프론트엔드)가 신뢰해야 합니다.
 */
export interface RiskDiagnosisResult {
    threatScore: ThreatScore;
    riskLevel: 'Low' | 'Medium' | 'High'; // 시스템적 위험 레벨
    estimatedLossUSD: number; // 추정 재무 손실액 (미화)
    summaryMessage: string; // 사용자에게 보여줄 핵심 경고 문구
}

/**
 * API 요청 바디 구조를 정의합니다.
 */
export interface DiagnosisRequest {
  threatData: ThreatScore;
  userContext: {
    industry: string; // 예: Finance, Healthcare 등
    assetValueUSD: number; // 진단 대상 자산 가치 (필수)
  }
}