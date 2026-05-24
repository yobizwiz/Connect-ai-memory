// src/components/QLossGauge.tsx

import React from 'react';

/**
 * QLoss Gauge Component: 시간적 압박과 시스템적 생존 위협을 시각화합니다.
 * @param {number} qlossValue - 현재 $QLoss$ 값 (0 ~ 100).
 * @param {boolean} isCritical - 임계치 도달 여부 (Red Zone 강제 발동).
 */
interface QLossGaugeProps {
    qlossValue: number;
    isCritical: boolean;
}

const QLossGauge: React.FC<QLossGaugeProps> = ({ qlossValue, isCritical }) => {
    // 1. 리스크 레벨에 따른 스타일 결정 (Red Zone Flashing 포함)
    const getRiskStyles = () => {
        let colorClass = 'bg-yellow-500'; // Default: Warning
        let borderClass = 'border-yellow-700';

        if (qlossValue >= 85) {
            // Critical Level: Red Zone 강제 발동
            colorClass = 'bg-red-600 animate-pulse transition duration-100 ease-in-out';
            borderClass = 'border-red-900 shadow-[0_0_20px_rgba(255,0,0,0.8)]';
        } else if (qlossValue >= 60) {
            // High Risk: Warning Zone
            colorClass = 'bg-orange-500';
            borderClass = 'border-orange-700';
        }

        return { colorClass, borderClass };
    };

    const styles = getRiskStyles();

    // 2. 애니메이션 효과 (Unstable Wave Simulation)
    // QLoss 값이 높아질수록 파동의 폭과 불안정성이 증가하도록 구현합니다.
    const waveAnimationStyle: React.CSSProperties = {
        transform: `scale(${1 + (qlossValue / 200)})`, // 크기 변화
        animation: 'wave-pulse 1s infinite alternate', // 핵심 애니메이션 이름
        boxShadow: isCritical ? '0 0 30px rgba(255, 69, 0, 1)' : 'none' // 임계치 도달 시 강한 그림자
    };

    return (
        <div className={`p-8 rounded-xl ${styles.borderClass} border-[4px] bg-gray-900 shadow-2xl w-full max-w-md`}>
            <h3 className="text-2xl font-mono text-red-400 mb-4 tracking-widest uppercase">
                SYSTEM RISK ALERT: QLoss Monitoring
            </h3>
            <p className="text-sm text-gray-400 mb-6">
                [Warning] 현재 시스템적 생존 위협 노출도 측정 중입니다. 즉각적인 조치가 필요합니다. [근거: 🏢 회사 정체성]
            </p>

            {/* Gauge Container */}
            <div className="relative h-12 mb-6 overflow-hidden border-b-4 border-red-800">
                {/* Wave Animation Layer */}
                <div
                    className={`absolute top-0 left-0 h-full rounded-t-[5px] transition-all duration-500 ease-out ${styles.colorClass}`}
                    style={waveAnimationStyle}
                ></div>

                {/* Static Gauge Fill (The actual $QLoss$ line) */}
                <div
                    className={`absolute top-0 left-0 h-full rounded-[2px] transition-all duration-700 ease-out ${styles.colorClass}`}
                    style={{ width: `${qlossValue}%` }}
                ></div>
            </div>

            {/* Current Value Display */}
            <div className="flex justify-between items-baseline">
                <span className={`text-6xl font-mono ${isCritical ? 'text-red-500 animate-[blink_1s_infinite]' : 'text-yellow-400'}`}>
                    {qlossValue.toFixed(2)}%
                </span>
                <div className="flex items-center space-x-3">
                    <span className="text-lg font-mono text-gray-300 uppercase tracking-wider">QLoss Index</span>
                    <span className={`px-4 py-1 rounded-full text-sm ${isCritical ? 'bg-red-900/70 text-red-400 border border-red-600' : 'bg-gray-800 text-yellow-300'}`}>
                        {isCritical ? 'CRITICAL THRESHOLD BREACHED' : 'STABLE MONITORING'}
                    </span>
                </div>
            </div>

            {/* Key Warning Message */}
            <p className={`mt-6 p-3 rounded ${isCritical ? 'bg-red-900/80 border-l-4 border-red-500 animate-[fadeIn_1s_ease-out]' : 'bg-gray-800/70 border-l-4 border-yellow-500'}`}>
                {isCritical ? "⚠️ 시스템 경고: 위험 노출 임계치 초과. 즉시 전문 컨설팅을 받지 않으면 재정적 손실($QLoss$)이 가속됩니다." : "💡 분석 중... 더 많은 정보를 입력하여 위험 노출도를 측정하십시오."}
            </p>
        </div>
    );
};

export default QLossGauge;