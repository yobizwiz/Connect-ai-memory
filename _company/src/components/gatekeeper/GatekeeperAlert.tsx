/**
 * @module GatekeeperAlert
 * @description 시스템적 위험(Critical Risk)이 감지되었을 때 전체 UI를 차단하는 게이트키퍼 경고 컴포넌트.
 * [근거: 🎨 Designer 산출물, Self-RAG]
 */
import React from 'react';

interface GatekeeperAlertProps {
    riskScore: number;
    details: string;
}

const GatekeeperAlert: React.FC<GatekeeperAlertProps> = ({ riskScore, details }) => {
    // Red Zone 색상 계산 (Red-to-Black gradient for maximum impact)
    const getRedZoneStyle = () => "bg-gradient-to-br from-[#9c1e3d] via-[#5e0f27] to-black";

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden pointer-events-none">
            {/* 1. Overlay Container: 전체 화면을 완전히 덮고 행동 불가 상태를 만듭니다. */}
            <div className={`absolute inset-0 opacity-95 transition-all ${getRedZoneStyle()} animate-[pulse_2s_infinite]`}>
                {/* 배경 흐림 효과 (blur)는 CSS로 처리되지만, 여기서는 오버레이로 커버합니다. */}
            </div>

            {/* 2. Alert Box: 중앙에 배치되는 핵심 경고창 */}
            <div className="relative z-10 max-w-[90%] w-[80vw] p-10 md:p-16 bg-gray-900/95 border-4 border-[#ff3b30] shadow-[0_0_50px_rgba(255,59,48,0.7)] animate-in fade-in zoom-in duration-500">
                {/* Glitch Effect Pseudo Code */}
                <div className="text-center mb-6">
                    <h1 
                        className="text-6xl sm:text-7xl font-extrabold tracking-tighter text-[#ff3b30] uppercase drop-shadow-[0_0_10px_rgba(255,59,48,0.8)] animate-pulse">
                            CRITICAL ERROR
                        </h1>
                    <p className="text-xl mt-2 font-mono text-yellow-400">
                        [SYSTEM INTEGRITY FAILURE DETECTED]
                    </p>
                </div>

                {/* 경고 내용 */}
                <div className="bg-black/70 p-6 rounded-lg border-l-8 border-[#ff3b30]">
                    <h2 className="text-2xl font-semibold text-white mb-4">구조적 생존 위협 감지 (Structural Survival Threat)</h2>
                    <p className="text-lg text-gray-300 whitespace-pre-wrap">{details}</p>
                </div>

                {/* 리스크 스코어 표시 */}
                <div className="mt-8 text-center">
                    <p className={`text-5xl font-bold ${riskScore >= 70 ? 'text-[#ff3b30]' : 'text-green-400'}`}>
                        {riskScore}%
                    </p>
                    <p className="text-lg text-gray-400 mt-1">진단 리스크 스코어 (Risk Score)</p>
                </div>

                {/* 3. Action State: 모든 버튼 비활성화 */}
                <div className="mt-12 flex justify-center space-x-6 pointer-events-none opacity-70">
                    <button 
                        disabled 
                        className="px-8 py-3 text-lg font-semibold rounded-md bg-red-700/50 border-2 border-[#ff3b30] cursor-not-allowed transition duration-200"
                    >
                        거래 진행 (Blocked)
                    </button>
                    <button 
                        disabled 
                        className="px-8 py-3 text-lg font-semibold rounded-md bg-gray-700/50 border-2 border-gray-600 cursor-not-allowed transition duration-200"
                    >
                        세부 리포트 보기 (Blocked)
                    </button>
                </div>

                <p className="mt-8 text-center text-sm text-red-400 font-mono">
                    ⚠️ 시스템이 사용자 행동을 강제로 중단시켰습니다. 전문가의 개입이 필수입니다.
                </p>
            </div>
        </div>
    );
};

export default GatekeeperAlert;