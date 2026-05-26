import { useState, useEffect } from 'react';

export type RiskLevel = 'LOW' | 'WARNING' | 'CRITICAL';

export const getRiskStyles = (level: string): { className: string; message: string } => {
  switch (level) {
    case 'CRITICAL':
      return { 
        className: 'bg-red-950/80 border-4 border-red-700 animate-pulse', 
        message: '🚨 CRITICAL SYSTEM THREAT: 즉각적인 아키텍처 재설계 및 생존권 확보 조치 권장.' 
      };
    case 'WARNING':
      return { 
        className: 'bg-yellow-950/80 border-4 border-yellow-600', 
        message: '⚠️ WARNING: 일부 프로세스 규격 미준수 발생. 사각지대 리스크 점검이 필요합니다.' 
      };
    case 'LOW':
    default:
      return { 
        className: 'bg-gray-800 border-4 border-gray-700', 
        message: '✅ SYSTEM SAFE: 현재까지 감지된 무결성 위협 수준이 낮음. 지속적인 모니터링이 필요합니다.' 
      };
  }
};

export const useRiskSimulation = (isRunning: boolean) => {
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('LOW');
  const [currentRiskScore, setCurrentRiskScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isRunning) {
      setRiskLevel('LOW');
      setCurrentRiskScore(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setCurrentRiskScore(10);
    
    // 점진적으로 리스크 점수를 상승시키는 애니메이션 효과 시뮬레이션
    const timer1 = setTimeout(() => {
      setCurrentRiskScore(45);
      setRiskLevel('WARNING');
    }, 800);

    const timer2 = setTimeout(() => {
      setCurrentRiskScore(85);
      setRiskLevel('CRITICAL');
      setIsLoading(false);
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isRunning]);

  return { riskLevel, currentRiskScore, isLoading };
};