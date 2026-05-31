import { NextApiRequest, NextApiResponse } from 'next';
import { calculateStructuralRisk } from '../../services/RiskEngineService';

/**
 * POST /api/risk-assessment
 * 외부 데이터를 받아 구조적 리스크 평가를 수행하는 엔드포인트입니다.
 * @param req - 요청 객체 (body에 externalData 포함 예상)
 * @param res - 응답 객체
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // 1. Method 및 Body 검증 (Robustness Check)
    if (req.method !== 'POST') {
        return res.status(405).json({ message: "Method Not Allowed. Only POST requests are supported." });
    }

    const externalData = req.body;

    // 2. 필수 데이터 검증 (Guard Clause)
    if (!externalData || typeof externalData !== 'object') {
        return res.status(400).json({ message: "Bad Request: Missing or invalid 'externalData' payload." });
    }

    try {
        // 3. 핵심 로직 실행 (Service Layer 호출)
        const result = calculateStructuralRisk(externalData);
        
        // 4. 성공 응답 반환 (API Contract 준수)
        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("Risk Assessment Failed:", error);
        // 서버 측 오류는 상세 정보 노출을 지양합니다.
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error during risk calculation." 
        });
    }
}