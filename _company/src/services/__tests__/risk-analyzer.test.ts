import { analyzeRiskAndCalculateLoss } from '../risk-analyzer.service';
import { DiagnosisRequest } from '../../types/threat-score.d';

// Mock API Test Suite (TypeScript)
describe('analyzeRiskAndCalculateLoss Core Logic Validation', () => {
    const assetValue = 100000; // 테스트 기준 자산 가치 $10만

    test('Scenario 1: Low Risk - Threat Score가 낮을 때 손실액이 매우 작아야 한다.', () => {
        // [TEST INPUT] 낮은 위협 점수 (30점)
        const request: DiagnosisRequest = {
            threatData: { score: 30 },
            userContext: { industry: 'Tech', assetValueUSD: assetValue }
        };

        const result = analyzeRiskAndCalculateLoss(request);

        // [ASSERTION] Low Risk여야 하며, 손실액은 자산 가치의 최소 비율을 유지해야 함.
        expect(result.riskLevel).toBe('Low');
        expect(parseFloat(result.estimatedLossUSD)).toBeLessThan(assetValue * 0.05); // $5,000보다 작아야 한다.
    });

    test('Scenario 2: Medium Risk - 중간 점수에서 자산 가치 대비 유의미한 손실액이 나와야 한다.', () => {
        // [TEST INPUT] 중간 위협 점수 (60점)
        const request: DiagnosisRequest = {
            threatData: { score: 60 },
            userContext: { industry: 'Finance', assetValueUSD: assetValue }
        };

        const result = analyzeRiskAndCalculateLoss(request);

        // [ASSERTION] Medium Risk여야 하며, 손실액이 자산 가치의 중간 범위에 있어야 함.
        expect(result.riskLevel).toBe('Medium');
        expect(parseFloat(result.estimatedLossUSD)).toBeGreaterThanOrEqual(assetValue * 0.05); // $5,000 이상이어야 한다.
    });

    test('Scenario 3: High Risk - 높은 점수에서 구조적 공포가 극대화된 손실액이 나와야 한다.', () => {
        // [TEST INPUT] 매우 높은 위협 점수 (95점)
        const request: DiagnosisRequest = {
            threatData: { score: 95 },
            userContext: { industry: 'Regulatory', assetValueUSD: assetValue }
        };

        const result = analyzeRiskAndCalculateLoss(request);

        // [ASSERTION] High Risk여야 하며, 손실액은 자산 가치의 높은 비율을 차지해야 함.
        expect(result.riskLevel).toBe('High');
        expect(parseFloat(result.estimatedLossUSD)).toBeGreaterThan(assetValue * 0.15); // $15,000보다 커야 한다.
    });

    test('Scenario 4: Edge Case - 자산 가치가 0일 경우 손실액은 0이어야 한다.', () => {
        // [TEST INPUT] 위협 점수 무관, 자산가치 0
        const request: DiagnosisRequest = {
            threatData: { score: 80 },
            userContext: { industry: 'Unknown', assetValueUSD: 0 }
        };

        const result = analyzeRiskAndCalculateLoss(request);

        // [ASSERTION] 손실액은 정확히 0이어야 한다. (시스템적 결함 방지)
        expect(result.estimatedLossUSD).toBe('0.00');
    });
});