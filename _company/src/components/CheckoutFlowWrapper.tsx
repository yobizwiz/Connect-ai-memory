/**
 * @module CheckoutFlowWrapper
 * @description 실제 결제 플로우를 감싸서 리스크 체크를 강제하는 인터셉터 컴포넌트.
 * [근거: CEO 지시, Self-RAG]
 */
import React, { useState } from 'react';
import GatekeeperAlert from './gatekeeper/GatekeeperAlert';
import { useRiskChecker } from '../hooks/useRiskChecker';

interface CheckoutFlowWrapperProps {
    onSuccess: (data: any) => void; // 결제 성공 시 콜백
}

const CheckoutFlowWrapper: React.FC<CheckoutFlowWrapperProps> = ({ onSuccess }) => {
    // 세션 ID는 실제로는 Context나 Redux Store에서 가져와야 합니다. 여기서는 mock으로 사용합니다.
    const MOCK_SESSION_ID = "session-abc-123"; 
    
    // 리스크 체크 로직을 호출합니다.
    const { isCritical, riskData, isLoading, triggerCheck } = useRiskChecker(MOCK_SESSION_ID);

    const [isProcessing, setIsProcessing] = useState(false);

    /**
     * 결제 처리 핸들러: 모든 비즈니스 로직의 핵심입니다.
     */
    const handlePaymentAttempt = async () => {
        if (isLoading) {
            alert("⚠️ 시스템이 초기 분석 중입니다. 잠시 기다려 주세요.");
            return;
        }

        // 1. 리스크 체크 수행을 강제 실행합니다.
        await triggerCheck(); 
        
        // 2. Critical 상태면, 결제를 절대 진행할 수 없습니다.
        if (isCritical) {
            alert("❌ [SYSTEM BLOCKED] 구조적 위험이 감지되어 거래가 취소되었습니다.");
            return; // 여기서 함수를 종료하여 payment API 호출을 막습니다.
        }

        // 3. 리스크 체크 통과 시, 실제 결제 로직 진행 (PayPal 연동 지점)
        setIsProcessing(true);
        console.log("✅ [Flow Success] Gatekeeper Alert를 통과했습니다. PayPal 트랜잭션 시작...");

        try {
            // ===========================================
            // 💡 여기에 실제 PayPal SDK 또는 백엔드 API 호출이 들어갑니다.
            // const paymentResponse = await payPalApi.processPayment(userData);
            await new Promise(resolve => setTimeout(resolve, 1500)); // Mock API Latency
            const mockSuccessData = { transactionId: "txn_mock_123", amount: 999 };
            // ===========================================

            setIsProcessing(false);
            onSuccess(mockSuccessData);

        } catch (error) {
            console.error("Payment Failed:", error);
            alert(`❌ 결제 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
        }
    };

    return (
        <div className="p-8 max-w-xl bg-white shadow-2xl rounded-lg">
            <h3 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">최종 결제 단계</h3>

            {/* Gatekeeper Alert가 활성화되면, 모든 콘텐츠를 가리고 경고만 보여줍니다. */}
            {isCritical ? (
                <GatekeeperAlert 
                    riskScore={riskData?.score || 0} 
                    details={riskData?.details || "분석 중 오류 발생"} 
                />
            ) : (
                <>
                    {/* Loading State */}
                    {isLoading && (
                        <div className="text-center p-10">
                            <p className="animate-pulse text-xl text-blue-600 flex items-center justify-center space-x-2">
                                <span className="loader"></span> <span>시스템 구조적 무결성 분석 중... 잠시만 기다려 주세요. (3초 지연)</span>
                            </p>
                        </div>
                    )}

                    {/* Success/Normal State */}
                    {!isLoading && !isCritical && (
                        <>
                            <div className="text-xl mb-8 p-4 border-l-4 border-green-500 bg-green-50 text-green-800">
                                ✅ 분석 완료. 현재 구조적 위험 레벨은 허용 범위 내입니다. 결제를 진행할 수 있습니다.
                            </div>

                            <button 
                                onClick={handlePaymentAttempt} 
                                disabled={isProcessing}
                                className={`w-full py-4 text-xl font-bold rounded-lg transition duration-300 ${
                                    isProcessing ? 'bg-gray-400 cursor-wait' : 'bg-[#ff3b30] hover:bg-red-700 shadow-lg transform hover:-translate-y-1'
                                } text-white`}
                            >
                                {isProcessing ? '💳 결제 처리 중... (API 호출)' : `PayPal로 ${riskData?.score || 0}% 리스크를 안고 구매하기`}
                            </button>

                            {/* 디버깅/정보 제공용 */}
                            <div className="mt-8 text-sm text-gray-500 border-t pt-4">
                                <p>진단 정보: {riskData?.details}</p>
                                <p>API 상태: ${isLoading ? '분석 중' : (isCritical ? '위험 감지됨' : '정상')}</p>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default CheckoutFlowWrapper;