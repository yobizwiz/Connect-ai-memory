import { renderHook, act } from '@testing-library/react-hooks';
import { useRiskCalculator } from '../useRiskCalculator';
import { calculateTRE } from '../../types/riskTypes';

// Mocking the time delay is necessary for reliable testing
jest.mock('../useRiskCalculator', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('useRiskCalculator Hook (E2E Test)', () => {
  it('1. Initial state must be clean and non-loading', () => {
    const { result } = renderHook(() => useRiskCalculator());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.riskMetrics).toBeNull();
  });

  it('2. Should simulate loading state and enforce time delay', async () => {
    // Mock the actual calculation function to control timing
    const mockCalculateAndSetRisk = jest.fn((data?: any) => Promise.resolve({ totalRiskExposureUSD: 100, riskLevel: 'LOW' }));

    // @ts-ignore - mocking requires this temporary ignore
    useRiskCalculator.calculateAndSetRisk = mockCalculateAndSetRisk;

    const { result } = renderHook(() => useRiskCalculator());

    // Trigger calculation and wait for the loading state to hit
    act(() => {
      mockCalculateAndSetRisk(null);
    });

    // Wait a short period to ensure 'isLoading' is true (due to mocked delay)
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(result.current.isLoading).toBe(true);

    // Simulate the promise resolution completing the loading state
    act(() => {
      mockCalculateAndSetRisk.mockResolvedValue({ totalRiskExposureUSD: 100, riskLevel: 'LOW' });
    });

    await act(async () => {
        // Wait for the promise to resolve and state to update
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('3. Should correctly calculate TRE and set CRITICAL level based on input data', async () => {
    const highRiskData = { containsPII: true, hasComplianceGap: false, lacksAuditLog: true }; // Maximum risk triggers
    const mockCalculateAndSetRisk = jest.fn((data?: any) => Promise.resolve(calculateTRE(data)));

    // @ts-ignore - mocking requires this temporary ignore
    useRiskCalculator.calculateAndSetRisk = mockCalculateAndSetRisk;

    const { result } = renderHook(() => useRiskCalculator());

    act(() => {
      mockCalculateAndSetRisk(highRiskData);
    });
    await act(async () => {
        // Wait for the promise to resolve and state to update
    });

    expect(result.current.riskMetrics).not.toBeNull();
    const metrics = result.current.riskMetrics;
    expect(metrics!.structuralGapFound).toBe(true); // Gap must be found
    // TRE가 30,000 이상이 될 확률이 높아야 함 (로직 상)
    expect(metrics!.riskLevel).toBe('CRITICAL'); 
  });
});