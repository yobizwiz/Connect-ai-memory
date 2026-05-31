import React, { createContext, useState, useContext } from 'react';

// Funnel State Type 정의
type FunnelStage = 'DASHBOARD' | 'PAYWALL_TRIGGERED' | 'SUCCESS';

interface FunnelContextType {
    stage: FunnelStage;
    triggerPaywallFunnel: () => void;
}

const FunnelContext = createContext<FunnelContextType | undefined>(undefined);

export const useFunnelContext = (): FunnelContextType => {
    const context = useContext(FunnelContext);
    if (!context) {
        throw new Error('useFunnelContext must be used within a FunnelProvider');
    }
    return context;
};

// Provider 컴포넌트
export const FunnelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [stage, setStage] = useState<FunnelStage>('DASHBOARD');

    /**
     * 사용자가 보고서 다운로드를 시도했을 때 Paywall Funnel 상태로 전환합니다.
     */
    const triggerPaywallFunnel = (): void => {
        console.log("--- [FUNNEL TRIGGER] State transitioning to PAYWALL_TRIGGERED ---");
        setStage('PAYWALL_TRIGGERED');
        // 실제 환경에서는 여기서 Router.push('/paywall')와 같은 네비게이션 로직이 실행됩니다.
    };

    return (
        <FunnelContext.Provider value={{ stage, triggerPaywallFunnel }}>
            {children}
        </FunnelContext.Provider>
    );
};