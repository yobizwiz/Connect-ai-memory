import React, { useState } from 'react';
import Head from 'next/head';

// =============================================================
// 🚨 Utility Components & Hooks (Self-Contained)
// =============================================================

/**
 * @description Red Zone 경고 효과를 시뮬레이션하는 컴포넌트.
 * 글리치 노이즈와 깜빡임을 통해 '시스템 오류' 느낌을 극대화합니다.
 */
const GlitchContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative overflow-hidden group">
      {/* Background Noise/Glitch Effect Layer */}
      <div 
        className="absolute inset-0 opacity-[0.1] pointer-events-none z-10"
        style={{ 
          backgroundImage: 'repeating-linear-gradient(90deg, rgba(255, 0, 0, 0.03) 0px, rgba(0, 255, 0, 0.03) 1px, transparent 1px, transparent 3px)',
          animation: 'glitch-bg 10s infinite linear'
        }}
      ></div>
      {/* Actual Content */}
      <div className="relative z-20">{children}</div>

      <style jsx global>{`
        @keyframes glitch-bg {
          from { background-position: -300% 0; }
          to { background-position: 300% 0; }
        }
        /* Global Glitch CSS for the text */
        .glitch-text {
            animation: flicker 1s infinite alternate, glitch-loop 0.2s infinite steps(4);
        }
        @keyframes flicker {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
        }
        @keyframes glitch-loop {
            0% { transform: translate(0); }
            20% { transform: translate(-4px, -2px); text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff; }
            40% { transform: translate(3px, 1px); text-shadow: -1px 0 #fff, 1px 0 #000; }
            60% { transform: translate(-2px, 0); }
            80% { transform: translate(1px, -1px); }
        }
      `}</style>
    </div>
  );
};

/**
 * @description 리스크 레벨에 따른 스타일을 정의합니다.
 */
const getRedZoneStyles = (score: number): React.CSSProperties => {
  if (score >= 75) {
    return { border: '2px solid #C0392B', backgroundColor: '#1e0c0f' }; // Dark Crimson
  } else if (score >= 40) {
    return { border: '2px solid #F39C12', backgroundColor: '#2a2615' }; // Amber/Warning
  } else {
    return { border: '2px solid #2ECC71', backgroundColor: '#102014' }; // Green/Safe
  }
};

