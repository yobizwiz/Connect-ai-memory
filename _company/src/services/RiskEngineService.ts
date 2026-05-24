/**
 * @module RiskEngineService
 * 외부 데이터 기반으로 시스템적 위험 지수(Structural Risk Index)를 계산하는 핵심 비즈니스 로직.
 * 이 함수는 단순한 데이터 가공이 아닌, yobizwiz의 '권위'와 '지성'을 담보하는 곳입니다.
 */

export type ThreatLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface RiskAssessmentResult {
    riskScore: number; // 0 (안전) ~ 100 (재앙적 위험)
    threatLevel: ThreatLevel;
    summaryTitle: string; // 사용자에게 보여줄 위협의 제목
    description: string;   // 공포감을 극대화하는 상세 설명
    requiredAction: {
        title: string;     // 해결책의 명칭 (예: 즉각적인 규제 준수 감사)
        details: string;    // 구체적 조치 사항
        isPaidSolutionRequired: boolean; // 이 서비스가 필요한 이유를 강제하는 플래그
    }[];
}

/**
 * 가상의 외부 데이터셋을 받아와 통합적으로 리스크 점수를 산출합니다.
 * @param externalData - { regulatoryCompliance: number, marketVolatility: number, internalProcessEfficiency: number } 형태의 구조화된 데이터.
 * @returns Promise<RiskAssessmentResult>
 */
export const calculateStructuralRisk = (externalData: Record<string, number>): RiskAssessmentResult => {
    // 1. 입력 유효성 검증 및 기본값 설정 (Robustness Check)
    const complianceScore = externalData?.regulatoryCompliance ?? 0;
    const volatilityScore = externalData?.marketVolatility ?? 0;
    const efficiencyScore = externalData?.internalProcessEfficiency ?? 0;

    // 2. 가중치 적용 및 총점 계산 (핵심 비즈니스 로직)
    // 법규 준수(Compliance)가 가장 중요하며, 이것이 무너지면 모든 것이 위험합니다.
    let totalRiskScore = (complianceScore * 0.4) + (volatilityScore * 0.35) + (efficiencyScore * 0.25);

    // 점수는 0에서 100 사이로 클리핑하고, 소수점 처리
    totalRiskScore = Math.min(Math.max(totalRiskScore, 0), 100);
    totalRiskScore = Math.round(totalRiskScore * 100) / 100; // 소수점 둘째 자리 반올림

    let threatLevel: ThreatLevel;
    let summaryTitle: string;
    let description: string;
    let requiredAction: Array<{ title: string, details: string, isPaidSolutionRequired: boolean }>;

    // 3. 리스크 레벨에 따른 결과 구조화 (Gatekeeper Alert 로직)
    if (totalRiskScore > 75) {
        threatLevel = "CRITICAL";
        summaryTitle = "🚨 [RED ZONE 경고] 시스템적 생존 위협 감지: 즉각적인 프로세스 강제 개입 필요.";
        description = `현재 구조적 리스크 점수 ${totalRiskScore.toFixed(2)}점은 치명적 수준입니다. 이대로 방치할 경우, 수백만 달러 규모의 재무적 손실을 초래할 가능성이 높습니다.`;
        requiredAction = [
            { title: "Guardian Protocol 가입", details: "위협 지수 기반 자동 모니터링 및 실시간 개입 시스템을 구축해야 합니다.", isPaidSolutionRequired: true },
            { title: "전문가 긴급 진단 요청", details: "yobizwiz의 고권위 진단을 통해 위험 벡터를 재정의해야 합니다.", isPaidSolutionRequired: true }
        ];
    } else if (totalRiskScore > 45) {
        threatLevel = "HIGH";
        summaryTitle = `⚠️ [주의] 구조적 결함 감지: ${Math.floor(totalRiskScore)}점, 모니터링 강화 필요.`;
        description = `현재 시스템은 잠재적인 취약점을 내포하고 있습니다. 근본 원인 분석을 통해 리스크를 관리해야 합니다.`;
        requiredAction = [
            { title: "전체 프로세스 재검토", details: "내부 워크플로우의 비효율성을 제거하는 감사(Audit)가 필요합니다.", isPaidSolutionRequired: false }
        ];
    } else {
        threatLevel = "LOW";
        summaryTitle = `✅ [안정] 현재 구조적 무결성 점수 ${Math.floor(totalRiskScore)}점, 정상 범위 내 유지 중.`;
        description = `현재까지는 안정적인 프로세스를 보이고 있으나, 외부 변동성에 대한 감시를 늦추어서는 안 됩니다.`;
        requiredAction = [
            { title: "정기 보고서 제출", details: "분기별 리스크 점검을 통해 잠재적 위험 요소를 선제적으로 파악해야 합니다.", isPaidSolutionRequired: false }
        ];
    }

    return {
        riskScore: totalRiskScore,
        threatLevel: threatLevel,
        summaryTitle: summaryTitle,
        description: description,
        requiredAction: requiredAction
    };
};