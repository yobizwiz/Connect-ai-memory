import React, { useState } from 'react';
import { useRiskSimulation, getRiskStyles } from '../hooks/useRiskSimulation';
// PaywallWidget은 기존에 생성된 컴포넌트라고 가정하고 import 합니다.
// 실제 구현 시에는 이 경로가 정확해야 합니다.
import PaywallWidget from '../components/PaywallWidget'; 

const RiskSimulatorPage: React.FC = () => {
    // 1. 상태 관리: 시뮬레이션 시작 여부를 부모 컴포넌트에서 제어합니다.
    const [isSimulationRunning, setIsSimulationRunning] = useState(false);

    // 2. Hook 사용: 리스크 로직을 실행하고 상태를 받습니다.
    const { riskLevel, currentRiskScore, isLoading } = useRiskSimulation(isSimulationRunning);

    // 3. UI 핸들링 함수
    const handleStartScan = () => {
        setIsSimulationRunning(true);
    };

    const handleReset = () => {
        setIsSimulationRunning(false);
    }

    // 4. 스타일 및 메시지 계산 (훅 내부에서 currentRiskScore가 사용 가능하도록 수정 필요하나, 여기서는 로컬로 처리)
    // 실제로는 useRiskSimulation이 현재 점수를 외부로 노출해야 합니다. (여기선 일단 Mocking하여 진행합니다.)
    const { className: warningClass, message: warningMessage } = getRiskStyles(riskLevel);

    return (
        <div className="min-h-screen bg-[#1A1A1A] text-white p-8 flex flex-col items-center justify-center">
            {/* Header - Authority Blue & Red Zone 느낌 */}
            <header className="text-center mb-12 w-full max-w-3xl border-b border-red-700/50 pb-6">
                <h1 className="text-4xl font-extrabold tracking-widest text-red-500 uppercase">
                    {`[🚨 System Alert: Compliance Gatekeeper Pro]` }
                </h1>
                <p className="mt-2 text-xl text-gray-300">
                    당신의 현재 시스템적 재정 노출 위험을 진단합니다. (Mock Data 기반)
                </p>
            </header>

            {/* 1. 리스크 시뮬레이터 영역 */}
            <div className={`w-full max-w-2xl p-8 rounded-lg shadow-2xl transition-all duration-1000 ${warningClass}`}>
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                    {/* Red Zone 경고 아이콘 */}
                    ⚠️ <span className="ml-3 text-red-500/80">{`Risk Level: ${riskLevel}`}</span>
                </h2>

                <div className="text-lg p-3 border-b border-dashed border-gray-700 mb-6">
                    <p className="font-mono tracking-wider">{warningMessage}</p>
                </div>
                
                {/* $TRE$ 시각화 게이지 */}
                <div className="mb-8">
                    <div className="flex justify-between text-sm font-medium mb-2">
                        <span>Total Risk Exposure ($TRE$)</span>
                        <span>점진적 불안정성 감지 중...</span>
                    </div>
                    {/* Mocked Score Display - 실제 점수 변화를 보여주는 영역 */}
                    <div className="w-full h-6 bg-gray-700 rounded-full relative overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-500 ease-linear ${riskLevel === 'CRITICAL' ? 'bg-red-600 shadow-red-900/80' : riskLevel === 'WARNING' ? 'bg-yellow-600 shadow-yellow-900/70' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(100, currentRiskScore)}%` }} // Mocking max 100%
                        ></div>
                    </div>
                </div>

                {/* 제어 버튼 */}
                <div className="flex justify-between gap-4">
                    <button 
                        onClick={handleStartScan} 
                        disabled={isSimulationRunning || isLoading}
                        className={`px-6 py-3 text-lg font-bold rounded transition ${isSimulationRunning ? 'bg-gray-700 cursor-not-allowed' : 'bg-red-700 hover:bg-red-800'} ${!isSimulationRunning && !isLoading ? '' : 'cursor-not-allowed opacity-70'}`}
                    >
                        {isLoading ? '시스템 스캔 중...' : (isSimulationRunning ? '스캔 진행 중...' : '위험 진단 시작')}
                    </button>
                    <button 
                        onClick={handleReset} 
                        disabled={!isSimulationRunning && !isLoading}
                        className="px-6 py-3 text-lg font-bold rounded bg-gray-600 hover:bg-gray-700 disabled:opacity-50"
                    >
                        재진단 초기화
                    </button>
                </div>

            </div>

            {/* 2. Call to Action (Paywall 위젯 통합) */}
            <div className="mt-16 w-full max-w-lg">
                <h3 className="text-center text-xl font-bold mb-4 text-gray-200">
                    위험 진단 결과: 즉각적인 행동이 필요합니다.
                </h3>
                {/* 기존 Paywall 컴포넌트 통합 */}
                <PaywallWidget /> 
            </div>
        </div>
    );
}

export default RiskSimulatorPage;