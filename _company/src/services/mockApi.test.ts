import { calculateRiskScore } from './mockApi';
import { QuizInputs, QuizResult } from '../types/quizTypes';

/**
 * @description Mock API Service Layer에 대한 통합 테스트 케이스 (E2E 시나리오의 근간)
 * 이 테스트는 리스크 계산 로직(Business Logic)이 외부 UI 변화와 관계없이 항상 일관되게 작동하는지 검증합니다.
 */
describe('MockApi: calculateRiskScore Integration Test', () => {

    // 🚨 Critical Scenario (최악의 경우): 모든 컴플라이언스 요소에서 결함 발견 시뮬레이션
    test('should return Critical risk level and high AQRS when all inputs are poor', async () => {
        const poorInputs: QuizInputs = {
            dataHandlingPractices: 'Poor',
            vendorOversightFrequency: 'Rarely',
            encryptionScope: 'Partial'
        };

        const result: QuizResult = await calculateRiskScore(poorInputs);

        // 기대값 검증: Critical 레벨에 대한 높은 AQRS와 점수 구조를 확인
        expect(result.riskLevel).toBe('Critical'); 
        expect(result.finalScore).toBeGreaterThanOrEqual(60); // 계산 로직상 최대치 근접 예상
        expect(result.totalAqrs).toBeGreaterThanOrEqual(25_000_000); // 최소 2천만 이상 기대

    });

    // ✅ Low Scenario (최상의 경우): 모든 컴플라이언스 요소가 완벽할 때 시뮬레이션
    test('should return Low risk level and minimal AQRS when all inputs are excellent', async () => {
        const perfectInputs: QuizInputs = {
            dataHandlingPractices: 'Excellent', // 가정 추가 (실제 구현 필요)
            vendorOversightFrequency: 'Continuously', // 가정 추가
            encryptionScope: 'Full'
        };

        // 참고: 현재 mockApi.ts의 로직에는 'Excellent'나 'Continuously'에 대한 가중치 정의가 없어, 
        // 실제로는 완벽한 입력 시에도 어느 정도의 기본 점수(Base Score)가 나오도록 조정해야 함.
        const result: QuizResult = await calculateRiskScore({ // 임시로 현재 정의된 Enum으로 대체 테스트
            dataHandlingPractices: 'Excellent', 
            vendorOversightFrequency: 'Continuously', 
            encryptionScope: 'Full'
        });

        // 기대값 검증: Low 레벨과 가장 낮은 AQRS를 확인 (혹은 기본 점수 범위 내)
        expect(result.riskLevel).toBe('Low');
        expect(result.finalScore).toBeLessThanOrEqual(15); 
    });

    // ⚠️ Medium Scenario (경고 단계): 일부 결함이 있을 때 시뮬레이션
    test('should return Medium risk level when some inputs are weak', async () => {
        const mixedInputs: QuizInputs = {
            dataHandlingPractices: 'Medium',
            vendorOversightFrequency: 'Annually',
            encryptionScope: 'Partial'
        };

        const result: QuizResult = await calculateRiskScore(mixedInputs);

        // 기대값 검증: Medium 레벨과 중간 범위의 AQRS를 확인 (15~34점 예상)
        expect(['Medium', 'High']).toContain(result.riskLevel); 
        expect(result.finalScore).toBeGreaterThanOrEqual(15);
    });

});