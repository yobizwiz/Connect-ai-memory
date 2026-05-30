// pages/api/risk/transmit-failure.ts
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * [Mock Endpoint 2/3] L_max 계산 API - 데이터 전송 실패 시나리오 (Data Transmission Failure)
 * @description 외부 시스템과의 통신 오류를 가정하여, 일부 데이터만 부분적으로 반환하며 경고 메시지를 포함합니다.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const mockErrorResponse = {
    success: false, // 실패 플래그 명시
    timestamp: new Date().toISOString(),
    error_code: 'DATA_TXN_FLAW_403', // 고유 에러 코드
    severity: 'WARNING', // 경고 레벨
    message: '⚠️ DATA TRANSMISSION FAILURE: Key compliance metrics were lost during transfer. Partial data available.', 
    partial_data: {
      compliance_check: 'Incomplete', // 불완전한 데이터만 반환
      estimated_max_loss_lmax: parseFloat((Math.random() * 5000 + 100).toFixed(2)), // 최소 $100~$5,100 수준으로 급락
    },
  };

  // HTTP Status는 4xx 대역을 사용하거나 200 OK와 함께 에러 페이로드를 포함하여 시스템 복잡성을 높입니다.
  res.status(200).json(mockErrorResponse); 
}