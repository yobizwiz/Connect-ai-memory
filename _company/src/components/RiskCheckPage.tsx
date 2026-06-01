import React, { useState } from 'react';
import GlitchOverlay from './GlitchOverlay';
import PaywallModal from './PaywallModal';
import { getDesignTokens } from '../utils/designTokensLoader';

interface RiskCheckPageProps {}

/**
 * 리스크 점검 페이지 (Pre-Paywall Funneling Gate)
 * 사용자의 입력에 따라 L_totalMax 값을 계산하고, 최종적으로 Paywall을 강제 오버레이합니다.
 */
const RiskCheckPage: React.FC<RiskCheckPageProps> = () => {
    // 1. 상태 관리 (State Management)
    const [userInputText, setUserInputText] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [lTotalMax, setLTotalMax] = useState<number>(0);
    const [isPaywallVisible, setIsPaywallVisible] = useState<boolean>(false);

    // 2. 로직: 리스크 점수 계산 (가상 함수)
    const calculateRiskScore = (input: string): number => {
        // 실제로는 백엔드 API 호출이 필요하지만, 프로토타입을 위해 로컬 계산합니다.
        if (!input || input.length < 5) return Math.floor(Math.random() * 10); // 입력 부족 시 낮은 점수

        let score = 70; // Base Risk Score (Default)
        // 사용자가 긴 문장일수록, 혹은 특정 키워드를 포함할수록 리스크가 높다고 가정합니다.
        if (input.toLowerCase().includes('규제') || input.length > 50) {
            score += 20; // 규제/길이 기반 가중치 부여
        } else if (input.toLowerCase().includes('준수')) {
             // '준수' 같은 키워드는 사용자가 안심하고 있다고 착각하게 만듭니다.
             score -= 15; 
        }

        // 리스크 점수는 최소 30점에서 최대 120점 사이로 제한합니다.
        return Math.max(30, Math.min(120, score + Math.floor(Math.random() * 10) - 5));
    };


    // 3. 이벤트 핸들러: 진단 요청 처리 (Funnel Trigger)
    const handleDiagnosisRequest = async () => {
        if (!userInputText.trim()) {
            alert("⚠️ 분석을 위해 최소한의 내용을 입력해주세요.");
            return;
        }

        setIsLoading(true);
        // 가상 API 호출 지연 시간 설정 (사용자에게 기다림의 압박감을 줌)
        await new Promise((resolve) => setTimeout(resolve, 2000)); 

        const calculatedScore = calculateRiskScore(userInputText);
        setLTotalMax(calculatedScore);
        setIsLoading(false);

        // ★★★ 핵심 Funneling 로직 ★★★
        if (calculatedScore >= 75) {
            // 리스크 점수가 임계치(75점) 이상이면 Paywall을 강제 노출합니다.
            console.log(`[CODE_LOG] L_totalMax (${calculatedScore}) > Threshold. Triggering Paywall.`);
            setIsPaywallVisible(true);
        } else {
            // 점수가 낮으면, 다음 단계로 이동하는 가짜 메시지를 보여주고 모달은 띄우지 않습니다. (실패 경로)
             alert(`✅ 분석 완료: 현재 리스크 레벨 ${calculatedScore}. 추가 데이터 확보가 필요합니다.`);
        }
    };

    // Design Token 로딩 및 초기화 검증
    const tokens = getDesignTokens();
    const threatRed = tokens?.color['color-threat-red'] || '#C0392B';


    return (
        <div className="min-h-screen p-8 text-white" style={{ backgroundColor: '#1A1A1A' }}>
            {/* 1. Glitch Overlay는 가장 상위에 위치하여 모든 시각적 압박을 담당 */}
            <GlitchOverlay isVisible={isPaywallVisible} />

            {/* 2. 메인 콘텐츠 (Paywall이 오버레이되면 배경처럼 보이게 처리) */}
            {!isPaywallVisible && (
                <div className="relative z-10 max-w-4xl mx-auto py-16">
                    <header className="text-center mb-12">
                        <h1 className="text-5xl font-extrabold text-red-400 tracking-tight mb-3">
                            [yobizwiz] 구조적 리스크 진단 시스템
                        </h1>
                        <p className="text-xl text-gray-400">
                            당신의 비즈니스 모델에 잠재된 '미개방 책임(Uncovered Liability)'을 분석합니다.
                        </p>
                    </header>

                    {/* 리스크 입력 섹션 */}
                    <div className="bg-[#231818] p-8 rounded-xl shadow-2xl border border-gray-700">
                        <h2 className="text-3xl font-bold text-red-500 mb-6">
                            🔍 리스크 원인 설명 (진단 입력)
                        </h2>
                        <label htmlFor="risk-input" className="block text-sm font-medium text-gray-300 mb-2">
                            현재 비즈니스가 직면한 가장 큰 규제/시장 구조적 문제점은 무엇입니까? (구체적으로 작성할수록 정확합니다.)
                        </label>
                        <textarea
                            id="risk-input"
                            rows={8}
                            className="w-full p-4 mb-6 bg-[#100d0d] border border-gray-700 rounded-lg focus:ring-red-500 focus:border-red-500 placeholder-gray-600 text-white resize-none"
                            value={userInputText}
                            onChange={(e) => setUserInputText(e.target.value)}
                            placeholder="예시: 최근 강화된 개인정보보호법과 복잡해진 크로스보더 데이터 전송 규제 준수에 막대한 리소스가 필요합니다."
                        ></textarea>

                        {/* 실행 버튼 */}
                        <button
                            onClick={handleDiagnosisRequest}
                            disabled={isLoading || userInputText.length < 10}
                            className={`w-full py-3 px-6 rounded-lg text-xl font-bold transition duration-300 ${
                                isLoading ? 'bg-gray-600 cursor-not-allowed' : 'hover:bg-red-800 shadow-red-900/50'} `
                            }
                            style={{ 
                                backgroundColor: userInputText.length < 10 ? '#3d2c2c' : `${threatRed}`, 
                                color: 'white',
                                border: `2px solid ${threatRed}`
                            }}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-80" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    진단 분석 중... (시스템 검증 중)
                                </div>
                            ) : '➡️ 진단 리포트 요청하기 (L_totalMax 계산)'}
                        </button>

                    </div>

                    {/* 결과 표시 영역 */}
                    <div className="mt-16 p-8 bg-[#231818] rounded-xl shadow-inner border border-gray-700">
                        <h2 className="text-2xl font-bold text-red-400 mb-4">진단 요약</h2>
                        <p className={`text-lg ${lTotalMax >= 75 ? 'text-yellow-300' : 'text-green-300'}`}>
                            현재 임시 계산된 $L_{totalMax}$ (미개방 책임 리스크 점수): <span class="font-mono text-2xl ml-2">${lTotalMax}</span> / 120점
                        </p>
                        <p className="mt-4 text-gray-400">
                            (이 수치는 내부 알고리즘과 현재의 시장 데이터를 기반으로 실시간 산출됩니다. 정확한 진단은 유료 리포트를 통해 확인 가능합니다.)
                        </p>
                    </div>
                </div>
            )}

            {/* 3. Paywall Modal (강제 오버레이) */}
            <PaywallModal 
                isVisible={isPaywallVisible} 
                onClose={() => { /* 실제로는 사용자가 닫을 수 없게 설계 */ }}
            />
        </div>
    );
};

export default RiskCheckPage;