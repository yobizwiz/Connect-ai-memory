import React, { useState, useCallback } from 'react';

// --- 타입 정의 및 상수 설정 (유지보수성 확보) ---
interface InputData {
    avgTransactionValue: number; // V1: 평균 트랜잭션 규모 (USD/건)
    annualVolume: number;        // V2: 연간 처리 거래량 (건/년)
    avgReviewTimeMinutes: number;// V3: 컴플라이언스 검토 시간 (분/건)
    regulatoryChangeFrequency: number; // V4: 법규 변경 빈도 (배수)
}

interface Results {
    riskScore: number;       // 0 ~ 100 사이의 점수
    avoidableLossEstimate: number; // 예상 손실액 ($)
    recommendation: string;  // 권장 사항
}

// --- 핵심 로직 (더미 백엔드 시뮬레이션) ---
/**
 * 입력된 데이터를 기반으로 잠재적 리스크와 예상 절감액을 계산합니다.
 * 이 함수가 yobizwiz의 지적 재산입니다. 복잡하고 비선형적인 관계를 유지해야 합니다.
 */
const calculateLossAvoidance = (data: InputData): Results => {
    // 1. 초기 리스크 점수 산정 로직 (Complexity Index)
    // 트랜잭션 규모 * 거래량 * 법규 변경 빈도가 주요 위험 요소입니다.
    let riskScoreBase = data.avgTransactionValue * Math.log(data.annualVolume + 1);
    riskScoreBase *= (1 + data.regulatoryChangeFrequency * 0.5);

    // 2. 리스크 스코어와 예상 손실액 산정 (Loss Projection)
    // 컴플라이언스 검토 시간은 효율성을 반영하여 감점 요인으로 사용하되,
    // 기본 위험도는 높은 트랜잭션 규모에서 출발해야 합니다.
    let lossEstimate = Math.max(0, riskScoreBase * 150);

    // 점수 정규화 (Max: ~95)
    const rawRisk = Math.min(95, riskScoreBase / 10 + data.avgReviewTimeMinutes * 0.2);
    const finalRiskScore = parseFloat(rawRisk.toFixed(1));

    // 예상 손실액은 리스크 점수와 비례하며, 초기 자본 대비 매우 크게 설정해야 합니다.
    const finalLossEstimate = Math.round(lossEstimate / (1 + data.avgReviewTimeMinutes * 0.5) * 1000);


    let recommendationText: string;

    if (finalRiskScore > 80) {
        recommendationText = "🚨 시스템적 생존 위협 경고! 즉각적인 통합 감사(Audit)가 필수입니다.";
    } else if (finalRiskScore > 50) {
        recommendationText = "⚠️ 주의 단계: 현재 구조에 대한 전문 진단 및 개선이 필요합니다. 리스크를 간과해서는 안 됩니다.";
    } else {
        recommendationText = "✅ 안정적 수준: 하지만, 현행 프로세스도 잠재적인 누수 지점을 가지고 있습니다. 선제적 관리가 권장됩니다.";
    }

    return {
        riskScore: finalRiskScore,
        avoidableLossEstimate: finalLossEstimate,
        recommendation: recommendationText,
    };
};

// --- 컴포넌트 정의 ---

