import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CredibilitySection from '../credibility-section/CredibilitySection';
import * as apiService from '@/services/api/credibilityService';

// Mock API 호출을 강제로 모킹하여 테스트 환경 제어
jest.mock('@/services/api/credibilityService');
const mockFetchReport = apiService.fetchCredibilityReport as any;


describe('Credential Section Component Testing', () => {

    beforeEach(() => {
        // 초기화 시 Mock 함수 설정
        mockFetchReport.mockClear();
    });

    test('1. Initial load state should show loading message', async () => {
        // 1차 테스트: 로딩 상태 확인 (API가 호출되었지만 아직 결과가 없는 상태)
        mockFetchReport.mockResolvedValue(null); // Mocking null/pending state
        render(<CredibilitySection variant="A" />);
        expect(screen.getByText(/시스템 분석 중/i)).toBeInTheDocument();
    });

    test('2. Successful data load should render critical warning (Variant A)', async () => {
        // 2차 테스트: 데이터 로드 성공 시, 핵심 경고가 잘 보이는지 확인
        const mockData = {
            reportId: 'TEST', overallScore: 0.9, isCritical: true, 
            riskDetails: [{ name: "Test Gap", level: "CRITICAL", scoreChange: +1, description: "테스트 데이터입니다." }],
            analysisTimestamp: new Date().toISOString()
        };
        mockFetchReport.mockResolvedValue(mockData);

        render(<CredibilitySection variant="A" />);
        
        // 비동기 로딩 후 결과가 렌더링되었는지 기다림
        await waitFor(() => {
            expect(screen.getByText(/시스템적 생존 위협/i)).toBeInTheDocument();
        });

        // 핵심 경고 메시지가 Visible한지 확인 (Authority Proof)
        expect(screen.getByText(/CRITICAL 리스크/i)).toBeInTheDocument();
    });

     test('3. API failure state should show fallback message', async () => {
        // 3차 테스트: API 호출 실패 시, 시스템이 크래시되지 않고 대안을 제시하는지 확인
        mockFetchReport.mockRejectedValue(new Error("Network Timeout"));

        render(<CredibilitySection variant="A" />);
        
        await waitFor(() => {
            expect(screen.getByText(/리스크 분석에 실패했습니다/i)).toBeInTheDocument();
        });
    });
});