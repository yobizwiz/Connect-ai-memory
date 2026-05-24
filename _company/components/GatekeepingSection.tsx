// src/components/GatekeepingSection.tsx (NextJS/React)
import React, { useState, useEffect, useCallback } from 'react';

/**
 * @description 시스템적 생존 위협을 시뮬레이션하는 핵심 게이트키핑 섹션 컴포넌트.
 * Timer 및 QLoss 로직이 포함되어야 함.
 */
const GatekeepingSection: React.FC = () => {
  // --- State Management ---
  const [timeLeft, setTimeLeft] = useState(120); // 2분 타이머 시작 (초 단위)
  const [qLoss, setQLoss] = useState(0); // QLoss 값 초기화
  const [isAnalyzing, setIsAnalyzing] = useState(false); // 분석 중 여부
  const [riskLevel, setRiskLevel] = useState('LOW'); // LOW | MEDIUM | HIGH | CRITICAL

  // --- 1. 타이머 로직 (시간적 압박 구현) ---
  useEffect(() => {
    if (timeLeft <= 0 || isAnalyzing) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnalyzing]);

  // 시간 감소에 따른 Risk Level 변화 로직 (핵심 비즈니스 로직)
  useEffect(() => {
    let newLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (timeLeft < 30 && timeLeft > 15) {
      newLevel = 'MEDIUM';
    } else if (timeLeft <= 15) {
      newLevel = 'HIGH';
    } else if (timeLeft <= 0) {
        // 타이머가 끝나면 가장 위험한 레벨로 강제 전환 (공포 증폭)
        newLevel = 'CRITICAL';
        // 만약 시간이 0이 되면, QLoss를 최대치로 설정하고 분석을 시작하도록 트리거할 수 있음.
    } else {
      newLevel = 'LOW';
    }
    setRiskLevel(newLevel);
  }, [timeLeft]);


  // --- 2. 가상 API 호출 시뮬레이션 (QLoss 증가 로직) ---
  /**
   * @description 백엔드에서 리스크 데이터를 가져오는 것을 시뮬레이션합니다.
   * 실제로는 fetch('/api/analyze-risk', { method: 'POST' }) 를 사용해야 합니다.
   */
  const handleAnalyzeRisk = useCallback(async () => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    // 로딩 상태 및 분석 시간 시뮬레이션 (3초 지연)
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      // *** [TODO: Designer 스펙 기반으로 실제 API 호출/데이터 파싱 필요] ***
      // Mocking the result based on current risk level and time remaining.
      const mockNewQLoss = Math.floor(Math.random() * 50) + (20 * (1 - timeLeft / 120));
      
      setQLoss(prevQLoss => prevQLoss + mockNewQLoss);

      // 분석 결과에 따라 최종 위험 레벨을 재조정하는 로직 추가 가능
      if (mockNewQLoss > 40) {
        setRiskLevel('CRITICAL');
      } else if (mockNewQLoss > 25 && riskLevel !== 'HIGH') {
        setRiskLevel('MEDIUM');
      }

    } catch (error) {
      console.error("API Analysis Failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, riskLevel, timeLeft]);


  // --- UI Component Structure ---
  const getRiskColor = (level: string): React.CSSProperties => {
    switch (level) {
      case 'CRITICAL': return { backgroundColor: '#a80000', color: '#ffffff' }; // Red Zone 강한 빨강
      case 'HIGH':     return { backgroundColor: '#e65100', color: '#ffeb3b' }; // Orange/Yellow Alert
      case 'MEDIUM':   return { backgroundColor: '#ffd740', color: '#333' }; // Yellow Warning
      default:         return { backgroundColor: '#4CAF50', color: '#ffffff' }; // Green Safe
    }
  };

  const containerStyle = getRiskColor(riskLevel);


  return (
    <div className="p-8 bg-gray-900 text-white shadow-2xl rounded-lg max-w-4xl mx-auto my-10 border-4 border-red-700">
      <h2 
        className="text-3xl font-extrabold mb-6"
        style={{ color: containerStyle.color }}
      >
        🚨 시스템적 생존 위협 분석 (Compliance Gatekeeper) 🚨
      </h2>

      {/* 1. 타이머 및 리스크 레벨 디스플레이 */}
      <div 
        className="flex flex-col md:flex-row justify-between items-center mb-8 p-6 rounded-lg border-2" 
        style={{ borderColor: containerStyle.backgroundColor }}
      >
        <div 
          className="text-5xl font-mono tracking-widest mb-4 md:mb-0 animate-pulse"
          style={{ color: containerStyle.color }}
        >
          남은 시간: {timeLeft < 10 ? `[${String(timeLeft).padStart(2, '0')}]` : `${String(timeLeft).padStart(2, '0')}`}초
        </div>
        <div 
          className="text-xl font-bold uppercase tracking-widest text-center p-3 rounded"
          style={{ color: containerStyle.color, backgroundColor: containerStyle.backgroundColor }}
        >
          현재 리스크 레벨: <span className="underline">{riskLevel}</span>
        </div>
      </div>

      {/* 2. QLoss 카운터 및 분석 버튼 */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-10 space-y-6 md:space-y-0">
        <div>
          <h3 className="text-xl font-semibold mb-2 text-red-400">누적 리스크 손실액 (QLoss)</h3>
          <p 
            className="text-6xl font-mono tracking-wider"
            style={{ color: containerStyle.color }}
          >
            ${qLoss.toLocaleString()} 
          </p>
          <p className="text-sm mt-2 text-gray-400">시간 경과 및 분석을 통해 누적되는 가상의 손실액입니다.</p>
        </div>

        <button
          onClick={handleAnalyzeRisk}
          disabled={isAnalyzing || timeLeft <= 0}
          className={`py-3 px-12 text-lg font-bold uppercase transition duration-300 rounded-md shadow-lg ${
            isAnalyzing ? 'bg-gray-500 cursor-not-allowed' : 'hover:bg-red-700 active:scale-[0.98]'
          } disabled:opacity-50`}
          style={{ color: containerStyle.color === '#ffffff' ? '#000000' : '#ffffff', backgroundColor: containerStyle.backgroundColor || '#ef4444' }}
        >
          {isAnalyzing ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>분석 중... ({Math.ceil(3000 / 1000)}초)</span>
            </span>
          ) : (
            `즉시 리스크 분석 시작`
          )}
        </button>
      </div>

      {/* 3. 최종 CTA 및 경고 메시지 */}
      <div className="text-center p-6 bg-red-900/50 border-t-4 border-red-500 rounded-b">
        <h3 className="text-2xl font-bold mb-3 text-yellow-300">🚨 경고: 시스템적 무지 상태입니다. 🚨</h3>
        <p className="mb-4 max-w-md mx-auto text-lg text-gray-200">
          현재 리스크 레벨({riskLevel})과 누적 손실액(${(qLoss).toLocaleString()})을 감안할 때, 더 이상 지체할 시간이 없습니다.
        </p>
        <button
            className="py-3 px-10 text-xl font-extrabold bg-red-600 hover:bg-red-700 transition duration-200 shadow-xl text-white rounded"
            onClick={() => alert('🚀 필수 통합 컨설팅(Setup Consulting) 페이지로 이동합니다.')}
        >
          필수 통합 컨설팅 예약하기 (지금 행동하세요!)
        </button>
      </div>

    </div>
  );
};

export default GatekeepingSection;