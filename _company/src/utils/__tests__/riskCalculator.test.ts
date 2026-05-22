import { calculateTotalRiskExposure, calculateMinimumInsurancePremium } from '../riskCalculator';

// --- Unit Test: calculateTotalRiskExposure ---
describe('calculateTotalRiskExposure (Unit Test)', () => {
    test('Case 1: Critical Risk Scenario (Low Score, High Employees)', () => {
        const input = { userIndustry: 'FinTech', employeeCount: 200, complianceScore: 10 }; // 낮은 점수 + 높은 복잡성
        const report = calculateTotalRiskExposure(input);

        // 검증 항목: Critical 레벨이 나와야 함. (High Penalty)
        expect(report.riskLevel).toBe('CRITICAL');
        // 예상되는 총 위험 노출액은 매우 높아야 함. (수동 계산값 기준 최소 10만 이상 기대)
        expect(report.totalRiskExposureUSD).toBeGreaterThan(150000); 
    });

    test('Case 2: Low Risk Scenario (High Score, Low Employees)', () => {
        const input = { userIndustry: 'Retail', employeeCount: 10, complianceScore: 95 }; // 높은 점수 + 낮은 복잡성
        const report = calculateTotalRiskExposure(input);

        // 검증 항목: LOW 레벨이 나와야 함. (Low Penalty)
        expect(report.riskLevel).toBe('LOW');
        // 총 위험 노출액은 낮게 유지되어야 함. 
        expect(report.totalRiskExposureUSD).toBeLessThan(40000); 
    });

     test('Case 3: Medium Risk Scenario (Balanced)', () => {
        const input = { userIndustry: 'Healthcare', employeeCount: 50, complianceScore: 50 }; 
        const report = calculateTotalRiskExposure(input);

        // 검증 항목: MEDIUM 레벨이 나와야 함.
        expect(['MEDIUM', 'HIGH']).toContain(report.riskLevel);
    });
});


// --- Unit Test: calculateMinimumInsurancePremium ---
describe('calculateMinimumInsurancePremium (Unit Test)', () => {
    test('Case 1: High Exposure -> Calculates Premium correctly', () => {
        const totalExposure = 200000; // $20만 위험 노출액 가정
        // Expected calculation: 200,000 * (1 - 0.2) = 160,000
        expect(calculateMinimumInsurancePremium(totalExposure)).toBe(160000);
    });

    test('Case 2: Low Exposure -> Minimum Premium floor check', () => {
        const totalExposure = 5000; // 매우 낮은 위험 노출액 가정
        // 계산 결과가 최소 기준인 $500 미만일 경우, 강제적으로 $500이 나와야 함.
        expect(calculateMinimumInsurancePremium(totalExposure)).toBe(500);
    });
});