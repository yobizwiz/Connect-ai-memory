/**
 * @description Safety Capital Ratio (SCR) 계산 유틸리티.
 * TMRV(Total Mitigation Risk Value)와 Lmax(Maximum Potential Loss)를 비교하여
 * 고객의 재무적 결핍을 측정합니다.
 */

interface SCRInput {
    capitalReserve: number | string;
    mitigationFactorA?: number;
    mitigationFactorB?: number;
    riskWeightC?: number;
    regulatoryComplianceScore?: number;
}

interface SCRResult {
    success: boolean;
    scr_ratio?: number;
    deficiency_amount?: number;
    code?: string;
    message?: string;
}

export function calculateSCR(params: SCRInput): SCRResult {
    // 1. 타입 검증: capitalReserve가 숫자인지 확인
    if (typeof params.capitalReserve !== 'number' || params.capitalReserve < 0) {
        return {
            success: false,
            code: 'INVALID_CAPITAL',
            message: 'capitalReserve must be a non-negative number.',
        };
    }

    // 2. 필수 입력값 검증 (5개 모두 필요)
    const requiredFields: (keyof SCRInput)[] = [
        'capitalReserve',
        'mitigationFactorA',
        'mitigationFactorB',
        'riskWeightC',
        'regulatoryComplianceScore',
    ];

    for (const field of requiredFields) {
        if (params[field] === undefined || params[field] === null) {
            return {
                success: false,
                code: 'INPUT_DEFICIT',
                message: `Missing required field: ${field}`,
            };
        }
    }

    // 3. 음수 값 검증
    if ((params.riskWeightC ?? 0) < 0) {
        return {
            success: false,
            code: 'INVALID_CAPITAL',
            message: 'riskWeightC must be a non-negative number.',
        };
    }

    // 4. SCR 계산
    const capitalReserve = params.capitalReserve as number;
    const mitigationFactorA = params.mitigationFactorA ?? 0;
    const mitigationFactorB = params.mitigationFactorB ?? 0;
    const riskWeightC = params.riskWeightC ?? 0;
    const regulatoryComplianceScore = params.regulatoryComplianceScore ?? 0;

    const totalMitigation =
        capitalReserve * (mitigationFactorA + mitigationFactorB) * (riskWeightC / 100);
    const scrRatio = totalMitigation * regulatoryComplianceScore;

    return {
        success: true,
        scr_ratio: parseFloat(scrRatio.toFixed(2)),
        deficiency_amount: Math.max(0, 15_000_000 - scrRatio),
    };
}
