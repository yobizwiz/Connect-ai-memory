import { SystemRiskData, RiskStateContext, AlertDetail } from '../types';

// 🚨 상수 정의: 변경되면 전체 시스템에 영향을 주므로 상수로 분리합니다.
const THRESHOLD = {
    WARNING: 5000, // $L_{max}$가 5000 초과 시 WARNING 진입
    CRITICAL: 15000, // $L_{max}$가 15000 초과 시 CRITICAL 진입
};

/**
 * @function calculateRiskState
 * @description Raw 데이터로부터 시스템의 현재 리스크 상태(State)를 계산하는 순수 함수.
 * (Pure Function: 입력값만으로 출력값이 결정됨. Side Effect 없음.)
 * @param {SystemRiskData} rawData - API에서 받은 원시 위험 데이터.
 * @returns {RiskStateContext} 계산된 시스템 상태 객체.
 * @throws {Error} 필수 필드 누락 시 예외 발생.
 */
export function calculateRiskState(rawData: SystemRiskData): RiskStateContext {
    // [Defensive Check 1]: 필수 데이터 유효성 검사 (가장 중요)
    if (!rawData || rawData.riskScore === null || isNaN(Number(rawData.riskScore))) {
        throw new Error("Invalid or missing risk score data provided to calculateRiskState.");
    }

    const currentLMax = Number(rawData.riskScore);
    let riskLevel: 'IDLE' | 'WARNING' | 'CRITICAL';
    let isSystemCritical: boolean;

    // [Defensive Check 2]: 상태 전이 로직 (State Transition Logic)
    if (currentLMax >= THRESHOLD.CRITICAL) {
        riskLevel = 'CRITICAL';
        isSystemCritical = true;
    } else if (currentLMax >= THRESHOLD.WARNING) {
        riskLevel = 'WARNING';
        isSystemCritical = true; // WARNING도 중요한 경고이므로 플래그 설정
    } else {
        riskLevel = 'IDLE';
        isSystemCritical = false;
    }

    return {
        currentLMax: currentLMax,
        riskLevel: riskLevel,
        isSystemCritical: isSystemCritical,
        lastUpdated: new Date(rawData.timestamp),
        thresholds: THRESHOLD, // 상수값을 그대로 사용해도 되지만, 구조적 통일성을 위해 포함.
    };
}

/**
 * @function getAlertDetail
 * @description 현재 상태에 맞는 상세 경고 정보를 반환합니다.
 * @param {RiskStateContext} state - 계산된 시스템 상태.
 * @returns {AlertDetail | null} 해당 상태의 상세 정보, 또는 정상일 경우 null.
 */
export function getAlertDetail(state: RiskStateContext): AlertDetail | null {
    if (state.riskLevel === 'IDLE') {
        return null; // 아무 경고 없음.
    }

    // [Defensive Check 3]: 상태별 디테일 반환 로직 분리
    if (state.riskLevel === 'WARNING') {
        return {
            title: "⚠️ 시스템 임계치 근접 감지",
            message: `현재 $L_{max}$가 ${Number(state.thresholds.warningThreshold).toLocaleString()}을 초과했습니다. 데이터 소스(${rawData.dataSource})에 대한 추가적인 검토가 필요합니다.`,
            severityColor: "#F39C12", // Designer의 경고색 토큰 사용
            actionRequired: 'Review',
        };
    } else if (state.riskLevel === 'CRITICAL') {
        return {
            title: "🚨 치명적 리스크 감지! 즉각적인 조치 필요!",
            message: `$L_{max}$가 ${Number(state.thresholds.criticalThreshold).toLocaleString()}을 초과했습니다. 이는 구조적 공백(Structural Gap)의 명확한 증거입니다. 지금 바로 전문가 진단이 필요합니다.`,
            severityColor: "#E74C3C", // Designer의 치명적 빨간색 토큰 사용
            actionRequired: 'Paywall', // 결제 유도 강제 전환
        };
    }
    return null;
}

// API 모킹을 위한 가상의 입력 데이터 (테스트 용)
export function mockFetchRiskData(score: number, source: SystemRiskData['dataSource']): SystemRiskData {
    return {
        timestamp: new Date().toISOString(),
        riskScore: score,
        violationCount: Math.floor(Math.random() * 5) + 1,
        dataSource: source
    };
}