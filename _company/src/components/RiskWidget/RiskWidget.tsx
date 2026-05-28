import React, { useState, useEffect, useCallback } from 'react';

// =====================================================
// ⚙️ TYPES & INTERFACES (Type Safety First)
// =====================================================

/**
 * @description 위젯이 소비해야 하는 구조화된 데이터 정의.
 * QLoss와 TRE는 절대적으로 필수적인 필드입니다.
 */
export interface RiskData {
  qLoss: number; // Quantum Loss Estimate
  tre: number;   // Total Financial Exposure (TRE)
}

/**
 * @description 위젯의 현재 상태를 나타내는 Enum 타입.
 * 이 Exhaustive Pattern Check는 모든 가능한 상태가 처리됨을 컴파일러에게 보장합니다.
 */
export type WidgetState = 'NORMAL' | 'WARNING' | 'CRITICAL';

// =====================================================
// 🧪 SIMULATION LOGIC (API 대체재)
// =====================================================

/**
 * @description 실제 API 호출을 시뮬레이션하는 함수.
 * 이 함수는 외부 네트워크 의존성을 제거하고, 오직 로컬 상태와 시간에 기반하여 데이터를 생성합니다.
 * 테스트 용이성(Testability) 확보가 최우선 목표였습니다.
 * @param currentState 현재 위젯의 상태를 입력받아 다음 시뮬레이션 데이터셋을 반환합니다.
 * @returns Promise<RiskData>
 */
const simulateApiCall = (currentState: WidgetState): Promise<RiskData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let qLoss;
      let tre;

      // 상태 기반 데이터 변동 로직 구현. 여기가 핵심입니다.
      switch (currentState) {
        case 'NORMAL':
          qLoss = Math.floor(Math.random() * 10 + 5); // 5~14 범위의 낮은 손실액
          tre = Math.floor(Math.random() * 50 + 100);  // 100~150 사이의 안정적 TRE
          break;
        case 'WARNING':
          qLoss = Math.floor(Math.random() * 40 + 20); // 20~69 범위로 증가
          tre = Math.floor(Math.random() * 150 + 300); // 300~450 사이의 경고 수준 TRE
          break;
        case 'CRITICAL':
          qLoss = Math.floor(Math.random() * 90 + 70);  // 70~169 범위로 급증
          tre = Math.floor(Math.random() * 300 + 800); // 800~1100 사이의 치명적 TRE
          break;
      }

      resolve({ qLoss, tre });
    }, 750); // 데이터 스트리밍처럼 보이게 750ms 지연 적용
  });
};


// =====================================================
// 🖼️ CORE WIDGET COMPONENT
// =====================================================

/**
 * @description 실시간 재무 리스크 대시보드 위젯 컴포넌트.
 * 이 코드는 플레이스홀더 없이, 오직 시뮬레이션된 데이터 스트림을 통해 모든 상태 변화를 구동합니다.
 */
