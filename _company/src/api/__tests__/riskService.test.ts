import { calculateRisk } from '../riskService';
import { RiskInputData, DiagnosticReport } from '../../types/SystemTypes';

/**
 * @description 리스크 계산 서비스의 핵심 로직을 테스트하는 파일입니다.
 * Paywall Barrier가 정상적으로 State A -> B -> C로 전환되는지 검증합니다.
 */
describe('RiskService - Defensiveness Test Suite', () => {
    // 🚨 Edge Case: 필수 입력 값 누락 시 에러가 발생하는지 확인해야 합니다. (Guard Clause 테스트)
    test('should throw error if input data is missing or malformed', async () => {
        await expect(calculateRisk(null as any)).rejects.toThrow("Invalid input data");
        await expect(calculateRisk({ checksCompleted: 'abc' } as any)).rejects.toThrow("Invalid input data");
    });

    // 🟢 State A Test: Low Risk Zone (Barrier 미작동)
    test('should correctly calculate LOW risk score and not trigger the barrier', async () => {
        const lowRiskData: RiskInputData = { checksCompleted: 5, isCriticalFailure: false };
        const report = await calculateRisk(lowRiskData);

        expect(report.riskScore).toBeLessThan(20);
        expect(report.statusLevel).toBe('LOW');
        expect(report.isBarrierTriggered).toBe(false);
    });

    // 🟡 State B Test: Medium Risk Zone (Warning, Barrier 미작동)
    test('should correctly calculate MEDIUM risk score and not trigger the barrier', async () => {
        const mediumRiskData: RiskInputData = { checksCompleted: 20, isCriticalFailure: false };
        const report = await calculateRisk(mediumRiskData);

        expect(report.riskScore).toBeGreaterThanOrEqual(20);
        expect(report.riskScore).toBeLessThan(65);
        expect(report.statusLevel).toBe('MEDIUM');
        expect(report.isBarrierTriggered).toBe(false);
    });

    // 🔴 State C Test: High Risk Zone (CRITICAL, Barrier 작동) - 가장 중요!
    test('should calculate HIGH risk score and correctly trigger the Paywall Barrier', async () => {
        const highRiskData: RiskInputData = { checksCompleted: 30, isCriticalFailure: true };
        const report = await calculateRisk(highRiskData);

        // 점수 계산 검증 (30 * 1.5 + 30 = 75)
        expect(report.riskScore).toBe(75); 
        expect(report.statusLevel).toBe('HIGH');
        expect(report.isBarrierTriggered).toBe(true);
        // 필수 조치 목록 검증 (High Risk일 때만 액션이 있어야 함)
        expect(report.mockAudit.mandatoryActionsRequired).toHaveLength(2); 
    });

    // 🚨 Edge Case Test: 최대 리스크 점수 테스트
    test('should cap the risk score at a maximum of 85', async () => {
        const maxRiskData: RiskInputData = { checksCompleted: 100, isCriticalFailure: true };
        const report = await calculateRisk(maxRiskData);

        // 점수가 계산 로직을 무시하고 최대치로 제한되는지 확인 (Mock API의 방어적 설계 검증)
        expect(report.riskScore).toBe(85); 
    });
});