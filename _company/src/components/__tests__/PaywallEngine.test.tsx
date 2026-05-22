// Note: This is a high-level integration test, requiring mock functions for async behavior.
/** 
 * @description PaywallEngine 컴포넌트의 통합 테스트 스켈레톤입니다. 
 * 실제 환경에서는 Jest + React Testing Library를 사용하여 비동기 흐름과 UI 업데이트를 검증해야 합니다.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PaywallEngine } from '../PaywallEngine';
import * as utils from '../../utils/riskCalculator';

// Mocking the complex utility functions to control outcomes during testing
jest.mock('../../utils/riskCalculator', () => ({
    ...jest.requireActual('../../utils/riskCalculator'),
    calculateTotalRiskExposure: jest.fn(),
    calculateMinimumInsurancePremium: jest.fn()
}));


describe('PaywallEngine Integration Test (Simulation Flow)', () => {
    // Mocking the API call to control asynchronous timing and results
    const mockSimulateRiskAssessment = utils.calculateTotalRiskExposure; 

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Successful flow: Input -> Loading -> Result Display', async () => {
        // 1. Mock the success path for the API call and calculation
        mockSimulateRiskAssessment.mockResolvedValue({
            totalRiskExposureUSD: 200000, // $20만으로 고정하여 테스트 용이하게 설정
            identifiableGapCount: 5,
            riskLevel: 'HIGH',
            analysisDurationMs: 3000
        });
        utils.calculateMinimumInsurancePremium.mockReturnValue(160000); // $16만으로 고정

        render(<PaywallEngine />);
        
        // 2. 초기 상태 확인 (버튼 활성화 및 입력 필드 존재)
        const analyzeButton = screen.getByRole('button', { name: /계산 시작/i });
        expect(analyzeButton).toBeEnabled();

        // 3. 입력값 변경 시뮬레이션 (테스트 데이터 주입)
        fireEvent.change(screen.getByLabelText(/산업군 선택/), { target: { value: 'FinTech' } });
        fireEvent.change(screen.getByLabelText(/직원 수/i), { target: { value: 150 } });
        fireEvent.change(screen.getByLabelText(/현재 컴플라이언스 준수 점수/i), { target: { value: 20 } });

        // 4. 분석 버튼 클릭 및 비동기 대기
        fireEvent.click(analyzeButton);
        
        // 로딩 상태 확인 (버튼이 disabled되고 "분석 중" 메시지가 보여야 함)
        await waitFor(() => {
            expect(screen.getByText(/분석 데이터 분석 중/i)).toBeInTheDocument();
        });

        // 5. 최종 결과 검증: Red Zone 스타일과 계산된 금액 확인
        const resultCard = screen.queryByRole('heading', { level: 2, name: /시스템 경고:/i });
        expect(resultCard).toBeInTheDocument();

        // 총 위험 노출액 $20만 확인
        expect(screen.getByText(/\$ 200,000/)).toBeInTheDocument();
        
        // 최소 보험료 $16만 확인
        expect(screen.getByText(/\$ 160,000/)).toBeInTheDocument();

    });
});