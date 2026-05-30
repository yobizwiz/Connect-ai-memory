import { calculateAggregatedRiskScoreAndGate, RiskInput } from './riskService';
// Mocking external dependencies (assuming calculateRiskScore is mocked for testing)

describe('✅ Aggregated Risk Score & Gate Service', () => {

    it('Should correctly identify Normal Zone when risk score is low (< 0.5)', async () => {
        // 낮은 리스크 데이터셋 구성 (0.2점)
        const safeData: RiskInput = { score: 0.2 };
        const result = await calculateAggregatedRiskScoreAndGate(safeData);

        expect(result.level).toBe('Normal');
        expect(result.isPaywallTriggered).toBe(false);
    });

    it('Should correctly identify Warning Zone when risk score is medium (0.5 <= score < 0.85)', async () => {
        // 중간 리스크 데이터셋 구성 (0.6점)
        const warningData: RiskInput = { score: 0.6 };
        const result = await calculateAggregatedRiskScoreAndGate(warningData);

        expect(result.level).toBe('Warning');
        expect(result.isPaywallTriggered).toBe(false); // 경고만 하고 Paywall은 아님
    });

    it('Should correctly identify Red Zone and trigger the Paywall flag when risk score is high (>= 0.85)', async () => {
        // 높은 리스크 데이터셋 구성 (0.9점)
        const criticalData: RiskInput = { score: 0.9 };
        const result = await calculateAggregatedRiskScoreAndGate(criticalData);

        expect(result.level).toBe('Red Zone');
        // Red Zone 진입 시, 비즈니스 플로우가 Paywall로 강제 전환되어야 합니다.
        expect(result.isPaywallTriggered).toBe(true); 
    });

    it('Should throw an error if the risk level is structurally invalid', async () => {
        // 테스트를 위해 구조적으로 올바르지 않은 값 (-1.0점)
        const badData: RiskInput = { score: -1.0 };
        // calculateAggregatedRiskScoreAndGate가 내부적으로 에러 처리를 하는지 확인
        await expect(calculateAggregatedRiskScoreAndGate(badData)).rejects.toThrow("RISK_ENGINE_ERROR");
    });

});