import { mockCalculateTRE } from '../riskService';

// Mocking the module to ensure clean testing environment
describe('mockCalculateTRE - End-to-End Integration Test', () => {
    it('should return a high risk score for Healthcare/Large Data scenario (Critical Path)', async () => {
        const metrics = { industry: 'Healthcare', staffCount: 150, dataSizeGB: 120 };
        const report = await mockCalculateTRE(metrics);

        // Assertions on the expected outcome structure and severity
        expect(report.treScore).toBeGreaterThan(75); // 충분히 높은 점수가 나와야 함
        expect(report.riskFactors.length).toBeGreaterThanOrEqual(2); // 최소 두 개 이상의 요인이 잡혀야 함
        // 가장 중요한 Assert: 리포트가 경고 메시지를 담아야 함
        expect(report.summaryMessage).toContain('위협'); 

    });

    it('should return a low risk score for Small/Tech scenario (Safe Path)', async () => {
        const metrics = { industry: 'Tech', staffCount: 5, dataSizeGB: 1 };
        const report = await mockCalculateTRE(metrics);

        // Assertions on the expected outcome structure and severity
        expect(report.treScore).toBeLessThan(40); // 낮은 점수가 나와야 함
        expect(report.riskFactors.length).toBe(0); // 위험 요인이 없어야 함
    });

    it('should handle edge case: moderate risk for Finance/Medium Data', async () => {
        const metrics = { industry: 'Finance', staffCount: 25, dataSizeGB: 15 };
        const report = await mockCalculateTRE(metrics);

        // Assertions on the expected outcome structure and severity
        expect(report.treScore).toBeGreaterThanOrEqual(40); // 주의 레벨 이상
    });
});