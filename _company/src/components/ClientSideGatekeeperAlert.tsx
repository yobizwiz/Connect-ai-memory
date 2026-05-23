import React, { useState, useCallback } from 'react';

// Props 정의: 리스크 스코어와 경고 메시지를 받습니다.
interface GatekeeperProps {
  riskScore: number;
  onProceed: () => void; // 사용자가 이 경고를 무시하고 진행할 때 호출되는 콜백
}

/**
 * @description 리스크 스코어가 임계치를 초과했을 때, 사용자 액션을 강제적으로 중단시키는 컴포넌트.
 * 시스템적 위협을 체감하게 만드는 게이트키퍼 역할을 합니다.
 */
const ClientSideGatekeeperAlert: React.FC<GatekeeperProps> = ({ riskScore, onProceed }) => {
  const [isVisible, setIsVisible] = useState(false);

  // 70% (0.7) 임계치 초과 여부를 체크합니다.
  if (riskScore < 0.7) {
    return null; // 위험도가 낮으면 아무것도 하지 않습니다.
  }

  const handleAlertTrigger = useCallback(() => {
    setIsVisible(true);
    // 경고가 표시되면, 실제로 CTA를 막는 부모 컴포넌트의 로직이 필요합니다.
    // 여기서는 시각적 차단과 함께 콜백을 준비합니다.
  }, []);

  const handleDismissAttempt = () => {
    // CEO 지시사항에 따라, 이 경고는 절대 쉽게 해제되어서는 안 됩니다.
    alert("🚨 시스템 위협 감지! 비상 정지 프로토콜이 작동했습니다. 데이터 분석을 거치지 않고 다음 단계로 넘어갈 수 없습니다.");
    console.error("[GATEKEEPER_ALERT] 사용자 액션 차단됨. 리스크 스코어:", riskScore);
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      {/* 배경 오버레이: 시스템 오류 느낌의 Red Zone */}
      <div className="absolute inset-0 bg-red-950/80 backdrop-blur-[1px] animated-glitch"></div>
      
      {/* 실제 경고 모달 */}
      <div 
        className={`relative z-10 p-12 max-w-xl w-full text-center transform transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        style={{ backgroundColor: '#8b0000', boxShadow: '0 0 40px rgba(255, 0, 0, 0.7)' }}
      >
        <div className="text-6xl animate-pulse mb-4">🚨</div>
        <h1 className="text-4xl font-extrabold text-red-300 uppercase tracking-wider mb-2">
          [!! 시스템 경고 !!] Critical Integrity Breach Detected.
        </h1>
        <p className="text-xl text-red-100 mb-6">
          ⚠️ 구조적 생존 위협이 감지되었습니다. 현재 리스크 스코어: <span className="font-mono text-yellow-300">{Math.round(riskScore * 100)}%</span>
        </p>
        <div className="mb-8 p-4 border-2 border-red-600 bg-black/30">
            <h3 className="text-xl text-white font-semibold mb-2">🛑 Gatekeeper Alert: Pre-Action Interruption</h3>
            <p className="text-sm text-red-200">
                진행하시려는 다음 액션은 **즉각적인 재무적 손실(Financial Loss)**을 초래할 수 있습니다. 
                이 보고서는 단순 진단이 아닌, 구조적 생존 위협의 시뮬레이션입니다.
            </p>
        </div>

        <button 
          onClick={() => {
              // 사용자에게 강제적인 고민 시간을 준 후 진행하게 합니다.
              handleDismissAttempt(); // 실제로는 여기서 다음 단계로 넘어가지 못하도록 막아야 함.
          }}
          className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold uppercase transition duration-200 disabled:opacity-40"
        >
          [진행 불가] 더 많은 정보를 받아보려면 전문가 상담이 필요합니다.
        </button>
      </div>
    </div>
  );
};

export default ClientSideGatekeeperAlert;