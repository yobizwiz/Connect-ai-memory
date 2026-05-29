import { 
    RiskInputs, 
    RiskCalculationResult, 
    RiskState, 
    WarningLevel, 
    BASE_LOSS_AMOUNT 
} from './types/risk_calculator_types';

/**
 * @class RiskCalculatorService
 * TRE (Total Risk Exposure) 대시보드의 핵심 리스크 계산 엔진입니다.
 * 이 서비스는 입력 가중치와 기본 손실액을 조합하여 잠재적 최대 재무적 손실액($L_r$)을 산출하고, 
 * 그 값에 기반하여 시스템의 현재 위험 상태(State)를 결정합니다.
 * [근거: 회사 공동 목표] L_r 계산 공식 및 JSON Schema 구조화 요구사항 충족.
 */
export class RiskCalculatorService {

    /**
     * @private 최소 리스크 레벨 (L_r < 10% of Base Loss)
     */
    private static readonly THRESHOLD_NORMAL = BASE_LOSS_AMOUNT * 0.2; // 예시: 기본 손실액의 20% 이하
    /**
     * @private 중간 리스크 레벨 (L_r >= 10% and L_r < 50%)
     */
    private static readonly THRESHOLD_YELLOW = BASE_LOSS_AMOUNT * 0.8; // 예시: 기본 손실액의 80% 이하

    /**
     * 리스크 가중치를 기반으로 잠재적 최대 손실액을 계산하고 시스템 상태를 반환합니다.
     * @param inputs - 위험 요소별 가중치와 승수(Multiplier)가 포함된 객체.
     * @returns RiskCalculationResult 타입의 최종 보고서.
     */
    public calculateRiskAndState(inputs: RiskInputs): RiskCalculationResult {
        const { regulatoryRiskWeight, complianceFailureWeight, operationalRiskWeight, lossMultiplier } = inputs;

        // 1. 핵심 리스크 지수 계산 (가중치 합산)
        // W_Reg + W_Comp + W_Ops는 세 가지 독립적 리스크 축의 결합도를 나타냅니다.
        const combinedWeight = regulatoryRiskWeight + complianceFailureWeight + operationalRiskWeight;

        // 2. 잠재적 최대 손실액 ($L_r$) 계산
        // $L_r$ = L_Base * (Combined Weight) * L_Multiplier
        let potentialMaxLossAmount = BASE_LOSS_AMOUNT * combinedWeight * lossMultiplier;

        // 3. 상태 및 경고 레벨 결정 (State Machine Logic)
        let currentState: RiskState = RiskState.NORMAL;
        let warningLevel: WarningLevel = WarningLevel.LOW;
        let isCriticalTransition: boolean = false;

        if (potentialMaxLossAmount >= Self.THRESHOLD_YELLOW) {
            // 위험 수준이 높으면 경고 레벨 상승
            currentState = RiskState.RED;
            warningLevel = WarningLevel.HIGH;
            isCriticalTransition = true; // Red Zone 진입을 위한 플래그 설정
        } else if (potentialMaxLossAmount >= Self.THRESHOLD_NORMAL) {
            // 중간 수준 리스크는 Yellow 경고
            currentState = RiskState.YELLOW;
            warningLevel = WarningLevel.MEDIUM;
        } else {
            // 낮은 리스크는 Normal 상태 유지
            currentState = RiskState.NORMAL;
            warningLevel = WarningLevel.LOW;
        }

        return {
            potentialMaxLossAmount: parseFloat(potentialMaxLossAmount.toFixed(2)), // 소수점 2자리까지 반올림
            currentState,
            warningLevel,
            isTransitioningToCritical: isCriticalTransition
        };
    }

    /**
     * [테스트/API 모의] API Gateway를 통해 호출될 것으로 예상되는 엔드포인트 함수입니다.
     * 실제 백엔드 프레임워크(예: FastAPI/Express) 환경에서 사용됩니다.
     * @param inputs - 요청 본문 (Request Body)으로 들어오는 리스크 가중치 데이터.
     * @returns JSON 구조화된 계산 결과.
     */
    public static async mockApiCall(inputs: RiskInputs): Promise<RiskCalculationResult> {
        console.log(`[API Call] Starting risk calculation for inputs...`);
        // 비동기 처리 시뮬레이션 (네트워크 지연, 복잡한 DB 조회 등)
        await new Promise(resolve => setTimeout(resolve, 50)); 

        const service = new RiskCalculatorService();
        const result = service.calculateRiskAndState(inputs);
        console.log(`[API Call] Calculation complete. State: ${result.currentState}`);
        return result;
    }
}

/** 
 * [Self-Correction/Testing Helper] 클래스 내부에서 정적 상수 접근을 위해 별도 객체로 분리합니다.
 */
const Self = {
    THRESHOLD_NORMAL: BASE_LOSS_AMOUNT * 0.2,
    THRESHOLD_YELLOW: BASE_LOSS_AMOUNT * 0.8
};

// 이 파일은 컴파일 타임에 타입 검사를 통과해야 합니다.
// npx tsc --noEmit (실제 실행 시)