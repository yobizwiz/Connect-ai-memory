/**
 * @description 리스크 케이스의 구조를 정의합니다. 모든 재무적 수치는 숫자(number)로 처리되어야 계산 무결성이 보장됩니다.
 */
export interface RiskQuantification {
    // 최소한의 필수 항목만 남기고, 실제 값은 number 타입으로 강제합니다.
    regulatoryFineEstimate: number; // $ 또는 €를 제외한 순수 금액 (Number)
    operationalDowntimeLossAnnualized: number; // 연간 기준으로 계산된 최대 운영 손실액 (Number)
    litigationSettlementEstimate: number; // 소송 및 배상 합의액 (Number)
}

/**
 * @description 개별 규제 위반 사례 데이터입니다.
 */
export interface RiskCaseData {
    case_id: string;
    regulation: string;
    violation_type: string;
    description: string;
    risk_quantification: RiskQuantification;
}

/**
 * @description 최종적으로 계산된 리스크 노출도 값입니다.
 */
export interface TotalRiskReport {
    totalLmaxUSD: number; // 합산된 최대 재무 손실액 (단위: USD)
    exceedsThreshold: boolean; // PAYWALL_THRESHOLD를 초과했는지 여부
}

/**
 * @description 시스템 전체에 정의된 리스크 임계치 상수.
 */
export const PAYWALL_THRESHOLD: number = 85000000; // 예시값 $85 Million (지정된 전역 Context 활용)