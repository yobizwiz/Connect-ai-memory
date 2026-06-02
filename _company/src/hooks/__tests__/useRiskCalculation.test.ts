import { renderHook, act } from '@testing-library/react-hooks';
import { useRiskCalculation } from '../useRiskCalculation';
import { RiskInputs } from '../../components/types/RiskInputs';

describe('useRiskCalculation Hook - High Risk Scenario Testing', () => {
  const initialInputs: RiskInputs = {
    numberOfAffectedRecords: 10,
    riskMultiplier: 5,
    dailyLossRate: 20
  };

  it('should calculate risk correctly with initial inputs', () => {
    const { result } = renderHook(() => useRiskCalculation(initialInputs));

    expect(result.current[0].lTotalMax).toBeGreaterThan(0);
    expect(result.current[0].isCritical).toBe(false);
    expect(typeof result.current[0].message).toBe('string');
  });

  it('should update risk output when inputs change', () => {
    const { result } = renderHook(() => useRiskCalculation(initialInputs));

    act(() => {
      const setInputs = result.current[1];
      setInputs({
        numberOfAffectedRecords: 200,
        riskMultiplier: 10,
        dailyLossRate: 80
      });
    });

    expect(result.current[0].isCritical).toBe(true);
  });
});