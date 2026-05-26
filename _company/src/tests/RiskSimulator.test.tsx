import React from 'react';
import { render, screen } from '@testing-library/react';
import RiskSimulatorPage from '../pages/RiskSimulatorPage';

// Mock the hook and components
jest.mock('../hooks/useRiskSimulation', () => ({
  useRiskSimulation: jest.fn(() => ({
    riskLevel: 'LOW',
    currentRiskScore: 10,
    isLoading: false
  })),
  getRiskStyles: jest.fn(() => ({
    className: 'bg-gray-800',
    message: 'System Safe'
  }))
}));

jest.mock('../components/PaywallWidget', () => {
  return function DummyPaywallWidget() {
    return <div data-testid="paywall-widget">Mock Paywall</div>;
  };
});

describe('RiskSimulatorPage - Integrated System Test Suite', () => {
  test('Successful rendering of RiskSimulatorPage', () => {
    render(<RiskSimulatorPage />);
    expect(screen.getByText(/System Alert/i)).toBeInTheDocument();
    expect(screen.getByText(/위험 진단 시작/i)).toBeInTheDocument();
  });
});