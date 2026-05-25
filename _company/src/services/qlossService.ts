/**
 * qlossService.ts: QLoss 기반 가상 리스크 분석 및 트랜잭션 시뮬레이션 서비스 (Mock API)
 * @description 실제 백엔드 호출을 대체하며, 주어진 사용자 데이터와 비즈니스 규칙에 따라 
 *              시스템의 불안정성(QLoss)과 거래 상태를 계산합니다.
 */

export interface QLossResult {
    qloss: number; // Current QLoss Score (0-100)
    status: 'SUCCESS' | 'WARNING' | 'CRITICAL_FAILURE';
    message: string; // 사용자에게 보여줄 주요 메시지
    details: Record<string, any>; // 추가 데이터 디버깅용
}

/**
 * 사용자가 입력한 데이터를 기반으로 QLoss를 계산하고 거래 결과를 시뮬레이션합니다.
 * @param inputData - 사용자가 입력하는 가상의 민감 정보 또는 체크리스트 결과.
 * @returns Promise<QLossResult> - 비동기 처리로 시스템 지연 및 복잡성을 표현합니다.
 */
export const simulatePaymentFlow = async (inputData: { complianceCheckPass: boolean; riskToleranceLevel: number }): Promise<QLossResult> => {
    // 3초 지연을 주어 로딩 상태를 체감하게 만듭니다. [근거: 코다리 개인 메모리]
    await new Promise<void>(resolve => setTimeout(() => resolve(), 2500));

    let qlossScore = 0;
    let status: QLossResult['status'] = 'SUCCESS';
    let message = "거래가 성공적으로 처리되었습니다. 구조적 무결성이 확인되었습니다.";

    // 1. Compliance Check 기반 리스크 계산 (가장 중요한 요소)
    if (!inputData.complianceCheckPass) {
        qlossScore += 50; // 법규 미준수 시 높은 점수 부여
        status = 'WARNING';
        message = "⚠️ 경고: 필수 규정 준수 항목에서 결함이 발견되었습니다. 이대로 진행할 경우, 리스크가 급증합니다.";
    } else {
        qlossScore += 10; // 기본 안정성 확보 점수
    }

    // 2. 위험 허용도에 따른 불안정성 가중치 부여
    const tolerancePenalty = Math.abs(inputData.riskToleranceLevel - 5) * 3;
    qlossScore += tolerancePenalty;

    // 최종 QLoss 스코어 조정 (최대 100점 제한)
    qlossScore = Math.min(100, qlossScore);

    let finalStatus: QLossResult['status'];
    if (qlossScore >= 75) {
        finalStatus = 'CRITICAL_FAILURE';
        message = "🚨 시스템 경고! 임계치를 초과했습니다. 구조적 무결성 확보가 즉시 필요합니다. 해결책을 제시하십시오.";
    } else if (qlossScore >= 40) {
        finalStatus = 'WARNING';
        message = `⚠️ 리스크 레벨 상승: $QLoss$ ${Math.round(qlossScore)}%. 추가 검토가 필요하며, 전문가의 개입이 권장됩니다.`;
    } else {
        finalStatus = 'SUCCESS';
    }

    return {
        qloss: Math.round(qlossScore),
        status: finalStatus,
        message: message,
        details: { 
            inputComplianceCheckPassed: inputData.complianceCheckPass,
            riskToleranceUsed: inputData.riskToleranceLevel
        }
    };
};

/**
 * QLoss 상태에 따른 스타일 정의 (Design Spec V2.0 반영)
 * @param qloss - 현재 QLoss 점수
 * @returns Tailwind CSS 클래스 문자열
 */
export const getRedZoneStyles = (qloss: number): string => {
    if (qloss >= 75) {
        return "bg-red-900/80 border-red-600 shadow-[0_0_30px_rgba(255,0,0,0.7)] animate-glitch"; // Critical Collapse
    } else if (qloss >= 40) {
        return "bg-yellow-900/80 border-yellow-600 shadow-[0_0_20px_rgba(255,165,0,0.7)] animate-pulse"; // Warning Zone
    } else {
        return "bg-blue-900/70 border-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.7)]"; // Normal / Curiosity
    }
};