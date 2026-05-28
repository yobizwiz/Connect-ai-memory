import { useState, useEffect } from 'react';
import { SystemRiskPayload, StateChangeLog, CombinedDashboardData, RiskStatus } from './riskTypes';

// === 상수 정의 (Blueprint 기반) ===
const T_YELLOW = 500; // Yellow Zone 임계치
const T_RED = 1200;   // Red Zone 임계치
const SIMULATION_INTERVAL_MS = 3000; // 3초마다 데이터 업데이트 시뮬레이션

/**
 * @description 리스크 스트림을 모의(Mock)로 생성하고 상태 변화를 관리하는 Hook.
 * 실제 프로젝트에서는 이 로직이 WebSocket 또는 API Polling으로 대체됩니다.
 */
export const useMockRiskStream = () => {
    const [data, setData] = useState<CombinedDashboardData | null>(null);

    useEffect(() => {
        let currentState: SystemRiskPayload = {
            status: 'NORMAL', level: 1, treValue: 300, pigScore: 50, arsIndex: 80, cdrRatio: 0.9, ailFactor: 20, ksdDeviation: 0.1, message: "System analysis running...", isGlitchActive: false
        };

        // 초기 상태 로그 설정
        let stateLog: StateChangeLog = {
            timestamp: new Date().toISOString(),
            previousStatus: null,
            newStatus: 'NORMAL',
            triggerReason: 'Initial system boot'
        };

        const intervalId = setInterval(() => {
            // 1. 다음 데이터 예측 및 상태 변화 로직 (핵심 비즈니스 로직)
            let nextStatePayload: SystemRiskPayload;
            let newLog: StateChangeLog;
            let currentTRE = currentState.treValue;

            // 시뮬레이션 목표: Normal -> Warning -> Critical 순으로 TRE를 급격히 증가시킴
            if (currentTRE < T_YELLOW * 0.8) {
                // Phase 1: Normal Zone (점진적 상승)
                nextStatePayload = {
                    ...currentState,
                    treValue: Math.min(T_YELLOW - 50, currentTRE + Math.floor(Math.random() * 150)), // Yellow 근처까지 느리게 증가
                    message: `Normal operation. Current $TRE$: ${Math.round(currentTRE)}`,
                    status: 'NORMAL', level: 1, isGlitchActive: false
                };
                newLog = { timestamp: new Date().toISOString(), previousStatus: 'NORMAL', newStatus: 'NORMAL', triggerReason: 'Normal fluctuation' };

            } else if (currentTRE >= T_YELLOW * 0.8 && currentTRE < T_RED - 300) {
                // Phase 2: Yellow Zone 진입 및 유지 (경계 인식 유도)
                nextStatePayload = {
                    ...currentState,
                    treValue: Math.min(T_RED - 100, currentTRE + Math.floor(Math.random() * 350)), // 경고 수준으로 급격히 증가
                    message: `⚠️ WARNING! Yellow Zone 진입 감지. $TRE$가 임계치에 근접합니다.`,
                    status: 'WARNING', level: 2, isGlitchActive: true // Glitch 활성화 시작
                };
                newLog = { timestamp: new Date().toISOString(), previousStatus: 'NORMAL', newStatus: 'WARNING', triggerReason: `TRE가 ${T_YELLOW}을 초과하여 경계 인식` };

            } else {
                // Phase 3: Red Zone 진입 (시스템적 위협 체감)
                nextStatePayload = {
                    ...currentState,
                    treValue: Math.min(1500, currentTRE + Math.floor(Math.random() * 600)), // 위험 수준으로 폭발적 증가
                    message: `🚨 CRITICAL RED ZONE! 시스템 생존 위협 감지! 즉각적인 조치가 필요합니다.`,
                    status: 'CRITICAL', level: 3, isGlitchActive: true // Glitch 유지 및 강조
                };
                newLog = { timestamp: new Date().toISOString(), previousStatus: 'WARNING', newStatus: 'CRITICAL', triggerReason: `TRE가 ${T_RED}을 돌파하여 시스템적 위험 발생` };
            }

            // KPI 값들은 상태에 따라 다르게 움직이게 설정 (시뮬레이션)
            nextStatePayload.pigScore = Math.max(20, currentState.pigScore - 5);
            nextStatePayload.arsIndex = Math.min(100, currentState.arsIndex + 3);
            nextStatePayload.cdrRatio = Math.random() * 0.5 + 0.5;
            nextStatePayload.ailFactor = (Math.random() * 10) + 1;
            nextStatePayload.ksdDeviation = Math.random() * 0.2;


            // 최종 데이터 업데이트 및 상태 전환 로깅
            setData({
                ...nextStatePayload,
                ...newLog
            } as CombinedDashboardData);

        }, SIMULATION_INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, []);

    return data;
};