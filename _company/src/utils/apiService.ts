export interface ReportData {
    riskScore: number;
    diagnosisSummary: string[];
    isCritical: boolean;
}

/**
 * Mock API Service: e2e_simulator_api.py의 핵심 로직을 시뮬레이션합니다.
 * 이 파일은 실제로는 Backend API (Python) 호출 계층이 됩니다.
 */
export const runE2ESimulation = async (formData: any): Promise<ReportData> => {
    // 3초 지연을 주어 로딩 상태를 체감하게 만듭니다. [근거: 코다리 개인 메모리]
    await new Promise(resolve => setTimeout(resolve, 3000));

    // --- 시뮬레이션 데이터 생성 로직 시작 ---
    // 실제로는 API가 이 데이터를 계산해야 합니다.
    const simulatedRiskScore = Math.floor(Math.random() * 100); // 0~99점
    let isCritical = false;
    let statusMessage: string;

    if (simulatedRiskScore > 75) {
        // 고위험군 시나리오 강제 부여
        isCritical = true;
        statusMessage = "🚨 심각한 결함 감지: 핵심 데이터 파이프라인의 무결성이 의심됩니다. 즉시 전문가 개입 필요.";
    } else if (simulatedRiskScore > 50) {
        // 중간 위험군 시나리오
        isCritical = false; // Paywall은 $TRE$가 가장 높을 때만 강제되어야 함.
        statusMessage = "⚠️ 주의: 일부 규정 Gap이 발견되었으며, 단기적 감사가 필요합니다.";
    } else {
        // 저위험군 시나리오
        isCritical = false;
        statusMessage = "✅ 분석 결과: 현재까지는 안정적인 운영 체계를 갖추고 있습니다. 정기 감사 권장.";
    }

    const reportData: ReportData = {
        riskScore: simulatedRiskScore,
        diagnosisSummary: [
            `[Module 1] 규제 Gap 진단: ${statusMessage}`,
            `[Module 2] 시스템 영향도 분석: 현재 프로세스 X가 취약합니다.`,
            `[Module 3] 권고 조치: 전문 컨설팅이 필요하며, $199~$499의 Mini-Diagnosis를 추천합니다.`
        ],
        isCritical: isCritical
    };

    return reportData;
};