// src/app/api/v1/risk-assessment/risk.test.ts
import { calculateRiskScoreAndLevel } from './route';

describe('calculateRiskScoreAndLevel - Structural Integrity Test', () => {
    // 💡 테스트 목표: 코드가 실제 비즈니스 로직(QLoss 계산)에 대해 구조적으로 완벽한지 검증합니다.
    
    test('Scenario 1: Maximum Red Zone Risk (AI Hallucination & PII Leakage)', async () => {
        const highRiskInputs = {
            'AI Hallucination': 95, // 매우 높음
            'PII Leakage': 80,     // 높음
            'Knowledge Silo': 10   // 낮음
        };

        const result = await calculateRiskScoreAndLevel(highRiskInputs);

        expect(result.risk_level).toBe('Red'); // Red Zone 예상
        expect(result.final_score).toBeGreaterThanOrEqual(0.9); // 점수는 꽤 높게 나와야 함 (0.35*0.95 + 0.25*0.8)
    });

    test('Scenario 2: Moderate Yellow Zone Risk (Only Knowledge Silo)', async () => {
        const moderateRiskInputs = {
            'AI Hallucination': 10,
            'PII Leakage': 10,
            'Knowledge Silo': 75 // 중간 정도의 위협만 존재함
        };

        const result = await calculateRiskScoreAndLevel(moderateRiskInputs);

        expect(result.risk_level).toBe('Yellow'); // Yellow Zone 예상
    });

    test('Scenario 3: Low Green Zone Risk (Minimal inputs)', async () => {
        const lowRiskInputs = {
            'AI Hallucination': 5,
            'PII Leakage': 10,
            'Knowledge Silo': 5
        };

        const result = await calculateRiskScoreAndLevel(lowRiskInputs);

        expect(result.risk_level).toBe('Green'); // Green Zone 예상
    });
});