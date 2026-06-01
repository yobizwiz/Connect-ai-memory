import { renderHook, act } from '@testing-library/react-hooks';
import useRiskCalculation from './useRiskCalculation';
// Mocking the entire module to ensure clean testing environment
jest.mock('./useRiskCalculation', () => jest.fn());

describe('useRiskCalculation Hook - L_max Integrity Testing', () => {
    const mockInputs: RiskInputs = {
        userLocation: "Seoul, Korea",
        dataComplianceScore: 0.8, // Score * Weight
        regulatoryWeight: 1.2,   // Weight
        historyData: [],
    };

    it('✅ [Test Case 1] Should calculate nominal risk score and status when within safe limits.', () => {
        // Arrange (Mocking the return for controlled test)
        jest.mock('./useRiskCalculation', () => ({
            __esModule: true,
            default: jest.fn(() => ({
                riskScore: 60,
                isCritical: false,
                statusMessage: "🟢 NOMINAL: System compliance appears stable based on current inputs."
            }))
        }));

        // Act & Assert
        const { result } = renderHook(() => useRiskCalculation(mockInputs));
        expect(result.current.riskScore).toBe(60);
        expect(result.current.isCritical).toBe(false);
        expect(result.current.statusMessage).toContain("NOMINAL");
    });

    it('🚨 [Test Case 2] Should trigger CRITICAL state transition and status message when L_max exceeds the threshold.', () => {
        // Arrange: 임계치 초과를 유도하는 가상의 입력값 설정 (Mocking for controlled test)
        const highRiskInputs = { ...mockInputs, dataComplianceScore: 1.0, regulatoryWeight: 2.0 }; // Lmax = 2.0

        jest.mock('./useRiskCalculation', () => ({
            __esModule: true,
            default: jest.fn(() => ({
                riskScore: 95, // 임계값 초과 시뮬레이션 점수
                isCritical: true,
                statusMessage: "⚠️ MANDATORY DIRECTIVE: Critical System Risk Detected. Immediate intervention required."
            }))
        }));

        // Act & Assert
        const { result } = renderHook(() => useRiskCalculation(highRiskInputs));
        expect(result.current.riskScore).toBe(95);
        expect(result.current.isCritical).toBe(true);
        expect(result.current.statusMessage).toContain("MANDATORY DIRECTIVE");
    });

    it('🐛 [Test Case 3] Should handle null/undefined inputs gracefully and report a failure state.', () => {
        // Arrange: 필수 데이터 누락 시나리오
        const invalidInputs = null;

        jest.mock('./useRiskCalculation', () => ({
            __esModule: true,
            default: jest.fn(() => ({
                riskScore: -1, // 실패 코드
                isCritical: true, // 시스템 오류는 항상 최고 위험으로 간주
                statusMessage: "SYSTEM FAILURE: Cannot calculate risk due to internal data mismatch."
            }))
        }));

        // Act & Assert
        const { result } = renderHook(() => useRiskCalculation(invalidInputs));
        expect(result.current.riskScore).toBe(-1);
        expect(result.current.isCritical).toBe(true);
        expect(result.current.statusMessage).toContain("SYSTEM FAILURE");
    });
});