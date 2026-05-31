/**
 * @module GapSimulatorService
 * @description 규제 격차 기반의 최대 재정 손실액(Lmax)을 계산하는 핵심 비즈니스 로직 엔진.
 * 이 모듈은 순수 함수로 설계되어, 외부 상태 변화 없이 예측 가능한 결과를 반환합니다. (Pure Function Principle)
 */

// --- 1. 타입 정의 및 상수화 (Defensive Programming) ---

/** 사용자가 입력할 수 있는 모든 산업군과 그 기본 리스크 가중치(Base Weight)를 정의합니다. */
export type Industry = 'Healthcare' | 'Finance' | 'Tech';

/** 시스템적 위험 요소와 그 심각도(Severity)를 표현하는 구조체입니다. (1-5점 척도 권장) */
export interface RiskFactor {
    name: string; // 예: Provenance Deficit
    severity: number; // 1(낮음) ~ 5(치명적)
    isCritical: boolean; // 이 리스크가 존재할 경우 Lmax에 가중치를 추가하는지 여부
}

/** 시뮬레이터의 최종 계산 결과 구조체 */
export interface SimulationResult {
    riskGrade: 'Low' | 'Medium' | 'High';
    maxLossUSD: number; // 정량화된 최대 손실액 (달러)
    gapReportSummary: string; // 보고서 요약문
}

/** 산업군별 기본 비용 계수. 이 값이 Lmax 계산의 기준이 됩니다. */
const BASE_COST_MULTIPLIERS: Record<Industry, number> = {
    Healthcare: 150000, // 의료/건강 분야는 규제가 가장 복잡함 (높은 초기 손실 가정)
    Finance: 220000,   // 금융 분야는 자본과 공포가 결합되어 높은 위험을 가짐
    Tech: 80000,       // 일반 기술 분야는 상대적으로 변동성이 크나 기본 베이스는 낮게 설정.
};

/** 리스크 요소별 Lmax 증폭 계수 (Amplification Factor). */
const RISK_AMPLIFICATION_FACTORS: Record<string, number> = {
    'Provenance Deficit': 1.8, // 출처 불명확성 -> 신뢰도 하락이 곧 자산 가치 폭락으로 연결됨
    'Source Attribution Failure': 2.5, // 주체 명시 실패는 법적 책임 소재를 모호하게 만들어 최악의 시나리오 유발
    'Data Residency Violation': 1.5, // 데이터가 어디에 있는지 못 알아서 발생하는 규제 위반 (GDPR 등)
    // ... 기타 리스크 추가 가능
};

/** Lmax 계산에 사용되는 공통 변수 */
const GLOBAL_LOSS_MULTIPLIER: number = 0.8; // 글로벌 경제 환경 악화 가중치 반영

// --- 2. 핵심 로직 엔진 함수 (Pure Function) ---

/**
 * 규제 격차를 기반으로 최대 재정 손실액(Lmax)을 계산합니다.
 * @param industry - 사용자가 선택한 산업군
 * @param risks - 시스템적 리스크 요소 목록
 * @returns SimulationResult 객체
 */
export const calculateGapSimulator = (industry: Industry, risks: RiskFactor[]): SimulationResult => {
    // 1. 기본 손실액 설정
    let baseLmax = BASE_COST_MULTIPLIERS[industry];

    // 2. 리스크 요소별 Lmax 증폭 계산 및 합산
    let totalRiskAmplificationSum = 0;
    const detectedRisks: string[] = [];

    for (const risk of risks) {
        if (!RISK_AMPLIFICATION_FACTORS[risk.name]) {
            // 정의되지 않은 리스크는 무시하거나 경고 로그만 남김.
            continue;
        }
        
        // Lmax 증폭 = (리스크 심각도 * 리스크 가중치) + 기본값
        const riskContribution = risk.severity * RISK_AMPLIFICATION_FACTORS[risk.name] || 0;
        totalRiskAmplificationSum += riskContribution;
        detectedRisks.push(risk.name);
    }

    // 3. 최종 Lmax 산출 공식 (공포 증폭 + 기본 비용)
    // Lmax = BaseCost * (1 + TotalRiskAmp/10) * GlobalLossMultiplier
    let finalLmax = baseLmax * (1 + totalRiskAmplificationSum / 15); // 15로 나누어 너무 폭발적으로 증가하는 것을 방지
    finalLmax *= GLOBAL_LOSS_MULTIPLIER;

    // Lmax는 최소한의 임계치를 가져야 함.
    if (finalLmax < 1000) finalLmax = 1000;


    // 4. 위험 등급 결정 로직 (Threshold Management)
    let riskGrade: 'Low' | 'Medium' | 'High';
    if (finalLmax >= 500000) {
        riskGrade = 'High'; // 50만 달러 이상 -> 즉시 위기 경보 수준
    } else if (finalLmax >= 150000) {
        riskGrade = 'Medium';
    } else {
        riskGrade = 'Low';
    }

    // 5. 리포트 요약문 생성 (권위적 어조 유지)
    const reportSummary = `[진단 보고서] ${industry} 산업의 구조적 취약점 진단 결과, 주요 리스크 요소(${detectedRisks.join(', ')})가 확인되었습니다. 현재 추정되는 법적 최대 손실액(Lmax)은 $${Math.round(finalLmax).toLocaleString()}이며, 이는 귀사가 직면한 '규제 갭'의 크기를 명확히 보여줍니다.`;

    return {
        riskGrade: riskGrade,
        maxLossUSD: parseFloat(finalLmax.toFixed(2)),
        gapReportSummary: reportSummary,
    };
};

// --- 3. 테스트 및 검증 (Self-Verification) ---
/**
 * 이 모듈이 제대로 작동하는지 확인하기 위한 더미 테스트 함수.
 */
export const testService = () => {
    console.log("--- Gap Simulator Service Test Start ---");
    
    // 케이스 1: 낮은 리스크 (Low Risk Case - Tech Industry, Minor Risks)
    const techRisksLow: RiskFactor[] = [
        { name: 'Provenance Deficit', severity: 2, isCritical: false },
        { name: 'Data Residency Violation', severity: 1, isCritical: false },
    ];
    let resultLow = calculateGapSimulator('Tech', techRisksLow);
    console.log(`[Test Case Low] Lmax: $${resultLow.maxLossUSD}, Grade: ${resultLow.riskGrade}`);

    // 케이스 2: 중간 리스크 (Medium Risk Case - Healthcare Industry, Moderate Risks)
    const healthRisksMed: RiskFactor[] = [
        { name: 'Provenance Deficit', severity: 3, isCritical: true },
        { name: 'Data Residency Violation', severity: 2, isCritical: false },
    ];
    let resultMedium = calculateGapSimulator('Healthcare', healthRisksMed);
    console.log(`[Test Case Medium] Lmax: $${resultMedium.maxLossUSD}, Grade: ${resultMedium.riskGrade}`);

    // 케이스 3: 최고 리스크 (High Risk Case - Finance Industry, Critical Risks)
    const financeRisksHigh: RiskFactor[] = [
        { name: 'Provenance Deficit', severity: 5, isCritical: true }, // Max Severity * High Amp Factor
        { name: 'Source Attribution Failure', severity: 5, isCritical: true },// Max Severity * Highest Amp Factor
    ];
    let resultHigh = calculateGapSimulator('Finance', financeRisksHigh);
    console.log(`[Test Case High] Lmax: $${resultHigh.maxLossUSD}, Grade: ${resultHigh.riskGrade}`);

    console.log("--- Gap Simulator Service Test End ---");
};