/**
 * src/components/__tests__/QuizSimulator.test.tsx
 * 단위 테스트 스켈레톤: 핵심 비즈니스 로직과 API 연동 흐름 검증 (Structural Integrity 확보)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import QuizSimulator from '../QuizSimulator';
import * as mockApi from '../../services/mockApi';

// Mock API 함수를 모킹하여 테스트 환경에서 제어 가능하게 만듭니다.
jest.mock('../../services/mockApi', () => ({
  submitQuizData: jest.fn(),
}));


describe('QuizSimulator Component Testing (Structural Integrity Check)', () => {
    beforeEach(() => {
        (mockApi.submitQuizData as jest.Mock).mockClear();
        // 테스트 시뮬레이션을 위해 초기 상태로 강제 설정
    });

    it('1. 컴포넌트가 정상적으로 렌더링되고 첫 질문을 보여주는지 확인', () => {
        render(<QuizSimulator />);
        // Q1 제목이 보이는지 체크 (최소한의 UI 검증)
        expect(screen.getByText(/회사 프로세스 중 가장 신뢰하는 리스크 검증 방법/i)).toBeInTheDocument(); 
    });

    it('2. 답변 선택 시, 누적 점수와 상태가 정확히 업데이트되는지 확인 (State Management)', async () => {
        render(<QuizSimulator />);

        // Q1의 'c' 옵션 클릭 시뮬레이션 (점수: 18)
        const optionCButton = screen.getByText(/규정\/법규 변경 시 발생하는 잠재적 위협을 예측하고 구조적으로 선제 대응한다\./i).closest('button');
        fireEvent.click(optionCButton!);

        // 다음 질문으로 이동 (버튼 활성화 확인)
        await waitFor(() => {
             // 두 번째 질문의 텍스트가 나타났는지 체크하여 상태 전환을 검증합니다.
            expect(screen.getByText(/새로운 기능 출시 전, 가장 먼저 검토해야 할 것은 무엇입니까?/i)).toBeInTheDocument();
        });
    });

    it('3. 모든 질문 완료 후 API를 호출하고 결과를 정확히 받아오는지 확인 (E2E Data Flow Test)', async () => {
        render(<QuizSimulator />);

        // Q1 답변 시뮬레이션 (점수 18)
        fireEvent.click(screen.getByText(/규정\/법규 변경 시 발생하는 잠재적 위협을 예측하고 구조적으로 선제 대응한다\./i).closest('button')!);

        // Q2 답변 시뮬레이션 (최고 리스크: 15점 가정)
        await waitFor(() => {
             fireEvent.click(screen.getByText(/예상치 못한 외부 규제 변화가 없는지 법률적 검토\./i).closest('button')!);
        });

        // Mock API의 성공적인 반환값 설정 (총 점수 33점)
        const mockResult: DiagnosisResult = {
            totalScore: 33,
            riskLevel: 'High',
            reportTitle: "🚨 시스템적 생존 위협 경고: 즉각적인 전면 재점검이 필수입니다.",
            detailedFindings: [{ category: 'A', description: "법규 변경 예측 실패", severity: 3 }]
        };

        (mockApi.submitQuizData as jest.Mock).mockResolvedValue(mockResult);

        // 제출 버튼 클릭 시뮬레이션 (isLoading 상태 진입)
        const submitButton = screen.getByRole('button', { name: /진단 보고서 요청 \(API 호출\)/i });
        fireEvent.click(submitButton);

        // 2초 대기 후 결과가 성공적으로 나타나는지 확인 (waitFor는 비동기 결과를 기다림)
        await waitFor(() => {
            expect(screen.getByText(/🚨 システム的 生存 脅威 警告:/i)).toBeInTheDocument(); // Red Zone Title 체크
        });

        // 리포트의 핵심 정보가 정확히 반영되었는지 검증
        expect(screen.getByText(/총 리스크 점수: \s*33/i)).toBeInTheDocument();
    });
});