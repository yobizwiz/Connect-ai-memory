import React, { useState } from 'react';
import { RiskLevel } from '../hooks/useRiskSimulation';

// Mock API 호출을 시뮬레이션하는 함수 (실제 백엔드 연동 자리)
const simulateApiCall = async (amount: number, paymentToken: string): Promise<{ success: boolean; message: string }> => {
    console.log(`[API CALL] Attempting to charge ${amount} with token ${paymentToken}...`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // 네트워크 지연 시뮬레이션

    // 간단한 유효성 검사 로직 추가 (예: 특정 토큰은 실패 처리)
    if (paymentToken.includes('fail')) {
        return { success: false, message: "Payment Gateway Error: Invalid token or insufficient funds." };
    }
    
    // 성공 시뮬레이션
    return { success: true, message: `System Audit Complete. Premium Insurance activated for $${amount}.` };
};

interface PaymentGateProps {
    initialRiskLevel: RiskLevel;
}

const getRedZoneStyles = (level: RiskLevel) => {
    switch (level) {
        case 'CRITICAL':
            return "bg-red-900/80 border-red-600 text-red-300 animate-pulse"; // Red Zone + Glitch simulation needed here
        case 'WARNING':
            return "bg-yellow-900/70 border-yellow-600 text-yellow-300";
        default:
            return "border-gray-700 bg-gray-800 text-white";
    }
};

const PaymentGate: React.FC<PaymentGateProps> = ({ initialRiskLevel }) => {
    const [riskLevel, setRiskLevel] = useState(initialRiskLevel);
    const [paymentAmount, setPaymentAmount] = useState(299.00); // Gold Tier Price Mockup
    const [paymentToken, setPaymentToken] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

    // 결제 처리 핸들러 (핵심 데이터 플로우)
    const handlePaymentSubmission = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentToken || paymentAmount <= 0) {
            setStatusMessage({ type: 'error', message: "⚠️ Please enter a valid payment token and amount." });
            return;
        }

        setIsSubmitting(true);
        setStatusMessage({ type: null, message: 'System Audit Running... Please wait.' });

        // 1. API 시뮬레이션 호출 (비동기 처리)
        const result = await simulateApiCall(parseFloat(paymentAmount.toFixed(2)), paymentToken);

        setIsSubmitting(false);

        if (result.success) {
            setStatusMessage({ type: 'success', message: `✅ SUCCESS! ${result.message} You are now protected.` });
            // 2. 성공 시 리다이렉트 또는 감사 보고서 생성 로직 호출 (다음 단계 API 호출 트리거)
        } else {
            setStatusMessage({ type: 'error', message: `❌ FAILURE: ${result.message}` });
        }
    };

    return (
        <div className={`p-8 rounded-xl shadow-2xl border-4 ${getRedZoneStyles(riskLevel)} max-w-3xl mx-auto`}>
            <h2 className="text-3xl font-bold mb-6 text-red-400">🚨 Red Zone Warning: Structural Integrity Breach Detected</h2>
            
            {/* 시스템 경고 메시지 (Paywall V7.0 필수 요소) */}
            <div className="p-4 border-l-4 border-red-500 bg-red-900/50 mb-6">
                <p className="text-lg font-semibold text-white">SYSTEM ALERT: Your current exposure level ({riskLevel}) exceeds the acceptable risk threshold.</p>
                <p className="text-sm mt-1 text-red-300">Immediate structural intervention is required to prevent catastrophic financial loss. [근거: 🏢 회사 정체성]</p>
            </div>

            <form onSubmit={handlePaymentSubmission} className="space-y-6 bg-gray-800/50 p-6 rounded-lg">
                {/* 결제 금액 표시 */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Premium Insurance Coverage (Gold Tier)</label>
                    <p className="text-4xl font-extrabold text-yellow-400">${paymentAmount.toFixed(2)}</p>
                </div>

                {/* 결제 토큰 입력 필드 */}
                <div>
                    <label htmlFor="paymentToken" className="block text-sm font-medium text-gray-300 mb-1">Payment Token (Simulated Card Number)</label>
                    <input
                        id="paymentToken"
                        type="text"
                        value={paymentToken}
                        onChange={(e) => setPaymentToken(e.target.value)}
                        className="w-full p-3 bg-gray-700 border border-red-600 rounded text-white focus:ring-2 focus:ring-red-500"
                        required
                        placeholder="XXXX XXXX XXXX 1234 (Test Fail token: fail...)"
                    />
                </div>

                {/* 제출 버튼 */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 text-lg font-bold rounded transition duration-300 ${
                        isSubmitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 shadow-lg'
                    }`}
                >
                    {isSubmitting ? 'PROCESSING AUDIT...' : `Secure Payment & Activate Protection (${riskLevel} Level)`}
                </button>
            </form>

            {/* 상태 메시지 표시 영역 */}
            {statusMessage.message && (
                <div className={`mt-6 p-4 rounded text-center ${
                    statusMessage.type === 'success' ? 'bg-green-700/80 border border-green-500 text-white' : 
                    statusMessage.type === 'error' ? 'bg-red-700/80 border border-red-500 text-white' : 
                    'bg-gray-700/80 border border-gray-600 text-white'
                }`}>
                    <p className="font-semibold">{statusMessage.message}</p>
                </div>
            )}
        </div>
    );
};

export default PaymentGate;