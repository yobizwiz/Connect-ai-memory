import React, { useState, useEffect } from 'react';
import axios from 'axios'; // 시뮬레이션용
import { useTheme } from 'next-themes';

// --- Type Definitions ---
interface PaymentData {
  amount: number;
  riskScore: string;
  message: string;
}

interface PaymentModalProps {
  data: PaymentData;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * 🚨 [SYSTEM ALERT] 필수 강제 결제 모달 컴포넌트.
 * 사용자가 이탈할 수 없게 만드는 구조적 무결성(Structural Integrity)을 갖추는 것이 목표입니다.
 */
const PaymentModal: React.FC<PaymentModalProps> = ({ data, onSuccess, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(120); // 120초 (2분) 초기 설정

  // --- 구조적 무결성: 카운트다운 타이머 로직 ---
  useEffect(() => {
    if (countdown <= 0 || isProcessing) return;

    const interval = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown, isProcessing]);

  // --- 구조적 무결성: 필수 입력 유효성 검사 및 결제 로직 ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(''); // 입력 시 에러 초기화
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 1. 필수 정보 유효성 검사 (가장 먼저 막는 것)
    if (!formData.name || !formData.email) {
      setError('🚨 모든 필드는 반드시 입력되어야 합니다. 이 과정은 법적 절차에 의해 강제됩니다.');
      return;
    }

    // 2. 시간 초과 체크 (결제가 회피되는 시나리오 유도)
    if (countdown < 30) {
        setError(`⚠️ 경고: 남은 시간이 ${Math.floor(countdown / 60)}분 ${countdown % 60}초 입니다. 미처리 시 리스크 점수가 급격히 증가합니다.`);
        // UI적으로 시간 압박을 더 주는 로직 추가 가능
    }

    setIsProcessing(true);

    try {
      // 3. PayPal API 호출 시뮬레이션 (실제로는 백엔드 게이트웨이와 통신)
      console.log('--- Attempting Mandatory Transaction ---');
      await new Promise((resolve, reject) => setTimeout(resolve, 2000)); // 2초 지연
      
      // 성공 시뮬레이션 로직 (실제로는 API 응답에 의존)
      if (Math.random() > 0.1) { 
        console.log('✅ Transaction Successful!');
        setIsProcessing(false);
        onSuccess(); // 부모 컴포넌트의 성공 핸들러 호출
      } else {
         // 실패 시뮬레이션 (재시도 유도)
         throw new Error("API 게이트웨이 연결 불안정. 시스템 재확인이 필요합니다.");
      }

    } catch (err: any) {
      setIsProcessing(false);
      setError(`❌ 거래 실패: ${err.message}. 시간을 지체할수록 리스크는 커집니다.`);
      // 에러 메시지에 위협적 톤 유지
    }
  };

  const renderCountdown = () => (
    <div className="text-xl font-mono text-red-600 animate-pulse">
        남은 시간: <span className="text-3xl">{Math.floor(countdown / 60)}:<span className="ml-2">{String(countdown % 60).padStart(2, '0')}</span></span> (초)
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className={`w-full max-w-xl p-8 rounded-lg shadow-2xl border-t-4 transition-all duration-500 ${data.riskScore === 'CRITICAL' ? 'border-red-600 bg-[#1A1A1A] text-white animate-pulse' : 'border-blue-600 bg-[#1A1A1A] text-white'}`}
      >
        {/* Header: 공포감 조성 */}
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold ${data.riskScore === 'CRITICAL' ? 'text-red-500 animate-ping' : 'text-blue-400'}`}>
            {data.message} <span className="block text-sm font-mono mt-1">(Mandatory Protocol Activated)</span>
          </h2>
          <p className="text-gray-400 mt-2">이 트랜잭션은 시스템적 리스크를 방어하기 위해 필수적으로 실행되어야 합니다.</p>
        </div>

        {/* Timer Display (가장 눈에 띄게) */}
        <div className="flex justify-center items-center mb-6 p-3 border-b border-red-700">
            <span className="text-lg font-semibold mr-4 text-gray-200">⚠️</span>
            {renderCountdown()}
        </div>

        {/* Error/Warning Display */}
        {error && (
          <div role="alert" className={`p-3 mb-6 rounded ${data.riskScore === 'CRITICAL' ? 'bg-red-900 border border-red-700 text-red-200' : 'bg-yellow-900 border border-yellow-700 text-yellow-200'}`}>
            <p className="font-bold">🚨 시스템 경고:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handlePaymentSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">이름 (필수)</label>
            <input 
              type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:border-red-500 focus:ring-1 transition duration-200" 
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">이메일 (필수 - 리스크 보고서 수신용)</label>
            <input 
              type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:border-red-500 focus:ring-1 transition duration-200" 
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
             <button 
                type="button" 
                onClick={onCancel}
                disabled={isProcessing}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded transition disabled:opacity-50 border border-gray-600">
                취소 (Exit)
            </button>

            <button 
              type="submit" 
              disabled={isProcessing}
              className={`px-8 py-3 font-bold rounded shadow-lg transition duration-300 ${isProcessing ? 'bg-gray-500 cursor-not-allowed' : data.riskScore === 'CRITICAL' ? 'bg-red-600 hover:bg-red-700 ring-4 ring-red-900' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isProcessing ? (
                <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-80" d="M</div>
    </div>
  );
};

export default PaymentModal;