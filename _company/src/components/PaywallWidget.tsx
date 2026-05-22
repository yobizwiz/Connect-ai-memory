import React, { useState, useCallback } from 'react';
// 1. API 연동을 위해 최근 작업 파일 임포트 (가정)
import { executePaymentTransaction } from '../services/paymentService';
import { RiskData } from '../services/interfaces'; // 인터페이스 사용 가정

// 2. 카운터 업 로직 사용
import { useCounterUp } from './useCounterUp';

/**
 * @description 리스크 레벨에 따라 경고 스타일을 결정하는 함수. [근거: Self-RAG, 🏢 회사 정체성]
 */
const getRedZoneStyles = (riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'): { className: string; intensity: number } => {
  switch (riskLevel) {
    case 'HIGH':
      return { className: "border-red-700 bg-red-900/80 shadow-[0_0_30px_rgba(255,0,0,0.9)]", intensity: 1.0 };
    case 'MEDIUM':
      return { className: "border-yellow-600 bg-yellow-900/70 shadow-[0_0_20px_rgba(255,200,0,0.7)]", intensity: 0.7 };
    case 'LOW':
    default:
      return { className: "border-blue-600 bg-blue-900/60 shadow-[0_0_15px_rgba(59,130,246,0.5)]", intensity: 0.3 };
  }
};

/**
 * @description Glitch Noise 효과를 시뮬레이션하는 Wrapper 컴포넌트 (CSS 애니메이션 필요)
 * 실제 구현 시 CSS/Tailwind 플러그인으로 처리해야 합니다. 여기서는 className만 정의합니다. [근거: CEO 지시]
 */
