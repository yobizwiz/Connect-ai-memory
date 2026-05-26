// src/components/LossMeter.tsx
import React from 'react';

/**
 * Loss Meter Component: 리스크 점수를 기반으로 시각적 위협을 체감시키는 핵심 컴포넌트.
 * Red Zone과 Blue Zone의 심리적 대비를 극대화합니다.
 * @param score - 현재 계산된 구조적 결함 리스크 점수 (0-100).
 */
interface LossMeterProps {
    score: number;
}

const getZoneStyles = (score: number) => {
    if (score >= 75) {
        return { color: '#C0392B', label: '🚨 CRITICAL RED ZONE', severity: 'critical' }; // Red Zone
    } else if (score >= 40) {
        return { color: '#F39C12', label: '⚠️ WARNING YELLOW ZONE', severity: 'warning' }; // Yellow/Warning Zone
    } else {
        return { color: '#2ECC71', label: '✅ SAFE BLUE ZONE', severity: 'safe' }; // Blue/Success Zone (Authority)
    }
};

const LossMeter: React.FC<LossMeterProps> = ({ score }) => {
    // 스코어에 따른 동적 스타일 및 라벨 결정
    const { color, label, severity } = getZoneStyles(score);

    return (
        <div className="p-8 border border-gray-700 bg-[#1A1A1A] rounded-lg shadow-2xl max-w-3xl mx-auto animate-pulse">
            <h3 className={`text-2xl font-mono mb-4 ${severity === 'critical' ? 'text-[#C0392B]' : 'text-[#2980B9]'}`}>
                [System Alert] 구조적 무결성 리스크 분석 결과
            </h3>

            {/* Loss Meter 시각화 */}
            <div className="relative pt-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-bold tracking-widest">{score.toFixed(1)}%</span>
                    <span className={`text-sm uppercase px-3 py-1 rounded ${severity === 'critical' ? 'bg-[#C0392B]/50 text-[#C0392B]' : severity === 'warning' ? 'bg-[#F39C12]/50 text-[#F39C12]' : 'bg-[#2ECC71]/50 text-[#2ECC71]'}`}>
                        {label}
                    </span>
                </div>
                
                {/* Progress Bar Container */}
                <div className="overflow-hidden h-6 mb-4 rounded-full bg-gray-700 border border-gray-600">
                    <div 
                        style={{ width: `${score}%`, backgroundColor: color }} 
                        className="h-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(192,57,43,0.8)]" // Red Zone 시 플래시 효과 추가
                    ></div>
                </div>

                <p className="text-sm text-gray-400 font-mono">
                    현재 리스크 지표는 {label}을 가리키고 있습니다. 즉각적인 구조적 조치가 필요합니다.
                </p>
            </div>
        </div>
    );
};

export default LossMeter;