/**
 * @description yobizwiz 핵심 리스크 시뮬레이션 API 응답 스키마 (v1)
 * 이 스키마는 프론트엔드와 백엔드가 공유하는 Contract 역할을 수행합니다.
 */

export type RiskState = 'Normal' | 'Yellow' | 'Red';

/**
 * @typedef {object} SimulationReport
 * @property {RiskState} state - 현재 시스템의 리스크 상태 (정상, 경고, 위험).
 * @property {number} lossAmountUSD - 잠재적 최대 손실액($L_r$) 추정치 (단위: USD).
 * @property {string} title - 보고서 제목.
 * @property {string[]} requiredActions - 현재 상태를 벗어나기 위해 반드시 취해야 할 필수 조치 목록.
 * @property {object} details - 상세 경고 메시지 및 기술적 근거 제공.
 * @property {string} details.explanation - 리스크 발생의 핵심 이유 설명 (Why).
 * @property {number} details.severityScore - 0(최소)부터 100(최대)까지의 시스템 취약점 점수.
export interface SimulationReport {
    state: RiskState;
    lossAmountUSD: number;
    title: string;
    requiredActions: string[];
    details: {
        explanation: string;
        severityScore: number;
    };
}

/**
 * @typedef {object} InputParameters
 * @property {number} complianceRate - 규정 준수율 (0.0 ~ 1.0).
 * @property {number} automationRatio - 프로세스 자동화 비율 (0.0 ~ 1.0).
 * @property {boolean} dataIntegrityCompromised - 데이터 무결성 침해 여부 (true/false).
 */

export interface RiskInputs extends InputParameters {}