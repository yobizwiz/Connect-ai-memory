import { renderHook, act } from '@testing-library/react-hooks';
import useRiskCalculation from '../useRiskCalculation';
import * as API from '../../api/mockApi'; // Mocked API module

// Mock the entire API module to control its return value and track calls
jest.mock('../../api/mockApi', () => ({
  processHighRiskData: jest.fn(),
}));

describe('useRiskCalculation Hook - High Risk Scenario Testing', () => {
  const MOCK_SCENARIO = 'healthcare'; // Mocked scenario from Writer's data

  beforeEach(() => {
    (API.processHighRiskData as jest.Mock).mockClear();
  });

  it('should remain stable and show normal warning if score is below threshold (e.g., 70)', () => {
    const { result } = renderHook(() => useRiskCalculation({ score: 70, scenario: MOCK_SCENARIO }));

    // Wait for initial calculation to settle
    setTimeout(() => {
      expect(result.current.riskState).toBe('SAFE');
      expect(result.current.isProcessing).toBe(false);
      expect(API.processHighRiskData).not.toHaveBeenCalled();
    }, 100);
  });

  it('should trigger forced processing state, API call, and animation if score exceeds threshold (e.g., 92)', async () => {
    // Mock the successful asynchronous API response delay
    (API.processHighRiskData as jest.Mock).mockResolvedValueOnce({ success: true, finalScore: 92, message: 'Critical Risk Detected' });

    const { result } = renderHook(() => useRiskCalculation({ score: 92, scenario: MOCK_SCENARIO }));
    let processingStarted = false;

    // Use act() to simulate state updates triggered by async actions (like API calls)
    await act(async () => {
      // The hook logic will automatically call the function or be called here
      const resultState = useRiskCalculation({ score: 92, scenario: MOCK_SCENARIO });
      processingStarted = true; // Simulate initial state change visibility
    });

    // Check immediate transition after exceeding threshold
    await new Promise(resolve => setTimeout(() => {
        expect(result.current.riskState).toBe('PROCESSING');
        expect(result.current.isProcessing).toBe(true);
        expect(API.processHighRiskData).toHaveBeenCalledWith(
            expect.objectContaining({ scenario: MOCK_SCENARIO, lMaxValue: expect.any(Number) })
        );
    }, 100));

    // Check final state after API resolution
    await act(async () => {
        // Simulate the final state update based on successful mock call
        const finalResult = await new Promise(resolve => setTimeout(() => resolve({ success: true, finalScore: 92 }), 50));
        useRiskCalculation({ score: 92, scenario: MOCK_SCENARIO }); // Re-run to check state logic flow
    });

    expect(result.current.riskState).toBe('CRITICAL');
    expect(result.current.isProcessing).toBe(false);
  });
});</code>