// src/types/regulatoryTypes.ts
/**
 * 글로벌 규제 위험 매트릭스에서 하나의 프로필을 정의하는 타입입니다.
 */
export interface RiskProfile {
    risk_id: string;
    risk_element: string;
    regulations: string[];
    impact_type: "벌금 및 소송 배상액 (Financial & Litigation Loss)";
    lmax_estimation: {
        min_usd: number;
        max_usd: number;
        source_notes: string;
    };
    weighting_factor: {
        base_weight: number;
        description: string;
        multiplier_scope: string;
    };
    provenance: string;
}

/**
 * 전체 규제 위험 데이터셋의 타입 정의입니다.
 */
export interface RegulatoryRiskParameters {
    dataset_name: string;
    description: string;
    version: string;
    risk_profiles: RiskProfile[];
}


/**
 * 시스템이 현재 감지한 위험 이벤트 정보를 입력받는 구조체입니다.
 * 실제 사용 시에는 더 복잡해질 수 있으나, MVP를 위해 필수 요소만 포함합니다.
 */
export interface IncidentEvent {
    incidentType: string; // 예: 'PII_ACCESS', 'UNAUTHORIZED_TX'
    severityScore: number; // 1 (낮음) ~ 10 (치명적)
    involvedDataCount: number; // 유출된 데이터 개수 등 정량적 지표
}

/**
 * TRE 계산 결과를 담는 구조체입니다.
 */
export interface RiskAssessmentResult {
    tre_score: number; // 최종 리스크 점수 (0 ~ 100)
    risk_id: string[]; // 매칭된 주요 위험 ID 목록
    lmax_estimate: {
        min_usd: number;
        max_usd: number;
        total_impact_message: string;
    };
}