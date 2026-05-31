// src/components/StatusGauge/__tests__/StatusGauge.test.tsx

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import StatusGauge from '../StatusGauge';
import * as complexityCalculator from '../../../utils/complexity-calculator';

// Mock complexity-calculator functions
jest.mock('../../../utils/complexity-calculator', () => {
  const originalModule = jest.requireActual('../../../utils/complexity-calculator');
  return {
    __esModule: true,
    ...originalModule,
    fetchMasterRiskDataset: jest.fn(),
  };
});

describe('StatusGauge Component Integrity Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (complexityCalculator.fetchMasterRiskDataset as jest.Mock).mockReturnValue(
      new Promise(() => {}) // never resolves to keep it loading
    );

    render(<StatusGauge />);
    expect(screen.getByText(/데이터 로딩 중/)).toBeInTheDocument();
  });

  it('renders stable state correctly when score is low', async () => {
    (complexityCalculator.fetchMasterRiskDataset as jest.Mock).mockResolvedValue({
      schema_metadata: {
        version: "1.0.0",
        creation_date: "2026-05-30",
        description: "Mock",
        required_fields_for_calculation: ["regulatory_weighting", "probability_score", "impact_score"]
      },
      risk_scenarios: [
        { id: "R1", name: "R1", primary_regulations: [], risk_category: "", failure_type: "", regulatory_weighting: 0.1, probability_score: 0.1, impact_score: 0.1 }
      ]
    });

    render(<StatusGauge />);

    // Wait for loading to finish and stable score to be displayed
    await waitFor(() => {
      expect(screen.queryByText(/데이터 로딩 중/)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Health Check/)).toBeInTheDocument();
    expect(screen.getByText(/M_Complexity 점수:/)).toBeInTheDocument();
    expect(screen.getByText(/안정 범위/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /진단 보고서 구매/ })).toBeInTheDocument();
  });

  it('renders critical state and handles alert when score is high', async () => {
    (complexityCalculator.fetchMasterRiskDataset as jest.Mock).mockResolvedValue({
      schema_metadata: {
        version: "1.0.0",
        creation_date: "2026-05-30",
        description: "Mock",
        required_fields_for_calculation: ["regulatory_weighting", "probability_score", "impact_score"]
      },
      risk_scenarios: [
        { id: "R1", name: "R1", primary_regulations: [], risk_category: "", failure_type: "", regulatory_weighting: 0.9, probability_score: 0.9, impact_score: 0.9 }
      ]
    });

    window.alert = jest.fn();

    render(<StatusGauge />);

    // Wait for critical state to render
    await waitFor(() => {
      expect(screen.getByText(/구조적 재앙 임박/)).toBeInTheDocument();
    });

    expect(screen.getByText(/임계점을 초과했습니다/)).toBeInTheDocument();
    
    const button = screen.getByRole('button', { name: /보험 가입 필요/ });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("Paywall로 이동합니다"));
  });
});