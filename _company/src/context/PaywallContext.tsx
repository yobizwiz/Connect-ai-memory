/**
 * @fileoverview Funnel State Management Context.
 * Paywall Funnel의 현재 상태 (IDLE -> CRISIS -> LOCKED)를 전역적으로 관리합니다.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { logAttentionEvent } from '../services/AbtTestService';

// 🚨 TypeScript 엄격 정의: Funnel State는 Enum으로 관리하여 오타와 불일치를 원천 차단합니다.
export type PaywallState = 'IDLE' | 'ALERT_YELLOW' | 'CRISIS_RED' | 'LOCKED_PAYWALL';

interface PaywallContextType {
    currentState: PaywallState;
    setState: (newState: PaywallState) => Promise<void>;
}

const PaywallContext = createContext<PaywallContextType | undefined>(undefined);

export const usePaywallContext = () => {
    const context = useContext(PaywallContext);
    if (!context) {
        throw new Error('usePaywallContext must be used within a PaywallProvider');
    }
    return context;
};

export const PaywallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentState, setCurrentState] = useState<PaywallState>('IDLE');
    const USER_ID = 'mock-user-123'; // 실제 환경에서는 세션 기반으로 가져와야 함

    /**
     * Paywall 상태를 변경하는 핵심 로직. 이 함수는 반드시 A/B 테스트 로깅을 수행해야 합니다.
     * @param newState - 새로운 Funnel State 값
     */
    const setState = useCallback(async (newState: PaywallState): Promise<void> => {
        console.log(`\n⚙️ [Paywall Context] State Transition Attempt: ${currentState} -> ${newState}`);

        // 1. 이전 상태에서 다음 상태로의 전환을 A/B 테스트 로깅합니다. (Transition Tracking)
        await logAttentionEvent({
            userId: USER_ID,
            eventType: 'TRANSITION',
            funnelState: newState,
            dataPayload: { previousState: currentState }
        });

        // 2. 상태 업데이트 및 내부 검증 루프 실행
        setCurrentState(newState);
    }, [currentState]);


    const contextValue = {
        currentState: currentState,
        setState: setState,
    };

    return (
        <PaywallContext.Provider value={contextValue}>
            {children}
        </PaywallContext.Provider>
    );
};