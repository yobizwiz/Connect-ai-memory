/**
 * @description 핵심 리스크 점수 구조체 (L_max)
 */
export interface RiskScore {
    structuralGap: number;      // 0.0 ~ 1.0. 시스템이 놓친 공백의 비율.
    provenanceConfidence: number; // 0.0 ~ 1.0. 정보 출처의 신뢰도. (법적 근거 유무 등)
    regulatoryExposureScore: number; // 0 ~ N. 특정 법규 위반 시 예상되는 재정적 손실액($).
}

/**
 * @description 세션 컨텍스트 및 사용자 티어 정의
 */
export interface SessionContext {
    sessionId: string;
    userTier: 'FREE' | 'PREMIUM' | 'ENTERPRISE'; // A/B 테스트나 기능 제한에 사용
    lastActivityTimestamp: Date;
}

/**
 * @description Funnel Stage 상수 정의
 */
export type FunnelStage = "CRITICAL" | "WARNING" | "SOLUTION_IMMEDIATE" | "WARNING_HIGH_INTENSITY" | "SOLUTION";

// 기타 타입들... (RiskScore, SessionContext 등)