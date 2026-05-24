import { calculateInitialLoss, calculateTimeDecay, calculateFinalAuditPrice } from './riskCalculators';

describe('Risk Calculators (Time Decay & Pricing)', () => {
    
    beforeEach(() => {
        // 초기 로드 시간 초기화
        if (typeof window !== 'undefined') {
            window.initialLoadTime = undefined;
        }
    });

    // 1. 초기 리스크 손실액 계산 테스트
    test('should return mock initial loss of 1000', () => {
        const mockFormData = {} as FormData;
        const initialLoss = calculateInitialLoss(mockFormData);
        expect(initialLoss).toBe(1000);
    });

    // 2. 시간 경과에 따른 QLoss 감쇠/증폭 테스트
    test('should return previous loss if elapsed time is less than 5 seconds', () => {
        const prevLoss = 1000;
        window.initialLoadTime = 10000; // 10초에 시작
        const currentTime = 14000;      // 14초에 측정 (4초 경과 -> 5초 미만)
        
        const finalLoss = calculateTimeDecay(prevLoss, currentTime);
        expect(finalLoss).toBe(prevLoss);
    });

    test('should amplify loss over time if elapsed time is 5 seconds or more', () => {
        const prevLoss = 1000;
        window.initialLoadTime = 10000; // 10초에 시작
        const currentTime = 70000;      // 70초에 측정 (60초 경과 -> 1분)
        
        const finalLoss = calculateTimeDecay(prevLoss, currentTime);
        // decayFactor = 2^(60/60) = 2
        // 기대값 = 1000 * 2 = 2000
        expect(finalLoss).toBe(2000);
    });

    test('should cap the amplified loss at 10000', () => {
        const prevLoss = 8000;
        window.initialLoadTime = 10000; // 10초에 시작
        const currentTime = 130000;     // 130초에 측정 (120초 경과 -> 2분)
        
        const finalLoss = calculateTimeDecay(prevLoss, currentTime);
        // newLoss = 8000 * 2^2 = 32000 -> 10000으로 한계값 클리핑
        expect(finalLoss).toBe(10000);
    });

    // 3. 최종 의무 감사 가격 계산 테스트
    test('should calculate final audit price based on qLoss', () => {
        const qLoss = 5000;
        const finalPrice = calculateFinalAuditPrice(qLoss);
        // 기대값 = 5000 * 0.8 + 500 = 4500
        expect(finalPrice).toBe(4500);
    });
});