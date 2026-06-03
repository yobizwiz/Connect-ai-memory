/**
 * components/ThreatGauge/ThreatGauge.tsx
 * @description 핵심 위협 게이지 및 인터랙티브 결제 배리어 모달 구현 (React/Next.js)
 */
import React, { useState, useEffect, useCallback } from 'react';
import { ThreatGaugeProps, TREScore, GaugeState } from './types';
import { useScrollLogger } from '@/utils/useScrollLogger';

// 🎨 CSS Glitch Noise Class (CSS Module 또는 Global Styles에 정의 필요)
const GLITCH_CLASS = "animate-glitch"; 

/**
 * Mock API Call: 외부에서 점수를 받아오는 시뮬레이션 함수.
 * @returns {Promise<TREScore>} 무작위로 생성된 리스크 점수
 */
const mockApiCall = async (): Promise<TREScore> => {
    console.log("⚙️ [API] External Risk Data Fetching...");
    await new Promise(resolve => setTimeout(resolve, 800)); // 네트워크 지연 시뮬레이션
    // Mock data: 랜덤하게 점수를 생성하여 테스트 커버리지를 확보합니다.
    return Math.floor(Math.random() * (100 - 30 + 1)) + 30; // 최소 30점, 최대 100점 범위 설정
};


/**
 * 메인 게이지 컴포넌트. 점수에 따라 시각적 경고와 결제 유도 흐름을 관리합니다.
 */
