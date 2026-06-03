import React, { useState, useCallback } from 'react';
import './styles.module.css'; // CSS Module 사용 예정
import PaywallModal from '../PaywallModal';

// ------------------------------------------
// 1. [Interface Definition] 데이터와 상태를 명확히 정의합니다.
// ------------------------------------------
interface ThreatGaugeProps {
  initialMaxLoss: number; // 초기 최대 손실액 (%)
}

/**
 * Structural Risk Threat Gauge Component
 * $L_{max}$ 데이터를 받아 3단계 임계치에 따라 시각적 공포를 조성하는 핵심 컴포넌트.
 */
const ThreatGauge: React.FC<ThreatGaugeProps> = ({ initialMaxLoss }) => {
  // 게이지의 현재 리스크 레벨 상태 관리 (모킹된 API 호출 결과를 반영)
  const [riskLevel, setRiskLevel] = useState(initialMaxLoss); 
  // 모달 열림/닫힘 상태
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * 리스크 레벨을 기반으로 시스템의 위협 단계와 색상을 결정합니다. (Core Logic)
   */
  const { currentStage, threatColorClass } = calculateRiskLevel(riskLevel);

  /**
   * 게이지 클릭 핸들러: '진단 요청' 버튼 클릭 시 Paywall Modal을 띄웁니다.
   * @param e 이벤트 객체
   */
  const handleDiagnosisClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    // 핵심 로직: 공포를 극대화하여 결제를 강제합니다.
    setIsModalOpen(true);
  }, []);

  return (
    <div className={`p-8 bg-[#1A1A1A] text-white border-b-4 ${threatColorClass} transition-all duration-700`}>
      <h2 className="text-3xl font-extrabold tracking-widest mb-4 uppercase">
        Structural Risk Threat Gauge 🚨
      </h2>
      <p className="mb-8 text-lg max-w-3xl text-gray-400">
        귀하의 비즈니스 모델이 직면한 잠재적 최대 재정 손실액({"$L_{max}$"})을 실시간으로 분석합니다. 이 수치는 단순한 추정이 아닌, 시스템 무결성 관점에서 계산된 '위협 지수'입니다.
      </p>

      {/* 핵심 게이지 컨테이너: 클릭 가능한 영역 */}
      <div 
        className={`relative p-6 cursor-pointer transition-all duration-1000 transform hover:scale-[1.01] ${threatColorClass} rounded-lg shadow-2xl`}
        onClick={handleDiagnosisClick}
        role="button"
        aria-label="진단 요청 버튼을 눌러 잠재적 재정 손실액에 대한 진단을 받아보세요."
      >
        {/* 1. 리스크 수치 표시 (가장 큰 요소) */}
        <div className="text-[6rem] font-black tracking-tight mb-2 drop-shadow-xl">
          {riskLevel.toFixed(1)}%
        </div>
        
        {/* 2. 위협 단계 및 설명 (권위적인 문구) */}
        <p className={`text-xl font-semibold uppercase ${currentStage === 'Critical' ? 'text-red-500 glitch-effect' : 'text-yellow-400'} mb-6`}>
          {getStageDescription(currentStage)}
        </p>

        {/* 3. 시각적 게이지 막대 (Progress Bar) */}
        <div className="w-full h-1 bg-gray-700 relative">
          <div 
            className={`absolute h-full transition-all duration-1000 ease-out ${threatColorClass} rounded-full`}
            style={{ width: `${riskLevel}%` }}
          ></div>
        </div>

        {/* 4. CTA 버튼 (가장 눈에 띄게) */}
        <button className="mt-8 w-full py-3 bg-red-700 hover:bg-red-600 text-white font-bold uppercase transition duration-200 shadow-lg transform hover:-translate-y-0.5">
          🚨 지금 즉시 구조적 진단 요청하기 (Funneling CTA)
        </button>
      </div>

      {/* Paywall Modal은 컴포넌트 외부에서 상태에 따라 제어됩니다. */}
      {isModalOpen && <PaywallModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

// ------------------------------------------
// Helper Functions (로직 분리)
// ------------------------------------------

/**
 * 리스크 레벨에 따른 단계 및 스타일을 계산하는 유틸리티 함수.
 * @param level $L_{max}$ 값 (0~100)
 * @returns {object} currentStage, threatColorClass
 */
export const calculateRiskLevel = (level: number) => {
    // 입력값 검증 및 클램핑 (Defensive Programming)
    const clampedLevel = Math.max(0, Math.min(100, level));

    let stage: 'Safe' | 'Warning' | 'Critical';
    let colorClass: string;

    if (clampedLevel < 30) {
        stage = 'Safe';
        // Safe 상태는 너무 강렬하면 오히려 신뢰도를 떨어뜨리므로, 시스템 기본 색상으로 유지합니다.
        colorClass = 'border-green-700 bg-[#1f2937]'; 
    } else if (clampedLevel >= 30 && clampedLevel < 65) {
        stage = 'Warning';
        colorClass = 'border-yellow-700 bg-[#2d2c2b]';
    } else {
        // Critical: Neon Red Zone Alert. 가장 강력한 시각적 위협을 부여합니다.
        stage = 'Critical';
        // 글리치 효과가 들어갈 메인 클래스 정의
        colorClass = 'border-[#DC2626] bg-black shadow-[0_0_30px_rgba(220,38,38,0.5)]'; 
    }

    return { currentStage: stage, threatColorClass: colorClass };
};

/**
 * 단계별 설명을 반환합니다.
 */
const getStageDescription = (stage: 'Safe' | 'Warning' | 'Critical'): string => {
    switch(stage) {
        case 'Safe': return "시스템 무결성 확보 단계 (Low Risk)";
        case 'Warning': return "구조적 취약점 발견 (Monitoring Required)";
        case 'Critical': return "즉각적인 시스템 리스크 발생 (Action Required)";
    }
};

export default ThreatGauge;