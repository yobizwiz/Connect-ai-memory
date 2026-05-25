import { getSystemicRiskReport } from '../riskService';

// Mocking setTimeout for reliable testing environment
jest.useFakeTimers(); 

describe('getSystemicRiskReport (QLoss API Simulation)', () => {
    it('should return a structured report with three distinct risk levels and financial data', async () => {
        const mockInput = { auditScore: 50 }; // 중간 점수로 테스트 유도
        let promise = getSystemicRiskReport(mockInput);

        // 시간 지연 시뮬레이션 (2.5초) 실행
        jest.advanceTimersByTime(2500);
        await promise;

        const report: any = await promise;
        
        // 필수 구조 검증
        expect(report).toHaveProperty('LOW');
        expect(report).toHaveProperty('MEDIUM');
        expect(report).toHaveProperty('HIGH');

        // 데이터 타입 및 필드 검증 (재무적 손실액과 레벨명)
        expect(typeof report.LOW.potential_loss_usd).toBe('string');
        expect(report.LOW.level).toBeDefined();
        expect(report.MEDIUM.potential_loss_usd).toMatch(/\$\d+\.\d{2} Million/); // $X.XX Million 형식 검증
        expect(report.HIGH.potential_loss_usd).toMatch(/^\$[\d,]+\.\d{2} Million$/); // 큰 금액 패턴 검증
    });

    it('should prioritize "Critical" status and maximum loss when high risk is detected (High Score)', async () => {
        const mockInput = { auditScore: 80 }; 
        let promise = getSystemicRiskReport(mockInput);

        jest.advanceTimersByTime(2500);
        await promise;

        const report: any = await promise;
        
        // 고위험 시나리오에서 HIGH 레벨이 Critical을 포함하는지 확인 (로직에 따라)
        expect(report.HIGH.level).toBe('Critical'); 
        expect(report.HIGH.description).toContain("시스템적 생존 위협");

    });

    it('should handle low risk input and provide reassuring but structured data', async () => {
        const mockInput = { auditScore: 10 }; // 낮은 점수 시나리오
        let promise = getSystemicRiskReport(mockInput);

        jest.advanceTimersByTime(2500);
        await promise;

        const report: any = await promise;
        
        // Low Risk가 성공적으로 반환되었는지 확인
        expect(report.LOW.level).toBe('Low'); 
    });
});