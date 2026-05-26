import React from 'react';

interface HeroProps {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  onSubmitRequest: (data: any) => Promise<void>; // API 핸들러 받기
}

const HeroSection: React.FC<HeroProps> = ({ riskLevel, onSubmitRequest }) => {
  // Tailwind CSS를 사용한다고 가정하고 스타일링을 합니다. 
  // 실제 Red Zone 효과는 부모 컴포넌트의 useRedZone 훅이 담당합니다.

  return (
    <section className="py-24 text-center relative z-10">
      {/* 글리치/위협 메시지 */}
      <div className="text-red-500 animate-glitch mb-6 inline-block">[SYSTEM ALERT: STRUCTURAL INTEGRITY COMPROMISED]</div>
      
      <h1 className="text-7xl font-extrabold text-white leading-tight tracking-tighter">
        당신의 비즈니스는 <span className="text-yellow-400 transition duration-300 hover:scale-105">지금</span>, 붕괴 직전입니다.
      </h1>
      <p className="mt-6 text-xl max-w-3xl mx-auto text-gray-300">
        단순한 리스크 진단이 아닙니다. 구조적 결함(Structural Defect)을 찾아내어, 당신의 시스템적 생존 위협을 체감하게 만듭니다.
      </p>

      {/* CTA 버튼 */}
      <button 
        onClick={() => onSubmitRequest({ riskScore: 0.9 })} // 임시 데이터 전달
        className="mt-12 px-12 py-4 text-xl font-bold rounded-none bg-red-600 hover:bg-red-700 transition duration-300 shadow-2xl transform hover:-translate-y-1"
      >
        🚨 즉시 위협 진단 요청 (Audit Request)
      </button>
    </section>
  );
};

export default HeroSection;