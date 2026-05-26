import React, { useState, useCallback } from 'react';

interface PaymentData {
    riskScore: number;
    reportData: any;
    transactionId?: string;
}

// 🚨 경고 메시지 컴포넌트 (Glitch 효과 시뮬레이션)
const GlitchWarningBox: React.FC<{ message: string }> = ({ message }) => {
    return (
        <div className="p-6 bg-red-900/70 border-2 border-red-500 animate-pulse shadow-[0_0_30px_rgba(255,0,0,0.8)] transition duration-300">
            <h2 className="text-xl font-bold text-red-400 mb-3 uppercase tracking-widest">[SYSTEM ALERT]</h2>
            <p className="text-white">{message}</p>
        </div>
    );
};

// 💳 최종 결제 페이지
const PaymentGate: React.FC<{ initialData?: PaymentData }> = ({ initialData }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'SUCCESS' | 'FAILED'>('IDLE');

    // 실제 API 호출 대신 시뮬레이션 로직 사용
    const handlePayClick = useCallback(async () => {
        if (!initialData) return;

        setIsProcessing(true);
        setPaymentStatus('IDLE');

        // Mock Payment Gateway Call (2초 지연)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 구조적 리스크가 높을수록 결제 실패 확률 증가 시뮬레이션
        if (initialData.riskScore > 85 && Math.random() < 0.6) {
            setPaymentStatus('FAILED');
            console.error("Payment Failed: Structural integrity failure detected.");
        } else if (Math.random() < 0.1) {
             // 극히 낮은 확률의 네트워크 에러 시뮬레이션
            setPaymentStatus('FAILED');
            alert("네트워크 오류로 결제에 실패했습니다. 잠시 후 다시 시도해주세요.");
        } else {
            setPaymentStatus('SUCCESS');
            console.log("Payment Successful: Structural integrity confirmed.");
        }

        setIsProcessing(false);
    }, [initialData]);


    let statusMessage = '';
    let actionButton;

    if (paymentStatus === 'FAILED') {
        statusMessage = "⚠️ 결제 실패: 구조적 무결성 검증에 실패했습니다. 추가 진단이 필요합니다.";
        actionButton = <button onClick={() => alert("재진단을 위해 다시 시작합니다.")} className="bg-yellow-600 hover:bg-yellow-700 px-8 py-3 rounded font-bold transition">다시 진단하기</button>;
    } else if (paymentStatus === 'SUCCESS') {
        statusMessage = "✅ 결제 완료. 귀사의 구조적 무결성이 확보되었습니다.";
        actionButton = <a href="#" className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded font-bold transition">대시보드 이동</a>;
    } else {
        statusMessage = "최종 결제를 진행하려면 구조적 리스크를 인정하고 시스템에 개입해야 합니다.";
        actionButton = (
            <button 
                onClick={handlePayClick} 
                disabled={isProcessing}
                className={`px-12 py-4 rounded font-extrabold transition duration-300 ${
                    isProcessing ? 'bg-gray-500 cursor-wait' : 'bg-red-700 hover:bg-red-800 shadow-lg'
                }`}
            >
                {isProcessing ? '진단 시스템 연동 중...' : `즉시 진단 체험권 구매 (${(initialData?.reportData?.financial_impact_estimate || 0) / 1000}K USD)`}
            </button>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
            <div className="w-full max-w-xl bg-gray-800 p-12 rounded-lg shadow-[0_0_50px_rgba(255,0,0,0.3)] border border-red-600/50">
                <h1 className="text-4xl font-extrabold text-red-500 mb-6 uppercase tracking-widest">[YOBIZWIZ] 시스템 개입 게이트웨이</h1>
                
                {/* 🚨 구조적 리스크 경고창 */}
                {initialData?.reportData?.structural_flaw_detected && (
                    <GlitchWarningBox message={`구조적 결함 감지: ${initialData?.reportData?.severity || 'UNKNOWN'} 등급의 시스템 생존 위협이 확인되었습니다. 즉시 조치가 필수입니다.`}/>
                )}

                {/* 결과 메시지 */}
                <div className="mt-8 text-center">
                    <p className={`text-2xl font-semibold mb-4 ${paymentStatus === 'SUCCESS' ? 'text-green-400' : paymentStatus === 'FAILED' ? 'text-red-400' : 'text-yellow-300'}`}>
                        {statusMessage}
                    </p>
                </div>

                <div className="mt-12 text-center">
                    {actionButton}
                </div>
            </div>
        </div>
    );
};

export default PaymentGate;