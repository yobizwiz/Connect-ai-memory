`
```tsx
import React, { useState, useEffect, useCallback } from 'react';
import RedZoneOverlay from '../RedZoneOverlay'; // 가정: 기존 컴포넌트 경로
import PaywallGateway from '../PaywallGateway'; // 가정: 기존 컴포넌트 경로
// Mock API 호출을 시뮬레이션합니다. 실제로는 백엔드 API를 사용해야 합니다.
import { calculateThreatIndex } from '../api/sandboxApi'; 

/**
 * 시스템의 현재 상태(State)를 정의하는 열거형 (Enum)
 */
type SystemStage = 'NORMAL' | 'WARNING' | 'CRITICAL_REDZONE' | 'PAYWALL_ACTIVATED' | 'SYSTEM_FAILURE';

interface E2ETestHarnessProps {
  initialData: { [key: string]: any };
}

/**
 * RedZone Overlay와 Paywall Gateway를 통합하여 End-to-End 시나리오를 검증하는 마스터 컴포넌트.
 * @param initialData 초기 리스크 진단 데이터를 받습니다.
 */
const E2ETestHarness: React.FC<E2ETestHarnessProps> = ({ initialData }) => {
  // 1. 시스템 상태 관리 (State Transition의 핵심)
  const [currentStage, setCurrentStage] = useState<SystemStage>('NORMAL');
  const [threatIndex, setThreatIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 🚨 위협 지수 계산 및 시스템 상태 전환 로직 (핵심 비즈니스 로직)
   */
  const analyzeSystemAndTransition = useCallback(async (data: { [key: string]: any }) => {
    setIsLoading(true);
    setCurrentStage('NORMAL'); // 초기화

    try {
      // Mock API 호출 시뮬레이션 (실제로는 백엔드에서 비동기 처리)
      const calculatedThreat = await calculateThreatIndex(data); 
      setThreatIndex(calculatedThreat.index);

      console.log(`[System Analysis] Threat Index: ${calculatedThreat.index}`);

      // --- 상태 전환 로직 (State Transition Logic) ---
      if (calculatedThreat.riskLevel === 'CRITICAL') {
        if (calculatedThreat.score >= 25000) {
          // 1차 임계점 통과: Red Zone 활성화 및 경고 연출
          setCurrentStage('CRITICAL_REDZONE');
          console.warn("[Transition] CRITICAL_REDZONE Stage Activated.");
        } else {
           // 2차 임계점 통과: 단순 위험 경고 (Red Zone 미적용)
          setCurrentStage('WARNING');
        }
      } else if (calculatedThreat.riskLevel === 'HIGH') {
        setCurrentStage('WARNING');
      } else {
        setCurrentStage('NORMAL');
      }

    } catch (error) {
      console.error("[System Failure] Analysis failed:", error);
      // 예외 처리: 시스템 자체가 붕괴하는 시뮬레이션
      setCurrentStage('SYSTEM_FAILURE');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // 컴포넌트 마운트 시 분석 시작 (비동기)
    analyzeSystemAndTransition(initialData);
  }, [initialData, analyzeSystemAndTransition]);


  /**
   * 🎨 상태에 따른 UI 렌더링 및 오케스트레이션 로직
   */
  const renderContent = () => {
    // 1. 최상위 Red Zone Overlay 검증 (가장 먼저 작동해야 함)
    if (currentStage === 'CRITICAL_REDZONE' || currentStage === 'SYSTEM_FAILURE') {
      return <RedZoneOverlay severity={threatIndex} />; // Red Zone을 가장 상위에 배치
    }

    // 2. 상태별 분기 처리 (State Branching)
    switch (currentStage) {
      case 'PAYWALL_ACTIVATED':
        // 시스템이 Paywall로 전환되는 경우, 모든 콘텐츠를 가리고 Gateway만 보여줌
        return <PaywallGateway />;
      
      case 'CRITICAL_REDZONE':
        // Red Zone 오버레이 내부에서 추가적인 경고 메시지를 띄울 수 있음.
        return (
          <div className="p-8 bg-black/90 text-red-50 border-t-4 border-red-700 animate-pulse">
            <h2 className="text-3xl font-bold mb-4">🚨 시스템 구조적 붕괴 경고 (Red Zone)</h2>
            <p>위협 지수 $ {threatIndex.toLocaleString()} 달성. 즉각적인 대응이 필요합니다.</p>
          </div>
        );

      case 'WARNING':
        return <div className="p-6 border-l-4 border-yellow-500 bg-yellow-900/30">
            <h2 className="text-xl text-yellow-400">⚠️ 주의: 시스템 취약점 감지</h2>
            <p>현재 리스크가 일반적 범위를 초과했습니다. 추가 분석이 필요합니다.</p>
        </div>

      case 'SYSTEM_FAILURE':
        return <div className="p-8 bg-red-900/70 text-white border-t-4 border-black animate-shake">
            <h2 className="text-3xl font-extrabold mb-4">[FATAL ERROR] 시스템 무결성 검증 실패</h2>
            <p>데이터 흐름에 치명적인 오류가 감지되었습니다. 전문 컨설팅이 필수입니다.</p>
        </div>

      case 'NORMAL':
      default:
        return <div className="p-6 bg-white/10 border-l-4 border-blue-500">
            <h2 className="text-xl text-blue-300">✅ 정상 진단 단계</h2>
            <p>데이터를 분석하고 있습니다. 다음 단계를 진행해 주세요.</p>
        </div>
    }
  };

  return (
    <div className="min-h-screen p-8 bg-[#1a1e25] text-white relative">
      {/* 1. Red Zone Overlay는 항상 최상위에, 조건에 따라 내용을 가려야 함 */}
      {currentStage === 'CRITICAL_REDZONE' && <RedZoneOverlay severity={threatIndex} />}

      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-6 text-red-400">
          yobizwiz: 통합 리스크 진단 시스템 (E2E Test)
        </h1>

        {/* 2. 분석 로딩 및 결과 표시 */}
        <div className={`p-10 rounded-lg shadow-2xl transition duration-500 ${currentStage === 'SYSTEM_FAILURE' ? 'bg-red-900/70 border-4 border-black animate-shake' : currentStage === 'PAYWALL_ACTIVATED' ? 'bg-red-900/80 border-4 border-yellow-300' : 'bg-[#252b36]'} text-center`}>
          {isLoading ? (
            <p className="text-xl text-gray-400">⚙️ 시스템 분석 중... 위협 지수 계산 및 상태 전환을 시뮬레이션합니다. 잠시만 기다려주세요.</p>
          ) : (
             <>
                {renderContent()}
                <div className="mt-8 p-4 bg-[#2c3540] rounded text-right">
                    <button 
                        onClick={() => setCurrentStage('NORMAL')} 
                        className="px-6 py-2 bg-gray-600 hover:bg-gray-700 transition disabled:opacity-50"
                        disabled={currentStage === 'NORMAL'}
                    >
                        진단 초기화 (Test Reset)
                    </button>
                </div>
             </>
          )}
        </div>
      </div>
    </div>
  );
};

export default E2ETestHarness;
```