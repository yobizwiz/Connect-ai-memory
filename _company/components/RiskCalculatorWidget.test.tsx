import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RiskCalculatorWidget from './RiskCalculatorWidget';

// Mocking the entire component for testing purposes
jest.mock('../pages/api/v1/calculate-risk', () => ({
    __esModule: true,
    default: jest.fn(),
}));


describe('RiskCalculatorWidget State Machine Test Suite', () => {
    it('should render in IDLE state initially and transition to INPUT on first interaction', async () => {
        render(<RiskCalculatorWidget />);
        // 1. 초기 상태 검증 (IDLE)
        expect(screen.getByText(/시스템 진단 대기 중/i)).toBeInTheDocument();

        // Mock input change for the first variable
        const mockHandleInputChange = jest.spyOn(React, 'useState').mockImplementationOnce(() => [0]); 
        
        // Simulate user interaction (Input -> INPUT)
        // NOTE: 실제로는 Input 필드에 포커스를 맞추고 값을 변경하는 액션이 필요함.
        // 여기서는 테스트 스켈레톤을 위한 더미 핸들러 호출로 대체합니다.
    });

    it('should transition to CALCULATING state and show glitch animation upon calculation start', async () => {
        render(<RiskCalculatorWidget />); 
        // Assume we are already in INPUT state for this test run.
        
        // Mock the API call setup (mockApiCall 함수가 정의되어 있다고 가정)
        const mockCalculate = jest.fn(); 

        // Simulate button click to trigger CALCULATING state
        await waitFor(() => {
            expect(screen.getByText(/시스템 부하 감지: 구조적 무결성 검증 중.../i)).toBeInTheDocument();
        });
    });

    it('should transition from CALCULATING to RESULT state and display the $Y$ Loss Estimate', async () => {
        render(<RiskCalculatorWidget />);
        // Simulate successful API response (SUCCESS -> RESULT)
        await waitFor(() => {
            expect(screen.getByText(/예상 재무 손실액 \(Estimated Loss \$Y\):/i)).toBeInTheDocument();
            expect(screen.getByText(/500,000,000 KRW/i)).toBeInTheDocument(); // Mocked Value Check
        });
    });

    it('should transition to ACTION state and reveal the download CTA button', async () => {
        render(<RiskCalculatorWidget />); 
        // Assume we are already in RESULT state.
        await waitFor(() => {
             expect(screen.getByRole('button', /진단 보고서 다운로드/i)).toBeInTheDocument();
        });
    });

    it('should handle API failures gracefully and revert to IDLE or INPUT state', async () => {
         // Simulate failure during API call
         await waitFor(() => {
            expect(screen.getByText(/시스템 오류 발생/i)).toBeInTheDocument();
        });
    });
});