/**
 * @fileoverview 가상의 '위협 지수(Threat Index)' API 호출을 시뮬레이션하는 서비스 레이어.
 * 실제 백엔드와 분리하여 테스트 용이성 및 재사용성을 높입니다.
 */

// 리스크 레벨 정의 (Enum 사용 권장)
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface ThreatIndexData {
    index: number; // 0 ~ 100 사이의 지수
    riskLevel: RiskLevel;
    message: string;
}

export interface ThreatInputData {
    externalApiCall1: string;
    regulatoryCheckResult: string;
    userBehaviorAnomalyScore: number;
}

export interface ThreatReport {
    threatIndex: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'CRITICAL';
    reportData: { details: string };
    isCriticalAlertTriggered: boolean;
}

/**
 * 가상의 외부 API를 호출하여 현재 고객/시스템의 위협 지수를 계산하고 반환합니다.
 * 이 함수는 비동기적으로 동작하며, 네트워크 지연을 시뮬레이션합니다.
 * @returns {Promise<ThreatIndexData>} 계산된 위협 지수 데이터.
 */
export const fetchThreatIndex = async (systemId: string): Promise<ThreatIndexData> => {
    console.log(`[API Call] Threat Index 조회 시작 - System ID: ${systemId}`);

    // 1초에서 2초 사이의 임의 지연을 주어 실제 네트워크 호출 느낌을 줍니다.
    const delay = Math.random() * 1000 + 1000;
    await new Promise<void>(resolve => setTimeout(() => resolve(), delay));

    // 가상의 위험도 로직: 시스템 ID에 따라 임의로 리스크를 결정합니다.
    let index: number;
    let riskLevel: RiskLevel;
    let message: string;

    if (systemId.includes('critical')) {
        index = Math.floor(Math.random() * 30) + 75; // 높은 지수 고정
        riskLevel = 'HIGH';
        message = "🚨 시스템적 구조 사각지대 발견! 즉시 진단이 필요합니다.";
    } else if (systemId.includes('warning')) {
        index = Math.floor(Math.random() * 40) + 45; // 중간 지수 고정
        riskLevel = 'MEDIUM';
        message = "⚠️ 주요 컴플라이언스 영역에서 잠재적 위험 패턴이 감지되었습니다.";
    } else {
        index = Math.floor(Math.random() * 30); // 낮은 지수
        riskLevel = 'LOW';
        message = "✅ 현재 시스템 상태는 안정적입니다. 하지만 예방 점검을 권장합니다.";
    }

    const result: ThreatIndexData = {
        index: index,
        riskLevel: riskLevel,
        message: message
    };

    console.log(`[API Call] Threat Index 조회 완료 - Risk Level: ${result.riskLevel}`);
    return result;
};

/**
 * 입력 데이터(외부 API 호출 결과, 규제 체크 결과, 비정상 행위 점수 등)를 바탕으로
 * 위협 보고서 데이터를 계산하여 반환합니다.
 */
export const calculateThreat = async (data: ThreatInputData): Promise<ThreatReport> => {
    const isCritical = 
        data.externalApiCall1.includes('CRITICAL') || 
        data.regulatoryCheckResult.includes('IMMEDIATE') || 
        data.userBehaviorAnomalyScore >= 0.9;
        
    const isMedium = 
        data.externalApiCall1.includes('Minor') || 
        data.regulatoryCheckResult.includes('Review') || 
        data.userBehaviorAnomalyScore >= 0.4;

    let threatIndex = 0.15;
    let riskLevel: 'LOW' | 'MEDIUM' | 'CRITICAL' = 'LOW';
    let details = 'Minimal risk detected.';
    let isCriticalAlertTriggered = false;

    if (isCritical) {
        threatIndex = 0.98;
        riskLevel = 'CRITICAL';
        details = 'SYSTEMIC FAILURE IMMINENT. IMMEDIATE ACTION REQUIRED.';
        isCriticalAlertTriggered = true;
    } else if (isMedium) {
        threatIndex = 0.6;
        riskLevel = 'MEDIUM';
        details = 'Potential compliance gap detected.';
        isCriticalAlertTriggered = false;
    }

    return {
        threatIndex,
        riskLevel,
        reportData: { details },
        isCriticalAlertTriggered
    };
};

const MockThreatIndexService = {
    fetchThreatIndex,
    calculateThreat,
};

export default MockThreatIndexService;