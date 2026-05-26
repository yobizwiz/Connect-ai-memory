/**
 * @fileoverview Red Zone 및 위기 레벨에 따른 동적 스타일링과 Glitch 효과 제어를 위한 커스텀 훅.
 * 이 훅은 컴포넌트가 리스크 상태 변화에 따라 불안정한 시각적 경험을 하도록 강제합니다.
 */
import { useState, useEffect } from 'react';

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export const useRedZone = (initialRisk: RiskLevel): { riskLevel: RiskLevel; isCritical: boolean; getStyles: () => React.CSSProperties } => {
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(initialRisk);

  // 리스크 레벨 변화 감지 및 강제 업데이트 로직 (시뮬레이션)
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (riskLevel === 'CRITICAL') {
      console.warn("🚨 CRITICAL Risk detected. Glitch/Red Zone active.");
      // 5초마다 강제 리스크 상향 시뮬레이션
      intervalId = setInterval(() => {
        setRiskLevel('HIGH'); // 상태가 이미 최고치면 유지하거나 다른 액션을 취함
      }, 5000);
    } else if (riskLevel === 'LOW') {
       // Low risk에서는 노이즈나 깜빡임 효과를 제거하는 로직 추가 가능.
    }

    return () => clearInterval(intervalId);
  }, [riskLevel]);


  const isCritical = riskLevel === 'CRITICAL';

  /**
   * 현재 리스크 레벨에 따른 스타일 객체를 반환합니다. (실제 구현 시 CSS-in-JS나 Tailwind 조합 필요)
   */
  const getStyles = () => {
    let baseColor: string;
    let opacityLevel: number;

    switch (riskLevel) {
      case 'CRITICAL':
        baseColor = '#FF0000'; // Pure Red
        opacityLevel = 1.0;
        break;
      case 'HIGH':
        baseColor = '#CC0000'; // Darker Red / Warning
        opacityLevel = 0.85;
        break;
      case 'MEDIUM':
        baseColor = '#FFB300'; // Amber/Warning Yellow
        opacityLevel = 0.6;
        break;
      case 'LOW':
      default:
        baseColor = '#1e40af'; // Authority Blue (Calm)
        opacityLevel = 0.2;
    }

    return {
      // 배경 오버레이에 적용될 스타일 예시
      backgroundColor: baseColor,
      backgroundImage: `linear-gradient(to right, transparent, ${baseColor} ${opacityLevel * 100}%), linear-gradient(to bottom, transparent, ${baseColor} ${opacityLevel * 100}% )`,
      backgroundSize: '200% 200%',
      transition: 'all 0.5s ease',
      // Glitch 효과를 위한 추가 CSS 클래스 적용 로직이 필요함 (예: animate-glitch)
    };
  };

  return { riskLevel, isCritical, getStyles };
};