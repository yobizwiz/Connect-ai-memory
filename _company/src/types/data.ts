/**
 * @module dataTypes
 * 신뢰도 섹션 및 모니터링 API에서 공통으로 사용되는 데이터 타입 정의.
 */

export interface RiskDetail {
    name: string;
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    scoreChange: number;
    description: string;
}

export interface RiskData {
    reportId: string;
    overallScore: number;
    isCritical: boolean;
    riskDetails: RiskDetail[];
    analysisTimestamp: string;
}
