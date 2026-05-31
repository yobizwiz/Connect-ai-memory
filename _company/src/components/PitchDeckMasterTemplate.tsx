// src/components/PitchDeckMasterTemplate.tsx
import React, { useState, useEffect } from 'react';
import { fetchSystemicRiskAnalysis, PitchDeckState, generatePaywallCopy } from '../api/riskService';

/** @type {typeof import('../api/riskService').RiskScoreResult} */
interface RiskScoreResult {
    treScore: number;
    isCritical: boolean;
    reportData: Record<string, any>;
}

// --- State I: Calm Deception (안심) ---
const StateCalmDeception = ({ result }: { result: RiskScoreResult }) => (
    <div className="p-8 bg-[#1a202c] text-white shadow-lg transition duration-500">
        <h1 className="text-4xl font-extrabold mb-4 text-blue-400">[SYSTEM ANALYSIS REPORT]</h1>
        <p className="text-xl mb-6 text-gray-300">안녕하십니까. 오늘 저희는 귀사의 '성장'에 대해 이야기하는 자리가 아닙니다.</p>
        <div className="bg-[#2d3748] p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold text-yellow-400">[DATA SOURCE: TARS]</h2>
            <p className="mt-2 text-gray-200">현재까지 분석된 리스크 점수는 <span className="font-mono text-lg">{result.treScore}점</span>으로 측정되었습니다.</p>
        </div>
        <p className="text-lg mb-4 border-l-4 border-yellow-500 pl-3 italic">
            "우리는 지금, 귀사가 인지하고 있지만 아직 측정하지 못한, 시스템적 생존의 취약점에 대해 논해야 합니다."
        </p>
    </div>
);

// --- State II: Warning Alert (경고) ---
const StateWarningAlert = ({ result }: { result: RiskScoreResult }) => (
    <div className="relative p-8 bg-[#3a1d1d] text-white shadow-2xl border-4 border-red-600 transition duration-500 animate-pulse">
        {/* Glitch Effect Mock */}
        <div className="absolute inset-0 pointer-events-none opacity-20 [mask-image:linear-gradient(to_right,transparent,white,transparent)] animate-shimmer"></div>
        
        <h1 className="text-5xl font-black mb-4 text-red-400">[!!! SYSTEM ALERT !!!]</h1>
        <p className="text-2xl mb-6 text-gray-100">⚠️ 경고: 데이터 흐름에 측정되지 않은 사각지대가 존재합니다.</p>
        
        <div className="bg-[#5e3c3c] p-4 rounded-lg mb-8 flex justify-between items-center">
            <div>
                <p className="text-xl text-yellow-200">추정 시간 손실액: <span className="font-mono text-3xl">{result.reportData?.timeLossEstimateHrs}시간 이상</span></p>
                <p className="text-sm mt-1 text-red-300">이 사각지대는 시간이 지남에 따라 기하급수적으로 증가합니다.</p>
            </div>
            <div className="text-right">
                 {/* Countdown Timer Mock */}
                <div className="text-4xl font-mono bg-black px-6 py-2 rounded-md border-2 border-red-700">
                    [TIME REMAINING]: 05:00:<span className='text-green-300'>00</span>
                </div>
            </div>
        </div>
        <p className="text-lg italic text-red-200">"이 사각지대를 방치하는 것은 단순한 보안 문제가 아닙니다. 이것은 시간에 따른 재정적 파산을 의미합니다."</p>
    </div>
);

// --- State III: Paywall Barrier (결제 장벽) ---
const StatePaywallBarrier = ({ copy }: { copy: string }) => (
    <div className="relative p-16 bg-black text-white border-8 border-red-900 shadow-[0_0_50px_rgba(255,0,0,0.7)] animate-zoomIn">
        {/* Glitch Effect Mock */}
        <div className="absolute inset-0 pointer-events-none opacity-40 [mask-image:linear-gradient(to_right,transparent,white,transparent)] animate-shimmer delay-50"></div>

        <h1 className="text-7xl font-black mb-8 text-red-500 tracking-wider uppercase">{`🚨 ${PitchDeckState.PAYWALL_BARRIER}`}{' '}</h1>
        
        {/* 핵심 메시지 */}
        <div className="p-6 bg-[#330000] border-l-8 border-red-500 mb-10 shadow-inner">
            <h2 className="text-4xl font-bold text-white mb-3">{`[MANDATE]`}{' '}</h2>
            <p className="text-2xl italic text-gray-200">{copy}</p>
        </div>

        {/* CTA Mock */}
        <button className="px-12 py-4 text-xl font-bold uppercase tracking-widest bg-red-600 hover:bg-red-700 transition duration-300 shadow-lg transform hover:scale-[1.02]">
            즉시 보안 패키지 구독하기 (Paywall Access)
        </button>
    </div>
);


