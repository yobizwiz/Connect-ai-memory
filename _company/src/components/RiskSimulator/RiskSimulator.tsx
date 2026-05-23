import React, { useState, useEffect, useCallback } from 'react';

// --- Types Definition ---
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface RiskState {
  score: number; // 0 (안전) to 100 (위협)
  level: RiskLevel;
}

/**
 * 리스크 점수 변화에 따른 UI 경고 애니메이션 및 상태를 시뮬레이션하는 컴포넌트.
 * 이 로직은 클라이언트 측에서 시간 기반으로 작동하며, 시스템적 위협을 사용자에게 '체험'하게 만듭니다.
 */
const RiskSimulator: React.FC = () => {
  // 1. 초기 상태 설정 (시스템이 분석 시작하는 순간)
  const [riskState, setRiskState] = useState<RiskState>({ score: 20, level: 'LOW' });
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  /** 리스크 점수와 레벨을 계산하는 순수 로직 (Pure Function) */
  const calculateRiskLevel = useCallback((score: number): RiskLevel => {
    if (score >= 85) return 'CRITICAL'; // Red Zone 경고 임계점
    if (score >= 60) return 'HIGH';
    if (score >= 30) return 'MEDIUM';
    return 'LOW';
  }, []);

  /** 리스크 점수를 업데이트하고 UI 상태를 변경하는 로직 */
  const updateRiskState = useCallback((newScore: number, isFinal: boolean): void => {
    let finalScore = Math.max(0, Math.min(100, newScore)); // 0~100 제한

    // 시뮬레이션 종료 시 최종 점수 고정 및 상태 변경
    if (isFinal) {
      setRiskState({ score: finalScore, level: calculateRiskLevel(finalScore) });
      setIsAnalyzing(false);
      return;
    }
    
    // 분석 중에는 부드럽게 업데이트하며 위협을 고조시킴
    const newLevel = calculateRiskLevel(finalScore);
    setRiskState({ score: finalScore, level: newLevel });
  }, [calculateRiskLevel]);

  /** 2초마다 리스크 점수를 하강시키며 '시스템적 무지'를 자극하는 시뮬레이션 */
  useEffect(() => {
    if (!isAnalyzing) return;

    // 초기 분석 단계 (점진적인 위협 상승 연출)
    const intervalId = setInterval(() => {
      setRiskState(prev => {
        let newScore = Math.min(95, prev.score + 10); // 점수를 최대 95까지 올리며 불안정성 고조
        return { score: newScore, level: calculateRiskLevel(newScore) };
      });
    }, 2000);

    // 분석 중단 후 (예: 데이터 수신 완료 시) 최종 위협 점수로 강제 전환하는 로직 추가 필요.
    const timeoutId = setTimeout(() => {
        clearInterval(intervalId); // 인터벌 클리어
        console.log("--- Analysis Complete: Triggering Red Zone ---");
        // 10초 후, 결정적인 순간에 리스크를 최고치로 설정하여 구매 유도 모드로 전환합니다.
        const finalTimeout = setTimeout(() => {
            updateRiskState(92, true); // 최종적으로 92점 (Red Zone)으로 강제 고정
        }, 10000); // 10초 뒤에 Red Zone 트리거

        return () => clearTimeout(finalTimeout);
    }, 15000); // 총 15초의 시뮬레이션 시간 부여

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [isAnalyzing, updateRiskState]);


  // --- UI Component Rendering ---

  const getRedZoneClass = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-900/80 border-red-600 text-white animate-pulse'; // Red Zone, Glitch 느낌
      case 'HIGH': return 'bg-yellow-700/80 border-yellow-500 text-gray-900';
      case 'MEDIUM': return 'bg-blue-800/80 border-blue-500 text-white';
      default: return 'bg-green-800/80 border-green-600 text-white';
    }
  };

  return (
    <div className="p-8 border border-gray-700 rounded-lg shadow-2xl bg-[#1A1A1A] w-full max-w-3xl">
      <h2 className="text-3xl font-mono text-red-400 mb-6 tracking-widest uppercase">
        🛡️ Compliance Gatekeeper Live Analysis
      </h2>

      {/* 1. 리스크 위젯 (핵심 시각화 영역) */}
      <div className={`p-8 border-4 ${getRedZoneClass(riskState.level)} rounded-xl mb-8 shadow-[0_0_30px_rgba(255,50,50,0.7)]`}>
        <div className="flex justify-between items-center">
            <div>
                <p className="text-sm uppercase tracking-widest opacity-80">{isAnalyzing ? 'System Analyzing...' : 'Analysis Complete.'}</p>
                <h3 className={`text-6xl font-extrabold mt-1 transition-colors ${riskState.level === 'CRITICAL' ? 'text-red-400 drop-shadow-[0_0_15px_rgba(255,0,0,0.9)]' : 'text-white'}`}>
                    {riskState.score}
                </h3>
            </div>
            <div className="bg-gray-800 w-3/4 h-8 relative flex items-center justify-start">
                <div 
                    className={`h-full transition-all duration-[1500ms] ease-out ${riskState.level === 'CRITICAL' ? 'bg-red-500 scale-[1.2]' : riskState.level === 'HIGH' ? 'bg-yellow-500' : 'bg-green-500'} `}
                    style={{ width: `${riskState.score}%` }}
                ></div>
            </div>
        </div>
        <p className="text-xl mt-4 text-white">
          Current Threat Level: <span className={`font-bold uppercase ${riskState.level === 'CRITICAL' ? 'text-red-400' : 'text-yellow-300'}`}>{riskState.level}</span>
        </p>
      </div>

      {/* 2. 경고 메시지 (애니메이션/텍스트 출력) */}
      <div className="mb-10 p-6 border-l-4 border-red-500 bg-[#2a1e1e] shadow-inner">
        <h3 className={`text-2xl font-bold tracking-wider uppercase ${riskState.level === 'CRITICAL' ? 'text-red-400 animate-pulse' : 'text-white'}`}>
          [WARNING] System Integrity Alert: {isAnalyzing ? "Data Stream Instability Detected." : `Structural Flaw Identified (${riskState.level})`}
        </h3>
        <p className="mt-2 text-gray-300">
            ${!isAnalyzing && riskState.level === 'CRITICAL' 
                ? "경고: 현재 시스템적 리스크 점수는 임계치를 초과했습니다. 즉각적인 전문가 진단이 필요합니다." 
                : "분석 중... 데이터 흐름을 추적하고 있습니다."}
        </p>
      </div>

      {/* 3. CTA (구매 유도 모드) */}
      <button
        onClick={() => alert('🚀 무료 리스크 진단 요청 프로세스 시작!')}
        disabled={!isAnalyzing && riskState.level !== 'CRITICAL'}
        className={`w-full py-4 text-xl font-extrabold uppercase tracking-widest transition duration-300 ${
            riskState.level === 'CRITICAL' 
                ? 'bg-red-600 hover:bg-red-700 shadow-[0_0_25px_rgba(255,0,0,1)] animate-pulse cursor-pointer' 
                : 'bg-gray-600 cursor-not-allowed opacity-70'
        }`}
      >
        {riskState.level === 'CRITICAL' ? '지금 바로 무료 진단 요청하기 (가장 중요)' : '분석 대기 중...'}
      </button>
    </div>
  );
};

export default RiskSimulator;