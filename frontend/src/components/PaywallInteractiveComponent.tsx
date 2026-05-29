// PaywallInteractiveComponent.tsx - Red Zone to Authority Blue State Machine Prototype
'use client';

import React, { useState } from 'react';

// ===============================================
// 1. BACKEND CONTRACT (TREResult Schema Mock)
// [근거: c:\Users\jinoh\Desktop\Connect AI\_company\yobizwiz_backend\schemas.py]
type TREResult = {
  is_critical: boolean; // True: High Risk, False: Low/Medium Risk
  score: number;        // 0 to 100
  message: string;      // System generated warning message
};

// 초기 상태 정의 (IDLE)
type PaywallState = 'idle' | 'loading' | 'result';

// --- Mock API Service Layer ---
/**
 * @description Simulate the call to /api/v1/calculate_tre endpoint.
 * 강제적인 비동기 지연(Time Pressure)과 위험 점수 계산을 시뮬레이션합니다.
 */
const fetchLossMetrics = (): Promise<TREResult> => {
  return new Promise((resolve) => {
    // 3초의 시간적 압박 (Forced Acknowledgment & Tension Build-up)
    setTimeout(() => {
      // 테스트 시나리오: 임의로 Critical 플래그를 True로 설정하여 Red Zone을 유도합니다.
      const mockResult: TREResult = {
        is_critical: true, // <--- 핵심 로직 지점 (테스트용)
        score: Math.floor(Math.random() * 30) + 70, // High score simulation
        message: "🚨 구조적 공백이 감지되었습니다. 현재 운영 생존 역량(TRE)은 위험 임계치를 초과했습니다.",
      };
      resolve(mockResult);
    }, 2500); // 2.5초 지연 구현
  });
};

// ===============================================
// 2. REACT COMPONENT IMPLEMENTATION
const PaywallInteractiveComponent: React.FC = () => {
  const [state, setState] = useState<PaywallState>('idle');
  const [result, setResult] = useState<TREResult | null>(null);

  /**
   * @description 사용자 상호작용을 통해 API 호출을 시뮬레이션하고 상태를 변경합니다.
   */
  const handleDiagnosisRequest = async () => {
    if (state === 'loading' || state === 'result') return;
    
    setState('loading');

    try {
      // 1. API 호출 시뮬레이션 시작
      const resultData: TREResult = await fetchLossMetrics();
      setResult(resultData);
      
      // 2. 로딩 완료 후 상태 전환
      setState('result');
    } catch (error) {
      console.error("API 호출 실패:", error);
      // 에러 처리 로직 추가 필요 (예: 네트워크 오류, 서버 다운 등)
      setResult({ is_critical: true, score: 0, message: "⚠️ 진단 서비스에 일시적 문제가 발생했습니다. 잠시 후 다시 시도해 주세요." });
      setState('result');
    }
  };

  /**
   * @description 현재 상태(state)와 결과(result)를 기반으로 동적인 CSS 클래스를 결정합니다.
   */
  const getZoneClasses = (isCritical: boolean) => {
    return isCritical 
      ? 'bg-red-900/80 border-4 border-neon-red shadow-[0_0_50px_rgba(255,0,0,0.7)]' // Red Zone: 공포 극대화
      : 'bg-gray-800/90 border-4 border-blue-600'; // Authority Blue: 통제력 확보

  };

  // --- 3. RENDERING LOGIC (State Machine Flow) ---

  const renderContent = () => {
    if (state === 'loading') {
      return (
        <div className="text-center p-12">
          <svg className="animate-spin inline h-10 w-10 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-80" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.833 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-xl font-semibold text-red-400">시스템 분석 중... 데이터를 구조적으로 재컴파일하는 중입니다.</p>
        </div>
      );
    }

    if (state === 'result' && result) {
      const isCritical = result.is_critical;
      return (
        <div className={`p-8 rounded-xl ${isCritical ? 'bg-red-900/70 text-white' : 'text-gray-100'}`}>
          <h2 className="text-4xl font-bold mb-6">
            {isCritical ? "🚨 CRITICAL ALERT: 구조적 위험 노출 (Structural Gap Detected)" : "✅ 분석 완료: 운영 상태 평가 보고서"}
          </h2>
          
          {/* Danger Zone / Authority Blue Visualization */}
          <div className="p-6 border-l-4 mb-8" 
               style={{ borderColor: isCritical ? '#ff0000' : '#007bff', backgroundColor: `${isCritical ? 'rgba(255,0,0,0.1)' : 'rgba(0,123,255,0.1)'}` }}>
            <p className="text-lg font-medium mb-2">총 위험 노출도 (TRE):</p>
            <div className="flex justify-between items-center mt-4">
                <span className={`text-6xl font-extrabold ${isCritical ? 'text-red-500' : 'text-blue-500'}`}>{result.score}%</span>
                <span className={`text-2xl uppercase tracking-wider ${isCritical ? 'text-red-400' : 'text-blue-400'}`}>
                    {isCritical ? "HIGH RISK (RED ZONE)" : "LOW RISK (BLUE TIER)"}
                </span>
            </div>
          </div>

          <p className="text-xl mb-8 text-gray-200">{result.message}</p>
          
          {/* Call to Action */}
          <button 
            className={`w-full py-3 px-6 rounded-lg text-lg font-bold transition duration-300 ${isCritical ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} shadow-xl`}
            onClick={() => { 
                // 실제로는 여기서 결제 게이트웨이로 이동해야 함.
                console.log("구매 유도 로직 실행"); 
            }}
          >
            {isCritical ? "🚨 즉시 생존 컨설팅 요청 (운영 생존 보험료 가입)" : "🔍 추가 진단 보고서 다운로드"}
          </button>
        </div>
      );
    }

    // Initial State
    return (
      <div className="text-center p-12">
        <h2 className="text-3xl font-bold mb-4 text-gray-700">시스템 무결성 감사 진입</h2>
        <p className="mb-8 text-lg text-gray-500">사용자 입력 데이터를 기반으로 글로벌 규제 리스크를 계산합니다. 잠시만 기다려주세요.</p>

        {/* Request Button */}
        <button 
          onClick={handleDiagnosisRequest}
          className="w-full py-3 px-6 rounded-lg text-xl font-bold bg-blue-500 hover:bg-blue-700 transition duration-300 shadow-md"
        >
          진단 요청 시작 (API 호출 시뮬레이션)
        </button>
      </div>
    );
  };

  // 메인 컨테이너 클래스 결정
  const mainContainerClasses = getZoneClasses(result?.is_critical ?? false);

  return (
    <div className={`min-h-[60vh] flex items-center justify-center p-12 rounded-xl ${mainContainerClasses} transition-all duration-700`}>
      {renderContent()}
    </div>
  );
};

export default PaywallInteractiveComponent;