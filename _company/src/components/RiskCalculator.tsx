// src/components/RiskCalculator.tsx
import React, { useState, useCallback } from 'react';
import { regulatory_risk_dataset, RiskCase } from '../data/mockRiskDataset';
import { calculateRiskExposure, logABTestEvent } from '../lib/riskCalculator';

/** @typedef {'INPUT' | 'ANALYZING' | 'WARNING' | 'SOLUTION'} CalculatorState */

/** @typedef {object} RiskInput - 사용자가 입력하는 개별 리스크 지표 (TypeScript Interface)
 * @property {string} id - 규제 ID.
 * @property {number} score - 현재 준수 점수 (0~100).
 */

const INITIAL_RISK_INPUTS = [
    { id: "GDPR-2019-A", score: 85 }, // 예시 값
    { id: "CCPA-2020-B", score: 60 },
    { id: "HIPAA-2016-C", score: 30 } // 의도적으로 낮은 점수를 설정하여 Warning 유발
];

/**
 * 인터랙티브 리스크 계산기 MVP 컴포넌트. 
 * Designer의 3단계 상태 변화와 Researcher의 데이터셋을 통합합니다.
 */
const RiskCalculator: React.FC = () => {
    // State Machine 구현: 현재 UI가 어느 단계에 있는지 관리합니다.
    const [state, setState] = useState<CalculatorState>('INPUT');
    const [inputs, setInputs] = useState<RiskInput[]>(INITIAL_RISK_INPUTS);
    const [result, setResult] = useState<{ lMax: number, riskScore: number, passed: boolean } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // ----------------- 핸들러 로직 -----------------

    /**
     * 사용자가 개별 리스크 지표의 점수를 업데이트할 때 호출됩니다.
     */
    const handleScoreChange = useCallback((id: string, newScore: number) => {
        setInputs(prevInputs => prevInputs.map(input => 
            input.id === id ? { ...input, score: parseFloat(newScore) || 0 } : input
        ));
    }, []);

    /**
     * '분석 실행' 버튼 클릭 시 호출되는 핵심 로직. State Transition의 시작점입니다.
     */
    const runAnalysis = useCallback(async () => {
        if (isLoading) return;

        setIsLoading(true);
        setState('ANALYZING');

        // 1. A/B 테스트 로그 기록 (비동기 작업 시뮬레이션)
        await logABTestEvent('A', inputs.reduce((sum, i) => sum + i.score, 0) / inputs.length || 0);

        // 2. 핵심 로직 실행: Lmax 계산 및 리스크 점수 산출 (Defensive Code 사용)
        const calculatedResult = calculateRiskExposure(inputs);
        setResult(calculatedResult);

        // 3. State Transition 결정
        if (!calculatedResult.passed || calculatedResult.riskScore < 50) {
            setState('WARNING'); // 리스크 높음 -> 경고 상태로 전환
        } else {
            setState('SOLUTION'); // 리스크 낮음 -> 해결책 제시 상태로 전환 (가정)
        }

        setIsLoading(false);
    }, [inputs, isLoading]);


    // ----------------- UI 렌더링 로직 (Designer Spec 반영) -----------------

    const renderInputStage = () => {
        return (
            <div className="p-6 border-b border-red-500/30">
                <h2 className="text-xl font-mono text-yellow-400 mb-4">// Stage 1: Data Input & Pre-Analysis</h2>
                <p className="mb-6 text-gray-500">분석을 위해 각 규제 지표의 현재 준수 점수를 입력해주세요. (필수)</p>

                {inputs.map((input) => (
                    <div key={input.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
                        <span className="font-mono text-lg">{input.id}: {regulatory_risk_dataset[input.id]?.description || '설명 없음'}</span>
                        <div className="flex items-center space-x-4">
                            <label htmlFor={`score-${input.id}`} className="text-sm text-gray-600">현재 준수 점수 (0-100)</label>
                            <input
                                id={`score-${input.id}`}
                                type="number"
                                min="0"
                                max="100"
                                value={input.score}
                                onChange={(e) => handleScoreChange(input.id, e.target.value)}
                                className="w-32 p-2 border rounded font-mono bg-gray-50 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                    </div>
                ))}

                <button 
                    onClick={runAnalysis} 
                    disabled={isLoading || inputs.some(i => i.score === undefined)}
                    className={`mt-8 w-full py-3 rounded font-bold transition duration-200 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-700 hover:bg-red-800'} text-white`}
                >
                    {isLoading ? '⚙️ 시스템 분석 중... 잠시만 기다려 주세요.' : '🚨 리스크 분석 실행 (시스템 패닉 트리거)'}
                </button>
            </div>
        );
    };

    const renderWarningStage = () => {
        return (
            <div className="p-8 bg-red-900/10 border-l-4 border-red-600 shadow-xl">
                <h2 className="text-3xl font-extrabold text-red-700 mb-4">// ⚠️ Stage 2: CRITICAL RISK ALERT</h2>
                <p className="mb-6 text-lg text-gray-700">🚨 시스템적 리스크가 임계치를 초과했습니다. 즉각적인 대응이 필요합니다.</p>

                <div className="bg-red-100 p-4 rounded border border-red-300 mb-8">
                    <h3 className="text-xl font-mono text-red-900">최대 예상 재무 손실액 (Lmax):</h3>
                    <p className="text-5xl font-black tracking-widest mt-2 text-red-800">${result?.lMax.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 mt-1">이는 현재의 준수 상태를 유지할 경우 예상되는 최소 손실액입니다.</p>
                </div>

                {/* Solution CTA (Designer Spec 반영) */}
                <button 
                    onClick={() => setState('SOLUTION')}
                    className="w-full py-4 text-xl bg-red-800 hover:bg-red-900 transition duration-200 rounded font-bold text-white shadow-lg"
                >
                    🔥 리스크 해소 및 방어책 설계 (yobizwiz Authority Access)
                </button>
            </div>
        );
    };

    const renderSolutionStage = () => {
        return (
             <div className="p-8 bg-green-900/10 border-l-4 border-green-600 shadow-xl">
                <h2 className="text-3xl font-extrabold text-green-700 mb-4">// ✅ Stage 3: SOLUTION & CONTROL</h2>
                <p className="mb-6 text-lg text-gray-700">위험을 통제할 수 있는 유일한 방법입니다. 시스템적 방어 로직이 필요합니다.</p>

                {/* 최종 결제 배리어 모달 Placeholder */}
                <div className="bg-green-100 p-6 rounded border border-green-300 mb-8">
                    <h3 className="text-2xl font-mono text-green-900">프로토콜 활성화 (Activate Protocol)</h3>
                    <p className='mt-2'>yobizwiz의 Provenance Audit Layer에 접근하여 시스템 무결성을 복원하십시오.</p>
                </div>

                {/* 실제 결제 버튼 Placeholder */}
                 <button 
                    className="w-full py-4 text-xl bg-blue-600 hover:bg-blue-700 transition duration-200 rounded font-bold text-white shadow-lg"
                >
                    ✨ yobizwiz Premium Audit Layer 구독하기 (결제 유도)
                </button>
            </div>
        );
    };

    // ----------------- 메인 컴포넌트 렌더링 -----------------

    return (
        <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden border border-gray-200">
            {/* Header */}
            <header className="p-6 bg-gray-800 text-white flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-wider">🛡️ Systemic Risk Calculator MVP</h1>
                <span className='text-sm opacity-75'>v1.0 - Defensive Full Stack Edition</span>
            </header>

            {/* State Transition based Rendering */}
            <div className={`transition-all duration-500 ${state === 'ANALYZING' ? 'opacity-50 pointer-events-none' : ''}`}>
                {state === 'INPUT' && renderInputStage()}
                
                {(state === 'WARNING' || state === 'SOLUTION') && result && (
                    <div className={`p-6 ${state === 'ANALYZING' ? 'hidden' : ''} transition-all duration-500`}>
                        {state === 'WARNING' ? renderWarningStage() : renderSolutionStage()}
                    </div>
                )}

                 {(state === 'ANALYZING') && (
                    <div className="p-12 text-center">
                        <h3 className="text-xl font-mono text-blue-600 mb-4">// Analyzing System Integrity...</h3>
                        {/* 로딩 애니메이션 Placeholder */}
                         <div className="animate-pulse bg-gray-200 rounded w-full h-8 mb-4"></div>
                         <p>A/B 테스트 환경 및 규제 데이터셋과 연동하여 $L_{max}$를 계산 중입니다. (잠시만 기다려 주세요.)</p>
                    </div>
                )}
            </div>

            {/* Footer / 결과 요약 */}
             <div className="p-4 bg-gray-50 border-t text-sm font-mono text-right">
                현재 상태: <span className={`font-bold ${state === 'WARNING' ? 'text-red-600' : state === 'SOLUTION' ? 'text-green-600' : 'text-gray-500'}`}>{/* State Text */}</span>
            </div>
        </div>
    );
};

export default RiskCalculator;