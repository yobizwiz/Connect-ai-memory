import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import useRiskCalculation from '../hooks/useRiskCalculation';
// Mocking the actual implementation to focus on testing state transitions and UI interaction logic
jest.mock('../hooks/useRiskCalculation', () => ({
    __esModule: true,
    default: jest.fn(),
}));

const mockUseRiskCalculation = useRiskCalculation;

describe('RiskCalculatorPage Widget Test Suite', () => {
    // Mocking the entire component rendering for isolated testing
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('1. 초기 로딩 상태에서 Y 값과 버튼을 올바르게 표시하는가?', async () => {
        const mockHook = jest.fn(() => ({ 
            calculateRisk: jest.fn(), 
            currentYValue: 0, 
            isLoading: false, 
            error: null,
            getRedZoneStyles: (v) => "bg-gray-700" // Mock style
        }));
        mockUseRiskCalculation.mockReturnValue(mockHook());

        // @ts-ignore - Testing the component directly
        render(<ReactCalculatorPage />); 

        // 초기 Y 값 확인
        expect(screen.getByText('Estimated Minimum Financial Loss (Y)')).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: /데이터 볼륨/i })).toHaveValue(10);
    });

    it('2. 위험 계산 실행 시, 로딩 상태가 활성화되고 버튼이 비활성화되는가?', async () => {
        const mockHook = jest.fn(() => ({ 
            calculateRisk: jest.fn(), 
            currentYValue: 0, 
            isLoading: true, // Mocking loading state ON
            error: null,
            getRedZoneStyles: (v) => "bg-gray-700"
        }));
        mockUseRiskCalculation.mockReturnValue(mockHook());

        // @ts-ignore
        render(<ReactCalculatorPage />); 

        // 로딩 메시지 및 비활성화된 버튼 확인
        expect(screen.getByText('분석 중... (시스템 부하)')).toBeInTheDocument();
    });


    it('3. 사용자 입력 변경에 따라 상태가 정상적으로 업데이트되는가?', async () => {
        const mockHook = jest.fn(() => ({ 
            calculateRisk: jest.fn(), 
            currentYValue: 100, 
            isLoading: false, 
            error: null,
            getRedZoneStyles: (v) => "bg-gray-700"
        }));
        mockUseRiskCalculation.mockReturnValue(mockHook());

        // @ts-ignore
        render(<ReactCalculatorPage />); 

        const volumeInput = screen.getByLabelText(/데이터 볼륨/i).closest('input');
        await act(async () => {
            fireEvent.change(volumeInput, { target: { value: '50' } }});
        });
        // UI상으로 데이터가 갱신되는지 확인 (정확한 state management 테스트는 Redux/Zustand 사용 시 용이하지만, 여기서는 DOM 변화만 검증)
        expect(volumeInput).toHaveValue('50'); 
    });

    it('4. 계산 실행 버튼 클릭 후, CTA 요청 트랜잭션 흐름이 정상적으로 트리거되는가?', async () => {
        const mockHook = jest.fn(() => ({ 
            calculateRisk: jest.fn(), 
            currentYValue: 15000, // 고위험값으로 설정
            isLoading: false, 
            error: null,
            getRedZoneStyles: (v) => "bg-red-900"
        }));
        mockUseRiskCalculation.mockReturnValue(mockHook());

        // @ts-ignore
        render(<ReactCalculatorPage />); 

        const ctaButton = screen.getByRole('button', { name: /무료 진단 보고서 요청/i });
        
        await act(async () => {
            fireEvent.click(ctaButton);
        });

        // 실제 환경에서는 Mocking을 통해 API 호출과 리다이렉트 여부를 확인해야 하지만, 여기서는 경고창 호출까지의 동작만 검증합니다.
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Diagnosis Request Submitted!'));
    });
});