// Gatekeeping Section: Main component integrating time, action, and CTA logic
import React, { useState } from 'react';
import { useLossCalculator } from '../hooks/useLossCalculator';
import InputForm from './InputForm';

const GatekeepingSection = () => {
  // 1. Hook 사용하여 QLoss 상태 관리 (전역처럼 동작하도록 설계)
  const { currentQLoss, riskLevel } = useLossCalculator(0);
  const [formData, setFormData] = useState({ name: '', email: '' });

  // 2. '최후 통첩' CTA 버튼의 애니메이션 및 클릭 강제 로직 핸들링
  const handleFinalWarningClick = () => {
    console.log("!!! FINAL WARNING TRIGGERED !!!");
    alert(`[SYSTEM ALERT] QLoss가 ${currentQLoss.toFixed(0)}에 도달했습니다. 즉시 전문가 컨설팅이 필요합니다.`);
    // 실제로는 여기서 CTA의 백엔드 API 호출 로직 실행
  };

  // 3. 리스크 레벨 기반의 Tailwind CSS 클래스 매핑 (Red Zone 적용)
  const getLossStyles = (level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
    switch(level) {
      case 'LOW': return "border-green-500 text-green-700";
      case 'MEDIUM': return "border-yellow-500 text-yellow-700";
      case 'HIGH': return "border-orange-600 text-orange-800";
      case 'CRITICAL': return "animate-pulse border-red-600 bg-red-900/10 shadow-[0_0_30px_rgba(255,0,0,0.7)] border-4 border-red-600 text-red-800";
    }
  };

  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <h2 className="text-5xl font-extrabold mb-12 tracking-tighter uppercase">
          Systemic Risk Assessment Gateway <span className="text-red-500">[{riskLevel}]</span>
        </h2>

        {/* QLoss Display Area */}
        <div 
            className={`p-8 rounded-xl shadow-2xl transition-all duration-1000 mb-12 ${getLossStyles(riskLevel)}`}
            style={{ transform: riskLevel === 'CRITICAL' ? 'scale(1.03)' : 'scale(1)' }}
        >
          <p className="text-lg uppercase tracking-[0.3em]">Estimated Potential Loss ($QLoss)</p>
          <h3 className="text-8xl font-mono mt-2 transition-all duration-500" 
              style={{ color: riskLevel === 'CRITICAL' ? '#FF4136' : (riskLevel === 'HIGH' ? '#FFDC00' : '#90EE90') }}
          >
            ${currentQLoss.toFixed(0)}
          </h3>
          <p className="mt-2 text-xl">시간 경과 및 정보 미입력으로 인한 추정 손실액</p>
        </div>

        {/* Input Form and Action Trigger */}
        <div className="mb-16 p-8 bg-gray-800 rounded-lg shadow-inner border border-gray-700">
          <h3 className="text-3xl font-semibold mb-6 text-red-400">위험 노출 최소화를 위해 정보를 입력하십시오.</h3>
          <InputForm 
            onValidationFailure={() => { /* 2. 행동 미완료 시 QLoss 급증 트리거 */ }}
          />
        </div>

        {/* Final Warning CTA */}
        <button
          onClick={handleFinalWarningClick}
          className={`w-full py-5 text-xl font-bold uppercase transition-all duration-300 ${
            riskLevel === 'CRITICAL' 
              ? 'bg-red-700 hover:bg-red-600 animate-[pulse_1s_infinite] shadow-lg shadow-red-900/50 cursor-pointer transform scale-[1.02]' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
            {/* 3. CTA의 인터랙티브 애니메이션 적용 */}
            {riskLevel === 'CRITICAL' ? "🚨 경고! 지금 즉시 전문가에게 컨설팅 요청 (필수)" : "무료 진단 보고서 받기"}
        </button>

      </div>
    </section>
  );
};

export default GatekeepingSection;