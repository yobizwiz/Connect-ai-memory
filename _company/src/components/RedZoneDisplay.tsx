import React from 'react';
import { QLossState } from '../hooks/useQLossSimulation';

interface RedZoneDisplayProps {
    state: QLossState;
}

const getBackgroundColor = (riskLevel: QLossState['riskLevel']) => {
    switch(riskLevel) {
        case 'GREEN': return 'bg-green-900/10 border-green-500';
        case 'YELLOW': return 'bg-yellow-900/20 border-yellow-600';
        case 'RED': return 'bg-red-900/30 border-red-700 animate-pulse'; // Critical Flash
    }
};

const getTitle = (riskLevel: QLossState['riskLevel']) => {
    switch(riskLevel) {
        case 'GREEN': return "시스템 무결성 정상. 현재는 관망 단계입니다.";
        case 'YELLOW': return "⚠️ 경고: 시스템 데이터 흐름에 이상 징후가 감지되었습니다. 즉시 점검이 필요합니다.";
        case 'RED': return "🚨 CRITICAL SYSTEM ALERT! 구조적 결함 임계치 도달 (QLoss > 75). 즉각적인 전문가 개입 없이는 생존 불가능합니다.";
    }
};

const RedZoneDisplay: React.FC<RedZoneDisplayProps> = ({ state }) => {
    const bgColor = getBackgroundColor(state.riskLevel);
    const titleText = getTitle(state.riskLevel);

    return (
        <div className={`p-6 border-4 ${bgColor} shadow-2xl rounded-lg transition-all duration-500 ease-in-out`}>
            <h3 className="text-xl font-bold text-red-400 mb-2 uppercase tracking-widest">
                [SYSTEM ALERT] - {state.riskLevel} ZONE ACTIVE
            </h3>
            {/* QLoss 게이지 시각화 */}
            <div className="my-6 p-4 bg-gray-800/70 rounded-md border border-red-500 shadow-inner">
                <p className="text-sm font-mono text-green-300 mb-1">QLoss Index: {state.level.toFixed(1)} / 100</p>
                {/* QLoss 바를 리스크 레벨에 따라 시각적으로 구현 */}
                <div className={`w-full h-8 rounded-full transition-all duration-1000 ${state.riskLevel === 'RED' ? 'bg-red-600 shadow-[0_0_20px_rgba(255,0,0,0.9)]' : state.riskLevel === 'YELLOW' ? 'bg-yellow-600' : 'bg-green-600'}`}>
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ${state.riskLevel === 'RED' ? 'animate-pulse' : ''}`} 
                        style={{ width: `${state.level}%` }}
                    ></div>
                </div>
            </div>

            {/* 경고 메시지 */}
            <p className="text-lg font-semibold text-gray-200 mb-4">{titleText}</p>
            
            {/* 강제 CTA 표시 로직 */}
            {(state.ctaForced || state.riskLevel === 'RED') && (
                <div className="bg-red-800/90 p-3 text-center border-2 border-red-500 shadow-xl">
                    <p className="text-sm uppercase font-mono text-yellow-200 mb-1">[ACTION REQUIRED] 시스템이 위험 상태를 감지했습니다.</p>
                    <h4 className="text-2xl font-extrabold text-red-300">지금 바로 전문가 진단이 필요합니다.</h4>
                </div>
            )}
        </div>
    );
};

export default RedZoneDisplay;