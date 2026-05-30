// src/components/StatusGauge/__tests__/StatusGauge.test.tsx

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import StatusGauge from '../StatusGauge'; 

// NOTE: 실제 테스트 환경에서는 jest-mocking을 사용하여 API 호출 및 Timeouts를 제어해야 합니다.
describe('StatusGauge Component Integrity Test Suite', () => {
    const MOCK_AB_GROUP = 'treatment';

    it('✅ Initial State (Normal Zone): 점수가 낮을 때 기본 상태가 올바르게 표시되는지 검증한다.', async () => {
        // 1. 테스트 전제: 초기 스코어 설정
        render(<StatusGauge currentRiskScore={20} abTestGroup={MOCK_AB_GROUP} />);
        
        // 2. 기대 결과 확인 (Normal Zone)
        expect(screen.getByText(/Systemic Risk Monitor/)).toHaveTextContent('Normal');
        const scoreElement = screen.getByRole('heading', { name: /현재 리스크 점수:/i }).closest('.text-5xl');
        expect(scoreElement).toHaveTextContent('20%');
    });

    it('✅ State Transition 1 (Warning Zone): 스코어가 높아지면 상태와 시각적 경고가 전환되는지 검증한다.', async () => {
        // 1. 테스트 전제: Warning Zone 진입 점수 설정
        const initialScore = 40;
        render(<StatusGauge currentRiskScore={initialScore} abTestGroup={MOCK_AB_GROUP} />);

        // 2. 기대 결과 확인 (Warning Zone)
        expect(screen.getByText(/Systemic Risk Monitor/)).toHaveTextContent('Warning');
    });

    it('✅ State Transition 2 (Critical Zone): 스코어가 임계값을 초과하면 Critical 상태로 전환되며 버튼이 활성화되는지 검증한다.', async () => {
        // 1. 테스트 전제: Critical Zone 진입 점수 설정
        const criticalScore = 85;
        render(<StatusGauge currentRiskScore={criticalScore} abTestGroup={MOCK_AB_GROUP} />);

        // 2. 기대 결과 확인 (Critical Zone)
        expect(screen.getByText(/Systemic Risk Monitor/)).toHaveTextContent('Critical');
        const button = screen.getByRole('button', { name: /진단 보고서 요청 \(결제 장벽 진입\)/i });
        expect(button).toBeEnabled(); 
    });

    it('✅ Critical Flow & A/B Testing (Paywall Trigger): Critical 상태에서 버튼 클릭 시, A/B 로깅 후 Paywall 모달이 뜨는지 검증한다.', async () => {
        // Mocking the API call to ensure it runs correctly before showing the modal
        const mockLogABTestEvent = jest.spyOn(console, 'log').mockImplementation(() => {});

        render(<StatusGauge currentRiskScore={90} abTestGroup={MOCK_AB_GROUP} />);
        
        // 1. Paywall 버튼 클릭 이벤트 발생
        const triggerButton = screen.getByRole('button', { name: /진단 보고서 요청 \(결제 장벽 진입\)/i });
        fireEvent.click(triggerButton);

        // 2. 기대 결과 확인 (Paywall 활성화)
        expect(screen.getByText(/시스템 경고: 데이터 접근 차단/)).toBeInTheDocument();
        
        // 3. A/B 테스트 로깅이 실행되었는지 로그를 통해 간접 검증
        expect(mockLogABTestEvent).toHaveBeenCalledWith(expect.any(String), 'DIAGNOSIS_REQUEST');

        // Cleanup mock
        mockLogABTestEvent.mockRestore();
    });
});