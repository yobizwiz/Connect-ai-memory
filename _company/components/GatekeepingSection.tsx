import React, { useState, useEffect, useCallback } from 'react';

// --- Mock API & Constants ---
const INITIAL_BASE_RISK = 1000; // 초기 베이스 리스크 (기준 금액)
const TIME_DECAY_RATE = 1000;   // 매 초당 $1,000 증가
const INTERACTIVE_BOOST = 5000; // 인터랙티브 클릭 시 추가되는 리스크

// Mock API call to simulate server analysis time and risk calculation
const simulateAnalysisApi = (initialRisk: number): Promise<{ finalQLossAmount: number; riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'; message: string }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            // Mock Logic: 리스크 레벨을 결정하고 최종 QLoss를 계산
            const finalQLoss = initialRisk + Math.floor(Math.random() * 5000); // 약간의 무작위성 추가
            let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
            let message: string;

            if (finalQLoss < 10000) {
                riskLevel = 'LOW';
                message = "현재 리스크 수준은 관리가 가능합니다. 하지만 잠재적 위험을 간과해서는 안 됩니다.";
            } else if (finalQLoss >= 10000 && finalQLoss < 50000) {
                riskLevel = 'MEDIUM';
                message = "시스템 무결성 검토가 필요합니다. 적절한 외부 컨설팅이 필수적입니다.";
            } else {
                riskLevel = 'HIGH';
                message = "🚨 경고: 시스템 생존 위협 수준에 도달했습니다. 즉각적인 전문 개입이 요구됩니다.";
            }

            resolve({ finalQLossAmount: finalQLoss, riskLevel: riskLevel, message: message });
        }, 3000); // 3초 지연 (시간적 압박)
    });
};


// --- Component Definition ---
interface RiskItem {
    id: number;
    title: string;
    description: string;
    riskValue: number; // 이 항목이 클릭되었을 때 추가되는 리스크 값
}

const initialRisks: RiskItem[] = [
    { id: 1, title: "규제 준수 실패 위험", description: "미준수 법규로 인한 패널티 발생 가능성.", riskValue: 3000 },
    { id: 2, title: "데이터 파편화 리스크", description: "분산된 데이터 구조로 인해 분석 지연 및 오류 발생.", riskValue: 4500 },
    { id: 3, title: "시스템적 무지 위험", description: "위험 요인을 인지하지 못하여 치명적인 결정을 내림.", riskValue: 7000 }, // 가장 높은 가중치
];

