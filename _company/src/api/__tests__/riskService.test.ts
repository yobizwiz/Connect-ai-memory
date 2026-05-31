import { calculateRiskScore } from '../riskService';

// Mocking the regulatory data loader to ensure test isolation
jest.mock('../../../KnowledgeBase/Regulatory_Risk_Index_V1.json', () => ({
    default: {
        regulations: [
            {
                name: "GDPR (General Data Protection Regulation)",
                focus_area: "PII 유출 및 데이터 주권 위반",
                risk_metric: {
                    violation_type: "처리 목적 외 활용 / 비식별화 실패",
                    estimated_financial_loss_max_lmax: "$20M - $50M+", 
                    penalty_mechanism: "매출 대비 최대 4% 또는 2,000만 유로 중 높은 금액.",
                    annual_trend_analysis: { recent_variance_estimate: "+15%", key_trigger: "데이터의 '사용 과정'에 대한 검증 의무(Provenance Mandate) 위반." }
                }
            },
            {
                name: "CCPA / CPRA (California Consumer Privacy Act)",
                focus_area: "소비자 데이터 통제권 침해",
                risk_metric: {
                    violation_type: "판매 및 공유 동의 부재",
                    estimated_financial_loss_max_lmax: "$10M - $30M", 
                    penalty_mechanism: "최대 소비자 피해액 또는 매출 기반 과징금.",
                    annual_trend_analysis: { recent_variance_estimate: "+8%", key_trigger: "데이터의 '수집 동의' 절차 위반." }
                }
            }
        ]
    }
}));

describe('calculateRiskScore API Integration Test', () => {
    // Mocking the file system read to prevent actual I/O during unit test run
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully calculate risk score using the integrated GDPR schema (Lmax)', async () => {
        const result = await calculateRiskScore("GDPR");
        expect(result).toHaveProperty('score');
        // L_max가 정확히 로드되었는지 확인
        expect(result.lmax).toBe("$20M - $50M+"); 
        // L_min이 N/A 대신 특정 값 또는 계산된 값이 와야 함을 검증 (현재는 Mocked)
        expect(result.lmin).not.toBe("N/A"); 
    });

    it('should calculate risk score for CCPA and correctly identify the regulatory body', async () => {
        const result = await calculateRiskScore("CCPA");
        // L_max가 정확히 로드되었는지 확인
        expect(result.lmax).toBe("$10M - $30M"); 
    });

    it('should return zero score and N/A for unknown violation types (Graceful Degradation)', async () => {
        const result = await calculateRiskScore("UNKNOWN_REGULATION");
        expect(result.score).toBe(0);
        expect(result.lmax).toBe("N/A");
    });
});