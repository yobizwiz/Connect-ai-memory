import React from 'react';

interface TotalRiskGaugeProps {
  score: number;
}

/**
 * 총 리스크 점수를 시각적 게이지로 표시하는 컴포넌트.
 * 점수에 따라 색상과 경고 메시지가 변경됩니다.
 */
const TotalRiskGauge: React.FC<TotalRiskGaugeProps> = ({ score }) => {
  const isCritical = score >= 70;
  const gaugeColor = isCritical ? '#DC2626' : score >= 40 ? '#F59E0B' : '#10B981';

  return (
    <div className="p-8 bg-[#1A1A1A] rounded-xl border-2" style={{ borderColor: gaugeColor }}>
      <h3 className="text-xl font-bold text-gray-300 mb-4 uppercase tracking-wider">
        Total Risk Exposure Gauge
      </h3>

      {/* 게이지 바 */}
      <div className="w-full h-6 bg-gray-800 rounded-full overflow-hidden mb-4">
        <div
          className="h-full transition-all duration-1000 ease-out rounded-full"
          style={{ width: `${score}%`, backgroundColor: gaugeColor }}
        />
      </div>

      {/* 점수 표시 */}
      <div className="text-center">
        <span className="text-5xl font-mono font-black" style={{ color: gaugeColor }}>
          {score.toFixed(1)}%
        </span>
        <p className={`mt-2 text-lg font-semibold ${isCritical ? 'text-red-400' : 'text-gray-400'}`}>
          {isCritical ? '🚨 CRITICAL — 즉각적인 구조적 개입 필요' : '✅ 관리 가능 범위'}
        </p>
      </div>
    </div>
  );
};

export default TotalRiskGauge;
