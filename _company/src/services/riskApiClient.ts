/**
 * @module riskApiClient
 * 리스크 엔진 API와 통신하는 클라이언트 모듈.
 * 실제 백엔드 호출은 여기에 구현되지만, MVP 단계에서는 Mock 로직을 사용해 E2E 테스트를 용이하게 합니다.
 */

import { RiskDataInput, AnalysisResult } from '@/types/riskTypes';

/**
 * 리스크 엔진 API를 시뮬레이션하는 비동기 함수입니다.
 * @param input - 사용자 입력 데이터 (산업군, 보유 기간 등)
 * @returns Promise<AnalysisResult> - 분석 결과를 포함한 프로미스
 */
export const analyzeRisk = async (input: RiskDataInput): Promise<AnalysisResult> => {
    console.log(`[API Call] Analyzing risk for industry: ${input.industry} with duration: ${input.duration}`);

    // Simulate network latency and complex computation time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mocking the API response based on input (structural integrity check)
    let mockRiskScore = Math.random() * 10; // 0 to 10
    let status: 'LOW' | 'MEDIUM' | 'HIGH';
    let financialLossEstimate: number; // $

    if (input.industry === 'Financial Services' && input.duration > 5) {
        // 고위험 시나리오 Mocking
        mockRiskScore = Math.min(10, mockRiskScore + 7);
        financialLossEstimate = parseFloat((Math.random() * 20000 + 3000).toFixed(2)); // $3k ~ $23k
        status = 'HIGH';
    } else if (input.industry === 'Tech' && input.duration < 1) {
        // 중간 위험 시나리오 Mocking
        mockRiskScore = Math.min(8, mockRiskScore + 2);
        financialLossEstimate = parseFloat((Math.random() * 5000 + 1000).toFixed(2)); // $1k ~ $6k
        status = 'MEDIUM';
    } else {
        // 저위험 시나리오 Mocking
        mockRiskScore = Math.max(0, mockRiskScore - 3);
        financialLossEstimate = parseFloat((Math.random() * 500 + 10).toFixed(2)); // $10 ~ $510
        status = 'LOW';
    }

    // Final result structure matching the required Paywall payload
    const result: AnalysisResult = {
        riskScore: parseFloat(mockRiskScore.toFixed(2)),
        status: status,
        financialLossEstimate: financialLossEstimate,
        recommendedSolutionCost: Math.ceil(financialLossEstimate * 0.5) + 1000, // 보험료는 손실액의 절반 + 최소 비용
        // TDR은 복잡하므로 여기서는 '시간적 기회비용'으로 통합하여 보여줍니다.
        timeOpportunityCost: Math.ceil(financialLossEstimate * 0.2),
        summaryText: `귀사의 ${input.industry} 산업 특성 및 운영 기간(${input.duration}년)을 분석한 결과, 예상되는 구조적 리스크가 감지되었습니다. 즉각적인 보호막이 필요합니다.`
    };

    return result;
};

export const fetchRiskReport = async (credentials: { userId: string; apiToken: string }): Promise<{ riskScore: number; reportId: string; details: string; dateGenerated: string }> => {
    console.log(`[API Call] Fetching risk report for user: ${credentials.userId}`);
    return {
        riskScore: 75,
        reportId: 'SUCCESS_REPORT_123',
        details: 'Low risk found.',
        dateGenerated: new Date().toISOString()
    };
};