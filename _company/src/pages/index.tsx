import React from 'react';
import { useQLossSimulation } from '../hooks/useQLossSimulation';
import RedZoneDisplay from '../components/RedZoneDisplay';

const GatekeepingPage: React.FC = () => {
    // 초기 QLoss 값은 10으로 설정하고, useEffect에서 자동 증가 로직이 작동하게 합니다.
    const { state, simulateQLossIncrease, mitigateQLoss } = useQLossSimulation(10);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <header className="text-center mb-12 border-b border-red-900 pb-6">
                <h1 className="text-5xl font-extrabold tracking-tighter text-red-400">
                    yobizwiz: 구조적 무결성 진단 시스템
                </h1>
                <p className="mt-3 text-xl text-gray-400/80">
                    귀하의 데이터는 현재 분석 중입니다. 예상치 못한 리스크가 발생할 수 있습니다.
                </p>
            </header>

            {/* 1. QLoss 시각화 (핵심) */}
            <div className="max-w-4xl mx-auto mb-12">
                <RedZoneDisplay state={state} />
            </div>

            {/* 2. 사용자 상호작용 및 테스트 영역 */}
            <div className="max-w-3xl mx-auto bg-gray-800/60 p-8 rounded-lg shadow-inner border border-red-900">
                <h2 className="text-3xl font-bold text-white mb-6 border-b border-red-700 pb-2">
                    진단 프로세스 상호작용 (MVP 테스트)
                </h2>

                {/* 강제 결제 CTA가 활성화되었을 때만 버튼을 강조 */}
                <div className={`p-4 rounded-lg mb-8 transition duration-500 ${state.ctaForced ? 'bg-red-900/70 border-2 border-red-500 animate-pulse' : 'bg-gray-700/50'}`}>
                    <h3 className="text-xl font-bold text-yellow-300 mb-3">
                        진단 결과를 바탕으로 한 필수 조치
                    </h3>
                    <p className="text-gray-300 mb-4">시스템이 경고하는 리스크를 해소하려면, 추가적인 분석과 전문 프로토콜 적용이 필요합니다.</p>
                    
                    {/* 강제 CTA 버튼 */}
                    <button 
                        onClick={() => alert("🔒 [Payment Gateway]: Advanced Mitigation Protocol ($1,999/월) 결제가 시작됩니다. (테스트 완료)")}
                        disabled={!state.ctaForced}
                        className={`w-full py-4 text-xl font-bold rounded transition duration-300 ${state.ctaForced ? 'bg-red-600 hover:bg-red-700 shadow-lg' : 'bg-gray-500 cursor-not-allowed'}`}
                    >
                        지금 바로 전문가 진단 신청 (Advanced Protocol)
                    </button>
                </div>

                {/* QLoss 수동 조작 버튼 */}
                <div className="flex justify-around gap-4">
                    <button 
                        onClick={() => mitigateQLoss(15)}
                        className="flex-1 py-3 bg-blue-600/80 hover:bg-blue-700 rounded transition text-sm"
                    >
                        [시뮬레이션] 데이터 입력 (QLoss -15)
                    </button>
                    <button 
                        onClick={() => simulateQLossIncrease(1)}
                        className="flex-1 py-3 bg-green-600/80 hover:bg-green-700 rounded transition text-sm"
                    >
                        [시뮬레이션] 추가 데이터 입력 (QLoss +1)
                    </button>
                </div>

            </div>
        </div>
    );
};

export default GatekeepingPage;