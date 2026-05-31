// src/services/__tests__/riskGatewayService.test.ts
import { calculateTRE, loadRegulatoryData } from '../riskGatewayService';
import { IncidentEvent, RegulatoryRiskParameters, RiskProfile } from '../../types/regulatoryTypes';

// --- Mock Data Setup ---
const mockRiskProfiles: RiskProfile[] = [
    {
        risk_id: "R_PII_LEAKAGE_HIPAA",
        risk_element: "개인 식별 정보(PII) 유출 및 비식별화 실패",
        regulations: ["HIPAA (미국)", "GDPR (EU, 데이터 주권 측면)"],
        impact_type: "벌금 및 소송 배상액 (Financial & Litigation Loss)",
        lmax_estimation: { min_usd: 50000, max_usd: 2000000, source_notes: "" },
        weighting_factor: { base_weight: 4.5, description: "", multiplier_scope: "" },
        provenance: "[Mock]"
    },
    {
        risk_id: "R_COMPLIANCE_DRIFT",
        risk_element: "필수 절차 누락 및 문서화 미비 (Compliance Drift)",
        regulations: ["ISO 27001"],
        impact_type: "벌금 및 소송 배상액 (Financial & Litigation Loss)",
        lmax_estimation: { min_usd: 1000, max_usd: 50000, source_notes: "" },
        weighting_factor: { base_weight: 2.0, description: "", multiplier_scope: "" },
        provenance: "[Mock]"
    }
];

const mockDataSet: RegulatoryRiskParameters = {
    dataset_name: "Global_B2B_Compliance_Risk_Matrix",
    description: "Test Data Set",
    version: "1.0",
    risk_profiles: mockRiskProfiles
};


describe('calculateTRE (Risk Gateway Service)', () => {

    // TDD Test Case 1: 정상적인, 치명적인 PII 유출 시나리오 (최대 점수 근접)
    test('should calculate high TRE score for severe PII leakage', () => {
        const event: IncidentEvent = {
            incidentType: "PII_ACCESS",
            severityScore: 10, // 최악의 심각도
            involvedDataCount: 500  // 데이터 갯수 많음
        };

        const result = calculateTRE(event, mockDataSet);

        // 기대 검증: PII 레거시를 기반으로 높은 점수가 나와야 함.
        expect(result.tre_score).toBeGreaterThanOrEqual(125); // (4.5 * 10 * 1) * 2.5 = 112.5 -> 충분히 높게 잡음
        expect(result.risk_id).toContain("R_PII_LEAKAGE_HIPAA");
        // Lmax 검증: PII 레거시의 Max/Min을 따름 (최대값이므로)
        expect(result.lmax_estimate.min_usd).toBe(50000); 
    });

    // TDD Test Case 2: 경미하고, 데이터가 적은 규정 위반 시나리오 (낮은 점수)
    test('should calculate low TRE score for minor compliance drift', () => {
        const event: IncidentEvent = {
            incidentType: "DOCUMENT_MISSING",
            severityScore: 2, // 낮은 심각도
            involvedDataCount: 10  // 데이터 갯수 적음
        };

        // 이 테스트는 PII 매칭만 하는 현재 로직에는 잡히지 않지만, 가중치가 낮게 계산되는지 검증합니다.
        const result = calculateTRE(event, mockDataSet);

        expect(result.tre_score).toBeCloseTo(5.0); // PII가 아니므로 기본 점수 5 유지 예상
    });


    // TDD Test Case 3: 입력 데이터 불완전성 방어 (Null/Undefined Input)
    test('should throw an error if input event or dataSet is null', () => {
        const invalidEvent: IncidentEvent = { incidentType: "TEST", severityScore: 5, involvedDataCount: 1 };

        // Case 3a: 데이터셋 누락
        expect(() => calculateTRE(invalidEvent, null as any)).toThrow("Invalid input parameters provided for TRE calculation.");
        
        // Case 3b: 이벤트 정보 누락 (Severity Score)
        const incompleteEvent: Partial<IncidentEvent> = { incidentType: "TEST", involvedDataCount: 1 };
        expect(() => calculateTRE(incompleteEvent as any, mockDataSet)).toThrow("Invalid input parameters provided for TRE calculation.");
    });

    // TDD Test Case 4: Mock API Endpoint의 에러 핸들링 검증 (System Integrity)
    test('should gracefully handle load failure in the service layer', async () => {
        const failingEvent: IncidentEvent = { incidentType: "TEST", severityScore: 5, involvedDataCount: 1 };

        // 데이터셋에 고의로 잘못된 구조를 주입하여 로드 실패 유도
        const badDataSet: any = { risk_profiles: 'this is not an array' };

        await expect(riskGatewayService.calculate(failingEvent, badDataSet)).rejects.toThrow("Internal System Error: Failed to calculate risk score");
    });
});