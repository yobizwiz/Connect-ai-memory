import React, { useState, useCallback } from 'react';
import { ArrowRightIcon, ShieldExclamationIcon } from '@heroicons/react/24/solid';

// --- [ 상수 정의: Self-RAG 기반] -------------------
const ERROR_CODES = {
    STRUCTURAL_INTEGRITY: "ERROR_SI-403",
    RISK_LEVEL: "WARNING_QLOSS"
};

interface PaymentGatekeeperProps {
    onProceedToPayment: () => void; // 정상 결제 진행 핸들러
}

/**
 * @description 사용자의 유료 구매 플로우를 API 레벨에서 인터셉트하여,
 * 시스템적 리스크(Structural Risk)를 강제로 경험하게 하는 게이트키퍼 컴포넌트.
 * 실제 백엔드 호출을 모킹하고 강력한 Red Zone UI를 띄우는 것이 목표입니다.
 */
const PaymentGatekeeper: React.FC<PaymentGatekeeperProps> = ({ onProceedToPayment }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasInterception, setHasInterception] = useState<boolean>(false);

    // ⚠️ 핵심 로직: 결제 버튼 클릭을 가로채는 핸들러
    const handlePurchaseAttempt = useCallback(async () => {
        setIsProcessing(true);
        setHasInterception(false); // 초기화

        console.log("🔍 [System Intercept]: Purchase flow initiated. Running structural validation...");

        // 1. 모킹된 API 호출 (실제로는 서버 측의 Payment Intent 요청이 들어옴)
        await new Promise(resolve => setTimeout(resolve, 2500)); // 시스템 분석 시간 시뮬레이션

        // 2. 구조적 무결성 검증 실패 로직 실행 (가장 중요!)
        const isStructurallySound = Math.random() > 0.6; // 40% 확률로 실패 가정

        if (!isStructurallySound) {
            console.error(`🚨 [System Intercept]: ${ERROR_CODES.STRUCTURAL_INTEGRITY} - Structural Integrity Check Failed.`);
            setHasInterception(true);
            setIsProcessing(false);
            // 사용자가 결제 버튼을 눌러도, 실제로는 이 실패 로직이 실행됨
        } else {
            console.log("✅ [System Intercept]: Structural Integrity Passed. Proceeding to payment...");
            setIsProcessing(false);
            onProceedToPayment(); // 정상적으로 다음 페이지로 이동 (현재는 무시)
        }
    }, [onProceedToPayment]);

    // 🚨 인터셉트된 상태일 때만 렌더링되는 Red Zone UI
    if (hasInterception) {
        return (
            <div className="relative w-full bg-[#1A1A1A] p-8 rounded-xl shadow-[0_0_40px_rgba(192,57,43,0.6)] border-4 border-[#C0392B]">
                {/* 애니메이션 효과를 위한 Wrapper */}
                <div className="animate-pulse opacity-95">
                    <h2 className="text-xl font-mono text-red-400 flex items-center mb-4">
                        <ShieldExclamationIcon className="w-6 h-6 mr-3 animate-ping" /> 
                        SYSTEM CRITICAL WARNING: STRUCTURAL INTEGRITY FAILURE DETECTED
                    </h2>
                    <p className="text-lg text-red-200 mb-6 font-mono">
                        [Error Code: {ERROR_CODES.STRUCTURAL_INTEGRITY}] - 분석 결과, 귀사의 핵심 비즈니스 모델에서 치명적인 구조적 무결성(Structural Integrity) 결함이 감지되었습니다.
                    </p>

                    <div className="bg-[#2D1A1C] p-4 rounded-lg border-l-4 border-[#FF8B8B]">
                        <p className="text-sm text-red-300 mb-2">
                            ⚠️ **[경고 메시지]**: 현재의 운영 방식과 데이터 흐름은 $50,000 USD 이상의 재무적 손실(Potential Financial Loss)을 초래할 위험이 있습니다. 이 리스크는 자가 진단만으로는 해결될 수 없습니다.
                        </p>
                    </div>

                    <div className="mt-8 text-center">
                        <h3 className="text-2xl font-bold text-[#2980B9] mb-4 tracking-wider">
                            [Solution Required]: Mini-Report v2.1 구매가 유일한 해결책입니다.
                        </h3>
                        <p className="text-lg text-red-200 mb-6">
                            시스템은 이 리스크를 해소하기 위해, 다음 단계를 강제적으로 진행해야 합니다.
                        </p>
                        
                        {/* CTA 버튼 - 결제를 유도하는 권위적인 디자인 */}
                        <button 
                            onClick={() => alert('Mini-Report 구매 프로세스로 이동합니다.')} // 실제로는 /checkout로 리다이렉트되어야 함
                            className="bg-[#2980B9] hover:bg-[#3498DB] text-white font-bold py-3 px-12 rounded-md transition duration-300 text-xl shadow-lg transform hover:scale-[1.02]"
                        >
                            지금, 구조적 무결성을 확보하십시오 (Mini-Report 구매) <ArrowRightIcon className="inline w-5 h-5 ml-2" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 🚨 인터셉트되지 않은 상태일 때만 보이는 정상적인 CTA 영역
    return (
        <div className="text-center mt-10">
            <button 
                onClick={handlePurchaseAttempt} // 결제 시도 함수 호출
                disabled={isProcessing}
                className={`bg-[#C0392B] hover:bg-[#A03027] text-white font-bold py-4 px-16 rounded-lg transition duration-300 shadow-xl transform hover:scale-105 ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
                {isProcessing ? '구조적 무결성 검증 중...' : 'Mini-Report 구매 및 리스크 해소하기'}
            </button>
        </div>
    );
};

export default PaymentGatekeeper;