const ThreatGauge: React.FC<ThreatGaugeProps> = ({ initialScore, onDiagnosisRequested }) => {
    // 1. 상태 관리: 현재 점수, 로딩 상태, 모달 열림 상태
    const [currentScore, setCurrentScore] = useState<TREScore>(initialScore);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 2. 스크롤 로거 통합 (A/B 테스트 로직)
    useScrollLogger([
        { top: 400, bottom: 600 }, // 첫 번째 어텐션 포인트
        { top: 1200, bottom: 1500 } // 두 번째 어텐션 포인트
    ]);

    // 점수 계산 및 게이지 상태 정의 (Defensive Logic)
    const getGaugeState = useCallback((score: TREScore): GaugeState => {
        if (score >= 80) return GaugeState.CRITICAL;
        if (score >= 50) return GaugeState.WARNING;
        return GaugeState.NORMAL;
    }, []);

    // 3. 점수 업데이트 핸들러 (가장 중요한 비즈니스 로직)
    const handleScoreUpdate = async () => {
        setIsLoading(true);
        try {
            // 모의 API 호출을 통해 새로운 리스크 점수를 가져옵니다.
            const newScore: TREScore = await mockApiCall();
            setCurrentScore(newScore);

            if (newScore >= 80) {
                console.warn(`🚨 CRITICAL RISK DETECTED! Score=${newScore}. Triggering paywall logic.`);
            } else {
                 console.info(`✅ Risk Check Complete. Current Score: ${newScore}`);
            }

        } catch (error) {
            console.error("❌ Failed to fetch risk score:", error);
            // 에러 발생 시 폴백(Fallback) 로직 수행: 점수를 0으로 초기화하거나, 마지막 값 유지
            setCurrentScore(Math.max(currentScore, 10)); // 최악의 경우 최소한의 경고 수준 유지
        } finally {
            setIsLoading(false);
        }
    };

    // 컴포넌트 마운트 시점에 점수 업데이트 실행 (초기 로딩 경험 제공)
    useEffect(() => {
        handleScoreUpdate(); 
    }, []);


    // 4. 결제 모달 관련 핸들러 및 최종 CTA 로직
    const handleDiagnosisRequest = () => {
        if (currentScore >= 80) { // Critical Zone일 때만 진단 요청을 허용한다고 가정
            onDiagnosisRequested(currentScore);
            setIsModalOpen(true);
        } else {
            alert("⚠️ 리스크가 임계치에 도달하지 않아, 지금은 '진단 요청' 버튼이 비활성화되었습니다. 더 많은 데이터를 수집하세요.");
        }
    };

    // 5. JSX 렌더링 (시각적 표현)
    const gaugeState = getGaugeState(currentScore);
    const isCritical = gaugeState === GaugeState.CRITICAL;

    return (
        <div className="p-8 max-w-4xl mx-auto bg-[#1A1A1A] rounded-xl shadow-2xl text-white border border-red-900/50">
            <h2 className="text-3xl font-mono text-red-500 mb-6 tracking-wider uppercase">
                System Integrity Audit Console [Yobizwiz]
            </h2>

            {/* Threat Gauge Display */}
            <div className={`relative h-8 w-full rounded-full overflow-hidden ${isCritical ? GLITCH_CLASS : ''}`}>
                {/* Background/Max Risk Visualization */}
                <div 
                    className="absolute top-0 left-0 right-0 h-full bg-[#333] opacity-50 pointer-events-none"
                ></div>
                
                {/* Fill Bar (Core Logic) */}
                <div 
                    style={{ width: `${currentScore}%` }}
                    className={`h-full transition-all duration-1000 ease-out ${getGaugeColorClass(gaugeState)}`}
                ></div>

                {/* Score Overlay */}
                <div className="absolute inset-y-0 flex items-center justify-start pl-4">
                    <span className={`text-5xl font-mono tracking-widest transition-colors duration-300 ${getScoreColor(gaugeState)}`}>
                        {currentScore.toFixed(1)} <span className="text-2xl text-red-600">%</span>
                    </span>
                </div>
            </div>

            {/* Status Report */}
            <div className="mt-8 p-4 bg-[#2c2c2c] rounded-lg border-l-4 border-red-700">
                <p className="text-sm text-gray-300 mb-1">Current Risk State: <span className={`font-bold uppercase ${getStateTextColor(gaugeState)}`}>{Object.values(GaugeState).find(s => s === gaugeState)}</span></p>
                <p className="text-xs text-red-400 mt-2">🚨 Warning: 데이터는 시뮬레이션되었으며, 실제 금융 거래가 아닌 '잠재적 리스크' 점수입니다. </p>
            </div>

            {/* Controls */}
            <div className="mt-10 flex justify-between items-center">
                <button 
                    onClick={handleScoreUpdate} 
                    disabled={isLoading}
                    className={`px-6 py-3 rounded-md font-bold transition duration-200 ${isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-700 hover:bg-red-800'} text-white`}
                >
                    {isLoading ? (<span>⚙️ 재분석 중...</span>) : ('🔄 리스크 점수 재검증')}
                </button>

                <button 
                    onClick={handleDiagnosisRequest} 
                    disabled={currentScore < 80 || isLoading} // 임계치 조건 적용
                    className={`px-8 py-3 rounded-md font-bold transition duration-200 ${currentScore >= 80 && !isLoading ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 cursor-not-allowed'} text-white`}
                >
                    {currentScore >= 80 && !isLoading ? "⚠️ Diagnosis Request (결제 필요)" : "데이터 부족: 임계치 미도달"}
                </button>
            </div>

             {/* Modal Placeholder */}
            {isModalOpen && <PaywallModal score={currentScore} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};


// --- Helper Components & Styles (가독성을 위해 분리) ---

/** 게이지 상태에 따른 색상 및 텍스트 스타일링 */
const getGaugeColorClass = (state: GaugeState): string => {
    switch (state) {
        case GaugeState.NORMAL: return 'bg-teal-500/70'; // Greenish-Teal
        case GaugeState.WARNING: return 'bg-yellow-500/80'; // Yellow Warning
        case GaugeState.CRITICAL: return 'bg-red-600/95 ring-4 ring-red-300'; // Deep Red, Glitch Ready
    }
};

const getScoreColor = (state: GaugeState): string => {
     switch (state) {
        case GaugeState.NORMAL: return 'text-teal-400';
        case GaugeState.WARNING: return 'text-yellow-400';
        case GaugeState.CRITICAL: return 'text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]'; // Glow effect for critical
    }
};

const getStateTextColor = (state: GaugeState): string => {
     switch (state) {
        case GaugeState.NORMAL: return 'text-teal-400';
        case GaugeState.WARNING: return 'text-yellow-400';
        case GaugeState.CRITICAL: return 'text-red-500';
    }
};

/**
 * Paywall 모달 컴포넌트 (결제 배리어)
 */
const PaywallModal: React.FC<{ score: TREScore; onClose: () => void }> = ({ score, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A1A1A] border-2 border-red-600 shadow-[0_0_30px_rgba(255,0,0,0.9)] w-full max-w-md p-8 rounded-lg animate-in zoom-in duration-300">
                <h3 className="text-4xl font-mono text-red-500 mb-4 uppercase tracking-wider border-b pb-2 border-red-700">
                    🔒 Access Restricted: Critical Alert
                </h3>
                <p className="text-gray-300 mb-6">
                    현재 리스크 점수 ({score.toFixed(1)})는 운영 중단({"$L_{max}$"}) 수준입니다. 이 데이터를 통해 안전성을 확보하려면 <span className="font-bold text-yellow-400">yobizwiz Authority Blue</span> 솔루션이 필수적입니다.
                </p>
                <div className="space-y-4 mb-8">
                    <button 
                        onClick={() => { console.log("Payment processed for Critical Access."); onClose(); }}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 transition font-bold text-lg rounded-md"
                    >
                        ✅ Diagnosis Report 접근 (Subscription $X,XXX)
                    </button>
                     <button 
                        onClick={onClose}
                        className="w-full py-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] transition font-bold text-sm rounded-md"
                    >
                        취소 및 로비 페이지로 복귀
                </button>
                </div>
            </div>
        </div>
    );
};


// --- Exported Component (최종 사용) ---

const WrappedThreatGauge: React.FC = () => {
    const [mockScore, setMockScore] = useState<TREScore>(45); // 초기 점수 설정
    
    const handleDiagnosisRequest = useCallback((score: TREScore) => {
        console.log(`[SUCCESS] User requested diagnosis at score ${score}. Initiating checkout flow.`);
    }, []);

    return (
        <div className="min-h-screen bg-[#0f172a] pt-12">
            {/* Tailwind CSS/Global Styles에 다음 애니메이션 정의 필수 */}
            <style global jsx>{`
                @keyframes glitch {
                    0%, 18%, 22%, 25%, 53%, 58%, 62%, 72%, 97% {
                        text-shadow: 0.06em -0.06em #f7d;
                        transform: translate(-1px, -1px);
                    }
                    20%, 24%, 55%, 60%, 70% {
                        text-shadow: 0.3em 0.3em #f7d, -0.3em -0.3em #d7f;
                        transform: translate(1px, 1px);
                    }
                }
                .animate-glitch {
                    animation: glitch 2s infinite alternate linear;
                }
            `}</style>

            <ThreatGauge 
                initialScore={mockScore} 
                onDiagnosisRequested={handleDiagnosisRequest} 
            />
        </div>
    );
};


export default WrappedThreatGauge;