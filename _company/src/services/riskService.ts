// src/services/riskService.ts

/**
 * @typedef {Object} RiskInputData - 외부에서 들어오는 시뮬레이션 원시 데이터 (Raw Data)
 * @property {number} regulatoryNonComplianceScore - 미준수 영역 점수 (0~100)
 * @property {number} dataCompletenessIndex - 데이터 완전성 지표 (0.0~1.0)
 * @property {boolean} systemAnomalyDetected - 시스템적 이상 징후 감지 여부
 */

/**
 * @typedef {Object} RiskOutputData - API가 최종적으로 반환하는 구조화된 위험 보고서
 * @property {'GREEN' | 'YELLOW' | 'RED'} riskLevel - 현재 시스템의 종합 위험 레벨 (State Machine 결과)
 * @property {number} treValue - 최대 재무 손실액 추정치 ($TRE$)
 * @property {Record<string, number>} kpiScores - 6대 KPI별 계산 점수
 * @property {Array<{kpi: string, value: number}>} warningIndicators - 경고를 유발하는 주요 지표 목록
 */

/**
 * 6대 핵심 위험 지표(KPI)의 가상 수학적 모델을 계산합니다.
 * 이 로직들은 yobizwiz의 독점적인 리스크 온톨로지에 기반하여 설계되었습니다.
 * @param {RiskInputData} data - 시뮬레이션 입력 데이터
 * @returns {Record<string, number>} 6대 KPI 점수 객체
 */
export function calculateKpis(data) {
    // --- [KPI Calculation Logic] ---

    // TRE (Total Risk Exposure): 미준수와 시스템 불안정성의 곱에 비례
    const treValue = data.regulatoryNonComplianceScore * (1 + Math.random() * 0.2);

    // PIG (Predictive Integrity Gap): 데이터 완전성 지표가 낮을수록 위험 증가
    const pigScore = (1 - data.dataCompletenessIndex) * 85; // 최대 85점

    // ARS (Anomaly Risk Score): 시스템 이상 감지 여부에 따라 급격히 상승
    const arsScore = data.systemAnomalyDetected ? Math.min(100, treValue / 2 + 30) : Math.random() * 20;

    // CDR (Compliance Drift Ratio): 규제 점수와 비준수 점수의 차이로 계산
    const cdrScore = Math.abs(data.regulatoryNonComplianceScore - 50);

    // AIL (Assurance Index Loss): 데이터 완전성 지표가 낮을수록 손실 증가
    const ailScore = data.dataCompletenessIndex * 10; // 최대 10점

    // KSD (Knowledge Structure Decay): 시스템 이상 감지에 연동하여 계산
    const ksdScore = data.systemAnomalyDetected ? 75 : Math.random() * 30;


    return {
        treValue: parseFloat(treValue.toFixed(2)),
        pigScore: parseFloat(pigScore.toFixed(2)),
        arsScore: parseFloat(arsScore.toFixed(2)),
        cdrScore: parseFloat(cdrScore.toFixed(2)),
        ailScore: parseFloat(ailScore.toFixed(2)),
        ksdScore: parseFloat(ksdScore.toFixed(2)),
    };
}

/**
 * 계산된 KPI와 입력 데이터를 바탕으로 종합 위험 레벨을 판단하는 상태 머신 로직입니다.
 * @param {Record<string, number>} kpis - calculateKpis가 반환한 6대 KPI 점수
 * @param {RiskInputData} data - 시뮬레이션 입력 데이터
 * @returns {{riskLevel: 'GREEN' | 'YELLOW' | 'RED', indicators: Array<{kpi: string, value: number}>}}
 */
export function determineRiskState(kpis, data) {
    let riskLevel = 'GREEN';
    const warningIndicators = [];

    // 🚨 RED ZONE 체크 (치명적 위협 조건): TRE > 80 이거나 ARS가 임계치를 넘을 경우
    if (kpis.treValue >= 80 || kpis.arsScore >= 70) {
        riskLevel = 'RED';
        warningIndicators.push({ kpi: 'TRE', value: kpis.treValue });
        warningIndicators.push({ kpi: 'ARS', value: kpis.arsScore });
    } 
    // 🟡 YELLOW ZONE 체크 (경계 단계 조건): PIG가 임계치를 넘거나 미준수 점수가 높을 경우
    else if (kpis.pigScore >= 50 || data.regulatoryNonComplianceScore > 60) {
        riskLevel = 'YELLOW';
        warningIndicators.push({ kpi: 'PIG', value: kpis.pigScore });
        if (data.regulatoryNonComplianceScore > 60) {
            warningIndicators.push({ kpi: 'ComplianceCheck', value: data.regulatoryNonComplianceScore });
        }
    } 
    // ✅ GREEN ZONE (안정 조건): 모든 지표가 낮은 경우
    else {
        riskLevel = 'GREEN';
    }

    return { riskLevel, indicators: warningIndicators };
}


/**
 * 메인 API 엔드포인트 시뮬레이션 함수. E2E 통합 로직을 수행합니다.
 * @param {RiskInputData} input - 사용자가 제공하는 원시 데이터
 * @returns {Promise<RiskOutputData>} 구조화된 위험 보고서 객체
 */
export async function getSystemicRiskReport(input) {
    console.log(`[INFO] Analyzing risk report for Non-Compliance Score: ${input.regulatoryNonComplianceScore}`);

    // 1. KPI 계산 (Core Business Logic)
    const kpiScores = calculateKpis(input);

    // 2. 위험 상태 판단 (State Machine Logic)
    const { riskLevel, indicators } = determineRiskState(kpiScores, input);

    // 3. 최종 보고서 구조화 및 반환
    return {
        riskLevel: riskLevel,
        treValue: kpiScores.treValue,
        kpiScores: kpiScores,
        warningIndicators: indicators,
    };
}