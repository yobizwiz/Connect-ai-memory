// types/index.ts (가정된 타입 정의를 위해 주석으로 남김)
// interface RiskInputs {
//   dataVolumeGB: number; // 데이터 볼륨 (예시 변수)
//   jurisdiction: string;  // 관할 지역 (예: GDPR, CCPA 등)
//   complianceGapScore: number; // 준수 격차 점수
// }

import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * @description 사용자의 입력 변수를 받아 재무적 손실액 Y를 계산하고 진단 보고서 발급 가능 여부를 판정하는 API 엔드포인트.
 * [근거: 🏢 회사 정체성, Self-RAG] 시스템적 생존 위협 체감에 필요한 핵심 백엔드 로직입니다.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // POST 요청만 허용합니다. GET으로 민감 데이터가 유출되는 것을 방지해야 합니다.
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed. Please use POST." });
    }

    const inputs = req.body;

    // 1. 입력 값 유효성 검사 (Guard Clause)
    if (!inputs || typeof inputs.dataVolumeGB !== 'number' || !inputs.jurisdiction || typeof inputs.complianceGapScore !== 'number') {
        return res.status(400).json({ error: "Invalid input parameters provided." });
    }

    try {
        // 2. 핵심 로직: 재무적 손실액 Y 계산 (가상의 복잡한 비즈니스 로직)
        const calculatedY = await calculateFinancialLossY(inputs);

        // 3. 보고서 발급 가능 여부 판정 및 상태 반환
        const canApplyForReport = checkEligibilityForReport(calculatedY, inputs);

        return res.status(200).json({
            success: true,
            riskScore: inputs.complianceGapScore,
            calculatedLossY: calculatedY, // Y 값을 전송하여 프론트가 사용 가능 여부를 결정하게 함
            isEligible: canApplyForReport,
            message: `진단 결과 분석 완료. 예상 손실액은 ${Math.round(calculatedY).toLocaleString()}원입니다.`
        });

    } catch (error) {
        console.error("API Error in calculate-risk:", error);
        return res.status(500).json({ success: false, error: "Internal server error during risk calculation." });
    }
}


/**
 * @description 가상의 복잡한 재무적 손실액 Y를 계산하는 핵심 함수 (비즈니스 로직 분리)
 * @param inputs 사용자 입력 변수 객체
 * @returns 예상되는 총 재무적 손실액 (Number)
 */
async function calculateFinancialLossY(inputs: any): Promise<number> {
    // 실제로는 DB 조회, 외부 API 호출 등이 들어가는 복잡한 비동기 과정이 필요합니다.
    await new Promise(resolve => setTimeout(resolve, 800)); // 네트워크 지연 시뮬레이션

    let baseLoss = inputs.dataVolumeGB * 25; // 데이터 볼륨 기반 초기 손실 (가중치 상향)
    
    // 뉴욕 법률 기반 페널티 구조 반영 (NYDFS 및 NY SHIELD)
    let compliancePenalty = 0;
    if (inputs.jurisdiction === 'NYDFS') {
        compliancePenalty = 150000; // NYDFS 23 NYCRR 500 위반 기본 페널티 (금융권 타격 최악 시나리오)
    } else if (inputs.jurisdiction === 'NY_SHIELD') {
        compliancePenalty = 75000; // NY SHIELD Act 위반 기본 민사 페널티 (개인정보 무단 노출)
    } else if (inputs.jurisdiction === 'GDPR') {
        compliancePenalty = 100000;
    } else {
        compliancePenalty = 50000;
    }
    
    // 준수 격차 점수에 따른 기하급수적 리스크 증가 적용 (공포감 극대화)
    const systemicRiskFactor = Math.pow(inputs.complianceGapScore / 100, 2); 

    let totalY = baseLoss + compliancePenalty + (systemicRiskFactor * 250000);

    // 최소 손실액 보장 로직
    return parseFloat((totalY).toFixed(2)); 
}


/**
 * @description 계산된 Y와 입력 변수를 바탕으로 진단 보고서 발급 자격 여부를 판정합니다.
 * [근거: 🏢 회사 정체성] '시스템적 생존 위협' 체감에 맞춰, 단순히 돈을 많이 벌었다고 버튼이 안 눌리게 설계해야 합니다.
 */
function checkEligibilityForReport(yValue: number, inputs: any): boolean {
    // 예시 로직: 손실액 Y가 일정 임계치 이상이고, 특정 조건(예: 데이터 볼륨)을 만족할 때만 가능하다고 설정.
    const MIN_Y_THRESHOLD = 1000; // 최소한의 위협 규모 기준
    return yValue >= MIN_Y_THRESHOLD && inputs.dataVolumeGB > 5; 
}

export const calculateRiskInputsSchema = {
    dataVolumeGB: "number",
    jurisdiction: "string",
    complianceGapScore: "number"
};