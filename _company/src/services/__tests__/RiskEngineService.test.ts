import { calculateStructuralRisk } from '../../RiskEngineService';
// Jest 또는 유사한 테스트 프레임워크 사용 가정

describe('RiskEngineService: Structural Risk Assessment', () => {

    // 1. 정상적인 'LOW' 리스크 케이스 테스트 (기본 기능 검증)
    test('should calculate low risk when all scores are high and balanced', () => {
        const safeData = { regulatoryCompliance: 95, marketVolatility: 80, internalProcessEfficiency: 92 };
        const result = calculateStructuralRisk(safeData);

        expect(result.riskScore).toBeGreaterThanOrEqual(70); // 임계치보다 높게 설정했는지 확인 (테스트 값 조정 필요)
        expect(result.threatLevel).toBe("LOW");
        expect(result.summaryTitle).toContain("[안정]");
    });

    // 2. 'CRITICAL' 리스크 케이스 테스트 (최대 압박감 시뮬레이션)
    test('should calculate CRITICAL risk when compliance score is dangerously low', () => {
        const criticalData = { regulatoryCompliance: 10, marketVolatility: 90, internalProcessEfficiency: 50 }; // Compliance가 핵심적으로 낮음
        const result = calculateStructuralRisk(criticalData);

        expect(result.riskScore).toBeGreaterThan(75); 
        expect(result.threatLevel).toBe("CRITICAL");
        expect(result.summaryTitle).toContain("[RED ZONE 경고]");
        expect(result.requiredAction[0].isPaidSolutionRequired).toBe(true); // 결제 유도 로직 검증
    });

    // 3. 에지 케이스 테스트 (입력값 누락 방어)
    test('should handle missing data inputs gracefully and default to a moderate risk', () => {
        const incompleteData = {}; // 모든 데이터가 누락된 경우
        const result = calculateStructuralRisk(incompleteData);

        // 최소 점수와 안전한 레벨을 반환하는지 검증합니다.
        expect(result.riskScore).toBeLessThan(45); 
        expect(result.threatLevel).not.toBe("CRITICAL"); 
    });

    // 4. 타입 및 구조적 무결성 테스트 (Schema Validation)
    test('should always return an object matching the defined RiskAssessmentResult schema', () => {
        const data = {};
        const result: any = calculateStructuralRisk(data); // any 사용으로 강제 실행
        expect(typeof result).toBe('object');
        expect('riskScore' in result).toBe(true);
        expect('threatLevel' in result).toBe(true);
    });

});