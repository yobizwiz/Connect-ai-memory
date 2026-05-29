import React, { useState } from 'react';
import { mockCalculateTRE, InputMetrics, RiskReport } from '../lib/api/riskService';

// 🚨 컴포넌트의 구조적 무결성 유지를 위한 타입 정의 (TypeScript Strict)
interface TREScoreDisplayProps {
    initialData: Partial<InputMetrics>;
}

/**
 * @component TREScoreDisplay - 시간적 압박과 위협감을 극대화하여 리스크 보고서를 표시하는 컴포넌트.
 * 이 컴포넌트는 단순히 데이터를 보여주는 것이 아니라, '구매해야 할 이유'를 설계하는 무기입니다.
 */
const TREScoreDisplay: React.FC<TREScoreDisplayProps> = ({ initialData }) => {
    const [metrics, setMetrics] = useState<InputMetrics>(initialData || { industry: '', staffCount: 0, dataSizeGB: 0 });
    const [report, setReport] = useState<RiskReport | null>(null);
    const [loading, setLoading] = useState(false);

    // 위험 레벨에 따른 동적 스타일링 (Red Zone Rendering)
    const getRiskZoneStyles = (score: number): React.CSSProperties => {
        let bgColor;
        let textColor;
        let borderStyle;

        if (score > 70) { // Critical Red Zone
            bgColor = '#990000'; // Neon Red 계열
            textColor = 'white';
            borderStyle = '3px solid #ff4d4d';
        } else if (score > 40) { // Warning Yellow/Orange Zone
            bgColor = '#cc6600'; // Authority Orange
            textColor = 'white';
            borderStyle = '2px solid #ffb700';
        } else { // Safe Blue Zone
            bgColor = '#1e3a8a'; // Deep Navy Blue (Authority)
            textColor = '#e5e7eb';
            borderStyle = '1px solid #4f46e5';
        }

        return {
            backgroundColor: bgColor,
            color: textColor,
            border: borderStyle,
        };
    };

    const handleCalculateTRE = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setReport(null); // 이전 결과 초기화
        
        // API 호출 모킹 (실제로는 fetch('/api/calculate_tre', ...) 사용)
        try {
            const result = await mockCalculateTRE({ 
                industry: metrics.industry, 
                staffCount: Number(metrics.staffCount), 
                dataSizeGB: Number(metrics.dataSizeGB) 
            });
            setReport(result);
        } catch (error) {
            console.error("API Calculation Failed:", error);
            alert("🚨 API 호출에 실패했습니다. 구조적 결함이 있을 수 있습니다.");
        } finally {
            // 계산 완료 후 로딩 상태 해제
            setLoading(false); 
        }
    };

    return (
        <div className="p-8 bg-gray-50 shadow-xl rounded-lg max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-red-700 mb-6 border-b pb-2">🚨 구조적 위험 진단 시스템 (TRE)</h2>
            
            {/* 1. 입력 폼 */}
            <form onSubmit={handleCalculateTRE} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-white rounded-md mb-8 border">
                <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700">산업군</label>
                    <select id="industry" value={metrics.industry} onChange={(e) => setMetrics({...metrics, industry: e.target.value})} required className="mt-1 block w-full border p-2 rounded-md focus:ring-red-500 focus:border-red-500">
                        <option>선택...</option>
                        <option value="Healthcare">헬스케어 (고위험)</option>
                        <option value="Finance">금융/보험</option>
                        <option value="Tech">IT/테크놀로지</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="staffCount" className="block text-sm font-medium text-gray-700">직원 수 (명)</label>
                    <input type="number" id="staffCount" value={metrics.staffCount} onChange={(e) => setMetrics({...metrics, staffCount: e.target.value})} required className="mt-1 block w-full border p-2 rounded-md focus:ring-red-500 focus:border-red-500"/>
                </div>
                 <div>
                    <label htmlFor="dataSizeGB" className="block text-sm font-medium text-gray-700">데이터 규모 (GB)</label>
                    <input type="number" id="dataSizeGB" value={metrics.dataSizeGB} onChange={(e) => setMetrics({...metrics, dataSizeGB: e.target.value})} required className="mt-1 block w-full border p-2 rounded-md focus:ring-red-500 focus:border-red-500"/>
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className={`col-span-full py-3 px-6 text-white font-bold rounded-md transition duration-200 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-700 hover:bg-red-800 shadow-lg'}`}
                >
                    {loading ? '진단 중... (시간적 압박)' : '구조적 리스크 진단 시작'}
                </button>
            </form>

            {/* 2. 결과 표시 영역 */}
            {report && (
                <div className="mt-10 p-8 rounded-xl shadow-2xl" style={getRiskZoneStyles(report.treScore)}>
                    <h3 className="text-4xl font-extrabold mb-4">📊 진단 결과: TRE 점수 {report.treScore}점</h3>
                    <p className="text-xl italic mb-6">{report.summaryMessage}</p>

                    {/* 핵심 리스크 요약 */}
                    <div className="mb-8 p-5 border-l-4 border-yellow-400 bg-opacity-20" style={{ borderColor: '#ffb700' }}>
                        <h4 className="text-xl font-semibold">🔍 진단 필요성 (Call to Action)</h4>
                        <p>{`이 점수는 귀사가 현재 마주한 '구조적 공백(Structural Gap)'을 보여줍니다. 이대로 방치하면 최대 재무 손실액 $L_{max}$에 노출됩니다.`}</p>
                    </div>

                    {/* 세부 리스크 요인 목록 */}
                    <h4 className="text-2xl font-bold mt-8 mb-4 border-b pb-2">📉 주요 구조적 위험 요인 ({report.riskFactors.length}개 발견)</h4>
                    <div className="space-y-6">
                        {report.riskFactors.map((factor, index) => (
                            <div key={index} className="p-4 border-l-4" style={{ borderColor: '#ffb700' }}>
                                <h5 className="text-2xl font-bold text-yellow-300">{`[${factor.riskId}] ${factor.title}`}</h5>
                                <p className="mt-1">{`점수 기여도: +${factor.severityScore}점`}</p>
                                <p className="mt-2 italic text-sm">{factor.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* CTA (Final Push) */}
                    <div className="mt-12 pt-6 border-t border-gray-700">
                        <button className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-md text-lg transition duration-200">
                            ✅ 전체 리스크 무결성 진단 보고서 요청 (통제력 확보 비용 지불)
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
};

export default TREScoreDisplay;