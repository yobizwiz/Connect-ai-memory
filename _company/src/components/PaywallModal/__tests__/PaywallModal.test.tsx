import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import PaywallModal from '../PaywallModal';
// Mocking the external API service
jest.mock('../../services/riskApi', () => ({
    fetchLossMetrics: jest.fn(), // 성공 경로 목업
    processPayment: jest.fn(), // 결제 프로세스 목업
}));

const mockFetchSuccess = (data) => {
    // fetchLossMetrics가 Promise를 반환하므로, resolve 시점을 제어합니다.
    require('../../services/riskApi').fetchLossMetrics.mockResolvedValue(data);
};

describe('PaywallModal Component Integration Test Suite', () => {
    const mockOnComplete = jest.fn();

    // --- 테스트 1: 성공 경로 (Happy Path) 검증 ---
    it("✅ Happy Path: 데이터 로드 성공 시, L_max 및 결제 CTA가 정상 노출되는지 확인", async () => {
        // GIVEN - 가짜 데이터를 설정하여 API 호출이 성공하는 상황을 모킹합니다.
        const mockData = { currentLevel: 'RED', maxLoss: 50000000 };
        mockFetchSuccess(mockData);

        render(<PaywallModal onDiagnosisComplete={mockOnComplete} />);

        // WHEN - 로딩 상태가 지나고, 최종 UI가 렌더링될 때까지 기다립니다.
        await waitFor(() => {
            expect(screen.getByText('시스템 위협 경고')).toBeInTheDocument();
            expect(screen.getByText('$50,000,000')).toBeInTheDocument(); // $L_max 확인
        });

        // THEN - 결제 버튼이 존재하고 클릭 가능해야 합니다.
        const purchaseButton = screen.getByRole('button', { name: /즉시 시스템 무결성 확보/i });
        expect(purchaseButton).toBeEnabled();

        // 추가 검증: 구매 시 API 호출 및 다음 단계 진입 확인
        mockFetchSuccess(mockData); // 재설정
        require('../../services/riskApi').processPayment.mockResolvedValue('success'); 
        act(() => {
            purchaseButton.click();
        });
        await waitFor(() => {
             expect(mockOnComplete).toHaveBeenCalledTimes(1); // 성공적으로 다음 단계 호출 확인
        });
    });

    // --- 테스트 2: API 호출 실패 및 데이터 누락 (Edge Case Handling) 검증 ---
    it("🐛 Edge Case Test: API 호출에 실패하거나 데이터가 누락되면, 시스템 경고 모드가 활성화되어야 한다.", async () => {
        // GIVEN - fetchLossMetrics를 Reject 시키거나, null을 반환하도록 설정합니다.
        require('../../services/riskApi').fetchLossMetrics.mockRejectedValue(new Error("Network Timeout"));

        render(<PaywallModal onDiagnosisComplete={mockOnComplete} />);

        // WHEN - 로딩 후 에러 상태가 렌더링되는지 확인
        await waitFor(() => {
            expect(screen.getByText('시스템 무결성 검증 실패')).toBeInTheDocument(); // 경고 제목 확인
            expect(screen.getByText(/치명적인 구조적 결함/)).toBeInTheDocument(); // 상세 위협 메시지 확인
            // 이 상태에서는 구매 버튼이 없어야 합니다.
            expect(screen.queryByRole('button', { name: /즉시 시스템 무결성 확보/i })).not.toBeInTheDocument(); 
        });

        // WHEN - 데이터 누락 오류 시나리오 (L_max가 null인 경우)
        require('../../services/riskApi').fetchLossMetrics.mockResolvedValue({ currentLevel: 'LOW', maxLoss: undefined });
        render(<PaywallModal onDiagnosisComplete={mockOnComplete} />);

        await waitFor(() => {
            expect(screen.getByText('데이터 누락 오류')).toBeInTheDocument(); // 커스텀 에러 메시지 확인
        });
    });

     // --- 테스트 3: 상태 역행 방지 (State Transition Guard) 검증 ---
    it("⏳ State Guard Test: 로딩 중이거나 에러 상태일 때는 구매 버튼 클릭을 무효화해야 한다.", async () => {
         // GIVEN - 초기 상태(로딩)를 모킹합니다.
        require('../../services/riskApi').fetchLossMetrics.mockResolvedValue({ currentLevel: 'RED', maxLoss: 10 });

        render(<PaywallModal onDiagnosisComplete={mockOnComplete} />);

        await waitFor(() => {
            // 로드된 후에도, 결제 버튼이 비활성화되어야 합니다. (혹은 핸들러가 막아야 함)
            const purchaseButton = screen.getByRole('button', { name: /즉시 시스템 무결성 확보/i });
            expect(purchaseButton).toBeDisabled(); // 물리적 Disabled 상태 확인
        });

    });
});