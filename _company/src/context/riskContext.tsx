import React, { createContext, useContext, useState, useCallback } from 'react';

// --- 🚨 시스템 상태 정의 (Design Token & State Machine) ---
export type RiskStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'PAYWALL_ACTIVE';

interface RiskContextType {
    status: RiskStatus;
    currentRiskScore: number;
    setRiskLevel: (score: number) => void; // 리스크 점수를 받아 상태를 업데이트하는 핵심 함수
    enterPanicState: () => void;          // 패닉 모드를 강제 진입시키는 함수
}

const RiskContext = createContext<RiskContextType | undefined>(undefined);

export const useRiskContext = (): RiskContextType => {
    const context = useContext(RiskContext);
    if (!context) {
        throw new Error('useRiskContext must be used within a PanicGateProvider');
    }
    return context;
};

// --- 🛡️ 리스크 게이트 제공자 (PanicGate Provider) ---
export const PanicGateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [status, setStatus] = useState<RiskStatus>('NORMAL');
    const [currentRiskScore, setCurrentRiskScore] = useState(0);

    // 리스크 점수를 받아 상태를 업데이트하는 핵심 로직 (Single Source of Truth)
    const setRiskLevel = useCallback((score: number) => {
        setCurrentRiskScore(score);
        let newStatus: RiskStatus;

        if (score < 50) {
            newStatus = 'NORMAL';
        } else if (score >= 50 && score < 85) {
            newStatus = 'WARNING';
        } else { // score >= 85
            console.warn(`[SYSTEM ALERT] Critical Risk Threshold (${score}) exceeded! Transitioning to CRITICAL.`);
            // 임계치 초과 시, 즉시 패닉 상태로 전환하고 외부 요소를 차단합니다.
            newStatus = 'CRITICAL';
            setTimeout(() => {
                enterPanicState();
            }, 500); // 짧은 지연 후 강제 진입
        }
        setStatus(newStatus);
    }, []);

    // 패닉 상태로 강제 전환 (DOM Lockout 및 Paywall 준비)
    const enterPanicState = useCallback(() => {
        if (status !== 'CRITICAL') {
            console.log("[SYSTEM PANIC] Full System Lockdown Initiated.");
            setStatus('PAYWALL_ACTIVE');
            // 실제 환경에서는 여기서 전역 스크롤 리스너를 붙여 Body/Window의 기본 동작을 막아야 합니다.
        }
    }, [status]);

    const value = {
        status,
        currentRiskScore,
        setRiskLevel,
        enterPanicState,
    };

    return (
        <RiskContext.Provider value={value}>
            {children}
        </RiskContext.Provider>
    );
};

export default PanicGateProvider;