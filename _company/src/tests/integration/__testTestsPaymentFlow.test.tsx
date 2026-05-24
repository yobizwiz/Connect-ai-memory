import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
// Assume PaymentGateway component is in this directory and receives QLoss prop
import PaymentGateway from '../../components/PaymentGateway'; 
import * as paymentApi from '../../services/paymentApi';

// --- MOCKING SERVICES AND COMPONENTS ---
// 1. Mock the entire backend API module to control responses for testing specific failure states.
jest.mock('../../services/paymentApi', () => ({
  default: {
    processPayment: jest.fn(),
  },
}));

describe('E2E Payment Gateway Integration Test (Systemic Failure Simulation)', () => {
  // Before each test, clear mocks to ensure clean state
  beforeEach(() => {
    (paymentApi.default.processPayment).mockClear();
  });

  it('should activate Red Zone/Jittering and fail gracefully when QLoss is critical (>= 75%)', async () => {
    // ARRANGE: Setup the test environment with initial state
    const INITIAL_QLOSS = 60; // Start below threshold
    
    // Mock successful payment for low risk initially
    (paymentApi.default.processPayment).mockResolvedValue({ success: true, message: 'Transaction approved.' });

    // ACT: Render the component with initial QLoss state
    render(<PaymentGateway qLoss={INITIAL_QLOSS} />);

    // ASSERT 1: Verify normal operation at low risk (initial check)
    expect(screen.getByText(/Proceed to Payment/i)).toBeInTheDocument();
    // Check that payment API was called correctly for the initial state
    // Note: Actual assertion logic depends on component's internal flow, but we confirm mock call setup.

    // --- Critical Scenario Triggering ---
    const CRITICAL_QLOSS = 85; // Above critical threshold (75%)
    console.log(`\n--- Simulating QLoss jump from ${INITIAL_QLOSS}% to ${CRITICAL_QLOSS}% ---\n`);

    // ACT: Update the component state/props with a critical QLoss value.
    // In a real app, this would be triggered by an external global store update (e.g., Redux). 
    // Here we simulate forcing the prop change for testing purposes.
    const { rerender } = render(<PaymentGateway qLoss={INITIAL_QLOSS} />);
    rerender(<PaymentGateway qLoss={CRITICAL_QLOSS} />);

    // ASSERT 2: Verify visual state changes immediately upon reaching critical QLoss
    // This assumes the component exposes a visible warning element based on Red Zone logic.
    const redZoneElement = screen.queryByRole('alert', { name: /system risk high/i });
    expect(redZoneElement).toBeInTheDocument(); // Must display the primary Red Zone warning.

    // Check for the specific instability indicator (Jittering/Flickering text or class)
    const jitterWarning = screen.getByText(/WARNING: System Integrity Compromised/i); 
    expect(jitterWarning).toBeInTheDocument();

    // --- Payment Attempt in Critical State ---
    // ARRANGE for failure: Mock the backend API to return a CRITICAL risk error when called from this state.
    const CRITICAL_ERROR_RESPONSE = {
      success: false, 
      errorCode: 'RISK_LEVEL_CRITICAL', 
      message: 'Payment processing halted due to unacceptable systemic instability.'
    };
    (paymentApi.default.processPayment).mockResolvedValueOnce(CRITICAL_ERROR_RESPONSE);

    // ACT: Attempt the payment submission (e.g., clicking a button)
    const payButton = screen.getByRole('button', { name: /Pay Now/i });
    fireEvent.click(payButton);

    // ASSERT 3: Verify API was called, and the UI correctly reflects the failure status derived from critical QLoss.
    await act(async () => {
      // Wait for async state update (loading -> error)
      await new Promise(resolve => setTimeout(() => resolve(), 10)); 
    });

    expect(paymentApi.default.processPayment).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Transaction Failed/i)).toBeInTheDocument(); // Should show general failure message
    expect(screen.getByText(/RISK_LEVEL_CRITICAL/i)).toBeInTheDocument(); // Must display the specific critical error code from the API response.

  });
});