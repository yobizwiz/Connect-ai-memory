import React, { useState, useCallback } from 'react';
import { useTimer } from '../hooks/useTimer';

// Mock API 호출 시뮬레이션 함수 (실제 백엔드와 연동되는 지점)
const simulateApiCall = async (data: any): Promise<{ success: boolean; message: string; riskScore: number }> => {
    console.log("API 요청 시도:", data);
    // 1초의 네트워크 지연을 시뮬레이션하여 사용자 경험에 압박감 부여
    await new Promise(resolve => setTimeout(resolve, 1000));

    // [핵심 로직] 결제 데이터가 들어왔을 때 의도적으로 실패를 유발합니다.
    if (data?.paymentAttempt === true) {
        return { 
            success: false, 
            message: "Critical Structural Flaw Detected: API Gateway 인증 레벨이 현행 규정(v3.1b)에 미달하여 트랜잭션 처리가 거부되었습니다.",
            riskScore: Math.floor(Math.random() * 50) + 80 // 높은 리스크 점수 강제 할당
        };
    }
    // 일반적인 성공 케이스 (테스트용)
    return { success: true, message: "진단 보고서가 정상적으로 생성되었습니다.", riskScore: 10 };
};

const GatewayForm: React.FC = () => {
  // 5분 타이머 초기 설정 및 사용
  const remainingTime = useTimer(300);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState<{ message: string; riskScore: number } | null>(null);

  // 결제 시도 핸들러: 구조적 위험 Mockup 트리거 지점
  const handlePaymentAttempt = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorState(null);

    try {
      // 1. API 호출 시뮬레이션 실행
      const result = await simulateApiCall({ paymentAttempt: true }); // 결제 시도 플래그를 넣어 강제 실패 유발
      
      if (!result.success) {
        // 구조적 위험 감지 -> Red Zone 상태로 전환
        setErrorState(result); 
      } else {
        alert(`성공적으로 처리되었습니다: ${result.message}`);
      }
    } catch (e) {
      console.error("API 호출 중 오류 발생:", e);
      setErrorState({ message: "통신 오류가 감지되었습니다. 네트워크 연결을 확인하십시오.", riskScore: 99 });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 타이머 표시 로직 (React Fragment를 사용하여 의존성 경고 방지)
  const TimerDisplay = React.memo(() => {
    const minutes = Math.floor(remainingTime / 60).toString().padStart(2, '0');
    const seconds = (remainingTime % 60).toString().padStart(2, '0');
    return <div className="text-xl font-bold text-red-700">남은 시간: {minutes}:{seconds}</div>;
  });

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white shadow-2xl rounded-lg border border-gray-100">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-900 flex justify-between items-center">
        최종 진단 게이트웨이 (Gateway Check)
        <TimerDisplay /> {/* 타이머 컴포넌트 사용 */}
      </h2>

      {/* 구조적 위험 상태 표시 영역 */}
      {errorState && (
        <div className="bg-red-100 border-l-4 border-red-600 p-4 mb-6 shadow-lg animate-pulse">
          <h3 className="text-xl font-bold text-red-800 flex items-center">
            🚨 SYSTEM ALERT: 구조적 위험 감지 🚨
          </h3>
          <p className="mt-1 text-sm text-red-700">{errorState.message}</p>
          <p className="text-xs mt-2 font-mono">위험 점수(QLoss): {errorState.riskScore} / 100 (Critical)</p>
          <p className="mt-2 text-sm italic">이 시스템적 결함은 즉각적인 전문가 개입을 요구합니다.</p>
        </div>
      )}

      <form onSubmit={handlePaymentAttempt}>
        {/* 가상의 결제 정보 입력 필드 */}
        <div className="space-y-4 mb-8">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">이름</label>
            <input id="name" type="text" required className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일</label>
            <input id="email" type="email" required className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        {/* CTA 버튼 */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg text-white font-bold transition duration-200 ${
            errorState ? 'bg-gray-500 cursor-not-allowed' : 
            isLoading ? 'bg-blue-400 cursor-wait' : 
            'bg-red-700 hover:bg-red-800 shadow-lg' // 위험 감지 시 빨간색 강조 유지
          }`}
        >
          {isLoading ? '시스템 분석 중... 잠시만 기다려 주세요.' : '진단 보고서 구매 및 시스템 개입 요청'}
        </button>
      </form>

    </div>
  );
};

export default GatewayForm;