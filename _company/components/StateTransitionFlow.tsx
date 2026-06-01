import React, { useState } from 'react';
import RedZoneAlertOverlay from './RedZoneAlertOverlay';
import PaywallModalBarrier from './PaywallModalBarrier';
import { useTransitionEffect } from './hooks/useTransitionEffect';

// 타입 정의: 현재 시스템 상태를 명확히 합니다.
type FlowState = 'IDLE' | 'DIAGNOSIS_INITIATED' | 'RISK_ALERT' | 'PAYWALL_TRIGGERED';

const StateTransitionFlow: React.FC = () => {
  const [currentState, setCurrentState] = useState<FlowState>('IDLE');
  // useTransitionEffect 훅을 사용하여 L_max 상태와 전이 지연 시간을 관리합니다. (0ms는 초기값)
  const [currentLMax, resetLMax] = useTransitionEffect(0, 1500); // 최소 1.5초의 체감 지연 설정

  // --- 로직 정의: 핵심 기능은 이 함수에 모듈화되어야 합니다. ---
  const handleDiagnosisRequest = async () => {
    if (currentState === 'PAYWALL_TRIGGERED') return; // 이미 결제 단계면 재진입 금지

    console.log("[Flow Logic]: 진단 요청 버튼 클릭됨. 상태 전이 시작...");
    
    // 1. State Transition: IDLE -> DIAGNOSIS_INITIATED (즉시)
    setCurrentState('DIAGNOSIS_INITIATED');
    await new Promise(resolve => setTimeout(resolve, 500)); // 시각적 여유 확보

    // 2. Simulate Data Fetching & Risk Calculation (가상의 API 호출 시간)
    console.log("[Flow Logic]: 리스크 데이터 로딩 중...");
    setCurrentLMax(0); // L_max 초기화 및 점진적 상승 준비

    await new Promise(resolve => setTimeout(resolve, 1500)); 

    // 3. State Transition: DIAGNOSIS_INITIATED -> RISK_ALERT (L_max 급증 발생!)
    const initialRisk = Math.floor(Math.random() * 20); // 낮은 초기값 (예시)
    console.log(`[Flow Logic]: L_max 값이 ${initialRisk}에서 폭발적으로 증가합니다.`);

    // L_max의 폭발적 급증을 시뮬레이션하고, 전이 효과를 강제합니다.
    const criticalLMax = Math.floor(Math.random() * 500) + 100; // 최소 100 이상 보장
    resetLMax(criticalLMax); 

    // L_max 급증과 함께 경고 상태로 진입 (2초 동안 노출 유지)
    setCurrentState('RISK_ALERT');
    await new Promise(resolve => setTimeout(resolve, 2000)); 


    // 4. State Transition: RISK_ALERT -> PAYWALL_TRIGGERED (강제 이탈 방지)
    console.log("[Flow Logic]: 경고 상태 유지 실패. Paywall로 강제 전환합니다.");

    setCurrentState('PAYWALL_TRIGGERED');
  };

  const renderContent = () => {
    switch (currentState) {
      case 'IDLE':
        return (
          <div className="text-center p-8 bg-[#0f172a] rounded-xl shadow-inner">
            <h2 className="text-3xl text-white mb-4">시스템 무결성 진단 대시보드</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              현재는 기본 리스크 점검 모드입니다. '진단 요청'을 통해 잠재적 위협 요소를 분석할 수 있습니다.
            </p>
            <button 
              onClick={handleDiagnosisRequest}
              className="px-8 py-3 text-xl font-bold uppercase tracking-wider bg-[#0f2c49] hover:bg-[#1e3a8a] transition duration-300 border-b-4 border-[#ff0000]/50"
            >
              진단 요청 (Diagnosis Request) 🔍
            </button>
          </div>
        );

      case 'DIAGNOSIS_INITIATED':
        return (
          <div className="text-center p-8 bg-[#1e293b] rounded-xl shadow-inner">
            <h2 className="text-4xl font-bold text-yellow-400 mb-2 animate-pulse">진단 중...</h2>
            <p className="text-gray-300 mb-6">
              글로벌 규제 데이터 및 시스템 구조 분석을 진행하고 있습니다. 잠시만 기다려 주십시오.
            </p>
            <div className="relative overflow-hidden">
                {/* 간단한 로딩 애니메이션 대체 */}
                <div className="absolute inset-0 flex items-center justify-between px-4">
                    <span></span>
                    <div className="w-2/3 h-1 bg-gray-700 relative after:content-[''] after:absolute after:top-full after:left-0 after:w-full after:h-[3px] after:bg-[#ff0000] animate-ping duration-150"></div>
                    <span></span>
                </div>
            </div>
          </div>
        );

      case 'RISK_ALERT':
        return (
          <div className="text-center p-8 bg-[#3a0d0f] border-4 border-red-600 rounded-xl shadow-[0_0_20px_#ff0000]">
            <h2 className="text-5xl font-extrabold text-white mb-4 animate-pulse">⚠️ 즉각적인 위험 감지!</h2>
            <p className="text-2xl text-red-300/90 mb-6">
              최대 예상 재정적 손실액($L_{max}$)이 임계치를 초과했습니다. 이대로 방치할 경우, 비즈니스는 운영 불가능 상태에 도달합니다.
            </p>
            <div className="text-5xl font-mono tracking-wider">
              $L_{max}$ = <span className="text-6xl text-[#ffaaaa]">{currentLMax.toLocaleString()}</span>
            </div>
          </div>
        );

      case 'PAYWALL_TRIGGERED':
        return null; // Paywall 컴포넌트가 전체를 덮으므로 여기선 내용 없음
    }
  };

  const showPaywall = currentState === 'PAYWALL_TRIGGERED';

  return (
    <div className="relative w-full max-w-4xl mx-auto min-h-[50vh]">
      {/* Red Zone Alert Overlay는 L_max가 임계점을 넘었을 때만 시각적으로 강제됩니다. */}
      <RedZoneAlertOverlay isVisible={currentState === 'RISK_ALERT'} lMaxValue={currentLMax} />

      <div className="relative z-10"> 
        {renderContent()}
      </div>

      {/* Paywall 모달은 최상위 레이어에 배치 */}
      {!showPaywall && (
         <PaywallModalBarrier onClose={() => setCurrentState('IDLE')} /> // 테스트를 위해 임시로 조건부 제거하거나, 상태 관리 수정 필요. 
                                                                   // 하지만 MVP 목표가 '강제 진입'이므로, Paywall은 무조건 최종 결과여야 합니다.
      )}
    </div>
  );
};

export default StateTransitionFlow;