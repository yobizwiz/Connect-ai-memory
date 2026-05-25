import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PaymentGateway from '../../components/PaymentGateway';
import * as qlossService from '../../services/qlossService';

// Mocking the entire service to control timing and return values for deterministic testing
jest.mock('../../services/qlossService', () => ({
    simulatePaymentFlow: jest.fn(),
    getRedZoneStyles: jest.fn((qloss) => {
        if (qloss >= 75) return "bg-red-900/80 border-red-600";
        if (qloss >= 40) return "bg-yellow-900/80 border-yellow-600";
        return "bg-blue-900/70 border-blue-600";
    }),
}));

const mockedSimulatePaymentFlow = qlossService.simulatePaymentFlow as jest.Mock;

describe('PaymentGateway Integration Test', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('✅ Case 1: Low Risk (Success) - QLoss < 40%', async () => {
        // Mock API to return a low-risk result
        mockedSimulatePaymentFlow.mockResolvedValueOnce({
            qloss: 25,
            status: 'SUCCESS',
            message: "거래가 성공적으로 처리되었습니다. 구조적 무결성이 확인되었습니다.",
            details: {}
        });

        render(<PaymentGateway />);

        // Simulate interaction for low risk (Compliance Pass, Low Tolerance)
        const select = screen.getByLabelText(/필수 규정 준수 항목 검토 완료 여부:/i);
        fireEvent.change(select, { target: { value: 'yes' } });
        
        const rangeSlider = screen.getByRole('slider');
        fireEvent.change(rangeSlider, { target: { value: '1' } });

        // Trigger the submission (API call)
        await fireEvent.submit(screen.getByRole('button', { name: /위험성 평가 시작/i }));

        await waitFor(() => {
            expect(screen.getByText(/25%/i)).toBeInTheDocument(); // Check QLoss score
            expect(screen.getByText(/구조적 무결성이 확인되었습니다/i)).toBeInTheDocument(); // Check success message
            expect(qlossService.simulatePaymentFlow).toHaveBeenCalledTimes(1);
        });
    });

    it('⚠️ Case 2: Mid Risk (Warning) - QLoss 40% <= QLoss < 75%', async () => {
        // Mock API to return a warning result (e.g., Compliance Fail, Medium Tolerance)
        mockedSimulatePaymentFlow.mockResolvedValueOnce({
            qloss: 60,
            status: 'WARNING',
            message: "⚠️ 리스크 레벨 상승: QLoss 60%. 추가 검토가 필요하며, 전문가의 개입이 권장됩니다.",
            details: {}
        });

        render(<PaymentGateway />);

        // Simulate interaction for warning risk (Compliance Fail)
        const select = screen.getByLabelText(/필수 규정 준수 항목 검토 완료 여부:/i);
        fireEvent.change(select, { target: { value: 'no' } });
        
        const rangeSlider = screen.getByRole('slider');
        fireEvent.change(rangeSlider, { target: { value: '5' } });

        // Trigger the submission (API call)
        await fireEvent.submit(screen.getByRole('button', { name: /위험성 평가 시작/i }));

        await waitFor(() => {
            expect(screen.getByText(/60%/i)).toBeInTheDocument(); // Check QLoss score
            expect(screen.getByText(/전문가의 개입이 권장됩니다/i)).toBeInTheDocument(); 
        });
    });

    it('🚨 Case 3: High Risk (Critical Failure) - QLoss >= 75%', async () => {
        // Mock API to return a critical failure result (High Compliance Fail, Low Tolerance)
        mockedSimulatePaymentFlow.mockResolvedValueOnce({
            qloss: 92,
            status: 'CRITICAL_FAILURE',
            message: "🚨 시스템 경고! 임계치를 초과했습니다. 구조적 무결성 확보가 즉시 필요합니다. 해결책을 제시하십시오.",
            details: {}
        });

        render(<PaymentGateway />);

        // Simulate interaction for critical risk
        const select = screen.getByLabelText(/필수 규정 준수 항목 검토 완료 여부:/i);
        fireEvent.change(select, { target: { value: 'no' } });
        
        const rangeSlider = screen.getByRole('slider');
        fireEvent.change(rangeSlider, { target: { value: '1' } });

        // Trigger the submission (API call)
        await fireEvent.submit(screen.getByRole('button', { name: /위험성 평가 시작/i }));

        await waitFor(() => {
            expect(screen.getByText(/92%/i)).toBeInTheDocument(); // Check QLoss score
            expect(screen.getByText(/구조적 무결성 확보가 즉시 필요합니다/i)).toBeInTheDocument(); // Check critical message
        });
    });
});