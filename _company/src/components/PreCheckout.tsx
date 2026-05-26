import React, { useState, useCallback } from 'react';
import styles from '../styles/RedZoneStyles.module.css';

// 🚨 Writer 제공 핵심 경고 문구 (사용자에게 강제 노출)
const WARNING_MESSAGE = "⚠️ [경고: 시스템 구조적 리스크 감지] 당신의 현재 데이터 흐름은 미검증 상태입니다. 이대로 진행할 경우, 법규 준수(Compliance) 실패로 인한 $10M~$50M 규모의 재정적 손실이 발생할 수 있습니다. 반드시 'QLoss 진단 보고서'를 통해 취약점을 해소해야 합니다.";

// 🚀 가상 API 호출 시뮬레이션 (추적 및 로직 실행)
const trackEvent = async (eventName: string, data: Record<string, any>) => {
    console.log(`[TRACKING HOOK] Sending event: ${eventName}`, data);
    // 실제 환경에서는 Fetch API를 사용하여 서버 엔드포인트로 전송해야 합니다.
    await new Promise(resolve => setTimeout(resolve, 300)); // 네트워크 지연 시뮬레이션
};

interface PreCheckoutProps {
    initialRiskScore: number; // 초기 리스크 점수 (0-10)
}

const PreCheckout: React.FC<PreCheckoutProps> = ({ initialRiskScore }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAcknowledged, setIsAcknowledged] = useState(false);
    const [currentRiskScore, setCurrentRiskScore] = useState(initialRiskScore);

    // 1. 컴포넌트 마운트 시 실행되는 초기 로직 (진입 추적)
    React.useEffect(() => {
        trackEvent('checkout_page_view', { risk_score: initialRiskScore });
        
        // 데이터 분석 중임을 보여주기 위해 로딩 상태를 유지
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 3000); // 시스템적 분석 시간 압박 (Time Pressure) 시뮬레이션

        return () => clearTimeout(timer);
    }, []);

    // 2. 사용자가 경고를 인지했을 때의 핸들러
    const handleAcknowledgeRisk = useCallback(() => {
        setIsAcknowledged(true);
        trackEvent('risk_acknowledged', { score: currentRiskScore });
    }, [currentRiskScore]);

    // 3. 결제 버튼 클릭 시 최종 로직 및 추적 (최종 이탈 방지)
    const handleProceedToPayment = async () => {
        if (!isAcknowledged) {
            alert("⚠️ 경고! 구조적 리스크에 대한 인지 승인이 필요합니다. 위 안내문을 먼저 읽어주십시오.");
            return;
        }

        // 최종 결제 전 트랜잭션 로직 실행 및 추적
        setIsLoading(true);
        trackEvent('checkout_attempt', { final_score: currentRiskScore });

        // 가상 서버 요청 (Payment Gateway Simulation)
        await new Promise(resolve => setTimeout(resolve, 2000)); // 결제 처리 지연 시뮬레이션

        alert(`✅ 트랜잭션 성공! 구조적 리스크 진단 보고서 구매가 완료되었습니다. (${currentRiskScore} 점 만점 대비 ${Math.max(0, currentRiskScore - 1)}점으로 하락 예상)`);
        trackEvent('purchase_complete', { final_score: Math.max(0, currentRiskScore - 1) });
    };

    if (isLoading) {
        return <div className={styles.redZoneContainer} style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h2 className="glitchText">시스템 분석 중... 잠시만 기다려 주십시오.</h2>
            <p>구조적 취약점 진단 리포트 생성을 위해 서버 연동 및 데이터 무결성 검증을 진행합니다.</p>
        </div>;
    }

    return (
        <div className={styles.redZoneContainer}>
            {/* 🚨 노이즈 오버레이는 CSS Module에서 처리 */}
            <div className="max-w-4xl mx-auto p-10 text-white relative z-20">
                
                <h1 className="text-5xl font-extrabold mb-6 glitchText">구조적 생존 위협 경고: QLoss v2.0</h1>
                
                {/* 🚨 필수 인지 단계 */}
                {!isAcknowledged ? (
                    <div className="bg-[#4d0000] p-6 border-l-8 border-red-500 mb-8 shadow-2xl">
                        <p className="text-lg font-semibold text-yellow-300 mb-2">🚨 중요 안내: 진행 전 필수 확인 사항 🚨</p>
                        <p className={`text-xl ${styles.glitchText}`}>{WARNING_MESSAGE}</p>
                        <button 
                            onClick={handleAcknowledgeRisk} 
                            className="mt-6 bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-8 rounded transition duration-200 cursor-pointer"
                        >
                            ✅ 구조적 리스크 인지 및 동의 (다음 단계 진행)
                        </button>
                    </div>
                ) : (
                    /* 🛡️ 결제 직전 섹션 */
                    <div>
                        <h2 className="text-3xl font-bold mb-4">최종 진단 보고서 구매</h2>
                        <p className="mb-8 text-lg">당신의 구조적 취약점 점수: <span className="text-yellow-400 text-2xl">{currentRiskScore}</span> / 10</p>

                        <div className="bg-[#6a0000] p-8 rounded-lg shadow-inner mb-10">
                            <h3 className="text-2xl font-bold mb-4">보험 상품: Compliance Gatekeeper Pro</h3>
                            <p className="text-xl mb-4">구매 시 리스크 점수는 즉시 <span className="text-green-300 text-2xl">{Math.max(0, currentRiskScore - 1)}</span>점으로 하락할 것으로 예측됩니다.</p>
                            <div className="flex justify-between items-center pt-4 border-t border-red-700">
                                <span className="text-3xl font-bold">가격: $999 (One-Time)</span>
                                <button 
                                    onClick={handleProceedToPayment} 
                                    disabled={isLoading}
                                    className={`py-4 px-12 text-white font-extrabold rounded transition duration-300 ${isLoading ? 'bg-gray-500 cursor-not-allowed' : 'hover:bg-red-900 bg-red-700 shadow-lg'}`}
                                >
                                    {isLoading ? '진단 보고서 전송 중...' : '지금 바로 구매하고 리스크 해소'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default PreCheckout;