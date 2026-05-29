import React from 'react';
import { CombinedDashboardData } from '../services/riskTypes';

/**
 * @component StatusGauge
 * 현재 리스크 레벨과 TRE 값을 시각화하고, 경고 애니메이션을 적용합니다.
 * @param data - useMockRiskStream에서 받은 데이터
 */
const StatusGauge: React.FC<{ data: CombinedDashboardData }> = ({ data }) => {

    // 1. 동적 스타일 결정 로직 (Blueprint 기반)
    const getStatusStyles = (status: string, level: number): React.CSSProperties => {
        switch (status) {
            case 'NORMAL':
                return { backgroundColor: '#38a169', color: 'white', boxShadow: '0 0 15px rgba(56, 161, 105, 0.4)' }; // Green Zone
            case 'WARNING':
                return { backgroundColor: '#dd6b20', color: 'white', boxShadow: '0 0 20px rgba(221, 107, 32, 0.8), inset 0 0 5px rgba(255, 255, 0, 0.7)' }; // Yellow Zone + Glitch Hint
            case 'CRITICAL':
                return { backgroundColor: '#c53030', color: 'white', boxShadow: '0 0 30px #ff0000, inset 0 0 10px rgba(255, 0, 0, 1)' }; // Red Zone + 강한 빛
            default:
                return { backgroundColor: '#6474b9', color: 'white' };
        }
    };

    // 2. Glitch Effect 컴포넌트 (시뮬레이션)
    const GlitchEffect = ({ children }: { children: React.ReactNode }) => (
        <div className="relative overflow-hidden group">
            {children}
            {/* CSS 애니메이션을 사용한 글리치 효과를 시뮬레이션 */}
            <div className="absolute inset-0 pointer-events-none opacity-20 animate-[glitch_1.5s_infinite]"></div>
        </div>
    );

    const style = getStatusStyles(data.status, data.level);
    const isGlitchActive = data.isGlitchActive || Math.round(data.treValue) >= 1200;

    return (
        <div className={`p-8 rounded-xl shadow-2xl transition-all duration-700 ${isGlitchActive ? 'glitch-noise' : ''}`} 
             style={style}>
            
            {/* Glitch Effect 적용 대상 */}
            <GlitchEffect>
                <h3 className="text-sm font-semibold uppercase tracking-widest mb-1 opacity-80">
                    Current System Status: {data.status} Zone
                </h3>
                <div className="flex items-baseline space-x-4">
                    {/* TRE Value (가장 크게) */}
                    <span className="text-7xl font-extrabold tracking-tight">{Math.round(data.treValue).toLocaleString()}</span>
                    <span className="text-6xl font-light text-opacity-80">TRE ($)</span>
                </div>

                {/* 상태 설명 */}
                <p className={`mt-2 text-lg font-medium ${data.status === 'CRITICAL' ? 'animate-[text-glow_1s_infinite]' : ''}`}>
                    {Math.round(data.treValue) >= 1200 ? "🔴 생존 임박: 즉각적 구조가 필요합니다." : data.message}
                </p>
            </GlitchEffect>

        </div>
    );
};

export default StatusGauge;