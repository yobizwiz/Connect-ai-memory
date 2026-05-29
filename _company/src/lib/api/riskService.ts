/**
 * @description [TRE] Time Risk Exposure Score 계산 서비스. 
 * 사용자 산업군, 규모 등의 비정형 데이터를 받아 구조적 리스크를 정량화하는 핵심 모듈입니다.
 * 이 로직은 단순한 조회(Lookup)가 아닌, 다중 요인 기반의 추론 과정으로 설계되어야 합니다.
 */

// --- [타입 정의] ---
export type RiskFactor = {
    riskId: string; // PII_LEAKAGE 등 구조적 식별자
    title: string;   // 위협 제목 (사용자에게 충격적으로 제시될 내용)
    severityScore: number; // 이 요인이 주는 리스크 기여도 (0~100)
    description: string; // 구체적인 위험 설명
};

export type RiskReport = {
    treScore: number;       // 최종 Time Risk Exposure Score (0-100)
    riskFactors: RiskFactor[]; // 점수에 기여한 세부 요인들
    summaryMessage: string; // 사용자에게 제시할 종합 메시지
}

export type InputMetrics = {
    industry: string;     // 산업군 (예: Finance, Healthcare, Tech)
    staffCount: number;   // 직원 수
    dataSizeGB: number;   // 처리하는 데이터 규모(TB나 GB가 아닌 단순 수치로 받음)
}

/**
 * @description mockCalculateTRE - 가상 사용자 입력값을 기반으로 TRE 점수를 계산합니다.
 * 실제 구현 시에는 외부 DB 호출 및 복잡한 통계 모델이 적용되어야 합니다.
 * @param metrics 사용자 산업, 인원수, 데이터 규모를 포함하는 구조체
 * @returns Promise<RiskReport> 최종 리스크 보고서 객체
 */
export const mockCalculateTRE = async (metrics: InputMetrics): Promise<RiskReport> => {
    console.log(`[Service] Starting TRE calculation for ${metrics.industry}...`);

    // 🚨 비동기 지연 및 긴장감 조성 로직 (Time Pressure Simulation)
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    let totalScore = 0;
    const riskFactors: RiskFactor[] = [];

    // --- [가중치 기반 리스크 계산 모듈] ---
    
    // 1. 산업군별 기본 가중치 적용 (Industry Weighting)
    let industryWeight = 30; // 기본값
    if (metrics.industry.toLowerCase().includes('healthcare')) {
        industryWeight = 45; // 의료 데이터는 구조적 리스크가 높음
    } else if (metrics.industry.toLowerCase().includes('finance')) {
        industryWeight = 40;
    }

    // 2. 직원 수 및 규모에 따른 복합 위험 계산 (Staff/Data Complexity)
    let complexityFactor = Math.min(1, metrics.staffCount / 500) * 20 + Math.min(1, metrics.dataSizeGB / 100) * 10;
    complexityFactor = Math.max(5, complexityFactor); // 최소 점수 보장

    // 3. 리스크 요인 체크 및 점수 누적 (Risk Factor Check)
    if (metrics.dataSizeGB > 80 && industryWeight >= 35) {
        riskFactors.push({
            riskId: "DATA_SCALE_RISK",
            title: "🚨 데이터 규모 폭증에 따른 컴플라이언스 위험",
            severityScore: 25 + Math.floor(metrics.dataSizeGB / 20), // 규모가 클수록 점수 증가
            description: `현재 ${metrics.dataSizeGB}GB의 데이터를 관리 중입니다. 이 규모는 내부 통제 시스템의 한계를 초과할 위험이 있습니다. (최대 손실액 $L_{max}$ 고려)`,
        });
        totalScore += 25 + Math.floor(metrics.dataSizeGB / 20);
    }

    if (industryWeight >= 40 && metrics.staffCount > 10) {
        riskFactors.push({
            riskId: "PII_LEAKAGE",
            title: "⚠️ 직원 증가에 따른 개인정보 유출 가능성 증대",
            severityScore: Math.min(35, (metrics.staffCount - 10) * 2), // 인원이 많을수록 점수 가파르게 상승
            description: `직원 ${metrics.staffCount}명 규모는 PII 관리 프로세스에 구조적 허점을 만들 가능성이 높습니다.`,
        });
        totalScore += Math.min(35, (metrics.staffCount - 10) * 2);
    }

    // 4. 최종 점수 결정 및 요약 메시지 생성
    const treScore = Math.floor(Math.min(95, totalScore + industryWeight + complexityFactor));
    
    let summaryMessage: string;
    if (treScore > 70) {
        summaryMessage = "🔥 경고! 현재 시스템의 구조적 무결성이 심각하게 손상되어 있습니다. 즉각적인 진단이 필요합니다.";
    } else if (treScore > 40) {
        summaryMessage = "🟡 주의. 일부 영역에서 통제력 확보가 필요한 미진한 부분이 발견되었습니다.";
    } else {
        summaryMessage = "🟢 양호. 현재까지 확인된 구조적 결함은 낮습니다. 하지만 방심은 금물입니다.";
    }


    return {
        treScore: treScore,
        riskFactors: riskFactors,
        summaryMessage: summaryMessage
    };
};

// --- [검증 및 Export] ---
export const getRiskSchema = () => ({
    schemaVersion: "v1.0",
    requiredFields: ["industry", "staffCount", "dataSizeGB"]
});