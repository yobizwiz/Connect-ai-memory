// PaywallContext.tsx - 시스템적 결제 흐름을 관리하는 중앙 상태 컨텍스트
import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * @typedef {'IDLE' | 'REQUESTING_FREE_REPORT' | 'SYSTEM_OVERLOAD_TRANSITION' | 'PAYWALL_ACTIVE'} PaywallState
 * 시스템의 현재 Paywall 상태를 정의합니다.
 */

/**
 * PaywallContextType
 * 모든 컴포넌트가 사용할 수 있는 전역 Paywall 상태 관리 객체입니다.
 */
export const PaywallContext = createContext(null);

/**
 * Custom Hook: paywallFlow - 컨텍스트 사용 편의성을 높여줍니다.
 * @returns {{ state: PaywallState, initiateFreeReportRequest: () => Promise<void> }}
 */
export const usePaywallFlow = () => {
    const [state, setState] = useState('IDLE');

    /**
     * 🚨 핵심 로직: 무료 진단 보고서 요청부터 결제 모달까지의 전체 플로우를 비동기로 제어합니다.
     * 이 함수는 'System Overload Transition'을 강제로 삽입하여 몰입도를 높입니다.
     */
    const initiateFreeReportRequest = useCallback(async () => {
        if (state !== 'IDLE') return;

        console.log('[Paywall Flow] 🚀 Free Report Request 시작...');
        setState('REQUESTING_FREE_REPORT');

        // [1/3] 데이터 검증 및 로딩 단계: 사용자에게 기대감을 조성합니다.
        await new Promise(resolve => setTimeout(resolve, 500)); // 0.5초 지연 시뮬레이션
        console.log('[Paywall Flow] ✅ 초기 데이터 체크 완료. 시스템 부하 감지...');

        // [2/3] 트랜지션 포인트: '시스템 경고' 효과 발생 (가장 중요한 몰입 구간)
        setState('SYSTEM_OVERLOAD_TRANSITION');
        console.warn('[Paywall Flow] ⚠️ WARNING: System Overload Transition 시작!');

        // 디자이너 브리프에 따라, 이 부분에서 짧지만 강렬한 경고 오버레이를 보여줘야 합니다.
        await new Promise(resolve => setTimeout(resolve, 1500)); // 시스템 과부하 연출을 위한 1.5초 지연
        console.log('[Paywall Flow] 🛑 Transition 종료. Paywall 노출 준비...');

        // [3/3] 최종 상태: Paywall 모달 활성화
        setState('PAYWALL_ACTIVE');
        console.log('[Paywall Flow] ✨ PAYWALL ACTIVE: 결제 게이트가 열렸습니다.');
    }, [state]);


    return {
        state,
        initiateFreeReportRequest,
    };
};

/**
 * PaywallProvider 컴포넌트: 애플리케이션 전체에 상태를 제공합니다.
 */
export const PaywallProvider = ({ children }) => {
    const flow = usePaywallFlow();

    return (
        <PaywallContext.Provider value={{ 
            flow,
            // 필요하다면 여기에 추가적인 Setter 함수들을 정의할 수 있습니다.
        }}>
            {children}
        </PaywallContext.Provider>
    );
};

/**
 * 사용 예시: usePaywallFlowHook()
 */
export const usePaywallFlowHook = () => useContext(PaywallContext);