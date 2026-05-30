import { useState, useEffect } from 'react';
import { RiskLevel } from '../constants/RiskLevels';

/**
 * @description 시스템의 위험 상태 변화를 관리하는 커스텀 훅.
 * IDLE -> ALERT (Time Pressure) -> MODAL_OPEN 로직을 제어합니다.
 */
export const useRiskState = () => {
    const [riskLevel, setRiskLevel] = useState<RiskLevel>('LOW');
    const [isAlertActive, setIsAlertActive] = useState(false);

    // 초기 로딩 및 강제 지연 로직 (Time Pressure 조성)
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        
        // 1. Initial State: IDLE -> LOADING
        setTimeout(() => {
            setRiskLevel('MEDIUM'); // 초기에는 경고 수준으로 시작
            setIsAlertActive(true); // ALERT 상태 진입
            console.log("⚙️ [State Machine] Transition: IDLE -> ALERT (Time Pressure Activated)");
        }, 1500); // 1.5초의 로딩 지연을 주어 긴장감 조성

        // 2. ALERT State Logic: 일정 시간이 지나면 크리티컬 리스크로 강제 전환
        timeoutId = setTimeout(() => {
            if (isAlertActive) {
                setRiskLevel('CRITICAL'); // 최악의 시나리오로 강제 하락
                console.warn("🚨 [State Machine] Transition: ALERT -> CRITICAL (Warning Threshold Passed)");
            }
        }, 7000); // 총 8.5초 후 크리티컬 리스크 노출

        return () => {
            clearTimeout(timeoutId);
        };
    }, [isAlertActive]);


    /**
     * @description 사용자가 진단 요청 버튼을 눌렀을 때 호출되는 핸들러.
     */
    const handleDiagnosisRequest = () => {
        console.log("✅ [State Machine] Transition: ALERT -> MODAL_OPEN (Conversion Point Reached)");
        // 실제 환경에서는 여기에 global context update 및 모달 Open API 호출 로직이 들어갑니다.
        localStorage.setItem('diagnosis_requested', 'true');
    };

    return { 
        riskLevel, 
        isAlertActive, 
        handleDiagnosisRequest 
    };
};