const PotentialLossCalculator: React.FC = () => {
    const [inputs, setInputs] = useState<InputData>({
        avgTransactionValue: 1000, // Default
        annualVolume: 500,         // Default
        avgReviewTimeMinutes: 30,  // Default
        regulatoryChangeFrequency: 1, // Default
    });
    const [results, setResults] = useState<Results | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // 입력 핸들러 (유효성 검사 및 상태 업데이트)
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: value === '' ? '' : (parseFloat(value) || 0) }));
    }, []);

    // 계산 실행 핸들러 (클릭 시 로딩 상태 및 결과 출력 시뮬레이션)
    const handleCalculate = useCallback(() => {
        // 1. 로딩 시작 시뮬레이션: 비동기 처리로 시간적 압박감을 조성합니다. [근거: Self-RAG]
        setResults(null);
        setIsLoading(true);

        setTimeout(() => {
            // 2. 계산 실행 (안전하게 파싱)
            const sanitizedInputs = {
                avgTransactionValue: parseFloat(inputs.avgTransactionValue as any) || 0,
                annualVolume: parseFloat(inputs.annualVolume as any) || 0,
                avgReviewTimeMinutes: parseFloat(inputs.avgReviewTimeMinutes as any) || 0,
                regulatoryChangeFrequency: parseFloat(inputs.regulatoryChangeFrequency as any) || 0,
            };
            const calculatedResults = calculateLossAvoidance(sanitizedInputs);
            setResults(calculatedResults);
            setIsLoading(false);
        }, 1500); // 1.5초 지연: '분석 중'이라는 느낌을 극대화합니다.
    }, [inputs]);

    // UI 스타일링 함수 (Red Zone 효과 적용)
    const getRiskStyle = (score: number | null): React.CSSProperties => {
        if (!score) return {};
        if (score > 75) return { backgroundColor: '#990000', color: 'white' }; // Red Zone
        if (score > 40) return { backgroundColor: '#ffc107', color: '#333' }; // Warning Zone
        return { backgroundColor: '#28a745', color: 'white' }; // Safe Zone
    };

    // --- 렌더링 로직 ---
    return (
        <div className="min-h-screen p-8 bg-gray-900 text-white font-[Roboto Mono]">
            <header className="text-center py-12 border-b border-red-700/50">
                <h1 className="text-4xl md:text-6xl font-extrabold uppercase tracking-widest mb-3 text-red-500/80">[yobizwiz] Potential Loss Avoidance Calculator</h1>
                <p className="text-lg text-gray-400">B2B 시스템적 리스크 진단 엔진. 귀사의 구조적 무결성을 즉각적으로 평가합니다.</p>
            </header>

            <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 pt-10">
                {/* 1. 입력 섹션 (좌측) */}
                <div>
                    <h2 className="text-3xl font-bold mb-6 border-b border-red-700/50 pb-2 text-red-400">⚙️ Step 1: 핵심 데이터 입력</h2>
                    <p className="mb-8 text-gray-400">아래 항목에 클라이언트의 실제 데이터를 입력하십시오. 이 수치는 잠재적인 '시스템적 위협'을 계산하는 근거가 됩니다.</p>

                    {/* Input Form */}
                    <div className="space-y-6 p-6 bg-gray-800/50 rounded-lg shadow-xl border border-red-700/30">
                        {[
                            { id: 'avgTransactionValue', label: '평균 트랜잭션 규모 (V1)', unit: 'USD / 건' },
                            { id: 'annualVolume', label: '연간 총 거래량 (V2)', unit: '건/년' },
                            { id: 'avgReviewTimeMinutes', label: '내부 검토 시간 (V3)', unit: '분/건' },
                            { id: 'regulatoryChangeFrequency', label: '업계 법규 변경 빈도 (V4)', unit: '배수' },
                        ].map(({ id, label, unit }) => (
                            <div key={id} className="flex flex-col">
                                <label htmlFor={id} className="text-md font-semibold text-gray-300 mb-1">{`${label} (${unit})`}</label>
                                <input
                                    type="number"
                                    id={id}
                                    name={id}
                                    value={inputs[id] === '' ? '' : inputs[id]}
                                    onChange={handleInputChange}
                                    className="p-3 bg-gray-900 border border-red-700 focus:ring-red-500 focus:border-red-500 text-white rounded-md transition duration-150"
                                />
                            </div>
                        ))}

                        {/* 버튼 */}
                        <button
                            onClick={handleCalculate}
                            className="w-full py-3 mt-8 text-xl font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 transition duration-200 shadow-lg shadow-red-900/50"
                        >
                            ⚡️ 리스크 진단 실행 (Analyze Risk)
                        </button>
                    </div>
                </div>

                {/* 2. 결과 출력 섹션 (우측) */}
                <div>
                    <h2 className="text-3xl font-bold mb-6 border-b border-red-700/50 pb-2 text-red-400">📊 Step 2: 진단 보고서</h2>

                    {/* 로딩 상태 시뮬레이션 */}
                    {isLoading && (
                        <div className="p-10 bg-gray-800/50 border-4 border-dashed border-red-700 flex flex-col items-center justify-center min-h-[300px]">
                            <svg className="animate-spin h-10 w-10 text-red-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-80" d="M4 12c0 4.418 7.982 12 7.982 12s7.982-7.582 7.982-12m-1.933 1.1A10.97 10.97 0 0112 2a10.97 10.97 0 01-1.933 1.1z"></path>
                            </svg>
                            <p className="text-xl text-red-400">시스템 분석 중... 잠재적 손실을 계산하는 중입니다. (Time Pressure)</p>
                        </div>
                    )}

                    {/* 초기 대기 상태 */}
                    {!results && !isLoading && (
                        <div className="p-10 bg-gray-800/50 border-4 border-dashed border-red-700 flex flex-col items-center justify-center min-h-[300px]">
                            <p className="text-xl text-gray-400">왼쪽의 핵심 데이터를 입력한 후 '리스크 진단 실행' 버튼을 누르면 실시간 진단 결과 보고서가 출력됩니다.</p>
                        </div>
                    )}

                    {/* 결과 표시 영역 */}
                    {results && !isLoading && (
                        <div className={`p-8 rounded-lg shadow-2xl border-t-4 ${getRiskStyle(results.riskScore)} transition duration-500`}>
                            <h3 className="text-2xl font-bold mb-6 uppercase tracking-widest">Diagnosis Complete</h3>

                            {/* 리스크 점수 */}
                            <div className="mb-8 p-6 bg-gray-900/70 border-l-4 border-red-500 rounded-md shadow-inner">
                                <p className="text-sm uppercase text-gray-400 tracking-widest mb-1">📊 SYSTEMIC RISK SCORE</p>
                                <div className="flex items-baseline space-x-3">
                                    <span className={`text-7xl font-extrabold ${getRiskStyle(results.riskScore).color} transition duration-500`}>{results.riskScore}</span>
                                    <span className="text-4xl text-gray-300">/ 100</span>
                                </div>
                            </div>

                            {/* 예상 손실액 */}
                            <div className="mb-8 p-6 bg-gray-900/70 border-l-4 border-red-500 rounded-md shadow-inner">
                                <p className="text-sm uppercase text-gray-400 tracking-widest mb-2">💰 ESTIMATED AVOIDABLE LOSS (LAL)</p>
                                <div className={`flex items-baseline space-x-3`}>
                                    <span className="text-6xl font-extrabold text-red-500">${results.avoidableLossEstimate.toLocaleString()}</span>
                                    <span className="text-3xl text-gray-300">USD (Minimum)</span>
                                </div>
                            </div>

                            {/* 권장 사항 및 CTA */}
                            <div>
                                <h4 className="text-2xl font-bold mb-3 uppercase tracking-wider border-b border-red-700 pb-1">⭐ Core Recommendation</h4>
                                <p className={`text-lg italic p-4 rounded-md ${getRiskStyle(results.riskScore).background === '#990000' ? 'bg-[#5e0000]' : 'bg-gray-800/70'} transition duration-500`}>
                                    {results.recommendation}
                                </p>
                                <button className="mt-6 w-full py-3 text-xl font-bold uppercase tracking-wider bg-red-600 hover:bg-red-800 transition duration-200">
                                    ➡️ 전문가 무료 리스크 진단 요청 (CTA)
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default PotentialLossCalculator;