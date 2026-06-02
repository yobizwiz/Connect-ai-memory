import { RiskInputData, DiagnosticReport } from '../types/SystemTypes';

/**
 * @description Paywall Barrier의 리스크 점수 계산을 시뮬레이션하는 서비스 계층입니다.
 * 이 함수는 실제 백엔드 API Gateway 역할을 수행하며 비즈니스 로직의 무결성을 담보합니다.
 * @param inputData 클라이언트로부터 전송받은 진단 데이터 (예: 체크된 규정 수, 위험도 등)
 * @returns 계산된 리스크 점수와 상태 정보가 포함된 DiagnosticReport 객체
 */
export const calculateRisk = async (inputData: RiskInputData): Promise<DiagnosticReport> => {
    // 1. 입력 데이터 유효성 검사 (Guard Clause - 필수!)
    if (!inputData || typeof inputData.checksCompleted !== 'number' || !Number.isInteger(inputData.checksCompleted)) {
        throw new Error("Invalid input data: Missing or non-integer checks completed count.");
    }

    // 2. 리스크 점수 계산 로직 (L_totalMax = f(Input, Context))
    // 시뮬레이션 목표: 체크 완료 수가 많고, 심각한 규정 위반이 감지될수록 점수는 높아져야 함.
    let calculatedScore = inputData.checksCompleted * 1.5 + (inputData.isCriticalFailure ? 30 : 0);

    // 최대값을 제한하고 반올림합니다.
    calculatedScore = Math.min(85, Math.round(calculatedScore));


    // 3. 임계치 기반 상태 결정 및 보고서 생성
    let status: 'LOW' | 'MEDIUM' | 'HIGH';
    if (calculatedScore < 20) {
        status = 'LOW'; // State A: Normal / Low Risk Zone
    } else if (calculatedScore >= 20 && calculatedScore <= 65) {
        status = 'MEDIUM'; // State B: Warning Zone
    } else {
        status = 'HIGH'; // State C: Red Zone - Paywall Barrier Trigger!
    }

    // 4. 모의 진단 보고서 데이터 생성 (Fake but Structured Data)
    const reportData: DiagnosticReport['mockAudit'] = {
        auditDate: new Date().toISOString(),
        riskScore: calculatedScore,
        statusLevel: status,
        mandatoryActionsRequired: status === 'HIGH' ? ['즉시 법률 검토', '운영 중단 필요성 진단'] : [],
        disclaimerMessage: `본 보고서는 시뮬레이션 데이터 기반이며, 실제 재무적/법률적 판단을 대체할 수 없습니다.`,
    };

    // 5. 최종 결과 반환 (Defensive Return)
    return {
        riskScore: calculatedScore,
        statusLevel: status,
        isBarrierTriggered: status === 'HIGH',
        mockAudit: reportData
    };
};