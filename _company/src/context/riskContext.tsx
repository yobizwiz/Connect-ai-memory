import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { RiskInputs, calculateTarsScore, determineRiskLevel } from '../services/riskCalculationService';

// --- 🚨 1. Risk Context (Uncovered Liability & Paywall) ---
interface RiskState {
  lTotalMax: number;       // 현재 계산된 총 위험 점수
  isPaywallActive: boolean; // Paywall 활성화 여부
  calculateRiskScore: (data: any[]) => Promise<number>;
  status?: 'CRITICAL' | 'PAYWALL_ACTIVE' | 'NORMAL';
}

const RiskContext = createContext<RiskState | undefined>(undefined);

export const useRiskContext = (): RiskState => {
  const context = useContext(RiskContext);
  if (!context) {
    throw new Error('useRiskContext는 <RiskProvider> 내부에서만 사용해야 합니다.');
  }
  return context;
};

// --- 🚨 2. TARS Context (Time-Adjusted Risk Score) ---
interface TarsState {
  currentRiskScore: number;
  currentRiskStatus: 'CRITICAL' | 'WARNING' | 'NORMAL';
  isLoading: boolean;
  calculateTars: (inputs: RiskInputs) => Promise<number>;
}

const TarsContext = createContext<TarsState | undefined>(undefined);

export const useTarsContext = (): TarsState => {
  const context = useContext(TarsContext);
  if (!context) {
    throw new Error('useTarsContext는 <RiskProvider> 내부에서만 사용해야 합니다.');
  }
  return context;
};

const PAYWALL_THRESHOLD = 85;

// --- 👑 Unified Provider Component ---
export const RiskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Risk Context State
  const [lTotalMax, setLTotalMax] = useState<number>(0);
  const [isPaywallActive, setIsPaywallActive] = useState<boolean>(false);
  const [status, setStatus] = useState<'CRITICAL' | 'PAYWALL_ACTIVE' | 'NORMAL'>('NORMAL');

  // Tars Context State
  const [currentRiskScore, setCurrentRiskScore] = useState<number>(0);
  const [currentRiskStatus, setCurrentRiskStatus] = useState<'CRITICAL' | 'WARNING' | 'NORMAL'>('NORMAL');
  const [isTarsLoading, setIsTarsLoading] = useState<boolean>(false);

  // Risk Score Calculator (Placeholder logic)
  const calculateRiskScore = useCallback(async (data: any[]): Promise<number> => {
    console.log("🔍 [System] Starting $L_{totalMax}$ calculation...");
    await new Promise(resolve => setTimeout(resolve, 500)); // Latency mock
    const score = data.length * 10 + Math.floor(Math.random() * 30);
    const finalScore = Math.min(score, 100);
    return finalScore;
  }, []);

  // Sync Paywall & Status
  useEffect(() => {
    const checkThreshold = async () => {
      const dataArray = [{ id: 1, riskFactor: 'A' }, { id: 2, riskFactor: 'B' }];
      if (lTotalMax === 0 && dataArray.length > 0) {
        const newScore = await calculateRiskScore(dataArray);
        setLTotalMax(newScore);
        const isActive = newScore >= PAYWALL_THRESHOLD;
        setIsPaywallActive(isActive);
        setStatus(isActive ? 'PAYWALL_ACTIVE' : 'NORMAL');
      }
    };
    checkThreshold();
  }, [calculateRiskScore, lTotalMax]);

  // TARS calculation handler
  const calculateTars = useCallback(async (inputs: RiskInputs): Promise<number> => {
    setIsTarsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Latency mock
      const score = calculateTarsScore(inputs);
      setCurrentRiskScore(score);
      const level = determineRiskLevel(score);
      setCurrentRiskStatus(level);
      
      // If TARS is critical, also set general status to CRITICAL to trigger overlays
      if (level === 'CRITICAL') {
        setStatus('CRITICAL');
      }

      return score;
    } finally {
      setIsTarsLoading(false);
    }
  }, []);

  const riskValue: RiskState = {
    lTotalMax,
    isPaywallActive,
    calculateRiskScore,
    status
  };

  const tarsValue: TarsState = {
    currentRiskScore,
    currentRiskStatus,
    isLoading: isTarsLoading,
    calculateTars
  };

  return (
    <RiskContext.Provider value={riskValue}>
      <TarsContext.Provider value={tarsValue}>
        {children}
      </TarsContext.Provider>
    </RiskContext.Provider>
  );
};

export default RiskProvider;