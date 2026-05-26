import React from 'react';
import { render, screen } from '@testing-library/react';
import RiskCalculatorWidget from './RiskCalculatorWidget';

describe('RiskCalculatorWidget Component Testing', () => {
    test('Successful rendering of RiskCalculatorWidget', () => {
        render(<RiskCalculatorWidget />);
        expect(screen.getByText(/SYSTEM DIAGNOSTIC REPORT/i)).toBeInTheDocument();
        expect(screen.getByText(/데이터 볼륨/i)).toBeInTheDocument();
    });
});