// =============================================================
// 💡 Main Component: Diagnostic Portal
// =============================================================

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [riskScore, setRiskScore] = useState(0);
  const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  /**
   * @description API 호출 및 진단 프로세스를 시뮬레이션합니다.
   */
  const handleDiagnosis = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setRiskScore(0);
    setDiagnosisResult(null);
    setIsSubmitted(false);

    // 1. 초기 경고 모달 시뮬레이션 (UX Flow Start)
    alert("🚨 시스템 분석 시작: 중요한 데이터를 처리 중입니다. 이탈을 감지했습니다.");

    await new Promise(resolve => setTimeout(resolve, 500)); // 짧은 지연

    let currentScore = 0;
    const steps = [
      { delay: 1000, scoreIncrease: 20, message: "✅ 구조적 컴플라이언스 게이트웨이 검사 중..." },
      { delay: 800, scoreIncrease: 35, message: "⚠️ 운영 프로세스 무결성(System Integrity) 분석 요청..." },
      { delay: 1200, scoreIncrease: 40, message: "🚨 존재론적 리스크 노출도(TRE) 심층 측정 중..." }
    ];

    // 2. 단계별 점수 상승 및 UI 업데이트 시뮬레이션 (The Core Simulation)
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      currentScore += step.scoreIncrease;
      setRiskScore(Math.min(100, currentScore)); 
    }

    // 최종 결과 설정 및 로딩 종료
    await new Promise(resolve => setTimeout(resolve, 500)); // 마지막 안정화 시간
    setIsLoading(false);
    const finalScore = Math.round(currentScore);
    setRiskScore(finalScore);
    
    let resultText: string;
    if (finalScore >= 70) {
      resultText = "경고! 시스템적 생존 위협 레벨입니다. 즉각적인 전문 진단이 필수적입니다.";
    } else if (finalScore >= 30) {
      resultText = "주의 필요. 일부 운영 프로세스에 구조적 결함이 감지되었습니다. 리스크 관리가 필요합니다.";
    } else {
      resultText = "최소한의 안정성을 확보했습니다. 그러나 완전한 무결성 검증을 권장합니다.";
    }

    setDiagnosisResult(resultText);
    setIsSubmitted(true); // 최종 제출 완료 상태로 전환
  };

  // ---------------------------------------------------------
  // RENDER LOGIC
  // ---------------------------------------------------------

  return (
    <>
      <Head>
        <title>yobizwiz | Critical Risk Diagnostic Portal</title>
        <meta name="description" content="Systemic Survival Threat Diagnosis Tool." />
        <style>{`
          /* Global styles for the Red Zone aesthetic */
          body { background-color: #0a0a0f; color: #E0E0FF; font-family: 'Roboto Mono', monospace; }
          .red-zone { color: #C0392B; animation-timing-function: ease-in-out; }
          .authority-blue { color: #2980B9; }
        `}</style>
      </Head>

      <main className="min-h-screen p-4 sm:p-10 flex justify-center items-start">
        <div className="w-full max-w-4xl bg-[#121218] border border-red-zone/30 shadow-[0_0_50px_rgba(192,57,43,0.1)] p-6 sm:p-12 rounded-lg">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-widest text-[#C0392B] glitch-text">[ALERT] Systemic Survival Threat Diagnostic Portal</h1>
            <p className="mt-3 text-xl text-gray-400">당신의 비즈니스는 현재 시스템적 위험에 노출되어 있습니다. 즉시 검증하십시오.</p>
          </div>

          {/* 1. Risk Gauge Display Area */}
          <div className={`p-6 rounded-lg mb-10 ${isLoading ? 'animate-pulse' : ''}`} style={getRedZoneStyles(riskScore)}>
            <h2 className="text-3xl font-bold mb-4 text-white">🧬 현재 위험 노출도 (Threat Exposure Index)</h2>
            <div className="flex items-center space-x-6 mt-6">
              {/* Gauge Visual */}
              <div className="w-full bg-gray-700 h-2.5 rounded-full overflow-hidden border border-[#C0392B]/50 relative">
                <div 
                    className={`h-full transition-all duration-1000 ease-out ${isLoading ? 'animate-[progress] animate-[linear_4s_infinite]' : ''}`}
                    style={{ width: `${Math.min(100, riskScore)}%`, backgroundColor: isLoading ? '#F39C12' : (riskScore >= 75 ? '#E74C3C' : (riskScore >= 40 ? '#F39C12' : '#2ECC71')) }}
                ></div>
              </div>

              {/* Score & Status */}
              <div className="text-center">
                <p className={`text-6xl font-extrabold tracking-wider ${isLoading ? 'red-zone' : ''}`}>{riskScore > 0 ? riskScore : '--'}%</p>
                <p className={`text-lg mt-2 text-gray-300`}>위험 점수 (Risk Score)</p>
              </div>
            </div>

            {/* Status Message */}
            <div className="mt-6 p-4 border-t border-dashed border-[#C0392B]/50">
                <p className={`text-xl font-bold ${riskScore >= 75 ? 'red-zone' : (riskScore > 0 ? 'text-yellow-400' : 'authority-blue')}`}>
                    {isLoading ? "SYSTEM ANALYSIS IN PROGRESS..." : `진단 대기. 점수 기준: ${Math.min(100, riskScore)}%`}
                </p>
            </div>
          </div>

          {/* 2. Action Area */}
          <div className="text-center mb-16">
             <button 
                onClick={handleDiagnosis} 
                disabled={isLoading}
                className={`px-10 py-4 text-xl font-bold rounded-lg transition-all duration-300 shadow-2xl ${
                    isLoading 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : `text-white bg-[#C0392B] hover:bg-[#A83124] border-b-4 border-red-700 shadow-red-900/50`
                } disabled:opacity-50`}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12h12a4 4 0 01-8 0z"></path>
                        </svg>
                        SYSTEM CHECKING...
                    </span>
                ) : (
                    "⚠️ 총 위험 노출도 즉시 진단 요청하기 (무료)" // Writer Version A CTA
                )}
            </button>

             {/* Success/Result Display */}
            {diagnosisResult && !isLoading && (
                <div className={`mt-10 p-8 rounded-xl text-center border-4 ${riskScore >= 75 ? 'red-zone' : 'authority-blue'} bg-[#1e120f]`}>
                    <h3 className="text-3xl font-bold mb-4">진단 완료: <span className={`font-extrabold ${riskScore >= 75 ? 'text-red-400' : ''}`}>{diagnosisResult}</span></h3>
                    <p className="text-lg mt-2 text-gray-300">위험 점수 {Math.round(riskScore)}%에 근거하여, 시스템의 무결성 확보가 최우선 과제입니다.</p>
                </div>
            )}
          </div>

        </div>
      </main>
    </>
  );