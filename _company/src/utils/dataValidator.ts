/**
 * @module dataValidator
 * @description 사용자 입력 데이터를 받아 구조적 리스크를 검증하고, 실패 시 상세한 경고 목록을 반환합니다.
 * 이 함수는 단순한 유효성 검사를 넘어, yobizwiz의 핵심 가치인 '시스템적 생존 위협'을 주입하는 역할을 합니다.
 */

export interface RiskDetail {
  category: string;       // 리스크 카테고리 (예: 규제 준수, 재무 건전성)
  severity: 'High' | 'Medium' | 'Low'; // 위험도
  description: string;    // 발견된 문제에 대한 구체적인 설명
  impactEstimate?: string; // 예상되는 최소/최대 금전적 손실액 (예: 5천만 원 이상)
}

/**
 * 입력 데이터셋을 검증하고, 구조적 리스크 목록을 반환합니다.
 * @param data - 사용자가 제출한 시뮬레이션 데이터를 담은 객체.
 * @returns {RiskDetail[]} 발견된 모든 위험 요소의 배열. 빈 배열일 경우 완벽함.
 */
export const validateStructuralData = (data: { complianceScore: number; revenueProjection: number; marketCoverage: string }): RiskDetail[] => {
  const risks: RiskDetail[] = [];

  // 1. 규제 준수 점검 (Compliance Check) - 가장 중요함
  if (data.complianceScore < 70) {
    risks.push({
      category: '규제 준수 취약성',
      severity: 'High',
      description: `현재 법적 컴플라이언스 점수(${data.complianceScore})는 산업 평균 대비 심각하게 낮습니다. 이는 최근 개정된 [OOO 규제]의 핵심 요건을 충족하지 못함을 의미합니다.`,
      impactEstimate: '최소 1억 원 이상의 벌금 및 운영 중단 리스크'
    });
  }

  // 2. 재무 건전성 예측 (Financial Projection) - 금액 제시가 핵심
  const minimumViableRevenue = 50000; // 임계치 설정
  if (data.revenueProjection < minimumViableRevenue) {
    risks.push({
      category: '재무 구조 리스크',
      severity: 'High',
      description: `예측 수익률(${Math.round(data.revenueProjection).toLocaleString()}원)이 지속 가능한 최소 기준선(${minimumViableRevenue.toLocaleString()}원)에 크게 미달합니다. 현 상태로는 3개월 내 자본 잠식 위험에 노출됩니다.`,
      impactEstimate: '최소 5천만 원의 재무적 손실 예상'
    });
  }

  // 3. 시장 커버리지 및 확장성 (Market Coverage) - 추상적인 위협
  if (!['글로벌', '국내외'].includes(data.marketCoverage)) {
     risks.push({
      category: '시장 구조적 한계',
      severity: 'Medium',
      description: `현재 시장 커버리지(${data.marketCoverage})는 지정학적 변동성을 고려할 때 지나치게 좁습니다. 이는 단일 지역 리스크에 대한 높은 노출도를 의미합니다.`,
    });
  }

  // 모든 위험 목록을 반환
  return risks;
};