/**
 * 메인 컴포넌트: 스토리 전이 로직을 담당합니다.
 */
const PitchDeckMasterTemplate = () => {
    // 1. State 및 초기값 설정
    const [result, setResult] = useState<RiskScoreResult | null>(null);
    const [currentState, setCurrentState] = useState<PitchDeckState>(PitchDeckState.CALM_DECEPTION);
    const [isLoading, setIsLoading] = useState(true);

    // 2. API 호출 및 상태 전환 로직 (useEffect)
    useEffect(() => {
        // Mock 입력 데이터 설정: 리스크가 높게 나오도록 강제 시뮬레이션
        const mockInputData = {
            hasRegulatoryGap: true, // 규제 사각지대 존재 가정
            dataVolume: 150,       // 높은 데이터 볼륨 가정 (임계치 초과 유도)
        };

        const loadAnalysis = async () => {
            setIsLoading(true);
            try {
                // API 호출 시뮬레이션 (2초 지연)
                await new Promise(resolve => setTimeout(resolve, 2000));
                const analysisResult = await fetchSystemicRiskAnalysis(mockInputData);
                setResult(analysisResult);

                // 상태 머신 로직 실행: TRE 점수에 따라 다음 스테이지 결정
                if (analysisResult.isCritical) {
                    setCurrentState(PitchDeckState.PAYWALL_BARRIER);
                } else if (analysisResult.treScore >= 40) { // 예시 임계치: Warning 시작점
                    setCurrentState(PitchDeckState.WARNING_ALERT);
                } else {
                    setCurrentState(PitchDeckState.CALM_DECEPTION);
                }

            } catch (error) {
                console.error("Failed to load risk analysis:", error);
                // 에러 발생 시 안전한 기본 상태로 폴백 (Defensive Coding)
                setResult({ treScore: 0, isCritical: false, reportData: {} });
                setCurrentState(PitchDeckState.CALM_DECEPTION);
            } finally {
                setIsLoading(false);
            }
        };

        loadAnalysis();
    }, []); // 컴포넌트 마운트 시 단 1회 실행

    // 3. 최종 렌더링 로직 (Switch Statement)
    const renderContent = () => {
        if (isLoading) {
            return <div className="p-20 text-center text-xl font-mono animate-pulse">⚙️ 시스템 진단 중... 리스크 분석을 수행합니다.</div>;
        }

        switch (currentState) {
            case PitchDeckState.CALM_DECEPTION:
                if (!result) return <div>Error: No risk result available.</div>;
                return <StateCalmDeception result={result} />;

            case PitchDeckState.WARNING_ALERT:
                if (!result) return <div>Error: Cannot render warning state.</div>;
                // 경고 단계에서는 시간/리소스를 보여주는 것이 중요함
                return <StateWarningAlert result={result} />;

            case PitchDeckState.PAYWALL_BARRIER:
                if (!result) {
                    console.error("Critical failure: Cannot generate paywall copy.");
                    return <div>Error: Missing risk data for Paywall activation.</div>;
                }
                // 강제 전환 시, API로 계산된 값을 사용해 카피 생성 (Mock 활용)
                const requiredCopy = generatePaywallCopy(result.treScore, result.reportData?.timeLossEstimateHrs || 1);
                return <StatePaywallBarrier copy={requiredCopy} />;

            default:
                return <div className="p-20 text-center">Unknown State</div>;
        }
    };


    return (
        <div className="min-h-screen bg-[#0d0d1a] p-8 font-sans">
            <header className="text-center mb-12 pt-4">
                <h1 className="text-5xl font-black text-white tracking-wide">yobizwiz | 시스템적 리스크 진단 콘솔</h1>
                <p className="text-xl mt-2 text-gray-400 border-b pb-3 max-w-3xl mx-auto">
                    [Purpose] 구조적 재무 손실을 인지시키고, 필수적인 해결책(Paywall)으로 유도합니다.
                </p>
            </header>

            {/* 실제 컨텐츠 영역 */}
            <div className="max-w-4xl mx-auto shadow-2xl rounded-lg bg-[#0a0a15] border border-gray-800">
                {renderContent()}
            </div>
        </div>
    );
};

export default PitchDeckMasterTemplate;