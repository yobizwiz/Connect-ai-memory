/**
 * @description API Controller Layer (Express Handler)
 * 요청 처리, 에러 포착 및 응답 구조화만을 담당합니다.
 */

import { Request, Response } from 'express';
import { calculateRiskReport } from '../services/riskService';
import { UserInputData } from '../types/apiTypes';


/**
 * @description POST /api/calculate-risk 엔드포인트 핸들러
 * 사용자가 제공한 데이터를 받아 구조적 위험 노출도를 계산하고 Paywall 상태를 반환합니다.
 */
export const calculateRiskEndpoint = async (req: Request, res: Response) => {
  // 1. 요청 유효성 검증 및 타입 가드 (Input Validation & Type Guarding)
  const userData: UserInputData = req.body;

  if (!userData || typeof userData.piiLeakageRecords !== 'number' || !isFinite(userData.piiLeakageRecords)) {
    // 필수 필드 누락 또는 잘못된 타입의 경우 400 Bad Request 반환
    return res.status(400).json({ 
      error: "Invalid input data format.", 
      message: "요청 바디에 'piiLeakageRecords'를 포함한 모든 필수 데이터 필드를 올바른 숫자로 제공해야 합니다." 
    });
  }

  try {
    // 2. 핵심 비즈니스 로직 실행 (Service Layer 호출)
    const result = calculateRiskReport(userData);

    // 3. 성공 응답 반환 (200 OK)
    return res.status(200).json({
      success: true,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        source_version: '1.0.0' // 버전 관리를 위한 메타데이터 추가 (시니어 스타일)
      }
    });

  } catch (error) {
    // 4. 예상치 못한 오류 발생 시 처리 (500 Internal Server Error)
    console.error("Risk calculation failed:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "위험 분석 중 서버 내부 로직 오류가 발생했습니다. 관리자에게 문의하십시오."
    });
  }
};