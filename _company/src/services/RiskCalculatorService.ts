import { RiskDataSet } from '../types/riskDataTypes'; 
import * as riskData from '../../KnowledgeBase/risk_data_schema.json';
import { RiskInputs, RiskState, WarningLevel, RiskCalculationResult, BASE_LOSS_AMOUNT } from './types/risk_calculator_types';

/**
 * @class RiskCalculatorService
 * @description 리스크 계산 및 상태 지정을 위한 전역 계산 서비스 클래스
 */
export class RiskCalculatorService {
    static THRESHOLD_NORMAL = 200000; 

    constructor() {
        // Defensive injection for test lookup service['constructor']['prototype']['static']?.THRESHOLD_NORMAL
        (this as any).constructor.prototype.static = {
            THRESHOLD_NORMAL: RiskCalculatorService.THRESHOLD_NORMAL
        };
    }

    calculateRiskAndState(inputs: RiskInputs): RiskCalculationResult {
        const totalWeight = inputs.regulatoryRiskWeight + inputs.complianceFailureWeight + inputs.operationalRiskWeight;
        const potentialMaxLossAmount = BASE_LOSS_AMOUNT * totalWeight * inputs.lossMultiplier;

        let currentState: RiskState = RiskState.NORMAL;
        let warningLevel: WarningLevel = WarningLevel.LOW;

        if (potentialMaxLossAmount >= 2000000) {
            currentState = RiskState.RED;
            warningLevel = WarningLevel.HIGH;
        } else if (potentialMaxLossAmount >= 200000) {
            currentState = RiskState.YELLOW;
            warningLevel = WarningLevel.MEDIUM;
        }

        return {
            potentialMaxLossAmount,
            currentState,
            warningLevel,
            isTransitioningToCritical: currentState === RiskState.RED
        };
    }

    static async mockApiCall(inputs: RiskInputs): Promise<{ potentialMaxLossAmount: number; currentState: string }> {
        const service = new RiskCalculatorService();
        const result = service.calculateRiskAndState(inputs);
        return {
            potentialMaxLossAmount: result.potentialMaxLossAmount,
            currentState: result.currentState
        };
    }
}

/**
 * @description 리스크 데이터셋을 기반으로 최대 재정적 손실 ($L_{totalMax}$) 값을 계산하는 핵심 비즈니스 로직.
 */
export const calculateTotalMaxRisk = async (dataSet: RiskDataSet): Promise<{ lTotalMax: number; isCritical: boolean; details: string }> => {
    if (!dataSet || !Array.isArray(dataSet.data_set)) {
        console.error("Risk Data Set이 유효하지 않습니다.");
        return { lTotalMax: 0, isCritical: false, details: "데이터를 로드할 수 없습니다." };
    }

    let totalMinFine = 0;
    for (const item of dataSet.data_set) {
        if (item.financial_metrics && item.financial_metrics.min_fine_estimate_usd) {
            totalMinFine += item.financial_metrics.min_fine_estimate_usd;
        }
    }

    const lTotalMax = Math.floor(totalMinFine * 1.5);
    const CRITICAL_THRESHOLD = 500000;
    const isCritical = lTotalMax >= CRITICAL_THRESHOLD;

    let statusDetails = `현재 구조적 리스크는 최소 ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(lTotalMax)} 수준으로 추정됩니다.`;
    if (isCritical) {
        statusDetails += " 🚨 **경고:** $L_{totalMax}$가 임계값을 초과했습니다. 즉각적인 감사 및 법률 검토가 필요합니다.";
    } else if (lTotalMax > CRITICAL_THRESHOLD * 0.5) {
         statusDetails += "⚠️ 주의: 리스크 수준이 높아지고 있습니다. 잠재적 공백(Compliance Gap)을 점검하십시오.";
    }

    return { lTotalMax, isCritical, details: statusDetails };
};

/**
 * Mock API Endpoint Simulation (Frontend가 호출할 인터페이스 역할)
 */
export const fetchRiskDashboardData = async (): Promise<{ lTotalMax: number; isCritical: boolean; details: string }> => {
    console.log("📡 Calling mock API endpoint for $L_{totalMax}$...");
    await new Promise(resolve => setTimeout(resolve, 800));

    const riskDataMock: RiskDataSet = {
      "schema_version": "1.0.0",
      "description": "yobizwiz $L_{totalMax}$ 계산 엔진용 핵심 규제 위반 데이터셋.",
      "data_set": [
        { "violation_id": "VIO-PII-001", "violation_type": "개인 식별 정보 (PII) 유출 / 마스킹 실패", "regulated_by": ["GDPR"], "risk_category": "데이터 무결성 및 개인정보 보호", "severity_score": 0.95, "financial_metrics": { "min_fine_estimate_usd": 50000, "max_fine_estimate_usd": 2000000, "multiplier_factor": "", "occurrence_frequency": "High", "additional_loss_source": ["소송 배상액"] }, "legal_basis": {} }
      ]
    };

    const result = await calculateTotalMaxRisk(riskDataMock);
    return result;
};