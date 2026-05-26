import React, { useState } from 'react';

/**
 * @component Loss Meter Section.
 * 사용자가 데이터를 통해 위협을 체감하게 만드는 핵심 시각화 요소.
 */
const LossMeter: React.FC = () => {
  // 가상의 리스크 데이터와 상태를 관리합니다.
  const [lossData, setLossData] = useState({
    complianceRiskScore: 0.3, // 초기 낮은 위험 점수
    potentialLossMilliards: 50, // $50M을 강조하는 핵심 수치
    violationCount: 4,
  });

  /**
   * 리스크를 상승시키는 시뮬레이션 핸들러 (사용자가 스크롤하거나 무언가를 할 때 트리거되어야 함)
   */
  const handleRiskEscalation = () => {
      // 데이터가 점진적으로 나빠지는 경험을 제공합니다.
      setLossData(prev => ({
          complianceRiskScore: Math.min(1, prev.complianceRiskScore + 0.1), // 최대 1까지 증가
          potentialLossMilliards: Math.max(50, prev.potentialLossMilliards - (Math.random() * 2)),
          violationCount: prev.violationCount + 1,
      }));
  };

  return (
    <section className="py-32 text-center bg-[#110000] relative z-10">
        <h2 className="text-5xl font-extrabold text-white mb-4">II. 당신의 시스템, 어디가 무너지고 있습니까?</h2>
        <p className="text-xl max-w-3xl mx-auto text-red-400/80 mb-16 border-b-2 border-dashed pb-4">
            우리는 단순한 지표를 넘어, 구조적 결함(Structural Defect)을 찾아냅니다.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            {/* 1. Loss Meter Graph (가장 중요) */}
            <div className="lg:col-span-2 p-8 bg-[#050000] border-2 border-red-900/70 shadow-[0_0_30px_rgba(255,0,0,0.2)]">
                <h3 className="text-4xl font-bold text-yellow-400 mb-6">The Compliance Loss Meter</h3>
                {/* 실제로는 SVG나 Canvas로 구현되어야 함 */}
                <div className={`h-8 w-full bg-gray-700 rounded-l-full relative transition duration-1000`} 
                     style={{ backgroundColor: `rgba(255, 0, 0, ${lossData.complianceRiskScore * 1.5})` }}>
                    {/* 위험 레벨 바 */}
                </div>
                <p className="text-xl mt-4 text-white/70">현재 리스크 지수: {(lossData.complianceRiskScore * 100).toFixed(1)}%</p>

                {/* 시뮬레이션 버튼 (사용자가 클릭하여 데이터를 나쁘게 만드는 경험) */}
                <button onClick={handleRiskEscalation} className="mt-8 px-6 py-2 bg-red-800 hover:bg-red-900 text-white transition">
                    [시뮬레이션] 리스크 데이터 강제 로드 (위협 증폭)
                </button>
            </div>

            {/* 2. Key Metric Card */}
            <div className="flex flex-col justify-center p-8 bg-[#1a0500] border-l-4 border-red-600 shadow-lg">
                <p className="text-lg text-gray-400 uppercase tracking-widest">잠재적 최대 손실액</p>
                <p className="text-6xl font-black text-yellow-300 mt-2">${lossData.potentialLossMilliards.toFixed(1)}M+</p>
                <p className="mt-4 text-sm text-red-500">🚨 이 수치는 단순 추정치가 아닙니다.</p>
            </div>
        </div>
    </section>
  );
};

export default LossMeter;