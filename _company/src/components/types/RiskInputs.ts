/**
 * @fileoverview Global Compliance Risk Atlas v2 기반의 리스크 계산 입력값 및 결과 타입을 정의합니다.
 * 이 파일은 Lmax 계산 로직과 UI 컴포넌트 간의 타입 안전성을 보장합니다.
 */

export interface ComplianceRiskAtlas {
    schema_version: string;
    model_description: string;
    calculation_variables: {
        N: "위반에 노출된 사용자 또는 데이터 건수 (Number of Affected Records/Users)";
        R: "규제 위반의 심각도 및 고의성 계수 (Risk Multiplier, 1.0 ~ 3.0). 높은 값일수록 법적 책임을 가중함.";
        T_rate: "위반으로 인한 일별 매출 손실 추정률 (%)";
        Jurisdiction: string; // 규제 관할권 명칭
    };
}

export interface RiskInputs {
    // 사용자 입력 변수들을 위한 타입 정의. 실제 API 통신을 통해 값을 받습니다.
    numberOfAffectedRecords: number; // N (사용자/데이터 건수)
    riskMultiplier: number;         // R (위험 계수)
    dailyLossRate: number;          // T_rate (%)
    jurisdiction: string;           // 규제 관할권
}

export interface RiskOutput {
    lTotalMax: number; // 최종 총 리스크 점수 (Lmax)
    isCritical: boolean;  // 임계값 초과 여부 (True/False)
    message: string;     // 사용자 친화적인 위험 메시지
}