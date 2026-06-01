import React from 'react';

/**
 * @description L_max 급증 시 필요한 Glitch Noise 및 Neon Red 경고 오버레이 컴포넌트.
 * 이 컴포넌트는 상태 변화에 의해 강제로 렌더링되어야 합니다.
 */
const RedZoneAlertOverlay: React.FC<{ isVisible: boolean; lMaxValue: number }> = ({ isVisible, lMaxValue }) => {
  if (!isVisible) return null;

  // L_max 값이 임계점을 넘었는지 확인 (예: 100 이상)
  const isCritical = lMaxValue > 100;

  return (
    <div className={`absolute inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isCritical ? 'bg-[rgba(255,0,0,0.8)]' : 'bg-[rgba(100,0,0,0.6)']'} opacity-100`}>
      <div className={`p-8 rounded-xl shadow-[0_0_30px_#ff0000] backdrop-blur-sm border-4 border-[#ff0000] transition-all duration-500 ${isCritical ? 'scale-105' : ''}`}>
        <div className="text-center animate-pulse">
          <h2 className={`text-6xl font-extrabold tracking-widest uppercase text-[#ffaaaa] drop-shadow-[0_0_10px_#ff0000]`}>
            🚨 CRITICAL SYSTEM FAILURE DETECTED 🚨
          </h2>
          <p className="mt-4 text-3xl text-red-200/80">
            시스템 무결성 점검 실패. 예상 최대 재정 손실액 ($L_{max}$): <span className="text-5xl font-mono tracking-wider">{lMaxValue.toLocaleString()}</span>
          </p>
          <p className="mt-6 text-lg text-red-300/90">
            현재의 지식으로는 이 위험을 막을 수 없습니다. 즉각적인 전문가 개입이 필요합니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RedZoneAlertOverlay;