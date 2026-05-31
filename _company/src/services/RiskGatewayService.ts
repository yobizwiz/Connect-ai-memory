// src/services/riskGatewayService.ts
import { 
    RegulatoryRiskParameters, 
    IncidentEvent, 
    RiskAssessmentResult 
} from '../types/regulatoryTypes';

/**
 * @description JSON 파일에서 로드된 규제 위험 매트릭스를 가져오는 Mock 함수입니다.
 * 실제 구현 시에는 DB 또는 Config Service를 통해 데이터를 로드해야 합니다.
 * @param data - 로드할 RegulatoryRiskParameters 객체.
 * @returns {RegulatoryRiskParameters} 유효한 데이터셋.
 */
export function loadRegulatoryData(data: any): RegulatoryRiskParameters {
    // Defensive Coding: JSON 파싱 실패나 스키마 불일치에 대비합니다.
    if (!data || typeof data !== 'object' || !Array.isArray(data.risk_profiles)) {
        throw new Error("Failed to load regulatory data: Data structure is invalid or missing risk profiles.");
    }
    return data as RegulatoryRiskParameters;
}

/**
 * @description 핵심 로직: IncidentEvent와 규제 매트릭스를 비교하여 TRE(Threat Risk Exposure) 점수를 계산합니다.
 * TRE는 (위험 가중치 * 이벤트 심각도 * 데이터 민감성 계수)에 비례하며, 0~100점 스케일로 정규화됩니다.
 * @param event - 현재 발생한 위험 사건의 정보.
 * @param dataSet - 로드된 규제 위험 매트릭스 데이터셋.
 * @returns {RiskAssessmentResult} 계산된 리스크 평가 결과.
 */
export function calculateTRE(event: IncidentEvent, dataSet: RegulatoryRiskParameters): RiskAssessmentResult {
    // 1. 초기화 및 방어적 검증 (Guard Clause)
    if (!dataSet || !event || event.severityScore === undefined) {
        throw new Error("Invalid input parameters provided for TRE calculation.");
    }

    let totalWeightedRisk = 0;
    const matchedRiskIds: string[] = [];
    let cumulativeMaxLossMinUsd = 0;
    let cumulativeMaxLossMaxUsd = 0;

    // 2. 위험 매칭 및 가중치 합산 (The Core Logic)
    for (const profile of dataSet.risk_profiles) {
        // --- [핵심 비교 로직] ---
        // 예: 이벤트 타입이 PII와 관련되어 있고, 심각도가 임계치를 넘으면 매칭으로 간주합니다.
        if (profile.risk_element.includes("개인 식별 정보") && event.incidentType.includes("PII")) {

            matchedRiskIds.push(profile.risk_id);

            // 가중치 계산: Weight * Severity * Data Count Factor (Defensive Multiplier)
            const weightedContribution = profile.weighting_factor.base_weight * 
                                       event.severityScore * 
                                       Math.min(1, event.involvedDataCount / 100); // 데이터 수가 많을수록 기여도 증가

            totalWeightedRisk += weightedContribution;
            
            // 최대 손실액 누적 (Lmax Aggregation)
            cumulativeMaxLossMinUsd = Math.max(cumulativeMaxLossMinUsd, profile.lmax_estimation.min_usd);
            cumulativeMaxLossMaxUsd = Math.max(cumulativeMaxLossMaxUsd, profile.lmax_estimation.max_usd);
        }
    }

    // 3. 최종 점수 정규화 및 산출 (Normalization)
    const maxPossibleScore = 100; // 목표 스케일 상한선
    let tre_score: number;

    if (totalWeightedRisk === 0) {
        tre_score = 5; // 최소 기본 리스크 점수 부여
    } else {
        // 예시 공식: 총 가중치 위험을 최대값으로 나누고, 스케일링 상수(C)를 곱하여 100점 만점으로 정규화.
        const scalingConstant = 2.5; // 이 값은 비즈니스와 테스트를 통해 최적화되어야 합니다.
        tre_score = Math.min(maxPossibleScore, totalWeightedRisk * scalingConstant);
    }

    // 결과 반환
    return {
        tre_score: parseFloat(tre_score.toFixed(2)),
        risk_id: matchedRiskIds,
        lmax_estimate: {
            min_usd: Math.round(cumulativeMaxLossMinUsd),
            max_usd: Math.round(cumulativeMaxLossMaxUsd),
            total_impact_message: `최소 ${Math.round(cumulativeMaxLossMinUsd)} USD, 최대 ${Math.round(cumulativeMaxLossMaxUsd)} USD의 잠재적 손실이 예상됩니다.`
        }
    };
}

/**
 * @description Mock API Endpoint Wrapper. (Express/Fastify 스타일)
 * 실제 백엔드 환경에서 호출될 진입점입니다.
 */
export const riskGatewayService = {
    endpoint: 'POST /api/v1/risk/calculate',
    async calculate(event: IncidentEvent, dataSet: RegulatoryRiskParameters): Promise<RiskAssessmentResult> {
        try {
            // 1차 검증: 데이터 로드 및 유효성 체크
            const validDataSet = loadRegulatoryData(dataSet);

            // 핵심 로직 실행 (이 부분에서 실제 계산 수행)
            return calculateTRE(event, validDataSet);

        } catch (error) {
            console.error("Risk Gateway Service Execution Error:", error instanceof Error ? error.message : String(error));
            // 방어적 에러 처리: 클라이언트에게는 내부 오류 메시지를 노출하지 않고 일반적인 실패 코드를 반환합니다.
            throw new Error("Internal System Error: Failed to calculate risk score due to invalid input or system configuration.");
        }
    }
};

/**
 * @description 종합 리스크 지표 연산 및 경고 등급 결정을 수행하는 핵심 헬퍼 함수
 */
export function calculateTREScore(inputs: Array<{ riskId: string; gapScore: number }>): {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    treScore: number;
    message: string;
} {
    if (!inputs || inputs.length === 0) {
        return {
            riskLevel: 'LOW',
            treScore: 0,
            message: '규제 리스크 평가 매개변수가 감지되지 않았습니다.'
        };
    }

    const totalGap = inputs.reduce((sum, item) => sum + item.gapScore, 0);
    const treScore = parseFloat((totalGap / inputs.length).toFixed(2));

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let message = '시스템 규제 준수 아키텍처가 안정적인 녹색 구역에 있습니다. 현재 수준의 예방적 모니터링을 지속하십시오.';

    if (treScore >= 80) {
        riskLevel = 'CRITICAL';
        message = '위험: 시스템이 극도로 파괴적인 규제 벌금 및 법적 제재(L_max 임계치 초과)에 직접적으로 노출되었습니다. 즉시 B2B 컴플라이언스 무결성 패치를 시행하고 게이트웨이 무제한 라이선스를 취득해야 합니다.';
    } else if (treScore >= 50) {
        riskLevel = 'HIGH';
        message = '경고: 다수의 잠재적 법률 위반 공백이 감지되었습니다. 감사 시 소송 패소 및 고객 이탈 가능성이 높습니다. 시스템 엔지니어링 리팩토링 권장.';
    } else if (treScore >= 20) {
        riskLevel = 'MEDIUM';
        message = '주의: 일부 운영 흐름에서 규제 컴플라이언스 비정상 상태(Compliance Drift)가 관측됩니다. 위험 방어벽 강화를 검토하십시오.';
    }

    return {
        riskLevel,
        treScore,
        message
    };
}