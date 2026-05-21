import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GatekeeperCTA from '../GatekeeperCTA';
import * as gatekeeperService from '../../services/gatekeeperService';

// Mocking the entire API service layer for unit testing isolation
jest.mock('../../services/gatekeeperService', () => ({
    initiateRiskCheck: jest.fn(),
    processPaymentGatekeeper: jest.fn(),
}));

describe('GatekeeperCTA Component Integration Test', () => {
    beforeEach(() => {
        // 클린 상태로 시작
        jest.clearAllMocks(); 
    });

    test('1. 초기 진단 요청 시, 로딩 상태와 경고 UI가 올바르게 표시되는지 검증', async () => {
        // Mocking: API 호출이 완료될 때까지 3초 지연 및 성공적인 Critical 리스크 반환을 가정
        (gatekeeperService.initiateRiskCheck as jest.Mock).mockResolvedValue({
            status: 'CRITICAL',
            riskScore: 95,
            message: "🚨 CRITICAL EXPOSURE DETECTED.",
            actionRequired: 'PAYMENT_REQUIRED',
            dataPayload: { lossEstimateY: 70000 }
        });

        render(<GatekeeperCTA />);
        
        // 초기 로딩 상태 확인 (시간 지연을 가정)
        await waitFor(() => expect(screen.getByText(/시스템 분석 중/i)).toBeInTheDocument());

        // 데이터 입력 및 제출 시뮬레이션
        fireEvent.change(screen.getByLabelText('산업군 (Industry)'), { target: { value: 'finance' } });
        fireEvent.click(screen.getByRole('button', /시스템 생존 위협 진단 시작/i));

        // 결과가 Critical Red Zone으로 변경되었는지 확인
        await waitFor(() => {
            expect(screen.getByText(/🚨 [SYSTEM 경고] CRITICAL 위험 감지/i)).toBeInTheDocument();
            expect(screen.getByText('잠재적 손실 추정액 ($Y$):')).toBeInTheDocument();
            expect(screen.getByRole('button', /필수 안전장치 구매 \(Gatekeeper 3단계\)/i)).toBeEnabled();
        });

    });

    test('2. 게이트키퍼 1차 진단 후, 결제 CTA를 클릭하면 Payment Gatekeeper 로직이 실행되는지 검증', async () => {
        // Mocking: 1차 리스크 진단 결과 (Payment Required)
        (gatekeeperService.initiateRiskCheck as jest.Mock).mockResolvedValue({
            status: 'CRITICAL',
            riskScore: 95,
            message: "🚨 CRITICAL EXPOSURE DETECTED.",
            actionRequired: 'PAYMENT_REQUIRED',
            dataPayload: { lossEstimateY: 70000 }
        });

        // Mocking: 결제 게이트키퍼 성공 응답 (Payment Success)
        (gatekeeperService.processPaymentGatekeeper as jest.Mock).mockResolvedValue({ success: true, message: '✅ 안전장치 구독이 완료되었습니다.' });


        render(<GatekeeperCTA />);
        
        // 1단계 실행 및 대기
        fireEvent.change(screen.getByLabelText('산업군 (Industry)'), { target: { value: 'finance' } });
        fireEvent.click(screen.getByRole('button', /시스템 생존 위협 진단 시작/i));

        // 2단계: 결제 버튼 클릭 시도
        await waitFor(() => expect(screen.getByRole('button', /필수 안전장치 구매 \(Gatekeeper 3단계\)/i)).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', /필수 안전장치 구매 \(Gatekeeper 3단계\)/i));

        // 결과 확인: 최종 성공 메시지가 표시되었는지 검증
        await waitFor(() => {
            expect(screen.getByText(/시스템 무결성 확보 완료/i)).toBeInTheDocument();
            expect(screen.getByText('✅ 안전장치 구독이 완료되었습니다.')).toBeInTheDocument();
        });
    });
});