import { render, screen } from '@testing-library/react';
import React from 'react';
import GatekeeperAlert from './GatekeeperAlert';

// Mocking the actual API call to ensure tests are fast and isolated
const mockOnDismiss = jest.fn();

describe('GatekeeperAlert Component - Structural Integrity Test', () => {
    it('Should NOT render when risk score is low (Below 50)', () => {
        render(<GatekeeperAlert riskScore={49} onDismiss={mockOnDismiss} />);
        expect(screen.queryByText(/CRITICAL/i)).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument(); // 가정: alert 역할을 가진 요소가 없음
    });

    it('Should render a MEDIUM alert when risk score is between 50 and 69', () => {
        render(<GatekeeperAlert riskScore={60} onDismiss={mockOnDismiss} />);
        expect(screen.getByText(/CAUTIONARY ALERT/i)).toBeInTheDocument();
    });

    it('Should render a HIGH alert when risk score is between 70 and 89', () => {
        render(<GatekeeperAlert riskScore={80} onDismiss={mockOnDismiss} />);
        expect(screen.getByText(/SIGNIFICANT RISK/i)).toBeInTheDocument();
    });

    it('Should render a CRITICAL FAILURE alert when risk score is 90 or above', () => {
        render(<GatekeeperAlert riskScore={95} onDismiss={mockOnDismiss} />);
        // 가장 강력한 경고 메시지가 정상적으로 출력되는지 확인
        expect(screen.getByText(/🔴 SYSTEM STRUCTURAL FAILURE DETECTED!/i)).toBeInTheDocument(); 
    });

    it('Should call the onDismiss handler when the close button is clicked', () => {
        render(<GatekeeperAlert riskScore={95} onDismiss={mockOnDismiss} />);
        const dismissButton = screen.getByRole('button', { name: /dismiss/i }); // 버튼 텍스트 가정
        dismissButton.click();
        expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });
});