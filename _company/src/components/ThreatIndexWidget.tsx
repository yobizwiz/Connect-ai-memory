import React from 'react';

export type RiskLevel = 'NORMAL' | 'WARNING' | 'CRITICAL';

// Designer님이 제공한 스펙을 기반으로 컴포넌트를 설계합니다.
interface ThreatIndexProps {
    level: RiskLevel;
    score: number;
}

const getRedZoneStyles = (level: RiskLevel) => {
    switch (level) {
        case 'NORMAL':
            return { bgColor: 'bg-[#1A1A1A]', accentColor: 'text-[#2980B9]' }; // Authority Blue
        case 'WARNING':
            return { bgColor: 'bg-[#3A2C1F]', accentColor: 'text-[#FFC700]' }; // Warning Yellow
        case 'CRITICAL':
            // Red Zone은 시스템적 충격이 필요합니다. 강렬한 배경색을 사용하고, 글리치 효과를 위한 클래스 이름을 준비합니다.
            return { bgColor: 'bg-[#1A0000]', accentColor: 'text-[#C0392B]' }; // Dark Red Zone
        default:
            return { bgColor: 'bg-gray-800', accentColor: 'text-gray-400' };
    }
};

const ThreatIndexWidget: React.FC<ThreatIndexProps> = ({ level, score }) => {
    const { bgColor, accentColor } = getRedZoneStyles(level);
    
    // Red Zone 경고가 발동된 경우 글리치 클래스를 추가합니다.
    const glitchClass = level === 'CRITICAL' ? 'animate-glitch' : '';

    return (
        <div className={`p-8 rounded-lg shadow-2xl ${bgColor} border-4 border-red-700/50 transition-all duration-1000 ${glitchClass}`}>
            <h3 className={`text-xl font-bold mb-4 ${accentColor}`}>
                SYSTEM THREAT INDEX REPORT: {level === 'CRITICAL' ? '!!! RED ZONE ALERT !!!' : 'System Analysis Complete'}
            </h3>
            
            <div className="flex items-baseline space-x-4">
                {/* 지수 값은 시스템 코드처럼 보입니다. */}
                <span className={`text-8xl font-mono tracking-wider ${accentColor}`}>{score.toFixed(2)}%</span>
                
                {/* 위협 레벨 텍스트 라벨을 반드시 포함합니다. */}
                <div className="text-lg uppercase tracking-widest text-gray-300">
                    Threat Level: <span className={`font-bold ${accentColor}`}>{level}</span>
                </div>
            </div>

            <p className="mt-6 text-sm text-red-400/70 border-t pt-2 border-red-900">
                [ALERT] 구조적 무결성 손상 감지. 즉각적인 진단 및 개입이 필요합니다.
            </p>
        </div>
    );
};

export default ThreatIndexWidget;