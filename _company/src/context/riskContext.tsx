import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { LTotalMaxScore } from '../types/lTotalMaxTypes'; // 가상의 타입 정의

// --- 🚨 초기 상태 및 Interface 정의 (Defensive Coding) ---
interface RiskState {
  lTotalMax: number;       // 현재 계산된 총 위험 점수
  isPaywallActive: boolean; // Paywall 활성화 여부 (Threshold 초과 시 True)
  calculateRiskScore: (data: any[]) => Promise<number>; // 리스크 점수를 비동기적으로 계산하는 핵심 로직
}

const RiskContext = createContext<RiskState | undefined>(undefined);

// 가상의 임계값 정의. 이 값에 따라 Paywall이 발동합니다.
const PAYWALL_THRESHOLD: number = 85; 

export const useRiskContext = (): RiskState => {
  const context = useContext(RiskContext);
  if (!context) {
    throw new Error('useRiskContext는 <RiskProvider> 내부에서만 사용해야 합니다.');
  }
  return context;
};

// --- Provider 컴포넌트 구현 (Single Source of Truth) ---
export const RiskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lTotalMax, setLTotalMax] = useState<number>(0);
  const [isPaywallActive, setIsPaywallActive] = useState<boolean>(false);

  // 💡 핵심 로직: 리스크 점수 계산 (Placeholder)
  // 실제 구현 시에는 API 호출 또는 복잡한 비즈니스 로직이 들어갑니다.
  const calculateRiskScore = useCallback(async (data: any[]): Promise<number> => {
    console.log("🔍 [System] Starting $L_{totalMax}$ calculation...");
    // 임시로 데이터 배열의 길이에 10점씩 가중치를 부여하는 시뮬레이션 로직 사용
    await new Promise(resolve => setTimeout(resolve, 500)); // API 지연 시간 모방
    const score = data.length * 10 + Math.floor(Math.random() * 30);
    return Math.min(score, 100); // 점수 제한
  }, []);

  // 리스크 점수가 변경될 때마다 Paywall 활성화 여부를 결정하는 Effect Hook (무결성 보장)
  useEffect(() => {
    const checkThreshold = async () => {
      if (lTotalMax === 0 && dataArray.length > 0) { // 초기 로딩 시점에만 계산을 트리거한다고 가정
        const newScore = await calculateRiskScore(dataArray);
        setLTotalMax(newScore);
        setIsPaywallActive(newScore >= PAYWALL_THRESHOLD);
      } else if (lTotalMax !== 0) {
         // 점수 업데이트가 발생하면 다시 검사합니다.
         const newScore = await calculateRiskScore([]); // 예시로 빈 배열 전달
         setLTotalMax(newScore);
         setIsPaywallActive(newScore >= PAYWALL_THRESHOLD);
      }
    };

    // 초기 데이터 로딩 시뮬레이션 (실제로는 외부 API 호출)
    const dataArray = [{ id: 1, riskFactor: 'A' }, { id: 2, riskFactor: 'B' }];
    checkThreshold();

  }, [calculateRiskScore]); // 의존성 배열에 calculateRiskScore 포함

  // 점수 수동 업데이트 함수 (외부에서 강제로 리스크 점수를 설정할 때 사용)
  const updateLTotalMax = useCallback((newScore: number) => {
      setLTotalMax(newScore);
      setIsPaywallActive(newScore >= PAYWALL_THRESHOLD);
  }, []);

  const value: RiskState = {
    lTotalMax,
    isPaywallActive,
    calculateRiskScore,
  };

  return (
    <RiskContext.Provider value={value}>
      {children}
    </RiskContext.Provider>
  );
};
// ⚙️ 모든 컴포넌트가 <RiskProvider>로 감싸져야 함을 주석 처리하여 명시함.
export { RiskProvider };