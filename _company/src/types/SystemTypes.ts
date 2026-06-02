/** @description System-wide Shared Types for Risk Calculation and Reporting */

export type StatusLevel = 'LOW' | 'MEDIUM' | 'HIGH';

/** @description 클라이언트가 API로 전송할 입력 데이터 구조. */
export interface RiskInputData {
    checksCompleted: number; // 사용자가 완료한 체크박스 수
    isCriticalFailure: boolean; // 핵심 위험 위반 감지 여부 (True일 경우 가중치 부여)
}

/** @description Mock API가 반환할 최종 진단 보고서 구조. */
export interface DiagnosticReport {
    riskScore: number; // 0 ~ 100 사이의 계산된 리스크 점수
    statusLevel: StatusLevel; // LOW, MEDIUM, HIGH 중 하나
    isBarrierTriggered: boolean; // Paywall Barrier가 작동해야 하는지 여부 (HIGH일 때 True)
    mockAudit: {
        auditDate: string;
        riskScore: number;
        statusLevel: StatusLevel;
        mandatoryActionsRequired: string[]; // 필수 조치 목록
        disclaimerMessage: string;
    };
}