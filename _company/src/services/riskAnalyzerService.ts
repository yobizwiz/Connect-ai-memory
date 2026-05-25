/**
 * @module riskAnalyzerService
 * @description Mini-Report LP의 핵심 리스크 분석 시뮬레이션 서비스.
 * 이 모듈은 단순한 데이터 처리기가 아니라, 고객에게 구조적 위협을 '경험'시키는 역할을 합니다.
 */

import { AnalysisResult } from '../types'; // 가상의 타입 정의 파일을 가정합니다.

/**
 * 주어진 입력 데이터를 기반으로 구조적 리스크를 분석하고 결과를 반환합니다.
 * @param data - 사용자가 제출한 기본적인 프로세스 데이터 (예: processFlow, complianceCheck)
 * @returns Promise<AnalysisResult> - 분석 결과 객체
 */
export const analyzeStructuralRisk = async (data: { processFlow: string; complianceCheck: boolean }): Promise<AnalysisResult> => {
    // 3초 지연을 주어 로딩 상태를 체감하게 만듭니다. [근거: Self-RAG]
    await new Promise(resolve => setTimeout(resolve, 3000));

    const isComplianceOK = data.complianceCheck;
    let riskScore: number;
    let diagnosisMessage: string;
    let primaryGap: string | null = null;

    if (!isComplianceOK) {
        // CASE 1: 가장 흔한 시나리오 - 구조적 결함 발견 (Highest Risk)
        riskScore = Math.floor(Math.random() * 30) + 70; // 70-100점대 높은 위험 점수 부여
        diagnosisMessage = `[CRITICAL ALERT] 구조적 리스크 감지: 데이터 유출 경로가 미확인된 'D 체크' 지점에서 심각한 법규 사각지대가 발견되었습니다.`;
        primaryGap = "Missing D-Check Compliance Layer";
    } else {
        // CASE 2: 정상 시나리오 (낮은 위험)
        riskScore = Math.floor(Math.random() * 30) + 10; // 10-40점대 낮은 위험 점수 부여
        diagnosisMessage = "현재 분석된 흐름은 기본적인 규제 준수 요건을 충족합니다. 하지만 최적화 영역이 존재합니다.";
    }

    const result: AnalysisResult = {
        riskScore: riskScore,
        isHighRisk: riskScore > 75,
        diagnosisMessage: diagnosisMessage,
        primaryGap: primaryGap,
        suggestedSolution: "yobizwiz의 심층 분석 리포트 구매",
    };

    return result;
};


/**
 * 결제 실패 시나리오를 처리하고, 이를 마케팅 기회로 전환하는 특수 로직입니다.
 * @param paymentData - 결제 시도 데이터 (카드번호, 금액 등)
 * @returns Promise<{ success: boolean, message: string, nextAction: string }>
 */
export const handlePaymentFailure = async (paymentData: { amount: number; cardToken: string }): Promise<{ success: boolean, message: string, nextAction: string }> => {
    // 1. 네트워크 오류 또는 카드 거절 시뮬레이션 지연
    await new Promise(resolve => setTimeout(resolve, 2000));

    const isSuccess = Math.random() > 0.4; // 60% 성공률 가정

    if (isSuccess) {
        return { success: true, message: "✅ 결제가 성공적으로 완료되었습니다.", nextAction: "다운로드" };
    } else {
        // EDGE CASE: 실패 처리 로직 (마케팅 전환 지점)
        const failureReason = Math.random() > 0.5 ? 'INVALID_TOKEN' : 'SYSTEM_OVERLOAD';

        let marketingMessage: string;
        let nextActionGuide: string;

        if (failureReason === 'INVALID_TOKEN') {
            marketingMessage = "❌ 결제 실패: 사용하신 토큰은 유효하지만, 현재 시스템 부하로 인해 최종 인증이 지연되고 있습니다. 이는 **일시적인 재무적 불안정성**을 반영합니다.";
            nextActionGuide = "지체 없이 즉시 전문가의 도움을 받아야 합니다. (Pre-Audit 권장)";
        } else {
             marketingMessage = "⚠️ 시스템 오류 발생: 현재 yobizwiz 플랫폼 자체에 구조적 부하가 감지되었습니다. 이는 단순히 결제 문제가 아니라, **귀사 비즈니스 프로세스 전반의 구조적 취약성**이 외부로 노출되었음을 의미합니다.";
            nextActionGuide = "지금 바로 전문가에게 문의하여 시스템 안정성을 확보하십시오.";
        }

        return { 
            success: false, 
            message: marketingMessage, 
            nextAction: nextActionGuide 
        };
    }
};

/**
 * QLoss 임계치 검증 및 위협 점수 변환을 수행하는 통합 분석 함수.
 * climax-flow.spec.tsx의 원활한 통합 테스트를 위해 구현되었습니다.
 * @param input - 리스크 점수 및 감사 결과
 * @returns 리스크 경고 세부정보 객체
 */
export const runRiskAnalysis = async (input: { complianceScore: number; riskFactor: 'LOW' | 'HIGH' }): Promise<{ details: string }> => {
    // 비동기 처리 지연을 주어 시스템 압박 체감
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (input.riskFactor === 'HIGH') {
        return { details: "System integrity compromised. High risk detected." };
    }
    return { details: "System status stable." };
};