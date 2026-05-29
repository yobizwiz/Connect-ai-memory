import { SimulationReport, RiskInputs } from '../types/RiskSimulationSchema';

/**
 * @description 리스크 계산 서비스: 입력 파라미터 기반으로 시스템의 잠재적 최대 손실액(L_r) 및 상태를 시뮬레이션합니다.
 * 이 함수는 Core Business Logic이므로 외부 호출에 대한 방어 로직을 갖습니다.
 */
export const calculateRisk = async (inputs: RiskInputs): Promise<SimulationReport> => {
    // 1. 입력 유효성 검증 및 가드 처리를 최우선으로 합니다.
    if (!inputs || typeof inputs.complianceRate !== 'number' || typeof inputs.automationRatio !== 'number') {
        throw new Error("Invalid input parameters provided for risk calculation.");
    }

    // 2. 핵심 리스크 지표 계산 (L_r 로직 Blueprint 기반)
    // L_r = BaseRisk * (1 - ComplianceRate)^Alpha + DataCompromised * Multiplier
    const compliancePenaltyFactor = Math.pow(1 - inputs.complianceRate, 2); // Alpha=2 가정
    let baseLossMultiplier = 10000; // 기본 리스크 베이스 금액 ($)

    // 데이터 무결성 침해는 가장 치명적인 페널티를 가합니다.
    const dataIntegrityPenalty = inputs.dataIntegrityCompromised ? 5 : 0;
    
    let totalLossAmountUSD = baseLossMultiplier * (compliancePenaltyFactor + dataIntegrityPenalty);

    // 자동화 비율이 낮으면 추가적인 운영 비용 손실을 가정합니다.
    totalLossAmountUSD += Math.max(0, 1 - inputs.automationRatio) * 500;


    // 3. 상태 결정 로직 (State Machine Simulation)
    let state: 'Normal' | 'Yellow' | 'Red';
    let requiredActions: string[] = [];

    if (totalLossAmountUSD > 40000 || !inputs.complianceRate) {
        state = 'Red'; // 재무적 손실액이 매우 크거나 컴플라이언스 준수가 아예 안 된 경우
        requiredActions = [
            "즉각적인 운영 중단 및 사태 분석팀 소집.", 
            "외부 법률 자문(Legal Counsel)을 통한 구조적 무결성 감사 의뢰."
        ];
    } else if (totalLossAmountUSD > 10000 || inputs.automationRatio < 0.4) {
        state = 'Yellow'; // 경고 단계: 주의가 필요함
        requiredActions = [
            "프로세스 자동화 취약점 진단 및 개선.", 
            "핵심 프로세스의 수동 검토(Manual Review) 주기 단축."
        ];
    } else {
        state = 'Normal'; // 정상 단계
        requiredActions = ["정기적인 리스크 온톨로지 업데이트 및 모니터링 유지."];
    }

    // 4. 최종 보고서 구조화 및 반환
    const report: SimulationReport = {
        state: state,
        lossAmountUSD: parseFloat(totalLossAmountUSD.toFixed(2)),
        title: `[${state}] 시스템 무결성 리스크 진단 보고서`,
        requiredActions: requiredActions,
        details: {
            explanation: `현재 시스템은 ${state} 상태로 판단됩니다. 주된 취약점은 '${inputs.complianceRate < 0.9 ? '규정 준수율' : (inputs.automationRatio < 0.5 ? '자동화 미흡' : '데이터 무결성')}'에 있습니다. 이 공백을 메우지 않으면 잠재적 최대 손실액(${totalLossAmountUSD.toLocaleString()} USD)이 발생할 수 있습니다.`,
            severityScore: Math.min(100, Math.round((totalLossAmountUSD / 500))) // 임의 점수 부여 로직
        }
    };

    return report;
};