import React, { useState, useEffect } from 'react';

// 손실 금액을 포맷팅하는 헬퍼 함수 (예: 1234567 -> $1.23M)
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD'', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.floor(amount));
};

// LossMeter 컴포넌트 정의
/**
 * 시스템적 생존 리스크에 따른 실시간 재무 손실액을 시뮬레이션하고 시각화합니다.
 * @param initialLoss - 초기 손실 금액 (USD)
 * @param decayRate - 초당 손실 증가율 (USD/s)
 */
const LossMeter: React.FC<{ initialLoss: number; decayRate: number }> = ({ initialLoss, decayRate }) => {
  // 1. 상태 관리: 현재 손실액
  const [currentLoss, setCurrentLoss] = useState(initialLoss);
  // 2. 타이머 ID를 저장하여 클린업에 사용합니다.
  const [intervalRef, setIntervalRef] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log("✅ LossMeter: 시뮬레이션 로직 시작.");
    
    // 1초마다 손실 금액 업데이트를 시도하는 타이머 설정
    const intervalId = setInterval(() => {
      setCurrentLoss(prevLoss => prevLoss + decayRate);
    }, 1000);

    setIntervalRef(intervalId);

    // 3. 클린업 함수: 컴포넌트가 언마운트될 때 타이머를 정리합니다. (필수)
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log("✅ LossMeter: 시뮬레이션 로직 정지.");
      }
    };
  }, [decayRate]); // decayRate가 변경될 때만 재실행

  // 4. 손실액을 바탕으로 경고 레벨 결정 (Red Zone, Warning Zone 등)
  const getRiskLevel = (loss: number): 'CRITICAL' | 'WARNING' | 'SAFE' => {
    if (loss > 1000000) return 'CRITICAL'; // 백만 달러 이상은 치명적
    if (loss > 50000) return 'WARNING';  // 5만 달러 이상은 경고 필요
    return 'SAFE';
  };

  const riskLevel = getRiskLevel(currentLoss);
  let colorClass: string;
  let warningText: string;

  switch (riskLevel) {
    case 'CRITICAL':
      colorClass = 'bg-red-700 shadow-red-900/80 ring-4 ring-red-500/50 animate-pulse';
      warningText = "🔴 CRITICAL: 즉각적인 구조적 무결성 확보가 필요합니다.";
      break;
    case 'WARNING':
      colorClass = 'bg-yellow-600 shadow-yellow-900/80 ring-4 ring-yellow-500/50';
      warningText = "🟡 WARNING: 잠재적 시스템 리스크가 감지되었습니다. 진단이 필요합니다.";
      break;
    case 'SAFE':
    default:
      colorClass = 'bg-blue-600 shadow-blue-900/80 ring-4 ring-blue-500/50';
      warningText = "🔵 SAFE: 현재 리스크 레벨은 통제 범위 내에 있습니다. 지속적인 모니터링이 권장됩니다.";
  }

  // 5. UI 반환 (전체적으로 위압적이고 전문적인 느낌을 강조)
  return (
    <div className={`p-8 rounded-xl max-w-4xl mx-auto ${colorClass} relative overflow-hidden`}>
      {/* 배경 노이즈/글리치 효과를 위한 가상 요소 */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[repeating-linear-gradient(90deg,_rgba(255,255,255,.03)_0,_transparent_1px,_rgba(255,255,255,.03)_2px)]"></div>
      <div className="absolute bottom-0 right-0 w-full h-1/4 bg-[linear-gradient(to_top,rgba(255,255,255,0.1)0%,transparent100%)] animate-deglow opacity-70"></div>

      <div className="relative z-10 text-center p-6 space-y-4">
        {/* 헤더: 시스템 경고 타이틀 */}
        <h2 className="text-xl font-mono uppercase tracking-widest text-white/80 flex items-center justify-center">
          <span role="img" aria-label="경고 아이콘" className="mr-3 text-lg">⚠️</span> 
          시스템적 생존 위협 분석 대시보드 (Live Analysis)
        </h2>

        {/* 핵심 손실 지표 */}
        <div className="text-6xl font-extrabold tracking-tight text-white sm:text-7xl">
          ${currentLoss.toLocaleString()} 
          <span className="text-3xl ml-4 text-red-200/80">$</span>
        </div>

        {/* 라벨 */}
        <p className={`text-lg font-mono tracking-wider uppercase ${riskLevel === 'CRITICAL' ? 'text-red-300 animate-[blink_1.5s_infinite]' : 'text-white'}`}>
            누적 재무 손실액 (Cumulative Financial Loss)
        </p>

        {/* 경고 메시지 */}
        <div className="pt-4 border-t border-white/20">
          <h3 className={`text-xl font-bold tracking-widest uppercase ${riskLevel === 'CRITICAL' ? 'text-red-300' : riskLevel === 'WARNING' ? 'text-yellow-300' : 'text-blue-300'}`}>
            {warningText}
          </h3>
        </div>

        {/* 추가 설명 (구조적 무결성 강조) */}
         <p className="text-sm text-white/60 pt-2">
             이 수치는 구조적 결함 및 규정 미준수로 인해 발생 가능한 추정 손실액입니다. 즉각적인 통제(Control)가 필요합니다.
        </p>
      </div>
    </div>
  );
};

export default LossMeter;