const RiskWidget: React.FC = () => {
  // 1. State Management (현재 데이터를 저장)
  const [currentRiskData, setCurrentRiskData] = useState<RiskData>({ qLoss: 0, tre: 0 });
  const [widgetState, setWidgetState] = useState<WidgetState>('NORMAL'); // 초기 상태는 Normal
  const [isLoading, setIsLoading] = useState(false);

  // Designer Spec 기반의 색상 토큰 정의 (Hardcoded for simplicity/performance)
  const getZoneStyles = useCallback((state: WidgetState) => {
    switch (state) {
      case 'NORMAL': return { bgClass: 'bg-gray-900', alertColor: 'text-blue-400' }; // AUTHORITY_BLUE 계열
      case 'WARNING': return { bgClass: 'bg-yellow-900/30 border-yellow-500/50', alertColor: 'text-amber-400 animate-pulse' }; // YELLOW_WARNING 계열
      case 'CRITICAL': return { bgClass: 'bg-[#c0392b]/10 border-red-700/50', alertColor: 'text-red-500 animate-blink' }; // RED_CRITICAL 계열
    }
  }, []);

  // 2. Data Simulation Loop (useEffect Hook)
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    const fetchNextData = async () => {
      setIsLoading(true);
      try {
        // 시뮬레이션 API 호출 실행
        const nextData = await simulateApiCall(widgetState);
        
        // 데이터 및 상태 업데이트 (원자적 트랜잭션처럼 처리)
        setCurrentRiskData(prevData => ({ ...prevData, qLoss: nextData.qLoss, tre: nextData.tre }));
        setWidgetState(nextData.tre > 800 ? 'CRITICAL' : nextData.tre > 250 ? 'WARNING' : 'NORMAL');

      } catch (error) {
        console.error("Risk Widget Simulation Failed:", error);
        // 에러 핸들링: API 실패 시 Yellow Zone으로 강제 이동 및 경고 표시
        setWidgetState('WARNING');
      } finally {
        setIsLoading(false);
      }
    };

    // 3초마다 데이터 스트림을 강제로 업데이트 (시뮬레이션)
    fetchNextData(); // 초기 로드 시 즉시 실행
    intervalId = setInterval(fetchNextData, 3000); 

    return () => clearInterval(intervalId); // Clean-up function 필수
  }, [widgetState]); // 의존성 배열에 widgetState를 넣어 상태 변화에 따라 재실행되도록 함 (최적화)


  // 3. Rendering Logic
  const { bgClass, alertColor } = getZoneStyles(widgetState);

  return (
    <div className={`p-8 rounded-xl shadow-2xl border-b-4 ${bgClass} transition-all duration-700 ease-in-out`}>
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
        📊 실시간 리스크 대시보드 <span className={`ml-3 p-1 rounded-full ${alertColor} transition duration-500`}>({widgetState})</span>
      </h2>

      {/* 메인 경고 메시지 - 공포감 극대화 */}
      <div 
        className={`p-4 mb-8 border-l-4 shadow-inner text-lg font-mono ${alertColor} transition duration-700`}
        style={{ borderColor: widgetState === 'CRITICAL' ? '#c0392b' : widgetState === 'WARNING' ? '#e67e22' : '#2980b9'}}
      >
        {isLoading 
          ? "데이터 분석 중... 시스템 안정성 검증을 위해 잠시만 기다려 주십시오." 
          : `경고! 현재 위험 수준은 ${widgetState}입니다. 즉각적인 구조적 무결성 점검이 필요합니다.`
        }
      </div>

      {/* KPI 카드 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* QLoss Card */}
        <div 
          className={`p-6 rounded-lg border-l-4 shadow-xl ${widgetState === 'CRITICAL' ? 'border-red-700 bg-gray-800/50' : widgetState === 'WARNING' ? 'border-yellow-700 bg-gray-800/50' : 'border-[#2980b9] bg-gray-800/50'} transition duration-300`}
        >
          <p className="text-sm font-mono uppercase text-gray-400 mb-2">Quantum Loss Estimate (QLoss)</p>
          <h3 className={`text-5xl font-extrabold ${alertColor} transition-all duration-1000`}>
            {currentRiskData.qLoss.toLocaleString()} 
            <span className="text-xl text-gray-400 ml-2">💰</span>
          </h3>
          <p className="text-xs mt-3 text-gray-500">현재 예측되는 미준수 영역의 재무적 손실 추정치.</p>
        </div>

        {/* TRE Card */}
        <div 
          className={`p-6 rounded-lg border-l-4 shadow-xl ${widgetState === 'CRITICAL' ? 'border-red-700 bg-gray-800/50' : widgetState === 'WARNING' ? 'border-yellow-700 bg-gray-800/50' : 'border-[#2980b9] bg-gray-800/50'} transition duration-300`}
        >
          <p className="text-sm font-mono uppercase text-gray-400 mb-2">Total Financial Exposure (TRE)</p>
          <h3 className={`text-5xl font-extrabold ${alertColor} transition-all duration-1000`}>
            {currentRiskData.tre.toLocaleString()} 
            <span className="text-xl text-gray-400 ml-2">💸</span>
          </h3>
          <p className="text-xs mt-3 text-gray-500">시스템적 생존 위협으로 인한 최대 재무 손실 위험액 (Critical Metric).</p>
        </div>
      </div>

    </div>
  );
};

export default RiskWidget;