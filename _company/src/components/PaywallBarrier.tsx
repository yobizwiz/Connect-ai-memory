import React, { useState, useEffect } from 'react';
import { useRiskContext } from '../context/RiskContext'; // 방금 만든 Context 사용
import { FocusTrapHook } from '../hooks/useFocusTrap'; // 기존에 생성된 Hook 활용

/**
 * @description $L_{totalMax}$ 임계치를 초과했을 때, 시스템적으로 모든 인터랙션을 봉쇄하고 유료 전환을 강제하는 컴포넌트.
 * Z-index: 9999를 보장해야 합니다.
 */
const PaywallBarrier: React.FC = () => {
  // Context Hook을 사용하여 현재 리스크 점수와 활성화 여부를 가져옴
  const { isPaywallActive, lTotalMax } = useRiskContext();

  // 💡 아키텍처 검증: Paywall이 비활성 상태라면 아무것도 렌더링하지 않습니다. (Zero-Defect)
  if (!isPaywallActive) {
    return null; // 조건부 렌더링으로 성능 최적화 및 무결성 확보
  }

  // Focus Trap Hook을 사용하여 이 모달이 활성화되는 순간, 모든 포커스는 내부 요소로 강제 이동합니다.
  const [isFocused, setIsFocused] = useState(false);
  useFocusTrap(isFocused); 

  // S-02: 경고 발동 (Warning Trigger) 로직 구현
  useEffect(() => {
    console.warn(`🚨 시스템 위험 감지! L_totalMax가 ${lTotalMax}로 임계치(${PAYWALL_THRESHOLD})를 초과했습니다.`);
    setIsFocused(true); // Focus Trap 활성화 시도
  }, [isPaywallActive, lTotalMax]);

  // S-03: 강제 차단 Modal의 구조적 뼈대
  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      className="paywall-overlay z-[9999] fixed inset-0 bg-black/95 flex items-center justify-center p-4 transition-opacity duration-300"
    >
      <div className={`relative w-full max-w-4xl ${isFocused ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {/* 🚨 최상단 경고 헤더 (Red Zone) */}
        <header className="p-6 bg-[#C0392B] text-white shadow-2xl border-b-4 border-red-700">
          <h1 className="text-3xl font-extrabold tracking-widest uppercase flex items-center">
            <span className="mr-2 animate-pulse">🚨</span> 시스템 경고: 구조적 리스크 감지
          </h1>
          <p className="mt-1 text-lg opacity-90">당신의 데이터는 심각한 재정적 위험($L_{totalMax}$)에 노출되어 있습니다.</p>
        </header>

        {/* 📊 $L_{totalMax}$ 핵심 시각화 영역 */}
        <div className="py-12 px-8 text-center">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">현재 시스템 리스크 점수</h2>
          <div 
            className="inline-block p-6 bg-red-100 border-4 border-[#C0392B] rounded-lg shadow-inner transform scale-[1.05]"
            aria-label={`${lTotalMax}% 위험도`}
          >
             <p className="text-7xl font-black text-[#C0392B] tracking-tighter">{lTotalMax}%</p>
             <p className="text-lg mt-1 uppercase">위험 지수($L_{totalMax}$)</p>
          </div>
        </div>

        {/* ✍️ 콘텐츠 영역 (S-04: Solution Funnel) */}
        <div className="p-8 bg-white shadow-2xl border-t-4 border-[#2980B9]">
            <h3 className="text-2xl font-bold text-[#2980B9] mb-4">해결책: 안정적인 시스템으로의 전환이 필수적입니다.</h3>
            <p className="mb-6 text-gray-600">현재 상태로는 서비스가 중단될 수 있습니다. 전문가 수준의 분석과 무결성을 확보하려면 Silver Tier 이상의 구독이 필요합니다.</p>

            {/* 💲 가격 비교 UI Placeholder */}
            <div className="flex justify-center gap-8 mt-10">
                <button 
                    className="w-64 py-3 text-xl font-bold rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                    onClick={() => console.log("Basic Tier Click")}
                >
                    Basic (불안정)
                </button>
                 <button 
                    className="w-64 py-3 text-xl font-bold rounded-lg bg-[#2980B9] hover:bg-[#1f6a9e] transition shadow-lg transform scale-[1.02]"
                    onClick={() => console.log("Silver Tier Click")}
                >
                    ✅ Silver Tier (필수)
                </button>
                 <button 
                    className="w-64 py-3 text-xl font-bold rounded-lg bg-[#C0392B] hover:bg-[#a8312b] transition"
                    onClick={() => console.log("Enterprise Tier Click")}
                >
                    🚀 Enterprise (최고 안정)
                </button>
            </div>

             {/* 🔒 Focus Trap이 이 영역을 봉쇄합니다 */}
        </div>
      </div>
    </div>
  );
};

export default PaywallBarrier;