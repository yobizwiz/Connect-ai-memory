import { getSystemicRiskReport } from '../riskService';

describe('systemicRiskReport API Integration Test', () => {

    // ==================================================
    // 🧪 테스트 케이스 1: GREEN ZONE (안전 시나리오)
    // 규제 준수 높고, 데이터가 완전하며, 이상 징후 없음.
    // 기대 결과: riskLevel='GREEN', TRE 값이 낮음.
    test('should return GREEN zone when all inputs are optimal and stable.', async () => {
        const input = {
            regulatoryNonComplianceScore: 15, // Low compliance score
            dataCompletenessIndex: 0.95,     // High data completeness
            systemAnomalyDetected: false    // No anomalies
        };

        const result = await getSystemicRiskReport(input);

        expect(result.riskLevel).toBe('GREEN');
        expect(result.treValue).toBeLessThan(40); // 낮은 수준의 TRE 예상
        expect(result.warningIndicators.length).toBe(0);
    });


    // ==================================================
    // 🧪 테스트 케이스 2: YELLOW ZONE (주의/경계 시나리오)
    // 규제 미준수 점수가 높지만, 시스템적 결함은 아님.
    // 기대 결과: riskLevel='YELLOW', PIG 또는 ComplianceCheck 지표 포함.
    test('should return YELLOW zone when compliance drift is detected.', async () => {
        const input = {
            regulatoryNonComplianceScore: 75, // High non-compliance score (Yellow Trigger)
            dataCompletenessIndex: 0.8,      // Acceptable data completeness
            systemAnomalyDetected: false     // No anomalies yet
        };

        const result = await getSystemicRiskReport(input);

        expect(result.riskLevel).toBe('YELLOW');
        expect(result.warningIndicators.length).toBeGreaterThanOrEqual(1);
        // Yellow Zone의 핵심 지표가 포함되었는지 확인 (PIG 또는 ComplianceCheck)
        const hasYellowIndicator = result.warningIndicators.some(i => 
            i.kpi === 'ComplianceCheck' || i.kpi === 'PIG'
        );
        expect(hasYellowIndicator).toBe(true);
    });


    // ==================================================
    // 🧪 테스트 케이스 3: RED ZONE (치명적 위협 시나리오)
    // 시스템 이상 징후 감지 및 규제 미준수가 결합되어 치명적인 위험 발생.
    // 기대 결과: riskLevel='RED', TRE와 ARS가 핵심 지표로 포함됨.
    test('should return CRITICAL RED zone when systemic anomaly and high non-compliance occur.', async () => {
        const input = {
            regulatoryNonComplianceScore: 90, // Extreme compliance failure
            dataCompletenessIndex: 0.5,      // Moderate data gap
            systemAnomalyDetected: true     // Critical system alert! (Red Trigger)
        };

        const result = await getSystemicRiskReport(input);

        expect(result.riskLevel).toBe('RED');
        // RED Zone의 핵심 지표가 포함되었는지 확인
        const hasRedIndicator = result.warningIndicators.some(i => 
            i.kpi === 'TRE' || i.kpi === 'ARS'
        );
        expect(hasRedIndicator).toBe(true);
    });

});