const GatekeepingSection: React.FC = () => {
    // State for QLoss Tracking (시간적/상호작용 리스크)
    const [currentQLoss, setCurrentQLoss] = useState<number>(INITIAL_BASE_RISK);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [analysisResult, setAnalysisResult] = useState<{ finalQLossAmount: number; riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'; message: string } | null>(null);

    // ⚙️ Time Decay Logic (핵심 구현)
    useEffect(() => {
        // QLoss를 매 초마다 강제 증가시키는 타이머 설정
        const timer = setInterval(() => {
            setCurrentQLoss(prev => prev + TIME_DECAY_RATE);
        }, 1000);

        // Cleanup function: 컴포넌트 언마운트 시 인터벌 제거 (메모리 누수 방지)
        return () => clearInterval(timer);
    }, []);


    // ⚡ Interactive Click Handler
    const handleRiskClick = useCallback((riskItem: RiskItem) => {
        if (isLoading) return; // 로딩 중이면 클릭 무시

        // QLoss를 즉시 증가시키고, 시각적 피드백을 주는 것이 핵심
        setCurrentQLoss(prev => prev + riskItem.riskValue);
        alert(`🚨 경고! '${riskItem.title}' 리스크가 감지되어 $${riskItem.riskValue.toLocaleString()}의 잠재적 손실액이 즉시 추가되었습니다.`);

    }, [isLoading]);


    // 🚀 Analysis Submission Handler (클릭 시 최종 분석 실행)
    const handleAnalyzeSubmit = async () => {
        if (isLoading || currentQLoss === INITIAL_BASE_RISK) return; // 초기값일 경우 제출 방지

        setIsLoading(true);
        setAnalysisResult(null);

        // 1. QLoss를 기준으로 최종 API 호출 시뮬레이션 실행
        const finalRiskPayload = await simulateAnalysisApi(currentQLoss);

        // 2. 결과 상태 업데이트 및 로딩 종료
        setAnalysisResult(finalRiskPayload);
        setIsLoading(false);
    };


    // --- UI Helper Functions ---
    const getRedZoneStyles = (level: 'LOW' | 'MEDIUM' | 'HIGH'): React.CSSProperties => {
        switch (level) {
            case 'LOW':
                return { color: '#27AE60', backgroundColor: '#E8F8F5' }; // Green/Low Threat
            case 'MEDIUM':
                return { color: '#E67E22', backgroundColor: '#FEECB9' }; // Orange/Warning
            case 'HIGH':
                return { color: '#C0392B', backgroundColor: '#FADBD8', border: '3px solid #C0392B' }; // Red/System Failure
            default:
                return {};
        }
    };

    const currentRiskLevel = analysisResult ? analysisResult.riskLevel : 'LOW';
    const lossStyle = getRedZoneStyles(currentRiskLevel);


    return (
        <section className="py-20 bg-gray-50" id="gatekeeping">
            <div className="container mx-auto max-w-6xl px-4 text-center">
                <h2 className="text-4xl font-extrabold mb-4 text-gray-900">
                    🛑 게이트키핑: 시스템적 무지 검증 구간
                </h2>
                <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
                    지금 바로 당신의 잠재적인 리스크를 진단하세요. 시간은 흐르고, 손실액($QLoss$)은 강제적으로 증가합니다.
                </p>

                {/* 💰 QLoss Display Area (핵심 시각화) */}
                <div className="bg-gray-900 p-8 rounded-xl shadow-2xl mb-16 border-b-4" style={{ borderColor: '#C0392B' }}>
                    <p className="text-sm uppercase tracking-widest text-red-400 font-mono mb-2">Current Detected Loss ($QLoss$)</p>
                    <h3 className="text-7xl font-black tracking-tighter text-white transition duration-500 ease-out" 
                        style={{ color: lossStyle.color }}>
                        ${currentQLoss.toLocaleString('en-US')}
                    </h3>
                    <p className="mt-2 text-gray-400">이 금액은 현재까지 감지된 모든 잠재적 손실의 누적액입니다.</p>
                </div>

                {/* 🚨 리스크 클릭 상호작용 영역 */}
                <div className="mb-16 p-8 bg-white rounded-lg shadow-inner border border-gray-200">
                    <h3 className="text-2xl font-bold text-red-700 mb-4 flex items-center justify-center">
                        <span role="img" aria-label="경고">⚠️</span> 주요 리스크 항목 진단 (클릭 시 QLoss 증가)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {initialRisks.map(risk => (
                            <button 
                                key={risk.id}
                                onClick={() => handleRiskClick(risk)}
                                disabled={isLoading}
                                className={`p-6 rounded-xl shadow-md text-left transition duration-300 transform hover:scale-[1.02] ${isLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-50 hover:bg-red-100 border-l-4 border-red-600'}
                                text-gray-800`}
                            >
                                <h4 className="text-xl font-bold mb-2">{risk.title}</h4>
                                <p className="text-sm text-gray-600 mb-3">{risk.description}</p>
                                <div className={`inline-block px-3 py-1 text-xs font-semibold rounded ${isLoading ? 'bg-red-400' : 'bg-red-200'} text-red-800`}>
                                    추가 리스크 가중치: ${risk.riskValue.toLocaleString()}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 📊 최종 분석 및 CTA 영역 */}
                <div className="bg-white p-10 rounded-xl shadow-2xl border-t-8" style={{ borderColor: '#2980B9' }}>
                    <h3 className="text-3xl font-bold text-gray-800 mb-6">시스템 무결성 최종 분석</h3>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#C0392B]"></div>
                            <p className="mt-4 text-lg text-gray-600">시스템 분석 중... (시간적 압박)</p>
                        </div>
                    ) : analysisResult ? (
                        // ✅ Analysis Result Display
                        <div className={`p-8 rounded-xl shadow-inner border-l-8 transition duration-500 ${analysisResult.riskLevel === 'HIGH' ? 'border-red-600 bg-red-50' : 'border-blue-600 bg-blue-50'}`}>
                            <h4 className="text-2xl font-bold mb-3 text-gray-800">✅ 진단 완료: 리스크 레벨 {analysisResult.riskLevel}</h4>
                            <p className={`text-lg font-semibold ${analysisResult.riskLevel === 'HIGH' ? 'text-red-700' : 'text-blue-700'}`}>
                                {analysisResult.message}
                            </p>
                            <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                                💡 최종 분석 요약: 현재 $QLoss$는 ${analysisResult.finalQLossAmount.toLocaleString()}이며, 이는 즉각적인 전문가 개입 없이는 시스템의 생존을 위협합니다.
                            </div>
                        </div>
                    ) : (
                         // 초기 상태 안내 메시지
                        <p className="text-gray-500 text-lg">위 리스크 항목들을 클릭하여 현재 QLoss를 누적시키고, 최종 분석을 진행해 주세요.</p>
                    )}

                    {/* 👑 Primary CTA - 필수 통합 컨설팅 */}
                    <button 
                        onClick={handleAnalyzeSubmit}
                        disabled={isLoading || currentQLoss === INITIAL_BASE_RISK}
                        className={`w-full py-4 text-xl font-bold rounded-lg transition duration-300 ${
                            isLoading ? 'bg-gray-400 cursor-not-allowed' : 
                            (currentRiskLevel === 'HIGH' ? 'bg-[#C0392B] hover:bg-[#A93226]' : 
                            (currentRiskLevel === 'MEDIUM' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-[#2980B9] hover:bg-blue-700'))
                        } text-white shadow-lg transform active:scale-[0.98]`}
                    >
                        {isLoading ? '시스템 분석을 진행 중입니다...' : '필수 통합 컨설팅 신청 (Setup Consulting) ⚙️'}
                    </button>

                </div>
            </div>
        </section>
    );
};

export default GatekeepingSection;