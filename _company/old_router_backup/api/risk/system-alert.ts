// pages/api/risk/system-alert.ts
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * [Mock Endpoint 3/3] L_max 계산 API - 시스템 경고 시나리오 (System Integrity Breach)
 * @description 내부 시스템의 무결성 문제(Integrity Breach)를 가정하여, 값이 비정상적이거나 계산 자체가 실패했음을 알립니다.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const mockCriticalResponse = {
    success: false,
    timestamp: new Date().toISOString(),
    alert_code: 'SYS_CORE_FAIL_0x7B', // 치명적 에러 코드 (Hex format 강조)
    severity: 'CRITICAL', // 최고 경고 레벨
    message: '🚨 SYSTEM INTEGRITY BREACH DETECTED: Core calculation engine failed validation. MANUAL REVIEW REQUIRED.', 
    lmax_status: 'UNRELIABLE', // 신뢰 불가 상태
    recommendation: 'DO NOT PROCEED WITH PURCHASE UNTIL MANUAL AUDIT IS COMPLETE.',
  };

  // 치명적 오류는 HTTP Status Code를 직접 사용하여 경고합니다.
  res.status(400).json(mockCriticalResponse); 
}