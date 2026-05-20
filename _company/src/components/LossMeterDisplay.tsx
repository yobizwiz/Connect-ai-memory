// src/components/LossMeterDisplay.tsx
import React from 'react';
import { RiskResult } from '../hooks/useRiskAnalysis';

interface LossMeterDisplayProps {
    result: RiskResult | null;
}

/**
 * @description Designer 스펙을 기반으로 리스크 점수를 시각화하는 컴포넌트.
 */
const getRedZoneStyles = (level: 'Green' | 'Yellow' | 'Red'): { bgClass: string, textClass: string } => {
    switch (level) {
        case 'Red': return { bgClass: "bg-red-700/20 border-red-600", textClass: "text-red-400" };
        case 'Yellow': return { bgClass: "bg-yellow-600/15 border-yellow-600", textClass: "text-yellow-300" };
        case 'Green': return { bgClass: "bg-green-600/15 border-green-600", textClass: "text-green-400" };
    }
};

const LossMeterDisplay: React.FC<LossMeterDisplayProps> = ({ result }) => {
    if (!result) return (
        <div className="p-8 bg-[#1A1A1A] rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="text-lg font-mono text-gray-400 mb-2">⚠️ 실시간 리스크 손실 예측 지수 (QLoss)</h3>
            <p className="text-sm text-gray-600">분석을 위해 데이터를 입력해 주세요.</p>
        </div>
    );

    const { score, level, message } = result;
    const styles = getRedZoneStyles(level);

    return (
        <div className={`p-8 rounded-xl shadow-2xl border-4 ${styles.bgClass} transition duration-500`} 
             style={{ borderColor: `var(--color-${level}-border)` }}>
            
            {/* 핵심 시각 요소 */}
            <h3 className="text-xl font-mono mb-6 flex items-center">
                <span className={`mr-2 text-3xl ${styles.textClass}`}>⚠️</span> 
                실시간 리스크 손실 예측 지수 (QLoss)
            </h3>

            {/* 점수 표시 카드 */}
            <div className="mb-8 p-6 bg-[#1A1A1A]/90 rounded-lg border border-dashed border-gray-700">
                <p className="text-sm text-gray-400 mb-2 uppercase tracking-widest">현재 리스크 점수</p>
                <div className={`text-8xl font-extrabold transition duration-1000 ${styles.textClass}`}>
                    {score.toFixed(1)} 
                    <span className="text-4xl ml-2">%</span>
                </div>
            </div>

            {/* 경고 메시지 */}
            <div className={`p-4 rounded-lg border-l-4 mb-8 ${styles.bgClass} ${styles.textClass}`}>
                <p className="font-bold text-sm uppercase tracking-wider mb-1">시스템 분석 결과</p>
                <p className="text-xl font-semibold">{message}</p>
            </div>

            {/* 게이지 시뮬레이션 (Placeholder) */}
            <div className="mt-8 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-1000 ease-out ${level === 'Red' ? 'bg-red-500' : level === 'Yellow' ? 'bg-yellow-500' : 'bg-green-500'} animate-[pulse_2s_infinite]`}
                    style={{ width: `${score}%` }}
                ></div>
            </div>
        </div>
    );
};

export default LossMeterDisplay;