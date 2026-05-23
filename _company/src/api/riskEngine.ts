/**
 * @module riskEngine
 * @description 가상의 Risk Engine API 스켈레톤입니다. 실제 백엔드 서비스(FastAPI 등)가 이 인터페이스를 구현해야 합니다.
 * 네트워크 지연 시간과 구조적 리스크 계산 로직을 모킹합니다.
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface InputData {
    revenueAnnual: number; // 연간 매출 (단위: 백만 USD)
    employeeCount: number; // 직원 수
    industryCode: string; // 산업 코드 (예: FIN, TECH, MFG)
}

/**
 * @async
 * 사용자가 입력한 데이터를 기반으로 구조적 리스크 레벨을 계산합니다.
 * 실제 환경에서는 API Gateway를 통해 호출됩니다.
 * @param data - 사용자 입력 데이터 객체
 * @returns Promise<RiskLevel> - 계산된 리스크 레벨
 */
export const getStructuralRiskLevel = async (data: InputData): Promise<RiskLevel> => {
    // [시니어 코멘트]: 네트워크 지연 시간을 시뮬레이션합니다. 3초 지연은 사용자가 '분석 중'이라는 시간적 압박(Time Pressure)을 느끼게 하는 핵심 마케팅 요소입니다. [근거: Self-RAG]
    await new Promise((resolve) => setTimeout(resolve, 2500));

    console.log(`[Risk Engine API Mock]: Data received for ${data.industryCode}. Starting structural analysis...`);

    // 모킹 로직: 매출과 직원 수를 기반으로 가짜 리스크 점수 계산
    let riskScore = (data.revenueAnnual * 0.1) + (data.employeeCount * 5);

    let level: RiskLevel;

    if (riskScore > 300) {
        level = 'CRITICAL'; // 구조적 생존 위협 레벨
    } else if (riskScore > 150) {
        level = 'HIGH'; // 명확한 위험 감지 레벨
    } else if (riskScore > 50) {
        level = 'MEDIUM'; // 주의 필요 레벨
    } else {
        level = 'LOW'; // 안정적 레벨
    }

    console.log(`[Risk Engine API Mock]: Analysis complete. Assigned level: ${level}`);
    return level;
};

/**
 * @module RiskDataTransformer
 * 리스크 레벨에 따른 상세 구조 분석 보고서 데이터를 반환합니다.
 */
export const getReportDetails = (level: RiskLevel): { title: string, description: string, financialLossEstimate: number } => {
    switch(level) {
        case 'CRITICAL':
            return { 
                title: "🚨 즉각적 시스템적 생존 위협 경고", 
                description: "현재의 법규/구조 변화에 대한 대비가 전무합니다. 이대로 방치할 경우, 최소 $3M~$10M 규모의 재정 손실이 예상됩니다.", 
                financialLossEstimate: 5000000 // $5 Million
            };
        case 'HIGH':
            return { 
                title: "⚠️ 구조적 취약점 감지", 
                description: "주요 규제 변화에 대한 선제적 대비가 필요합니다. 향후 6개월간 운영 효율성 측면에서 $1M~$3M의 리스크를 안고 있습니다.", 
                financialLossEstimate: 2000000 // $2 Million
            };
        case 'MEDIUM':
            return { 
                title: "💡 경고 단계 (주의 요망)", 
                description: "일부 운영 프로세스에 개선이 필요합니다. 적절한 관리 없이는 장기적으로 비용 증가를 유발할 수 있습니다.", 
                financialLossEstimate: 500000 // $0.5 Million
            };
        case 'LOW':
        default:
            return { 
                title: "✅ 구조적 안정성 확인", 
                description: "현재 운영 환경은 주요 위험 요소에 대해 높은 방어력을 갖추고 있습니다.", 
                financialLossEstimate: 0
            };
    }
};