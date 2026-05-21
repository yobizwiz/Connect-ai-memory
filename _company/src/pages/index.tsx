import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';

// --- 유틸리티 컴포넌트 ---
/** @type {React.FC} */
const RedZoneButton: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => (
  <button 
    onClick={onClick} 
    className="px-10 py-4 text-xl font-bold uppercase tracking-widest bg-red-800/95 border-2 border-red-600 hover:bg-red-700 transition duration-300 shadow-lg transform hover:scale-[1.02] cursor-pointer z-10"
  >
    {children}
  </button>
);

/** @type {React.FC<{threatLevel: number}>} */
const ThreatIndexGauge: React.FC<{ threatLevel: number }> = ({ threatLevel }) => {
  // 0 (안전) ~ 100 (시스템 붕괴 임박) 사이의 레벨을 받음
  const colorScale = [
    { level: [0, 25], bgColor: 'bg-green-600', warningText: 'STATUS NORMAL' },
    { level: [26, 75], bgColor: 'bg-yellow-600', warningText: 'WARNING DETECTED' },
    { level: [76, 100], bgColor: 'bg-red-800', warningText: 'CRITICAL FAILURE IMMINENT' },
  ];

  const activeColor = colorScale.find(c => threatLevel >= c.level[0] && threatLevel <= c.level[1]);
  const currentBgColor = activeColor ? activeColor.bgColor : 'bg-gray-500';
  const warningText = activeColor ? activeColor.warningText : 'UNKNOWN';

  return (
    <div className="p-8 bg-gray-900 border-l-4 border-red-600/70 shadow-2xl">
      <h3 className="text-xl font-mono text-red-400 mb-4 uppercase tracking-wider">SYSTEM ALERT: Threat Index</h3>
      <div className="relative pt-1 mb-8">
        <div 
          className="flow-root w-full h-2 bg-gray-700 rounded-full"
          style={{ width: `${Math.max(5, Math.min(100, threatLevel))}%` }}
        >
          <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${currentBgColor}`} 
               style={{ width: `${Math.max(5, Math.min(100, threatLevel))}%` }}></div>
        </div>
        <p className="text-right text-sm font-mono mt-2 text-red-300">{Math.round(threatLevel)}%</p>
      </div>
      <div className="text-center">
        <p className="text-lg uppercase tracking-wider text-yellow-400 animate-pulse">{warningText}</p>
      </div>
    </div>
  );
};

/** @type {React.FC} */
const LossCalculatorWidget: React.FC<{ initialLoss?: number }> = ({ initialLoss = 300 }) => {
  const [yearInput, setYearInput] = useState('2024');
  const [departmentInput, setDepartmentInput] = useState('Finance');
  const [lossEstimate, setLossEstimate] = useState(initialLoss);

  // $300억 원 계산 로직 시뮬레이션 (실제로는 복잡한 백엔드 API 호출 필요)
  const calculateRiskScore = useCallback(() => {
    let baseValue = 1; // 기본 위험 지수
    if (parseFloat(yearInput) < new Date().getFullYear() - 5) {
        baseValue *= 1.5; // 오래된 데이터일수록 리스크 증가
    }
    if (departmentInput === 'IT' || departmentInput === 'Compliance') {
        baseValue *= 2.0; // 핵심 부서 관련 위협 가중치 부여
    }

    // 임의의 계산을 통해 손실액과 리스크 스코어를 결정합니다.
    const newLoss = Math.floor(initialLoss * baseValue);
    setLossEstimate(newLoss);
  }, [yearInput, departmentInput, initialLoss]);

  useEffect(() => {
    calculateRiskScore();
  }, [calculateRiskScore]);

  // 숫자를 억 단위로 포맷팅하는 함수 (예: 300,000,000,000 -> 300.00 억)
  const formatLoss = (value: number): string => {
    return (value / 10**9).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // 손실액을 기준으로 위협 레벨 결정
  const getThreatLevel = (): number => {
      if (lossEstimate > 250 * 10**9) return 95; // 매우 높은 리스크
      if (lossEstimate > 100 * 10**9) return 70; // 중간-높음 리스크
      return Math.min(Math.max(30, lossEstimate / 10**9 * 10), 60); // 낮은 리스크
  }

  const currentThreatLevel = getThreatLevel();


  return (
    <div className="p-8 bg-gray-950 border-t-4 border-red-700/70 shadow-inner">
      <h2 className="text-3xl font-bold text-white mb-6 uppercase tracking-wider">Systemic Risk Assessment Module</h2>
      
      {/* 입력 위젯 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-gray-900 p-6 rounded-lg border border-red-800/50">
        <div>
          <label className="block text-sm font-mono text-red-400 uppercase tracking-wider mb-1">Target Year</label>
          <select 
            value={yearInput} 
            onChange={(e) => setYearInput(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-red-700 text-white focus:ring-red-500 focus:border-red-500"
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            {/* ... 더 많은 년도 옵션 추가 가능 */}
          </select>
        </div>
        <div>
          <label className="block text-sm font-mono text-red-400 uppercase tracking-wider mb-1">Department Scope</label>
          <select 
            value={departmentInput} 
            onChange={(e) => setDepartmentInput(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-red-700 text-white focus:ring-red-500 focus:border-red-500"
          >
            <option value="Finance">재무 (Finance)</option>
            <option value="IT">IT/기술 (IT)</option>
            <option value="Compliance">규제 준수 (Compliance)</option>
            <option value="Marketing">마케팅 (Marketing)</option>
          </select>
        </div>
        <div>
            <button 
                onClick={calculateRiskScore}
                className="w-full py-3 text-lg font-bold uppercase tracking-widest bg-red-800 hover:bg-red-700 transition duration-200 border border-red-600"
            >
                <span className='mr-2'>⚙️</span> Risk Analysis Run
            </button>
        </div>
      </div>

      {/* 결과 시각화 */}
      <div className="text-center py-12 bg-black/50 rounded-lg border border-red-900/70">
        <p className="text-xl font-mono text-yellow-400 mb-4 uppercase tracking-widest">Estimated Total Financial Exposure (Annual)</p>
        <div className="inline-block p-6 bg-gray-950 border-4 border-red-800 shadow-[0_0_30px_rgba(255,0,0,0.7)] rounded-xl">
            <span className={`text-6xl font-extrabold tracking-tight ${lossEstimate > 100 * 10**9 ? 'text-red-400 animate-pulse' : 'text-yellow-400'} transition duration-500`}>
                ${formatLoss(lossEstimate)} <span className="text-4xl font-normal text-gray-400">B</span>
            </span>
        </div>
        <p className='mt-6 text-sm text-red-300'>This figure represents the potential loss if structural vulnerabilities are not addressed.</p>
      </div>
    </div>
  );
};


/** @type {React.FC} */
const LandingPagePrototype: React.FC = () => {

  // 1. 위협 지수 애니메이션 상태 관리
  const [threatLevel, setThreatLevel] = useState(20); // 초기값은 낮은 위험으로 시작
  useEffect(() => {
    // 3초 간격으로 Threat Index를 임의로 상승시키는 시뮬레이션 로직
    const intervalId = setInterval(() => {
      setThreatLevel(prev => Math.min(100, prev + Math.floor(Math.random() * 8) + 2)); // 2~9씩 증가
    }, 3000);

    // 컴포넌트 언마운트 시 인터벌 클리어링 (메모리 누수 방지)
    return () => clearInterval(intervalId);
  }, []);


  const handleDiagnosisRequest = () => {
    alert("🚨 [시스템 경고] 진단 요청 플로우 시작: 고객님의 데이터를 수집하기 위해 다음 단계로 이동합니다. (실제로는 /diagnosis?ref=landing 로 리다이렉트)");
  };

  return (
    <>
      <Head>
        <title>SYSTEM WARNING | Red Zone Protocol</title>
        <meta name="description" content="Your structural integrity is compromised." />
      </Head>

      {/* Global Styles: Red Zone Aesthetics */}
      <style global jsx>{`
        body { background-color: #0a0a12; color: #e5e7eb; font-family: 'Courier New', Courier, monospace; }
        .red-text { color: #ef4444; }
        .red-border { border-color: #ef4444 !important; }
        @keyframes glitch {
          0% { transform: translate(0); opacity: 1; }
          20% { transform: translate(-3px, 3px); opacity: 0.8; }
          40% { transform: translate(5px, -5px); opacity: 0.7; }
          60% { transform: translate(-2px, -2px); opacity: 1; }
          100% { transform: translate(0); opacity: 1; }
        }
        .glitch-text {
            animation: glitch 0.5s infinite alternate linear;
            text-shadow: 2px 2px #ef4444, -2px -2px #ef4444;
        }
      `}</style>

      <div className="min-h-screen py-16">
        {/* Hero Section: 공포 주입 */}
        <header className="text-center max-w-4xl mx-auto mb-20 pt-8">
          <p className="text-lg text-red-500 font-mono uppercase tracking-widest animate-pulse mb-3">[SYSTEM ALERT] Structural Integrity Compromised.</p>
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight red-text glitch-text mb-6">
            당신의 시스템은 <span className="block text-red-400 mt-2">구조적 무결성 위협</span>에 노출되었습니다.
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
            단순한 규정 준수로는 부족합니다. 저희는 당신의 비즈니스가 직면할 수 있는 **최악의 시나리오**를 사전에 예측하고 방어하는 시스템을 제공합니다.
          </p>
          <RedZoneButton onClick={handleDiagnosisRequest}>
            🚨 즉시 무료 리스크 진단 요청 (총 위험 노출액 분석)
          </RedZoneButton>
        </header>

        {/* Threat Index & Widget Integration */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 mb-24">
            {/* 1. 위협 지수 게이지 (Threat Index) - Left Side */}
            <div>
                <ThreatIndexGauge threatLevel={threatLevel} />
            </div>

            {/* 2. 손실액 계산기 (Loss Widget) - Right Side */}
            <div className="lg:pr-8">
                <h2 className="text-4xl font-bold text-white mb-6 uppercase tracking-wider border-b pb-3 border-red-900/70">Total Risk Exposure</h2>
                <LossCalculatorWidget />
            </div>
        </div>

        {/* Core Value Proposition: 공포 -> 해결책 구조 */}
        <section className="max-w-4xl mx-auto mb-24 py-16 bg-gray-950/5 border-y border-red-800/50">
            <div className='text-center'>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                    우리는 '규정 준수'가 아닌, <span className='red-text glitch-text'>존재 기반 자체의 무결성</span>을 다룹니다.
                </h2>
                <p className="text-lg text-gray-300 mt-6 max-w-xl mx-auto">
                    대부분의 컨설팅은 사소한 '규정 위반'에 초점을 맞춥니다. 하지만 진정한 위험은 시스템 자체의 구조적 결함, 즉 **총 위험 노출액(Total Risk)**에서 발생합니다.
                </p>
            </div>
        </section>

        {/* Final CTA Block: 긴급성 강조 */}
        <footer className="text-center py-12 bg-black border-t-4 border-red-600/70">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 uppercase tracking-wider">
            더 이상 추측으로 비즈니스를 운영하지 마십시오.
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            최종 위험 경고 보고서를 통해, 당신의 조직이 숨기고 있는 진짜 재무적 손실액을 확인하십시오. 기회는 지금뿐입니다.
          </p>
          <RedZoneButton onClick={handleDiagnosisRequest}>
            지금 무료 진단 요청하고 구조적 무결성을 확보하세요 (선착순 마감)
          </RedZoneButton>
        </footer>
      </div>
    </>
  );
};

export default LandingPagePrototype;