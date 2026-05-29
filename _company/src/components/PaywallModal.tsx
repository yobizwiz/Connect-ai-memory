import React, { useState, useEffect, useCallback } from 'react';
import { logAttentionData } from '../services/trackingService'; // 👈 분리된 서비스 사용

// --- [Type Definitions] ---
type PaywallState = 'INITIAL' | 'ALERTING' | 'ATTENTION_TRACKING' | 'VALIDATING' | 'SUCCESS';

interface ModalProps {
    initialRiskScore: number; // 진단 요청 시 초기 $TRE$ 점수
}

const PaywallModal: React.FC<ModalProps> = ({ initialRiskScore }) => {
    // State Machine 관리 (AWAITING_INPUT -> ALERTING -> ATTENTION_TRACKING...)
    const [state, setState] = useState<PaywallState>('INITIAL'); 
    const [isAgreedLegalTerms, setIsAgreedLegalTerms] = useState(false); // 필수 체크박스 상태

    // --- [1. State Transition Handlers] ---

    /**
     * 진단 요청 버튼 클릭 시 호출되는 핵심 로직 (Requirement 1: State Machine Trigger)
     */
    const handleDiagnosisRequest = useCallback(async () => {
        if (state !== 'INITIAL') return;

        // A. 초기 경고 상태로 전환 및 애니메이션 트리거
        setState('ALERTING');
        console.log(`[State Change] Initial state to ALERTING. Triggering Red Zone Warning.`);
        
        // B. 가상의 $TRE$ 임계값 체크 로직 (여기서 실제 서버 API 호출이 발생해야 함)
        if (initialRiskScore < 70) {
            alert("🚨 경고: 현재 위험 노출도가 높지 않아 Paywall 진입이 거부되었습니다. 더 많은 데이터를 입력하세요.");
            setState('INITIAL'); // 실패 시 초기화
            return;
        }

        // C. 임계값 초과 성공 -> Attention Tracking 상태로 전환
        setTimeout(() => {
            setState('ATTENTION_TRACKING');
            console.log("[State Change] Success! Transitioned to ATTENTION_TRACKING phase.");
        }, 3000); // 3초간 경고 애니메이션 및 시간적 압박(Time Pressure) 조성
    }, [initialRiskScore, state]);

    /**
     * 스크롤/마우스 움직임 추적 (Requirement 2: Attention Point Tracking)
     */
    const handleScroll = useCallback(async () => {
        if (state !== 'ATTENTION_TRACKING') return;
        
        // 주의 집중도가 감지될 때마다 로깅 API 호출을 시도합니다.
        const currentData = {
            scrollPosition: window.scrollY,
            elementId: 'main_content_section', // 현재 위치한 섹션 ID를 사용해야 함
            timeSpentMs: 0,
        };

        // Attention Logging은 백그라운드에서 비동기적으로 처리합니다.
        logAttentionData(currentData).catch(e => console.error("Tracking failed:", e));
    }, [state]);


    /**
     * 최종 결제 버튼 클릭 시 호출되는 유효성 검증 게이트 (Requirement 3: Validation Gate)
     */
    const handlePurchaseClick = async () => {
        // --- V-GATE 1: 필수 체크박스 유효성 검사 ---
        if (!isAgreedLegalTerms) {
            alert("❌ 경고! 결제를 진행하려면 반드시 '법적 고지 및 약관'에 동의하셔야 합니다. (Mandatory Check)");
            return; // 여기서 프로세스를 강제 중단 (Fail Fast)
        }

        // --- V-GATE 2: 최종 시스템 검증 로직 (Mock) ---
        console.log("[Validation] Running final structural integrity check...");
        await new Promise(resolve => setTimeout(resolve, 1000)); // 긴장감 조성

        // 성공적으로 통과하면 다음 단계로 전환
        setState('VALIDATING');
        console.log("[State Change] Validation successful. Moving to CONFIRMATION.");
    };


    useEffect(() => {
        if (state === 'ATTENTION_TRACKING' || state === 'VALIDATING') {
            window.addEventListener('scroll', handleScroll);
        } else {
            window.removeEventListener('scroll', handleScroll);
        }

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [state, handleScroll]);


    // --- [JSX Rendering] ---
    let content;
    if (state === 'INITIAL') {
        content = (
            <div className="p-8 bg-gray-900/70 border-b border-red-600">
                <h2 className="text-xl text-white mb-4">1. 무료 진단 요청</h2>
                <p className="text-gray-300 mb-6">당신의 데이터를 입력하고 잠재적 위험 노출도를 확인하십시오.</p>
                <button 
                    onClick={handleDiagnosisRequest} 
                    className="bg-red-700 hover:bg-red-800 px-6 py-2 text-lg transition duration-300"
                >
                    진단 요청 (Proceed)
                </button>
            </div>
        );
    } else if (state === 'ALERTING') {
        // Red Zone Warning Animation Mockup
        content = (
            <div className="text-center p-12 border-4 border-red-500 bg-red-900/30 animate-pulse">
                <h3 className="text-6xl text-red-500 mb-4">🚨 CRITICAL SYSTEM ALERT 🚨</h3>
                <p className="text-2xl text-white">시스템 오류 감지. 구조적 위험 노출도가 임계값을 초과했습니다.</p>
                <button onClick={() => setState('ATTENTION_TRACKING')} className="mt-6 bg-red-700 px-8 py-3">
                    경고 인정 및 계속하기 →
                </button>
            </div>
        );
    } else if (state === 'ATTENTION_TRACKING') {
        content = (
            <div className="p-12 text-center bg-gray-900/50">
                <h3 className="text-4xl text-blue-400 mb-4">📈 분석 중... 주의 집중도가 필요합니다.</h3>
                <p className="text-lg text-gray-300">지금 고객님의 스크롤 움직임과 체류 시간(Attention Point)을 추적하고 있습니다. (A/B Test Logging Active)</p>
                {/* Attention Tracking Zone */}
            </div>
        );
    } else if (state === 'VALIDATING') {
        content = (
             <div className="text-center p-12 bg-yellow-900/30 border border-yellow-500">
                 <h3 className="text-4xl text-yellow-400 mb-6">🔒 최종 구조적 무결성 검증 중...</h3>
                 <p className="text-lg text-gray-300">시스템 안정성을 확보하기 위해 마지막 보안 게이트를 통과해야 합니다. 잠시만 기다려 주십시오.</p>
             </div>
        );
    } else if (state === 'SUCCESS') {
        content = (
            <div className="text-center p-12 bg-green-900/30 border border-green-500">
                <h3 className="text-4xl text-green-400 mb-4">✅ 시스템 업그레이드 완료!</h3>
                <p className="text-lg text-gray-300">귀사의 운영 생존 보험(Operational Insurance)이 확보되었습니다. 이제 안심하고 비즈니스를 운영하십시오.</p>
            </div>
        );
    }

    return (
        <div className="relative w-full max-w-4xl bg-[#121212] shadow-[0_0_30px_rgba(255,20,0,0.8)]">
            {/* 🚧 상태 머신 전체 컨테이너 */}
            <div className="min-h-[60vh]">
                {content}
            </div>

            {/* Payment Gate (Validation Component) - ATTENTION_TRACKING 이후 활성화 */}
            {(state === 'ATTENTION_TRACKING' || state === 'VALIDATING') && (
                <div className="p-8 bg-[#1A1A1A] border-t border-red-700/50">
                    {/* 법적 고지 및 동의 체크박스 */}
                    <div className="mb-6 space-y-3 text-sm text-gray-400">
                        <label className="flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                onChange={(e) => setIsAgreedLegalTerms(e.target.checked)} 
                                checked={isAgreedLegalTerms}
                                className="form-checkbox h-5 w-5 text-blue-600 bg-gray-700 border-gray-600"
                            />
                            <span className="ml-2">저는 yobizwiz의 서비스 약관 및 법적 고지사항을 충분히 숙지했으며 동의합니다. (필수)</span>
                        </label>
                    </div>

                    {/* 최종 구매 버튼 (Validation Gate 역할 수행) */}
                    <button 
                        onClick={handlePurchaseClick}
                        disabled={!isAgreedLegalTerms || state === 'VALIDATING'} // 비활성화 조건 추가
                        className={`w-full py-3 text-xl font-bold transition duration-300 ${
                            (state === 'VALIDATING' || !isAgreedLegalTerms) 
                                ? 'bg-gray-500 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700 shadow-[0_0_15px_rgba(52,152,219,0.8)]' // Authority Blue 느낌의 강조
                        }`}
                    >
                        {state === 'VALIDATING' ? "🔒 최종 승인 대기 중..." : 
                         `GOLD Tier 구매 확정 (${(initialRiskScore * 0.5).toFixed(1)} Score)`}
                    </button>
                </div>
            )}
        </div>
    );
};

export default PaywallModal;