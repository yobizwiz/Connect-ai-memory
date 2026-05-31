/**
 * @fileoverview Risk Exposure Service: 규제 위협 데이터를 TRE 점수로 변환하고 시스템 상태(State)를 결정하는 코어 모듈.
 * 이 서비스는 프론트엔드(React/Vue 등)와 연동될 Mock API 백엔드 로직을 시뮬레이션합니다.
 */

import { RegulatoryScenario, RiskDataset } from '../types/riskTypes'; // 가정된 타입 정의 파일

/**
 * 시스템의 위험 상태를 나타내는 Enum (Type-safe state management)
 * Normal: 정상 범위 - 아무 조치 불필요.
 * Warning: 주의 단계 - 모니터링 및 대비 필요.
 * Critical: 위기 단계 - 즉각적인 해결책(Paywall/Action)이 필수.
 */
export enum SystemState {
    NORMAL = 'Normal',
    WARNING = 'Warning',
    CRITICAL = 'Critical',
}

/**
 * 위험 평가 결과를 담는 구조체 (API 응답 표준화)
 */
interface RiskAssessmentResult {
    score: number; // 최종 TRE 점수 (0-100)
    state: SystemState;
    isPaywallRequired: boolean; // Paywall 전환 강제 여부 플래그
    glitchTriggered: boolean;   // Glitch 시각 효과 발생 지침 플래그
    message: string;            // 사용자에게 보여줄 명확한 메시지
}

/**
 * 1. TRE 점수 계산 로직 (핵심 비즈니스 로직)
 * @param dataset - Researcher가 제공한 구조화된 위험 데이터셋
 * @returns 총 위험 노출 점수 (Total Risk Exposure Score)
 */
const calculateTRE = (dataset: RiskDataset): number => {
    let totalScore = 0;
    // 시뮬레이션 로직: 모든 시나리오의 '위협 강도'와 '법적 벌금 $L_{max}$ 크기'에 가중치를 부여하여 점수 산출.
    for (const scenario of dataset.risk_scenarios) {
        // 예시 계산: Threat Severity * Lmax / Time Sensitivity Coefficient
        const severityWeight = Math.random() * 0.3 + 0.5; // 0.5 ~ 0.8 사이 무작위 가중치 적용 (실제로는 복잡한 공식 필요)
        const scoreContribution = scenario.primary_threat_impact * severityWeight * (scenario.estimated_max_fine / 1e6);

        totalScore += Math.min(scoreContribution, 30); // 개별 시나리오 점수는 최대 30점 제한
    }
    // 최종 점수를 100점 만점으로 정규화 및 반올림 처리 (무결성 확보)
    return Math.round(Math.min(totalScore / 3, 95)); // 예시 상한선 설정
};

/**
 * 2. 시스템 상태 판별 로직 (State Machine Transition)
 * @param score - 계산된 TRE 점수
 * @returns SystemState 및 UI 지침이 포함된 객체
 */
const getSystemState = (score: number): { state: SystemState; paywallRequired: boolean; glitchTriggered: boolean; message: string } => {
    if (score >= 85) { // Critical Threshold Check (Designer Spec V3.0 기준)
        return {
            state: SystemState.CRITICAL,
            paywallRequired: true,
            glitchTriggered: true,
            message: "🚨 [RED ZONE ALERT] 시스템적 리스크가 임계치 초과! 즉각적인 전문가 검토(유료 서비스)가 필요합니다."
        };
    } else if (score >= 50) { // Warning Threshold Check
        return {
            state: SystemState.WARNING,
            paywallRequired: false,
            glitchTriggered: true, // 경고 시에는 Glitch 효과를 주어 긴장감 유지
            message: "⚠️ [NOTICE] 주의 단계 진입. 일부 리스크 요인이 감지되었습니다. 자세한 분석이 필요합니다."
        };
    } else {
        return {
            state: SystemState.NORMAL,
            paywallRequired: false,
            glitchTriggered: false,
            message: "✅ 시스템 정상 작동 범위입니다. 주기적인 모니터링을 권장합니다."
        };
    }
};


/**
 * 🌐 Mock API 엔드포인트 시뮬레이션 (메인 진입점)
 * @param riskDataset - 입력 데이터셋
 * @returns RiskAssessmentResult - 최종 분석 결과 및 UI 지침
 */
export const assessRiskAndGetState = async (riskDataset: RiskDataset): Promise<RiskAssessmentResult> => {
    try {
        // 1. 점수 계산 단계
        const score = calculateTRE(riskDataset);

        // 2. 상태 판별 및 UI 지침 결정
        const stateInfo = getSystemState(score);

        // 3. 최종 결과 객체 반환 (프론트엔드가 이 구조를 읽어 모든 로직을 처리)
        return {
            score: score,
            state: stateInfo.state,
            isPaywallRequired: stateInfo.paywallRequired,
            glitchTriggered: stateInfo.glitchTriggered,
            message: stateInfo.message
        };

    } catch (error) {
        console.error("🚨 Critical Error during risk assessment:", error);
        // Defensive Coding: 실패 시에도 시스템이 무너지지 않도록 안전한 폴백 상태 반환
        return {
            score: 0,
            state: SystemState.NORMAL,
            isPaywallRequired: false,
            glitchTriggered: false,
            message: "❌ 데이터 처리 중 오류가 발생했습니다. 데이터를 확인해 주세요."
        };
    }
};

// --- 테스트용 더미 데이터셋 (실제 호출 시에는 외부에서 주입됨) ---
const DUMMY_RISK_DATASET: RiskDataset = {
    metadata: { dataset_version: "v1.0.0", creation_date: new Date().toISOString(), description: "" },
    risk_scenarios: [
        // ... (실제 데이터 로직이 주입될 부분)
    ]
};

/**
 * @example
 * // Mock API 호출 예시
 * const result = await assessRiskAndGetState(DUMMY_RISK_DATASET);
 * console.log(`TRE Score: ${result.score}, State: ${result.state}`);
 */

export default {
    assessRiskAndGetState,
};