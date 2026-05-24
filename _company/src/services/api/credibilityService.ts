/**
 * 🚨 WARNING: This is a STUB SERVICE layer. 
 * Actual backend integration must replace the mock logic below.
 */

import { RiskData } from '@/types/data'; // Assume this type exists

// 시뮬레이션용 리스크 데이터 구조 정의 (Designer Spec 기반)
export const generateMockRiskData = (): RiskData => ({
    reportId: `RISK-${Date.now()}`,
    overallScore: 0.85, // 1.0이 최고 위험
    isCritical: true,
    riskDetails: [
        { name: "Compliance Gap", level: "CRITICAL", scoreChange: +0.25, description: "핵심 법규 변경에 대한 사각지대 발생 (Systemic Failure)." },
        { name: "Data Leakage Risk", level: "HIGH", scoreChange: +0.15, description: "비정형 데이터 저장으로 인한 잠재적 유출 경로 노출." },
        { name: "Process Bottleneck", level: "MEDIUM", scoreChange: +0.05, description: "수작업 검증 단계로 인한 병목 현상 및 지연 리스크." },
    ],
    analysisTimestamp: new Date().toISOString(),
});

/**
 * API Stub: 고객의 구조적 취약점을 분석하여 리스크 데이터를 가져옵니다.
 * @param clientData - 결제 시도 사용자 또는 회사 데이터 (가정)
 * @returns Promise<RiskData>
 */
export const fetchCredibilityReport = async (clientData: any): Promise<RiskData> => {
    console.log(`[API Stub] Analyzing risk for client data...`);
    
    // 3초 지연 시뮬레이션 (사용자에게 '분석 중'이라는 전문적인 시간적 압박감 제공)
    await new Promise<void>(resolve => setTimeout(() => resolve(), 3000));

    // 실제 백엔드 호출 대신 Mock 데이터를 반환합니다.
    return generateMockRiskData();
};