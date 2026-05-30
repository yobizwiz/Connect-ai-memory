/**
 * @fileoverview Paywall 시스템에서 사용되는 비동기 데이터 호출을 모킹합니다.
 * 실제 API가 아닌, 지연 시간(Time Pressure)과 상태 전이를 시뮬레이션하는 것이 목적입니다.
 */

import { RiskData } from '../types/riskTypes';
import { QuizState, DiagnosisResult } from '../types/quizTypes';

/**
 * 초기 리스크 계산에 필요한 데이터를 강제로 비동기적으로 가져옵니다.
 * @param initialInput - 사용자로부터 받은 최초 입력 데이터 (예: 산업군, 직원 수).
 * @returns Promise<RiskData> - 계산된 가상의 위험 보고서.
 */
export const fetchInitialRiskMetrics = async (initialInput: { industry: string; employeeCount: number }): Promise<RiskData> => {
    console.log("🚨 [API] Initial Risk Metrics fetching started...");
    // 핵심은 강제적인 시간 지연입니다. 3초는 사용자가 '기다린다'고 느끼게 하는 중요한 장치입니다.
    await new Promise(resolve => setTimeout(resolve, 3000)); 

    if (Math.random() < 0.1) { // 10% 실패 시나리오 추가
        throw new Error("API_FAILURE: 시스템 내부 규정 검증 오류가 발생했습니다. 재시도를 바랍니다.");
    }

    // 강제적인 위협 수치 반환 (최대 손실액 $L_{max}$ 포함)
    return {
        riskLevel: "CRITICAL", // 테스트를 위해 일단 Critical로 고정합니다.
        structuralDeficiencyReport: `[${initialInput.industry}] 산업군은 현재 ${Math.floor(Math.random() * 10)}%의 구조적 공백(Structural Gap)에 노출되어 있습니다.`,
        maxPotentialLoss: (Math.random() * 5_000_000 + 10_000).toFixed(2), // 최소 $10,000 ~ 최대 $6,000,000
    };
};

/**
 * 최종 솔루션 구매 직전에 호출되는 '진단 요청' API를 모킹합니다.
 * 이 단계에서는 Paywall 진입을 강제하며, 가격 정보를 제공합니다.
 */
export const fetchDiagnosisSolutionDetails = async (): Promise<{ solutionName: string; price: number }> => {
    console.log("✅ [API] Solution Details fetching started...");
    await new Promise(resolve => setTimeout(resolve, 1500)); // 짧은 지연 시간으로 긴장감 유지

    return {
        solutionName: "Systemic Resilience Protocol v2.0",
        price: 4999.99, // 고가 정책 반영
    };
};

export const submitQuizData = async (quizState: QuizState): Promise<DiagnosisResult> => {
    console.log("🚨 [API] Quiz data submission started...");
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 강제 대기

    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
    if (quizState.accumulatedScore >= 25) {
        riskLevel = 'High';
    } else if (quizState.accumulatedScore >= 12) {
        riskLevel = 'Medium';
    }

    return {
        totalScore: quizState.accumulatedScore,
        riskLevel: riskLevel,
        reportTitle: "yobizwiz 실시간 리스크 자가 진단 보고서",
        detailedFindings: [
            {
                category: 'A',
                description: `답변 기반 분석 결과 귀사의 법적 무효화 리스크는 ${riskLevel === 'High' ? '치명적' : '주의'} 수준입니다.`,
                severity: riskLevel === 'High' ? 3 : 1
            },
            {
                category: 'B',
                description: `통제 실패 대책이 미흡합니다. 프로세스 무결성 보완이 요구됩니다.`,
                severity: riskLevel === 'High' ? 2 : 1
            }
        ]
    };
};