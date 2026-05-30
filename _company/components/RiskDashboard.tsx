import React, { useState, useCallback } from 'react';
import { RiskInputs, CalculatedResult } from './types';
import { calculateLmaxScore, MAX_LOSS_THRESHOLD } from './services/riskService';
// Glitch Noise 애니메이션은 Tailwind CSS 또는 Styled Components로 구현 가정
const WarningAlert = ({ children }: { children: React.ReactNode }) => (
    <div className="p-8 border-4 border-red-600 bg-gradient-to-br from-red-900/70 to-black animate-glitch noise-effect shadow-[0_0_30px_rgba(255,0,0,0.8)]">
        <h2 className="text-4xl text-red-400 font-extrabold mb-4 tracking-widest uppercase">[SYSTEM ALERT] CRITICAL BREACH DETECTED</h2>
        {children}
    </div>
);

/**
 * Lmax 계산 결과를 보여주고 Paywall CTA를 유도하는 핵심 대시보드 프로토타입.
 */
const RiskDashboard: React.FC = () => {
    // 초기 상태값 설정 (디폴트는 낮은 리스크)
    const [inputs, setInputs] = useState<RiskInputs>({
        employeeCount: 50,
        complianceRate: 0.85, // 높은 준수율로 시작
        aiUsageScope: 0.4,   // 중간 범위의 AI 사용으로 시작
    });

    const [result, setResult] = useState<CalculatedResult | null>(null);

    /**
     * 입력 데이터를 처리하고 Lmax 점수를 계산합니다.
     */
    const handleCalculateRisk = useCallback(() => {
        // 1. 로직 실행 (Mock API Call)
        const calculatedResult = calculateLmaxScore(inputs);
        setResult(calculatedResult);
    }, [inputs]);

    // --- UI 핸들러 ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let parsedValue: number | undefined = undefined;

        if (name === 'complianceRate') {
            parsedValue = parseFloat(value); // 0.0 ~ 1.0
        } else if (['employeeCount', 'aiUsageScope'].includes(name)) {
            parsedValue = parseInt(value, 10);
        } else if (name === 'dataRetentionYears') {
             parsedValue = parseInt(value, 10) || undefined;
        }

        setInputs(prev => ({ ...prev, [name]: parsedValue !== undefined ? parsedValue : parseFloat(value) }));
    };

    // --- 조건부 UI 및 Funnel 로직 ---
    const renderScoreDisplay = () => {
        if (!result) return null;

        const isCritical = result.isCritical;
        const scoreText = `${result.lmaxScore} / ${result.threshold}`;

        return (
            <div className={`p-10 rounded-xl text-center transition-all duration-500 shadow-2xl 
                ${isCritical ? 'bg-gradient-to-br from-red-900/80 to-black border-4 border-red-600' : 'bg-gray-800/70'}
            `}>
                <p className="text-xl text-gray-300 uppercase tracking-widest mb-2">Estimated Max Loss Score (Lmax)</p>
                <h1 className={`text-9xl font-extrabold transition-all duration-500 ${isCritical ? 'text-red-500 scale-[1.02]' : 'text-white'}`}>
                    {scoreText}
                </h1>
                {!isCritical && <p className="mt-4 text-lg text-green-400">Status: GREEN ZONE (Managed Risk)</p>}
                {isCritical && <p className="mt-4 text-2xl text-red-300 animate-pulse">⚠️ Immediate Intervention Required!</p>}
            </div>
        );
    };

    return (
        <div className="container mx-auto p-8 bg-[#1a1a2e] min-h-screen text-white font-sans">
            <header className="text-center py-8 border-b border-red-900/50 mb-10">
                <h1 className="text-5xl font-bold tracking-tight text-red-400">System Integrity Dashboard</h1>
                <p className="text-lg mt-2 text-gray-400">규제 리스크를 정량화하여 시스템적 취약점을 진단합니다. (Lmax Score)</p>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {(Object.keys(inputs) as Array<keyof RiskInputs & string>).map(name => {
                    let label = '';
                    let placeholder = '';

                    if (name === 'employeeCount') {
                        label = '직원 수 (Employee Count)';
                        placeholder = '예: 50';
                    } else if (name === 'complianceRate') {
                        label = '규제 준수율 (Compliance Rate, 0-1)';
                        placeholder = '예: 0.85';
                    } else if (name === 'aiUsageScope') {
                        label = 'AI 활용 범위 지수 (0-1)';
                        placeholder = '예: 0.4';
                    } else if (name === 'dataRetentionYears') {
                         label = '데이터 보존 기간 (년)';
                         placeholder = '예: 7';
                    }

                    return (
                        <div key={name}>
                            <label className="block text-sm font-medium text-red-300 mb-1">{label}</label>
                            <input
                                type="number"
                                name={name}
                                value={inputs[name] === undefined ? '' : String(inputs[name])}
                                onChange={handleChange}
                                placeholder={placeholder}
                                className="w-full p-3 bg-gray-800 border border-red-700 rounded focus:border-red-500 focus:ring focus:ring-red-500/50 text-white"
                            />
                        </div>
                    );
                })}
            </section>

            {/* 2. 실행 버튼 및 결과 표시 */}
            <div className="flex flex-col items-center mb-16">
                <button
                    onClick={handleCalculateRisk}
                    className="px-10 py-4 text-xl font-bold rounded-lg transition duration-300 shadow-lg 
                               bg-red-700 hover:bg-red-600 active:scale-[0.98] uppercase tracking-widest"
                >
                    {"$L_{max}$ 점수 실시간 계산하기 ⚙️"}
                </button>

                {/* 결과 표시 영역 */}
                <div className="mt-12 w-full max-w-xl">
                    {renderScoreDisplay()}
                </div>
            </div>


            {/* 3. Paywall CTA (Funnel 최종 단계) */}
            <section className={`text-center p-12 rounded-xl transition-all duration-700 ${result?.isCritical ? 'bg-gradient-to-br from-red-900/95 to-black shadow-[0_0_40px_rgba(255,0,0,0.9)]' : 'bg-gray-800/70 border border-red-700/50'}`}>
                <h2 className="text-3xl font-bold text-red-400 mb-4 uppercase tracking-wider">
                    {"🚨 경고: 최대 손실액 임계값($L_{max}$) 초과!"}
                </h2>
                <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                    {"현재 진단 점수는 귀사의 시스템이 감당할 수 있는 수준을 넘어섰습니다. 이대로 방치할 경우, 규제 위반 및 운영 마비로 인한 재무적 손실($L_{max}$)이 예상됩니다. 📉"}
                </p>

                <button
                    onClick={() => alert('진단 보고서 요청 플로우 시작: (유료 Paywall 페이지로 이동합니다)')}
                    className="px-12 py-4 text-xl font-extrabold rounded-full transition duration-300 shadow-2xl uppercase tracking-widest 
                               bg-red-500 hover:bg-red-400 active:scale-[0.98] border-4 border-transparent hover:border-white"
                >
                    지금, 심층 진단 보고서 요청하기 (Paywall) ✅
                </button>

                 <p className="text-sm text-gray-500 mt-6">
                    *본 서비스는 법률 및 재무 자문을 대체할 수 없습니다. 전문가의 검토가 필수적입니다.
                </p>
            </section>
        </div>
    );
}

export default RiskDashboard;