// =============================================
// 🛡️ Component Types & State Definitions (Defensive Coding)
// $L_{max}$ 계산, 상태 관리 및 API 통신에서 사용되는 모든 타입 정의.
// 원본: Designer/Researcher의 요구사항 기반 아키텍처 설계.
// =============================================

/**
 * @typedef {Object} SystemRiskData
 * @description 외부로부터 받아오는 Raw $L_{max}$ 점수 데이터 (API Payload)
 */
export interface SystemRiskData {
    timestamp: string; // ISO 8601 format
    riskScore: number | null; // 필수 필드. 누락 방지 처리 필요.
    violationCount: number; // 현재까지 감지된 위반 사례 수.
    dataSource: 'FSS' | 'GDPR' | 'INTERNAL'; // 데이터 출처를 명시하여 추적 가능하게 함.
}

/**
 * @typedef {Object} RiskStateContext
 * @description 애플리케이션 전체에 걸쳐 관리될 RVS의 현재 상태 객체.
 */
export interface RiskStateContext {
    // 1. 핵심 지표 (Primary Metrics)
    currentLMax: number; // 현재 계산된 최대 손실액 (가장 중요).
    riskLevel: 'IDLE' | 'WARNING' | 'CRITICAL'; // 시스템의 현재 경고 레벨.
    isSystemCritical: boolean; // Critical 상태 여부 플래그 (UI 강제 렌더링용).

    // 2. 메타 정보 (Metadata)
    lastUpdated: Date;
    thresholds: {
        warningThreshold: number; // WARNING 진입 임계값 ($L_{max}$ 기준).
        criticalThreshold: number; // CRITICAL 진입 임계값.
    };
}

/** @type {RiskStateContext} */
export type RiskStatus = RiskStateContext;


/**
 * @typedef {Object} AlertDetail
 * @description 특정 상태(WARNING/CRITICAL)에서 표시되어야 하는 상세 경고 정보.
 */
export interface AlertDetail {
    title: string; // 사용자에게 보여줄 명확한 위험 제목 (예: "임계치 초과 감지").
    message: string; // 구체적인 위반 내용 및 설명.
    severityColor: string; // Designer가 정의한 CSS 토큰 값 (#E74C3C 등).
    actionRequired: 'Review' | 'Paywall'; // 사용자에게 요구하는 행동.
}

// API 응답 구조를 위한 타입 명확화 (Optional, but defensive)
export type RiskAPIResponse = {
    success: boolean;
    data?: SystemRiskData;
    error?: string;
};