import React, { useState, useCallback } from 'react';

// Define types for strict TypeScript compliance (Defensive Coding)
type RiskStatus = "LOW" | "WARNING" | "CRITICAL";

interface RiskResult {
    status: RiskStatus;
    score: number;
    lmax_estimate: string;
    alerts: string[];
    details: Record<string, any>;
}

// --- UI Components for System Authority ---

const getStatusStyles = (status: RiskStatus) => {
    switch(status) {
        case "CRITICAL":
            return { bg: 'bg-red-900/80', text: 'text-red-300', border: 'border-red-600', icon: '💥' };
        case "WARNING":
            return { bg: 'bg-yellow-900/80', text: 'text-yellow-200', border: 'border-yellow-600', icon: '⚠️' };
        case "LOW":
        default:
            return { bg: 'bg-green-900/80', text: 'text-green-300', border: 'border-green-600', icon: '✅' };
    }
};

// Mock API Call (Simulating the fetch to the FastAPI backend)
const mockApiCall = async (context: string): Promise<RiskResult> => {
    // In a real Next.js app, this would be an actual fetch call:
    // const response = await fetch('/api/v1/risk/calculate', { method: 'POST', body: JSON.stringify({ context }) });
    // return response.json();

    console.log(`[Mock API] Calling backend with context: "${context}"`);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency

    // Use the actual Python logic function name for reference (assuming a global import)
    // We simulate the successful run of get_mock_risk_api from Step 1.
    const mockResult = {
        status: "CRITICAL", // Hardcoded result for demonstration purposes, should come from API
        score: 0.95,
        lmax_estimate: "$€20M - 전 세계 연 매출의 4%",
        alerts: [
            "💥 치명적 위험: 감사 추적(Audit Trail) 기록의 누락 또는 조작은 법적 책임을 극대화합니다.",
            "🚨 경고: 개인 식별 정보(PII)가 언급되었습니다. GDPR 준수 여부를 즉시 확인하십시오."
        ],
        details: { compliance: "Critical", privacy: "High"}
    } as RiskResult;

    return mockResult;
};


const LiveRiskAlertModule: React.FC = () => {
    const [inputContext, setInputContext] = useState('');
    const [result, setResult] = useState<RiskResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCalculateRisk = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputContext.trim()) return;

        setIsLoading(true);
        setError(null);
        setResult(null); // Clear previous results

        try {
            // Call the mock API/Backend service
            const resultData = await mockApiCall(inputContext);
            setResult(resultData);
        } catch (err) {
            console.error("Risk calculation failed:", err);
            setError("🚨 시스템 오류: 리스크 계산 서비스와 통신할 수 없습니다. API 게이트웨이를 확인하십시오.");
            setResult(null);
        } finally {
            setIsLoading(false);
        }
    }, [inputContext]);

    const statusStyles = getStatusStyles(result?.status || "LOW");

    return (
        <div className="p-6 border-4 rounded-xl shadow-2xl max-w-3xl mx-auto" 
             style={{ borderColor: statusStyles.border, backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
            
            {/* Header - System Authority */}
            <div className={`p-4 rounded-lg mb-6 flex items-center justify-between ${statusStyles.bg}`}>
                <h2 className="text-xl font-bold tracking-widest">
                    SYSTEM ALERT: 리스크 진단 모듈 💻
                </h2>
                <span className={`text-sm px-3 py-1 rounded-full font-mono uppercase ${statusStyles.text} border ${statusStyles.border}`}>
                    {statusStyles.icon} 실시간 시스템 경고
                </span>
            </div>

            {/* Input Form */}
            <form onSubmit={handleCalculateRisk} className="mb-8">
                <label htmlFor="context" className="block text-sm font-medium mb-2 text-gray-300">
                    [Input Context] 진단할 비즈니스 활동/데이터 흐름을 설명해주세요. (예: 해외 클라이언트를 위한 PII 전송)
                </label>
                <textarea 
                    id="context" 
                    rows={4} 
                    value={inputContext} 
                    onChange={(e) => setInputContext(e.target.value)}
                    className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 transition duration-150" 
                    placeholder="진단 컨텍스트를 입력하세요..." 
                    disabled={isLoading}
                />
                <button 
                    type="submit" 
                    disabled={isLoading || !inputContext.trim()}
                    className={`mt-4 w-full py-3 rounded-lg font-bold transition duration-200 ${
                        isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-600'
                    } text-white`}
                >
                    {isLoading ? '진단 중... (Calculating Risk)' : '리스크 점수 계산 및 경고 확인'}
                </button>
            </form>

            {/* Results Display */}
            {(result || error) && (
                <div className={`mt-8 p-6 rounded-xl ${statusStyles.bg} border-l-4 ${statusStyles.border}`}>
                    {error ? (
                        <p className="text-red-300 font-mono">{error}</p>
                    ) : result ? (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className={`text-2xl font-bold ${statusStyles.text}`}>{statusStyles.icon} 최종 진단 결과</h3>
                                <span className={`text-sm px-4 py-1 rounded-lg font-mono uppercase ${'bg-black text-white'} border ${statusStyles.border}`}>
                                    {result.status} ({result.score * 100}% 위험도)
                                </span>
                            </div>

                            {/* Lmax Estimate */}
                            <div className="mb-4 p-3 bg-red-900/50 rounded">
                                <p className="text-sm text-gray-300">{"💰 예상 최대 재정적 손실 ($L_{max}$):"}</p>
                                <h4 className={`text-xl font-extrabold ${statusStyles.text}`}>{result.lmax_estimate}</h4>
                            </div>

                            {/* Alerts */}
                            <div className="space-y-3">
                                <p className="text-lg text-gray-200 mb-2 border-b border-dashed pb-1">🚨 핵심 경고 메시지:</p>
                                {result.alerts.map((alert, index) => (
                                    <p key={index} className={`p-3 rounded ${statusStyles.bg} transition duration-150 ${index === 0 ? 'font-semibold' : ''}`}>{alert}</p>
                                ))}
                            </div>

                            {/* Details */}
                             {result.details && (
                                <div className="mt-6 pt-4 border-t border-gray-700">
                                    <h4 className="text-lg font-semibold text-gray-200 mb-2">🔍 상세 위험 요인 분석:</h4>
                                    <p className="text-sm text-yellow-300">PII 민감도: {result.details.privacy}</p>
                                     <p className="text-sm text-yellow-300">지리적 복잡성: {result.details.geography}</p>
                                </div>
                            )}

                        </>
                    ) : (
                        <p className="text-gray-400 italic">진단 컨텍스트를 입력하고 버튼을 눌러 리스크 점수를 계산하세요.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default LiveRiskAlertModule;