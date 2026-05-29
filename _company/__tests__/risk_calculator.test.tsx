// @ts-ignore - 테스트 환경에서 임포트 경로 오류 무시
import { calculateRiskReport } from '@/services/risk_calculator_service';
import { RiskInputSchema, SimulationReport } from '@/types/RiskSimulationSchema';

describe('🚨 E2E 통합 리스크 시뮬레이션 검증 (Structural Integrity Test)', () => {

    // 🟢 케이스 1: 정상 작동 및 Low Risk Zone 테스트
    test('should calculate a valid report and return LOW risk level for benign input', async () => {
        const inputs: RiskInputSchema = {
            isAny: false,
            hasLegalAuthority: true,
            riskInput1: 10, // 낮은 값으로 Low Risk 예상
            // ... 나머지 입력값은 테스트에 필요한 최소값으로 설정
        };

        let report: SimulationReport;
        try {
             report = await calculateRiskReport(inputs);
        } catch (e) {
            fail(`Low risk test failed unexpectedly. Error: ${e}`);
        }

        expect(report).toBeDefined();
        // Low Risk는 Yellow Zone 경계 이하의 지표를 가져야 함
        expect(report!.riskLevel).toBe('GREEN'); 
        expect(report!.treValue).toBeLessThanOrEqual(50); // 낮은 TRE 값 검증
    });

    // 🟡 케이스 2: 임계점 도달 및 Yellow Zone 경고 테스트 (Transition Point)
    test('should transition to YELLOW risk level when key KPI crosses threshold', async () => {
        const inputs: RiskInputSchema = {
            isAny: true,
            hasLegalAuthority: false,
            riskInput1: 80, // Yellow Zone 경계 부근 값 설정
            // ... 나머지 입력값
        };

        let report: SimulationReport;
        try {
             report = await calculateRiskReport(inputs);
        } catch (e) {
            fail(`Yellow risk test failed unexpectedly. Error: ${e}`);
        }

        expect(report).toBeDefined();
        // Yellow Zone은 특정 범위의 Lr 값을 가져야 함
        expect(report!.riskLevel).toBe('YELLOW'); 
    });

    // 🔴 케이스 3: 구조적 공백 발생 및 Red Zone 강제 테스트 (Critical Failure)
    test('should report CRITICAL RED risk level when systemic failure inputs are provided', async () => {
        const inputs: RiskInputSchema = {
            isAny: true,
            hasLegalAuthority: false,
            riskInput1: 999, // 매우 높은 값으로 Red Zone 유도
            // ... 나머지 입력값
        };

        let report: SimulationReport;
        try {
             report = await calculateRiskReport(inputs);
        } catch (e) {
            fail(`Red risk test failed unexpectedly. Error: ${e}`);
        }

        expect(report).toBeDefined();
        // Red Zone은 가장 높은 경고 레벨을 가져야 함
        expect(report!.riskLevel).toBe('RED'); 
        expect(report!.treValue).toBeGreaterThan(500); // 매우 높은 TRE 값 검증
    });

    // ❌ 케이스 4: 예외 처리 테스트 (Edge Case - Data Validation)
    test('should throw an error if mandatory input data is missing or invalid', async () => {
        const inputs: RiskInputSchema = {
            isAny: false,
            hasLegalAuthority: true,
            riskInput1: NaN, // 유효하지 않은 데이터 입력
            // ... 나머지 입력값
        };

        await expect(calculateRiskReport(inputs)).rejects.toThrow(/필수 리스크 지표.*누락되었거나 숫자가 아닙니다/);
    });
});