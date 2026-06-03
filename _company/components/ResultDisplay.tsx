import React from 'react';

interface ResultProps {
  totalScore: number;
}

const ResultDisplay: React.FC<ResultProps> = ({ totalScore }) => {
  // 리스크 점수에 따른 톤앤매너 결정 (이 부분이 공포 마케팅의 핵심입니다.)
  let riskLevel = '낮음';
  let gaugeColor = 'bg-green-500';
  let warningText = "준수 관리가 매우 양호합니다. 하지만 방심은 금물입니다.";

  if (totalScore >= 21) {
    riskLevel = '치명적 리스크 노출 (CRITICAL)';
    gaugeColor = 'bg-red-700';
    warningText = "🚨 경고: 즉시 전문가 개입이 필요합니다. 운영 중단 위험에 근접했습니다!";
  } else if (totalScore >= 12) {
    riskLevel = '중대 리스크 구간 (HIGH)';
    gaugeColor = 'bg-yellow-600';
    warningText = "⚠️ 경고: 구조적 공백(Structural Gap)이 포착되었습니다. 개선 조치가 시급합니다.";
  } else {
    riskLevel = '관찰 필요 (OBSERVATION)';
    gaugeColor = 'bg-orange-500';
    warningText = "💡 관찰: 일부 프로세스에서 비효율적 리스크가 발견되었습니다. 점진적 개선이 필요합니다.";
  }

  // Funneling 목표를 위해 이 버튼은 결제 페이지로 유도해야 합니다.
  const handleCheckoutClick = () => {
    console.log("✅ FUNNEL TRIGGERED: 고객을 Stripe/결제 시스템으로 강제 리디렉션합니다.");
    // 실제 구현에서는 router.push('/checkout?risk_score=' + totalScore); 를 사용합니다.
  };

  return (
    <div className="text-center space-y-12 pt-8">
      {/* 최종 결과 제목 및 경고 */}
      <div>
        <h2 className={`text-4xl font-extrabold mb-3 ${riskLevel === '치명적 리스크 노출 (CRITICAL)' ? 'text-red-500 animate-pulse' : 'text-white'}`}>
          진단 완료. 당신의 구조적 위험 점수 ($TRE$): {totalScore} Point
        </h2>
        <p className="text-xl text-gray-300">
          이 수치는 귀사가 무지하거나 방치하는 **미인지 손실액({"$L_{gap}$"})**을 의미합니다.
        </p>
      </div>

      {/* 1. 네온 레드 게이지 컴포넌트 호출 (시각적 공포 유발) */}
      <div className="w-full max-w-xl mx-auto p-6 bg-gray-900 rounded-2xl shadow-[0_0_30px_rgba(255,0,0,0.5)] border border-red-700">
        <h3 className="text-2xl font-bold text-center mb-4 text-red-400">🔥 {"$L_{gap}$"} 리스크 게이지</h3>
        {/* Mock Neon Gauge Implementation */}
        <div className="relative w-full h-6 bg-gray-700 rounded-full overflow-hidden border border-red-500">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${gaugeColor}`} 
            style={{ width: `${(totalScore / 23) * 90}%` }} // 점수에 비례하여 게이지 채움 (최대 90%로 제한)
          ></div>
        </div>
        <p className="text-center mt-4 text-sm font-mono">현재 리스크 노출률: {Math.round((totalScore / 23) * 100)}%</p>
      </div>

      {/* 2. 최종 경고 메시지 */}
      <div className="p-6 bg-red-900/50 border-l-4 border-yellow-400 rounded-lg shadow-inner">
        <h3 className="text-2xl font-bold text-red-300 mb-2">🔥 최종 경고: {riskLevel}</h3>
        <p className="text-gray-100">{warningText}</p>
      </div>

      {/* 3. Funneling CTA (강제 연결) */}
      <div>
        <button
          onClick={handleCheckoutClick}
          className="w-full py-4 text-2xl bg-red-600 hover:bg-red-700 transition duration-300 transform hover:scale-[1.02] shadow-red-800/50 border-b-4 border-double border-yellow-400"
        >
          ✅ {"$L_{gap}$"} 해소 및 완벽한 컴플라이언스 확보 (지금 리스크 진단 보고서 받기)
        </button>
        <p className="text-xs text-gray-500 mt-2">
            (실제로는 결제 모달/Stripe 페이지로 연결되어야 합니다.)
        </p>
      </div>
    </div>
  );
};

export default ResultDisplay;