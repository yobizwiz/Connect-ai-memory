import React, { useState, useEffect, useCallback } from 'react';

// 🚨 임계치 상수를 정의하여 유지보수성을 높입니다. (Golden Rule)
const CRITICAL_THRESHOLD = 1200; 
const API_POLLING_INTERVAL = 3000; // 3초마다 리스크 점수 업데이트 시뮬레이션

interface RiskGaugeProps {
  onDiagnosisRequested: () => void; // Paywall 모달을 열기 위한 콜백 함수
}

/**
 * @description 실시간 리스크 점수를 표시하고, 임계치 초과 시 경고(Glitch/Neon Red) 상태를 관리하는 핵심 컴포넌트.
 */
const RiskGauge: React.FC<RiskGaugeProps> = ({ onDiagnosisRequested }) => {
  // 1. State Management for Risk Score (가드 적용된 초기값 설정)
  const [riskScore, setRiskScore] = useState<number>(0);
  const [isCritical, setIsCritical] = useState<boolean>(false);

  // API 연동 시뮬레이션 로직
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // 리스크 점수 업데이트를 훅(Hook)으로 분리하여 테스트 용이성 확보
    const fetchSimulatedRiskScore = useCallback(() => {
        // [Defensive Coding] Math.random()을 사용하여 가짜 데이터를 생성하고, 안전하게 정수를 만듭니다.
        let newScore: number;
        if (Math.random() < 0.2) { // 20% 확률로 높은 리스크 점수 주입 시뮬레이션
            newScore = Math.floor(Math.random() * (3000 - 1500 + 1)) + 1500; // 1500~3000점 사이
        } else {
            // 평상시 리스크 점수는 낮게 유지하여 경고의 효과를 극대화합니다.
            newScore = Math.floor(Math.random() * (1000 - 50 + 1)) + 50; // 50~1000점 사이
        }
        
        setRiskScore(newScore);
        // 리스크 점수 변경에 따라 Critical State를 즉시 업데이트합니다.
        setIsCritical(newScore > CRITICAL_THRESHOLD);
    }, []);

    fetchSimulatedRiskScore(); // 마운트 시 한 번 실행
    interval = setInterval(fetchSimulatedRiskScore, API_POLLING_INTERVAL);

    // 클린업 함수: 컴포넌트 언마운트 시 인터벌 제거 (메모리 누수 방지)
    return () => clearInterval(interval);
  }, [onDiagnosisRequested]); // onDiagnosisRequested가 변경되면 재실행되도록 의존성 배열에 추가.

  // 2. Gauge Visualization Logic
  const getGaugeColor = () => {
    if (isCritical) return 'bg-neon-red';
    if (riskScore > CRITICAL_THRESHOLD * 0.8) return 'bg-yellow-600'; // 경고 영역
    return 'bg-green-500'; // 안전 영역
  };

  // 3. Component Rendering
  return (
    <div className="bg-gray-900 p-8 rounded-xl shadow-2xl border border-gray-700 transition-all duration-700 transform hover:shadow-[0_0_50px_rgba(255,69,0,0.3)]">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Left Side: 리스크 점수와 상태 */}
        <div>
          <p className="text-sm uppercase text-gray-400 tracking-wider mb-2">Live System Risk Score</p>
          <h1 
            className={`text-7xl font-extrabold transition-colors duration-500 ${isCritical ? 'text-neon-red animate-pulse' : 'text-white'}`}
          >
            {riskScore.toLocaleString()} <span className="text-4xl text-gray-400">P</span>
          </h1>
          <p className={`mt-2 text-lg font-semibold ${isCritical ? 'text-red-400' : 'text-green-400'}`}>
            {isCritical ? "🚨 CRITICAL: Immediate Intervention Required" : "✅ Stable. Monitoring in progress."}
          </p>
        </div>

        {/* Right Side: 게이지 Visualization */}
        <div className="w-full md:w-1/2">
          <div className="relative pt-[2rem] pb-[4rem]">
            {/* Gauge Background Circle */}
            <svg class="w-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Track (Background) */}
              <circle
                cx="100" cy="100" r="85"
                fill="none"
                stroke="#374151" // Gray-700
                strokeWidth="12"
                className="transition-all duration-1000"
              />
              {/* Progress (Dynamic) */}
              <circle
                cx="100" cy="100" r="85"
                fill="none"
                stroke={getGaugeColor().replace('bg-', 'var(--tw-ring-color)-')} // Tailwind color mapping
                strokeWidth="12"
                className={`transition-all duration-700 ease-out transform-origin-center ${isCritical ? 'animate-glitch' : ''}`}
                style={{ 
                    // 점수가 높을수록 호 진행도를 높임 (최대 360도)
                    strokeDasharray: `${2 * Math.PI * 85}, ${2 * Math.PI * 85}`, // Circumference length doubled for animation
                    strokeDashoffset: `calc(${2 * Math.PI * 85} - (${riskScore / 3000}) * ${2 * Math.PI * 85})`, 
                }}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Action Button (Paywall Trigger) */}
      <button 
        onClick={onDiagnosisRequested}
        className={`mt-10 w-full py-4 text-xl font-extrabold uppercase transition duration-300 ${isCritical ? 'bg-red-700 hover:bg-red-600 shadow-[0_0_20px_rgba(255,0,0,0.9)]' : 'bg-yellow-600 hover:bg-yellow-500'} text-white`}
      >
        무료 진단 요청 (Free Diagnosis Request)
      </button>
    </div>
  );
};

export default RiskGauge;