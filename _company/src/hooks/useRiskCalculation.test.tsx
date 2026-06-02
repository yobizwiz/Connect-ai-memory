import { renderHook } from '@testing-library/react-hooks';
import { useRiskCalculation } from './useRiskCalculation';
import { RiskInputs } from '../components/types/RiskInputs';

describe('useRiskCalculation Hook', () => {
    const mockInputs: RiskInputs = {
        numberOfAffectedRecords: 50,
        riskMultiplier: 1.5,
        dailyLossRate: 2.5,
        jurisdiction: 'Global/SEC'
    };

    it('calculates risk successfully', () => {
        const { result } = renderHook(() => useRiskCalculation(mockInputs));
        expect(result.current[0].lTotalMax).toBeGreaterThan(0);
        expect(result.current[0].isCritical).toBeDefined();
        expect(typeof result.current[0].message).toBe('string');
    });
});