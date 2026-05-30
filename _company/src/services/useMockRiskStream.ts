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
                // Phase 1: Normal Zone (점진적 상승) - baseline status
                nextStatePayload = {
                    ...currentState,
                    treValue: Math.min(T_YELLOW - 50, currentTRE + Math.floor(Math.random() * 150)), // Yellow 근처까지 느리게 증가
                    message: "✅ [BASELINE STATUS]: 사각지대에 잠재적 규제 노출 리스크가 상존합니다. 선제적 통제 프로세스를 필수적으로 확보하십시오.",
                    status: 'NORMAL', level: 1, isGlitchActive: false
                };
                newLog = { timestamp: new Date().toISOString(), previousStatus: 'NORMAL', newStatus: 'NORMAL', triggerReason: 'Normal fluctuation' };

            } else if (currentTRE >= T_YELLOW * 0.8 && currentTRE < T_RED - 300) {
                // Phase 2: Yellow Zone 진입 및 유지 (경계 인식 및 손실 방지 요구)
                nextStatePayload = {
                    ...currentState,
                    treValue: Math.min(T_RED - 100, currentTRE + Math.floor(Math.random() * 350)), // 경고 수준으로 급격히 증가
                    message: "⚠️ [WARNING ZONE]: 잠재적 컴플라이언스 드리프트 감지! 지체 시 최소 $L_{min}$ ($50,000+)의 손실이 예견됩니다. 선제적 보강 설계를 즉시 개입하십시오.",
                    status: 'WARNING', level: 2, isGlitchActive: true // Glitch 활성화 시작
                };
                newLog = { timestamp: new Date().toISOString(), previousStatus: 'NORMAL', newStatus: 'WARNING', triggerReason: `TRE가 ${T_YELLOW}을 초과하여 경계 인식 및 $L_min 위협 확인` };

            } else {
                // Phase 3: Red Zone 진입 (시스템적 생존 위협 체감 및 강제 조치)
                nextStatePayload = {
                    ...currentState,
                    treValue: Math.min(1500, currentTRE + Math.floor(Math.random() * 600)), // 위험 수준으로 폭발적 증가
                    message: "🚨 [CRITICAL RED ZONE]: PII 비식별화 실패 및 AI 환각 책임 전가 감지! 최대 $L_{max}$ ($20,000,000+)의 재정 손실 위험에 노출되어 규정 위반에 해당합니다. 이것은 옵션이 아닙니다. 구조 무결성 방어벽을 즉시 활성화하고 복구 조치를 즉시 수행해야 합니다!",
                    status: 'CRITICAL', level: 3, isGlitchActive: true // Glitch 유지 및 강조
                };
                newLog = { timestamp: new Date().toISOString(), previousStatus: 'WARNING', newStatus: 'CRITICAL', triggerReason: `TRE가 ${T_RED}을 돌파하여 시스템적 무효화 위협 및 $L_max 강제 진입` };
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