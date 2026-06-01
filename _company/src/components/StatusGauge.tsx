import React, { useState } from 'react';
import { useRiskCalculation } from '../hooks/useRiskCalculation';
import { RiskInputs, RiskOutput } from './types/RiskInputs';

// 초기 Mock 데이터 설정 (사용자에게 적절한 기본값을 제공)
const initialMockInputs: RiskInputs = {
    numberOfAffectedRecords: 50, // N=50
    riskMultiplier: 1.5,        // R=1.5
    dailyLossRate: 2.5,          // T_rate=2.5%
    jurisdiction: "Global/SEC"   // Jurisdiction
};

// ✨ Mocking Glitch Effect Component (실제 스타일링은 CSS로 처리)
const GlitchText: React.FC<{ text: string; colorClass?: string }> = ({ text, colorClass = 'text-red-500' }) => (
    <span className={`inline-block relative ${colorClass} animate-glitch`}>
        {/* 실제 구현 시 keyframe 애니메이션을 적용해야 함 */}
        {text}
    </span>
);


/**
 * Lmax 기반의 실시간 리스크 지표 게이지 컴포넌트.
 * 사용자가 입력값을 변경하면 로직이 재실행되어 상태와 스타일이 동기화됩니다.
 */
const StatusGauge: React.FC = () => {
    // 훅을 사용하여 계산 엔진과 상태를 연결합니다.
    const [riskOutput, setInputs] = useRiskCalculation(initialMockInputs);

    // 입력값 변경 핸들러 (API 통합 시 이 함수 내부에서 API 호출 후 결과를 받아야 함)
    const handleInputChange = (key: keyof RiskInputs, value: string | number) => {
        let numericValue: number;
        if (typeof value === 'string') {
            numericValue = parseFloat(value);
        } else {
            numericValue = value;
        }

        // 유효성 검증 및 0 처리 로직 추가는 Defensive Coding 원칙에 따라 필요합니다.
        const updatedInputs: Partial<RiskInputs> = {};
        if (key === 'numberOfAffectedRecords') updatedInputs[key] = Math.max(0, numericValue);
        else if (key === 'riskMultiplier') updatedInputs[key] = Math.max(1.0, numericValue);
        else if (key === 'dailyLossRate') updatedInputs[key] = Math.min(10, Math.max(0, numericValue));
        else if (key === 'jurisdiction') updatedInputs[key] = value as string;

        setInputs({ 
            ...initialMockInputs, 
            ...(updatedInputs as Partial<RiskInputs>) 
        });
    };


    // Critical 상태에 따른 동적 스타일링 결정
    const containerClassName = riskOutput.isCritical ? 'border-4 border-red-600 shadow-[0_0_20px_rgba(255,0,0,0.7)]' : 
                              riskOutput.lTotalMax > 50000 ? 'border-2 border-yellow-500' : 'border-2 border-gray-300';

    return (
        <div className="p-8 bg-slate-900/70 backdrop-blur-md rounded-xl shadow-2xl max-w-4xl mx-auto">
            <h2 className={`text-3xl font-extrabold mb-6 ${riskOutput.isCritical ? 'text-red-500' : 'text-white'}`}>
                🛡️ Total Risk Exposure Index ($L_{totalMax}$)
            </h2>

            {/* 1. 리스크 게이지 섹션 */}
            <div className={`p-8 mb-6 rounded-lg transition duration-300 ${containerClassName} bg-slate-950`}>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm uppercase text-gray-400 tracking-wider">총 리스크 점수</p>
                        <h1 className={`text-7xl font-mono ${riskOutput.isCritical ? 'text-red-500' : 'text-cyan-400'} transition duration-300`}>
                            {riskOutput.lTotalMax.toLocaleString()}
                        </h1>
                        <p className="text-2xl mt-1 font-semibold text-gray-300">USD (Mock Value)</p>
                    </div>
                    {/* 임계값 초과 시 경고 효과가 적용되는 영역 */}
                    <div className={`px-6 py-3 rounded-full ${riskOutput.isCritical ? 'bg-red-800/70' : 'bg-gray-700'} shadow-inner`}>
                        <p className="text-lg font-bold text-white">
                            {riskOutput.isCritical ? 'CRITICAL BREACH' : 'STABLE ZONE'}
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. 실시간 위험 메시지 및 입력 제어 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 전역 경고 바 */}
                <div className={`col-span-full p-4 rounded-lg ${riskOutput.isCritical ? 'bg-red-900/50 border border-red-700' : 'bg-gray-800/50 border border-gray-700'}`}>
                    <p className="text-sm uppercase text-yellow-400 tracking-widest mb-1">System Alert</p>
                    <p className="text-lg font-medium text-white">{riskOutput.message}</p>
                </div>

                {/* Input 폼 (N) */}
                <div className="bg-slate-800 p-4 rounded-lg shadow-xl">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        N: 영향받은 기록 수 (Affected Records)
                    </label>
                    <input 
                        type="range" 
                        min="1" max="500" step="1" 
                        value={initialMockInputs.numberOfAffectedRecords} // Mock 사용
                        onChange={(e) => handleInputChange('numberOfAffectedRecords', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg"
                    />
                    <p className="text-right text-xl font-bold mt-2 text-cyan-400">{initialMockInputs.numberOfAffectedRecords}</p>
                </div>

                {/* Input 폼 (R) */}
                <div className="bg-slate-800 p-4 rounded-lg shadow-xl">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        R: 위험 계수 (Risk Multiplier, 1.0~3.0)
                    </label>
                    <input 
                        type="range" 
                        min="1" max="3" step="0.1" 
                        value={initialMockInputs.riskMultiplier} // Mock 사용
                        onChange={(e) => handleInputChange('riskMultiplier', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg"
                    />
                    <p className="text-right text-xl font-bold mt-2 text-cyan-400">{initialMockInputs.riskMultiplier}</p>
                </div>
                
                 {/* Input 폼 (T_rate) */}
                <div className="bg-slate-800 p-4 rounded-lg shadow-xl">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        T: 일일 손실률 (%)
                    </label>
                    <input 
                        type="range" 
                        min="0" max="10" step="0.1" 
                        value={initialMockInputs.dailyLossRate} // Mock 사용
                        onChange={(e) => handleInputChange('dailyLossRate', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg"
                    />
                    <p className="text-right text-xl font-bold mt-2 text-cyan-400">{initialMockInputs.dailyLossRate}%</p>
                </div>
            </div>

             {/* API 통합 지침 */}
             <div className="mt-8 p-4 border-t border-gray-700 pt-6">
                 <h3 className="text-xl font-bold text-yellow-400 mb-2">💡 [Developer Note] API Integration Point</h3>
                 <p className="text-sm text-gray-400">현재 로직은 커스텀 훅을 통해 Mock 계산되고 있습니다. 실제 운영 환경에서는 이 `useRiskCalculation` 훅 내부에서, 백엔드의 <code className='bg-red-900/50 p-1 rounded'>/api/risk_service.py</code> 엔드포인트로 POST 요청을 보내어 최종 $L_{max}$ 값을 받아와야 합니다.</p>
             </div>

        </div>
    );
};

export default StatusGauge;