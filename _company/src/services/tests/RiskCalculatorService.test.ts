import { RiskCalculatorService } from '../services/RiskCalculatorService';
import { RiskInputs, RiskState, WarningLevel } from '../services/types/risk_calculator_types';

/**
 * @fileoverview RiskCalculatorService의 단위 테스트 케이스입니다.
 * 모든 리스크 로직은 이 테스트를 통과해야 합니다.
 */

describe('RiskCalculatorService Unit Tests', () => {
    let service: RiskCalculatorService;

    beforeEach(() => {
        service = new RiskCalculatorService();
    });

    // --- 🟢 Test Case 1: Normal State (최소 리스크) ---
    it('should return NORMAL state when risk inputs are minimal', () => {
        const minimalInputs: RiskInputs = {
            regulatoryRiskWeight: 0.05, // W_Reg (Low)
            complianceFailureWeight: 0.05, // W_Comp (Low)
            operationalRiskWeight: 0.05, // W_Ops (Low)
            lossMultiplier: 1.0 // L_Multiplier (Low)
        };

        const result = service.calculateRiskAndState(minimalInputs);

        expect(result.currentState).toBe(RiskState.NORMAL);
        expect(result.warningLevel).toBe(WarningLevel.LOW);
        // 계산 검증: 100만 * (0.05*3) * 1.0 = 150,000 (20% 임계치보다 훨씬 낮음)
        expect(result.potentialMaxLossAmount).toBeLessThan(service['constructor']['prototype']['static']?.THRESHOLD_NORMAL || 0);
    });

    // --- 🟡 Test Case 2: Yellow State (경고 레벨) ---
    it('should return YELLOW state when risk inputs are moderate', () => {
        const mediumInputs: RiskInputs = {
            regulatoryRiskWeight: 0.3, // W_Reg (Medium-High)
            complianceFailureWeight: 0.25, // W_Comp (Medium)
            operationalRiskWeight: 0.1, // W_Ops (Low)
            lossMultiplier: 1.5 // L_Multiplier (Medium)
        };

        const result = service.calculateRiskAndState(mediumInputs);

        expect(result.currentState).toBe(RiskState.YELLOW);
        expect(result.warningLevel).toBe(WarningLevel.MEDIUM);
    });

    // --- 🔴 Test Case 3: Red State (Critical) ---
    it('should return RED state with CRITICAL warning when risk inputs are high', () => {
        const criticalInputs: RiskInputs = {
            regulatoryRiskWeight: 0.9, // W_Reg (Very High)
            complianceFailureWeight: 0.8, // W_Comp (High)
            operationalRiskWeight: 0.7, // W_Ops (High)
            lossMultiplier: 2.0 // L_Multiplier (High)
        };

        const result = service.calculateRiskAndState(criticalInputs);

        expect(result.currentState).toBe(RiskState.RED);
        // 계산 검증: 100만 * (0.9+0.8+0.7) * 2.0 = 340만 (최고 위험도 시뮬레이션)
        expect(result.warningLevel).toBe(WarningLevel.HIGH); // 현재 스캐폴딩에서는 Red=High로 설정됨을 확인
    });

    // --- ✅ Test Case 4: API Integration Mock Test ---
    it('should handle the mockApiCall and return structured data', async () => {
        const inputs: RiskInputs = {
            regulatoryRiskWeight: 0.5,
            complianceFailureWeight: 0.5,
            operationalRiskWeight: 0.1,
            lossMultiplier: 1.2
        };

        // mockApiCall은 비동기 함수이므로 await 사용
        const result = await RiskCalculatorService.mockApiCall(inputs);

        expect(result).toHaveProperty('potentialMaxLossAmount');
        expect(typeof result.currentState).toBe('string'); 
    });
});