// pages/api/risk/calculate-nominal.ts
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * [Mock Endpoint 1/3] L_max 계산 API - 정상 시나리오 (Nominal Calculation)
 * @description 기본적인 리스크 점수와 최대 손실액을 반환합니다. 시스템이 안정적일 때 사용됩니다.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // 실제로는 복잡한 데이터 파이프라인과 API 호출 로직이 들어가야 합니다.
  const mockData = {
    success: true,
    timestamp: new Date().toISOString(),
    calculated_risk_score: Math.random() * 10 + 2, // 예시 점수 (2 ~ 12)
    estimated_max_loss_lmax: parseFloat((Math.random() * 500000 + 5000).toFixed(2)), // 최소 $5,000~$550,000
    compliance_check: 'Passed',
    message: 'Structural Risk Analysis Completed Successfully.',
  };

  // 성공 응답은 표준 JSON 구조를 유지합니다.
  res.status(200).json(mockData);
}