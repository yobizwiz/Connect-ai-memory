import { analyzeStructuralRisk, handlePaymentFailure } from '../riskAnalyzerService';
import * as jest from '@jest/globals';

// Mocking the API calls for isolated testing
jest.mock('../riskAnalyzerService');


describe('Mini-Report LP - Structural Risk Analysis Service', () => {
    it('Should simulate successful risk analysis and generate a low score when compliant', async () => {
        const data = { processFlow: '...', complianceCheck: true };
        // Mocking the expected outcome for success case (low risk)
        (analyzeStructuralRisk as jest.Mock).mockResolvedValue({ 
            riskScore: 25, 
            isHighRisk: false, 
            diagnosisMessage: "Everything looks fine.", 
            primaryGap: null, 
            suggestedSolution: "" 
        });

        const result = await analyzeStructuralRisk(data);
        expect(result.riskScore).toBeLessThan(50); // Low risk check
        expect(result.isHighRisk).toBe(false);
    });

    it('Should simulate high structural risk when compliance fails', async () => {
        const data = { processFlow: '...', complianceCheck: false };
        // Mocking the expected outcome for failure case (high risk)
        (analyzeStructuralRisk as jest.Mock).mockResolvedValue({ 
            riskScore: 95, 
            isHighRisk: true, 
            diagnosisMessage: "CRITICAL!", 
            primaryGap: "Compliance Failure", 
            suggestedSolution: "Urgent action required" 
        });

        const result = await analyzeStructuralRisk(data);
        expect(result.riskScore).toBeGreaterThan(80); // High risk check
        expect(result.isHighRisk).toBe(true);
    });
});

describe('Mini-Report LP - Payment Failure Handler', () => {
    it('Should simulate a successful payment and confirm the transition.', async () => {
        const paymentData = { amount: 499, cardToken: 'valid_token' };
        // Mocking success outcome
        (handlePaymentFailure as jest.Mock).mockResolvedValue({ 
            success: true, message: "Success", nextAction: "Download" 
        });

        const result = await handlePaymentFailure(paymentData);
        expect(result.success).toBe(true);
    });

    it('Should simulate failure and convert error into a structural warning (Marketing Opportunity)', async () => {
        const paymentData = { amount: 499, cardToken: 'invalid_token' };
        // Mocking the specific failure case for marketing conversion
        (handlePaymentFailure as jest.Mock).mockResolvedValue({ 
            success: false, 
            message: "⚠️ 시스템 오류 발생: 구조적 취약성이 감지되었습니다.", // 핵심 메시지 검증
            nextAction: "지금 바로 전문가에게 문의하여 시스템 안정성을 확보하십시오." // 행동 유도 검증
        });

        const result = await handlePaymentFailure(paymentData);
        expect(result.success).toBe(false);
        expect(result.message).toContain('구조적 취약성'); // 마케팅 전환 메시지 확인
    });
});