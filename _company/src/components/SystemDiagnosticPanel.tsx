// src/components/SystemDiagnosticPanel.tsx
import React, { useState, useCallback } from 'react';
import { calculateEstimatedLoss } from '../utils/complianceCalculator';

export interface BreakdownItem {
    sourceRule: string;
    component: string;
    contributionAmount: number;
}

export interface EstimatedLossData {
    y: number;
    level: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    breakdown: BreakdownItem[];
}

// --- UI Components & Styling (Designer Spec Adherence) ---

const getRiskColor = (level: string) => {
    switch (level) {
        case 'CRITICAL': return 'bg-red-700 border-red-500';
        case 'HIGH': return 'bg-yellow-700 border-yellow-500';
        default: return 'bg-green-700 border-green-500';
    }
};

const DiagnosticPanel = () => {
    const [inputs, setInputs] = useState({
        jurisdictionCode: 'GDPR-EU', // Defaulting to highest risk for UX demonstration
        dataTypeClassification: 'PII',
        dataSubjectCountN: 100 as number | '',
    });

    const [estimatedLossY, setEstimatedLossY] = useState<EstimatedLossData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // 핸들러 함수: 입력값 변경 시 상태 업데이트 및 로직 호출 (실시간 피드백)
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let newValue;

        if (name === 'dataSubjectCountN') {
            newValue = value === '' ? '' : Math.max(1, parseInt(value) || 1); // 입력 시 빈칸 허용하여 키 입력 잠김 해결
        } else {
            newValue = value;
        }

        setInputs(prev => ({ ...prev, [name]: newValue }));
    }, []);

    // 핵심 계산 로직 실행 (Glitch Trigger Point 2 / Processing...)
    const handleCalculateLoss = useCallback(() => {
        setError('');
        setEstimatedLossY(null);
        setIsLoading(true);

        // 시뮬레이션 지연 시간 추가 (Time Pressure 구현)
        setTimeout(() => {
            try {
                // 1. 로직 실행 및 계산 (Structural Integrity 확보)
                const sanitizedInputs = {
                    ...inputs,
                    dataSubjectCountN: Math.max(1, parseInt(inputs.dataSubjectCountN as any) || 1)
                };
                const result = calculateEstimatedLoss(sanitizedInputs);
                setEstimatedLossY({
                    y: result.estimatedLossY,
                    level: result.riskLevel as 'CRITICAL' | 'HIGH' | 'MEDIUM',
                    breakdown: result.breakdown
                });

            } catch (e: any) {
                setError(e.message || "시스템 오류 발생.");
            } finally {
                setIsLoading(false);
            }
        }, 1500); // 1.5초 로딩 시간 시뮬레이션
    }, [inputs]);


    // --- Render Logic ---

    return (
        <div className="p-8 bg-[#1A1A1A] text-white min-h-[60vh] border border-red-900/50 shadow-2xl">
            {/* A. HEADER: [CRITICAL SYSTEM ALERT] */}
            <header className={`p-4 mb-8 rounded-md text-lg ${getRiskColor(estimatedLossY ? estimatedLossY.level : 'MEDIUM')}`}>
                <h2 className="uppercase tracking-widest font-mono">[SYSTEM DIAGNOSTIC REPORT] :: CRITICAL VIOLATION DETECTED</h2>
            </header>

            {/* B. INPUT SECTION: 변수 입력 패널 */}
            <section className="mb-10 p-6 border border-gray-700 bg-[#252525]">
                <h3 className="text-xl text-red-400 mb-4 font-mono">INPUT VARIABLES DEFINITION</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* V1 Input */}
                    <div>
                        <label htmlFor="jurisdictionCode" className="block text-sm font-mono text-gray-400 mb-1">V1. Jurisdiction Code (법규)</label>
                        <select
                            id="jurisdictionCode"
                            name="jurisdictionCode"
                            value={inputs.jurisdictionCode}
                            onChange={handleInputChange}
                            className="w-full p-2 bg-[#333] border border-red-600/50 focus:ring-red-500 focus:border-red-500 font-mono text-sm"
                        >
                            <option value="GDPR-EU">GDPR-EU (유럽 일반 데이터 보호 규정)</option>
                            <option value="CCPA-CA">CCPA-CA (캘리포니아 소비자 프라이버시 법)</option>
                            <option value="SOX-US">SOX-US (사베인스-옥슬리 법)</option>
                        </select>
                    </div>

                     {/* V2 Input */}
                    <div>
                        <label htmlFor="dataTypeClassification" className="block text-sm font-mono text-gray-400 mb-1">V2. Data Type Classification (데이터 민감도)</label>
                        <select
                            id="dataTypeClassification"
                            name="dataTypeClassification"
                            value={inputs.dataTypeClassification}
                            onChange={handleInputChange}
                            className="w-full p-2 bg-[#333] border border-red-600/50 focus:ring-red-500 focus:border-red-500 font-mono text-sm"
                        >
                            <option value="PII">PII (개인 식별 정보)</option>
                            <option value="PHI">PHI (건강 및 의료 기록 - ★최고 위험★)</option>
                            <option value="FINANCIAL">FINANCIAL (금융 거래 기록)</option>
                            <option value="IP">IP (지적재산권)</option>
                        </select>
                    </div>

                     {/* V3 Input */}
                    <div>
                        <label htmlFor="dataSubjectCountN" className="block text-sm font-mono text-gray-400 mb-1">V3. Data Subject Count (영향받은 주체 수, N)</label>
                         <input
                            type="number"
                            id="dataSubjectCountN"
                            name="dataSubjectCountN"
                            value={inputs.dataSubjectCountN}
                            onChange={handleInputChange}
                            min="1"
                            className="w-full p-2 bg-[#333] border border-red-600/50 focus:ring-red-500 focus:border-red-500 font-mono text-sm"
                        />
                    </div>

                </div>
            </section>


            {/* C. PROCESS & RESULT OUTPUT (System Diagnostic Console) */}
            <section className="mt-12">
                {/* 프로세스 버튼 및 로딩 상태 */}
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={handleCalculateLoss}
                        disabled={isLoading}
                        className={`px-8 py-3 text-lg font-mono uppercase tracking-wider transition duration-300 ${isLoading ? 'bg-gray-700 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(255,0,0,0.7)]'} text-white`}
                    >
                        {isLoading ? 'ANALYZING... [SYSTEM LOAD]' : 'EXECUTE DIAGNOSIS & CALCULATE Y LOSS'}
                    </button>

                    {(error && !isLoading) && (
                         <p className="text-red-400 font-mono animate-pulse">❗ ERROR: {error}</p>
                    )}

                    {/* 로딩 시뮬레이션 */}
                    {isLoading && (
                        <div className="w-64 h-4 bg-gray-700 relative flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 animate-[scanline_2s_linear_infinite] opacity-50" style={{ background: 'repeating-linear-gradient(90deg, transparent 0%, rgba(255,0,0,.3) 1px, transparent 2px)' }}></div>
                            <span className="text-sm text-red-400 flex items-center"><svg className="animate-spin -mr-1 ml-2 h-5 w-5 text-red-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-80" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12h12a4 4 0 01-8 0z"></path></svg> PROCESSING...</span>
                        </div>
                    )}
                </div>

                {/* D. 결과 출력: $Y$ ESTIMATED LOSS */}
                {estimatedLossY && (
                    <div className="mt-12 p-8 border-4 border-red-600 bg-[#111] shadow-[0_0_30px_rgba(255,0,0,0.7)]">
                        <h3 className="text-2xl uppercase tracking-widest text-center mb-6 font-mono">[DIAGNOSIS COMPLETE] - ESTIMATED MINIMUM LOSS</h3>

                        {/* 최종 Y 값 표시 */}
                        <div className={`text-6xl text-center p-4 rounded-lg ${getRiskColor(estimatedLossY.level)}`}>
                            ${estimatedLossY.y.toLocaleString()}
                        </div>
                        <p className="text-2xl text-center font-mono mb-8 text-red-300">Estimated Minimum Loss ($Y$)</p>

                         {/* 리스크 등급 */}
                        <div className={`text-center py-3 px-6 rounded-lg inline-block ${getRiskColor(estimatedLossY.level)}`}>
                            RISK LEVEL: <span className="font-bold ml-2">{estimatedLossY.level}</span>
                        </div>

                        {/* 상세 분석 (Breakdown) */}
                        <div className="mt-10 pt-6 border-t border-gray-700">
                            <h4 className="text-xl text-red-300 mb-4 font-mono">[SYSTEM BREAKDOWN ANALYSIS]</h4>
                            {estimatedLossY.breakdown.map((item, index) => (
                                <div key={index} className="mb-3 border-l-2 border-yellow-500 pl-4 py-1">
                                    <p className="text-sm font-mono text-gray-400">{item.sourceRule}</p>
                                    <p className="text-base font-bold flex justify-between items-center">
                                        <span>{item.component}</span>
                                        <span className="text-yellow-300">${Math.round(item.contributionAmount).toLocaleString()}</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default DiagnosticPanel;