const GlitchBox: React.FC<{ children: React.ReactNode; riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' }> = ({ children, riskLevel }) => {
    // Tailwind CSS의 animate-pulse와 custom animation을 조합하여 사용한다고 가정합니다.
    const baseClasses = "relative p-8 border-2 transition duration-500";
    const glitchClass = `animate-glitch-noise ${riskLevel === 'HIGH' ? 'duration-[1s] opacity-90' : 'opacity-70'}`;

    return <div className={`${baseClasses} ${glitchClass`}`}>{children}</div>;
};


/**
 * @description Paywall V6.0 핵심 위젯 컴포넌트. [근거: CEO 지시, 🏢 회사 정체성]
 * 이 컴포넌트는 모든 리스크 진단 결과를 종합하여 사용자에게 공포와 행동을 강제합니다.
 */
const PaywallWidget: React.FC = () => {
  // 초기 Dummy Data - 실제로는 API 호출로 받아옴
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // 1. $TRE$ 카운터 업 구현 (가상의 최종 위험 노출액)
  const initialTReValue = 42000; // 가상으로 산정된 총 위험 노출액 ($42,000)
  const treCountedValue = useCounterUp(initialTReValue, 3000); // 3초 동안 카운트 업

  // 2. 리스크 데이터 시뮬레이션 및 로딩 처리 (실제로는 API 호출)
  const handleRunDiagnosis = useCallback(async () => {
    setIsLoading(true);
    setRiskData(null);
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3초 지연 시뮬레이션

    // 가상의 진단 결과 (High Risk로 설정하여 Paywall 효과 극대화)
    const simulatedResult: RiskData = {
        riskLevel: 'HIGH',
        structuralDeficiencyScore: Math.floor(Math.random() * 100) + 85, // 높은 점수 부여
        suggestedPremiumAmount: 999, // Gold Tier 가격 설정
        estimatedOpportunityCostUSD: initialTReValue, // 카운터 업 값과 연동
    };

    setRiskData(simulatedResult);
    setIsLoading(false);
  }, [initialTReValue]);


  // 3. 결제 처리 핸들러 (PaymentService와 연동되는 최종 지점)
  const handlePurchase = useCallback(async () => {
    if (!riskData) return;

    setIsLoading(true);
    try {
      // PaymentService 호출 시뮬레이션 [근거: 💻 코다리 개인 메모리]
      console.log("API Call: Initiating payment transaction...");
      await executePaymentTransaction({ amount: riskData.suggestedPremiumAmount }); // 실제 API 함수 호출 지점

      alert('✅ 결제 성공! 구조적 방어 시스템 활성화 완료.');
      setIsPaid(true);
    } catch (error) {
      console.error("Payment failed:", error);
      alert('❌ 결제 실패: 오류 코드를 확인하십시오.');
    } finally {
      setIsLoading(false);
    }
  }, [riskData]);


  // 4. UI 렌더링 로직
  const currentRiskLevel = riskData?.riskLevel || 'LOW';
  const redZoneStyles = getRedZoneStyles(currentRiskLevel);

  return (
    <div className="max-w-6xl mx-auto p-8 bg-gray-900 min-h-[85vh] text-white">
      <header className="text-center mb-12 border-b-4 border-red-700 pb-6">
        <h1 className="text-5xl font-extrabold tracking-tighter uppercase">시스템 경고: 구조적 결함 감지</h1>
        <p className="mt-3 text-xl text-red-400/80">당신의 비즈니스 시스템은 이미 위험 노출 상태입니다.</p>
      </header>

      {/* 🌟 핵심 Paywall 컨테이너 */}
      <div className={`relative p-12 rounded-xl border-4 ${redZoneStyles.className} shadow-2xl`}>
        <h2 className="text-3xl font-bold mb-6 text-center uppercase">위협 분석 결과 보고서 (Red Zone Active)</h2>

        {/* A. $TRE$ 카운터 업 위젯 영역 */}
        <div className="mb-8 p-6 bg-black/70 border-l-4 border-red-500 flex items-center justify-between">
            <div>
                <p className="text-lg uppercase text-red-300">총 위험 노출액 (TRE) 추정치:</p>
                <h3 className="text-6xl font-mono tracking-widest mt-1">$ {treCountedValue.toLocaleString()}</h3> {/* 카운트 업 적용 */}
            </div>
            <div className='flex flex-col items-end'>
                 <p className="text-sm uppercase text-red-400">최소 보험료 필요액</p>
                 <span className="text-3xl font-bold">$ {riskData?.suggestedPremiumAmount.toLocaleString() || 'N/A'}</span>
            </div>
        </div>

        {/* B. 시스템 경고 및 분석 영역 (Glitch Box 적용) */}
        <div className="mb-10 p-8 bg-black/60 border-2 border-red-500">
          <h3 className="text-xl text-red-400 font-semibold mb-3 uppercase flex items-center">
            <span className='mr-2'>🚨</span> 시스템적 생존 위협 분석 (Critical Threat Analysis)
          </h3>
          <p className="text-sm text-gray-300 mb-4 block italic">
             [근거: 법률 데이터 및 구조적 결함 지표 기반]
          </p>
          {/* Glitch 효과가 들어갈 핵심 영역 */}
          <GlitchBox riskLevel={currentRiskLevel}> 
            <div>
              <p className="text-lg font-medium text-red-300">구조적 취약점 점수: {riskData?.structuralDeficiencyScore || 'N/A'} / 100</p>
              <p className='mt-2'>현재 시스템은 **{currentRiskLevel}** 레벨의 위험에 노출되어 있으며, 이는 곧 재정적 손실($)로 직결됩니다.</p>
            </div>
          </GlitchBox>
        </div>

        {/* C. 행동 유도 (CTA) 영역 */}
        <div className="text-center">
            {!isPaid ? (
                <>
                    <p className={`mb-8 text-xl font-semibold ${currentRiskLevel === 'HIGH' ? 'text-red-400 animate-pulse' : 'text-yellow-300'}`}>
                        지금 즉시 $TRE$를 방어하고, 시스템적 무결성을 확보하십시오.
                    </p>
                    <button 
                      onClick={handlePurchase} 
                      disabled={isLoading || !riskData}
                      className={`px-12 py-4 text-xl font-bold uppercase transition duration-300 ${
                        redZoneStyles.className.includes('border-red') ? 'bg-red-700 hover:bg-red-600' : 'bg-gray-600 cursor-not-allowed'
                      } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        {isLoading ? '🚨 분석 중... (결제 진행)' : `Gold Tier Pre-Audit 신청 (${riskData?.suggestedPremiumAmount.toLocaleString()} USD)`}
                    </button>
                </>
            ) : (
                <div className='text-green-400 p-6 border border-green-500 rounded-lg'>
                    <h3 className="text-2xl font-bold">✅ 방어 시스템 활성화 완료.</h3>
                    <p className="mt-2 text-gray-300">당신의 비즈니스는 이제 구조적 충격으로부터 보호됩니다.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default PaywallWidget;