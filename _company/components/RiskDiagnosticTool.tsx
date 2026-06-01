import React, { useState, useCallback } from 'react';
import { calculateTotalMaximumLoss, determineRiskLevel } from '../services/riskCalculator';
import { InputData } from '../types/inputTypes';
// StatusGauge 컴포넌트는 디자인팀이 완성할 것으로 가정하고 임시로 대체합니다.

/**
 * @component RiskDiagnosticTool
 * 리스크 진단 도구의 전체 상태 관리 및 사용자 인터랙션을 담당하는 메인 컴포넌트.
 */
const RiskDiagnosticTool: React.FC = () => {
    // 초기 입력 데이터는 모든 변수를 0으로 설정합니다 (가장 안전한 기본값).
    const [input, setInput] = useState<InputData>({
        regulatoryFailureRate: null,
        systemicGapExposure: null,
        dataIntegrityWeakness: null,
    });

    // 로직 계산 결과를 저장할 상태
    const [totalLoss, setTotalLoss] = useState(0);
    const [riskState, setRiskState] = useState({ isHighRisk: false, level: 'Low' });

    /**
     * 사용자 입력이 변경될 때마다 리스크 점수를 재계산하는 핸들러.
     */
    const handleInputChange = useCallback((key: keyof InputData, value: number | null) => {
        // 1. 상태 업데이트 (Optimistic Update)
        setInput(prev => ({ ...prev, [key]: value }));

        // 2. 리스크 점수 재계산 및 상태 반영
        const newLoss = calculateTotalMaximumLoss({
            regulatoryFailureRate: input.regulatoryFailureRate ?? null,
            systemicGapExposure: input.systemicGapExposure ?? null,
            dataIntegrityWeakness: input.dataIntegrityWeakness ?? null,
        });

        // Note: 실제로는 입력 값의 변화만 반영해야 하지만, MVP 단계에서는 간단히 전체를 다시 계산합니다.
        const { isHighRisk, level } = determineRiskLevel(newLoss);
        setTotalLoss(newLoss);
        setRiskState({ isHighRisk, level });

    }, [input]); // 의존성 배열에 input을 넣음으로써, 값이 변경될 때마다 리커니컬하게 작동하도록 보장합니다.

    // 임시 Gauge 컴포넌트 (디자인팀 산출물 대체)
    const StatusGauge = ({ value: lossAmount, level }: { value: number; level: string }) => {
        let colorClass = 'bg-green-500';
        if (level === 'Medium') colorClass = 'bg-yellow-500';
        if (level === 'Critical') colorClass = 'bg-red-600 animate-pulse';

        return (
            <div className="p-8 bg-gray-900 rounded-xl shadow-2xl border-b-4 border-transparent">
                <h3 className={`text-lg font-semibold mb-4 ${level === 'Critical' ? 'text-red-400' : 'text-white'}`}>
                    🚨 현재 리스크 레벨: {level}
                </h3>
                <div className="flex justify-between items-end mt-6">
                    <div className={`w-full h-12 rounded-t-lg ${colorClass}`} style={{ width: `${Math.min(100, lossAmount / 80000 * 100)}%` }}></div>
                    <span className="text-4xl font-extrabold text-red-400">${lossAmount.toLocaleString()}</span>
                </div>
                <p className="mt-2 text-sm text-gray-400">잠재적 최대 손실액 (L_totalMax)</p>
            </div>
        );
    };

    // Paywall CTA 렌더링 로직
    const renderPaywallCTA = () => {
        if (!riskState.isHighRisk) return null;

        return (
            <div className="mt-10 p-8 bg-red-900/80 border-4 border-red-600 rounded-xl shadow-2xl animate-pulse">
                <h2 className="text-3xl font-extrabold text-red-300 flex items-center">
                    ⚠️ 경고! 즉각적인 대응이 필요합니다. (L_totalMax 임계값 초과)
                </h2>
                <p className="mt-3 text-lg text-white/90">
                    현재 산출된 $L_{totalMax}$는 귀사가 감당할 수 있는 수준을 **현저히** 초과했습니다. 이대로 방치할 경우, 재정적 파국($L_{max}$)에 직면하게 됩니다.
                </p>
                <button className="mt-6 px-10 py-3 text-xl font-bold bg-red-700 hover:bg-red-800 transition duration-200 transform scale-105">
                    ✅ 필수 생존 보험료 가입 및 상세 진단 보고서 받기
                </button>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-gray-900 rounded-xl shadow-inner text-white">
            <h1 className="text-3xl font-bold mb-6 border-b border-red-700 pb-2">🚨 리스크 진단 도구 (L_totalMax MVP)</h1>

            {/* StatusGauge 영역: 가장 먼저 시각적 충격을 줘야 함 */}
            <StatusGauge value={totalLoss} level={riskState.level} />

            {/* 사용자 입력 섹션 */}
            <div className="mt-10 space-y-8">
                <h2 className="text-xl font-semibold text-gray-300 border-b pb-2">📋 리스크 변수 진단 (사용자 점검)</h2>

                {/* 1. Regulatory Failure Rate */}
                <div>
                    <label className="block text-md font-medium text-red-400 mb-2">규제 미준수율 (Regulatory Failure Rate)</label>
                    <p className='text-sm text-gray-400 mb-3'>현재 시스템에서 규제를 놓치고 있는 비율. 0(없음) ~ 1(완벽 부재).</p>
                    <input
                        type="range"
                        min="0" max="1" step="0.1" value={input.regulatoryFailureRate ?? 0}
                        onChange={(e) => handleInputChange('regulatoryFailureRate', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                    <div className="flex justify-between text-sm mt-1 text-gray-400"><span>0 (안전)</span><span>1 (위험)</span></div>
                </div>

                {/* 2. Systemic Gap Exposure */}
                <div>
                    <label className="block text-md font-medium text-red-400 mb-2">시스템적 공백 노출 정도 (Systemic Gap Exposure)</label>
                    <p className='text-sm text-gray-400 mb-3'>산업의 핵심 흐름에서 우리 비즈니스가 놓치고 있는 기회/위협. 0(안전) ~ 1(심각).</p>
                    <input
                        type="range"
                        min="0" max="1" step="0.1" value={input.systemicGapExposure ?? 0}
                        onChange={(e) => handleInputChange('systemicGapExposure', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                    <div className="flex justify-between text-sm mt-1 text-gray-400"><span>0 (안전)</span><span>1 (위험)</span></div>
                </div>

                {/* 3. Data Integrity Weakness */}
                <div>
                    <label className="block text-md font-medium text-red-400 mb-2">데이터 무결성 취약점 (Data Integrity Weakness)</label>
                    <p className='text-sm text-gray-400 mb-3'>핵심 데이터의 변조 가능성 또는 출처 불명확성 정도. 0(안전) ~ 1(위험).</p>
                    <input
                        type="range"
                        min="0" max="1" step="0.1" value={input.dataIntegrityWeakness ?? 0}
                        onChange={(e) => handleInputChange('dataIntegrityWeakness', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                    <div className="flex justify-between text-sm mt-1 text-gray-400"><span>0 (안전)</span><span>1 (위험)</span></div>
                </div>
            </div>

            {/* Paywall 강제 진입 CTA */}
            {renderPaywallCTA()}
        </div>
    );
};

export default RiskDiagnosticTool;