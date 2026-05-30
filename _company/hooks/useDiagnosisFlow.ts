import { useState, useCallback } from 'react';
import { RiskData } from '../types'; // 가정: types.ts에 정의된 타입 사용
// 임시로 API 호출을 시뮬레이션하는 Mock 함수를 사용합니다.
// 실제 환경에서는 c:\Users\jinoh\Desktop\Connect AI\_company\components\services\riskService에서 가져와야 합니다.

/**
 * @description Paywall Funnel의 전체 상태 관리 및 로직 흐름 제어 훅.
 * 진단 요청 클릭부터 결제 준비까지의 모든 상태를 통합합니다.
 */
export const useDiagnosisFlow = () => {
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'PAYWALL_READY' | 'ERROR'>('IDLE');
    const [diagnosisResult, setDiagnosisResult] = useState<RiskData | null>(null);

    /**
     * @description 리스크 진단 프로세스를 시작합니다. (로딩 상태 진입)
     */
    const startDiagnosisProcess = useCallback(async () => {
        if (status === 'LOADING') return; // 이미 진행 중이면 재실행 방지
        setStatus('LOADING');

        try {
            // 🚨 실제 환경에서는 Promise 기반의 API 호출을 사용해야 합니다.
            console.log("[FlowManager] Diagnosis process started...");
            await new Promise(resolve => setTimeout(resolve, 1500)); // 1. 로딩 시뮬레이션 (1.5초)

            // Mock 데이터: 진단 결과 생성 및 위험도 부여
            const mockRiskData: RiskData = {
                totalRiskExposure: Math.floor(Math.random() * 100) + 70, // 최소 70점 이상으로 Critical 유도
                riskLevel: 'CRITICAL', // Paywall 발동 조건 충족 가정
                details: [/* ... */],
            };

            // 2. 진단 결과 저장 및 상태 업데이트 (Paywall 준비 완료)
            setDiagnosisResult(mockRiskData);
            setStatus('PAYWALL_READY');
            console.log("[FlowManager] Diagnosis complete. Paywall ready.");

        } catch (error) {
            console.error("🚨 Diagnosis Flow Error:", error);
            setStatus('ERROR');
            // 에러 발생 시 사용자에게 명확한 피드백 제공 로직 추가 필요
        }
    }, [status]);

    /**
     * @description 사용자가 결제를 진행할 준비가 되었을 때 호출됩니다. (A/B 테스트 및 이탈 기록 지점)
     */
    const trackAndAdvanceToPaywall = useCallback(() => {
        if (status !== 'PAYWALL_READY' || !diagnosisResult) {
            console.warn("[FlowManager] Cannot proceed: Not ready for paywall.");
            return null;
        }

        // 🐛 A/B 테스트 및 이탈 지점 추적 로직 통합 (필수!)
        const trackingData = {
            event: 'Paywall_Entry_Attempt',
            risk_score: diagnosisResult.totalRiskExposure,
            risk_level: diagnosisResult.riskLevel,
            timestamp: Date.now(),
            // A/B 테스트 변수 (예시) - 실제로는 Context나 State에서 가져와야 함
            ab_group: 'Control' // 또는 'A', 'B'
        };

        console.log(`[Analytics] Tracking user drop-off point attempt. Data:`, trackingData);

        // 💡 실제 서비스에서는 Google Analytics, Mixpanel 등의 SDK 호출이 여기에 들어갑니다.
        // 예: window.analytics.track('Funnel', 'Paywall_Attempt', trackingData);

        // 성공적으로 Paywall 진입에 필요한 데이터를 반환하고 상태를 유지합니다.
        return diagnosisResult;
    }, [status, diagnosisResult]);


    const resetFlow = useCallback(() => {
        setStatus('IDLE');
        setDiagnosisResult(null);
        console.log("[FlowManager] Flow reset complete.");
    }, []);

    // 상태 및 로직을 객체로 반환하여 컴포넌트에서 사용하기 쉽게 만듭니다.
    return {
        status,
        diagnosisResult,
        startDiagnosisProcess,
        trackAndAdvanceToPaywall,
        resetFlow
    };
};