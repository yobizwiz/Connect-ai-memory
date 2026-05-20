import React from 'react';
import './RedZoneEffect.css';

// RedZoneEffect는 현재 리스크 레벨에 따라 시각적 경고 시스템을 제어하는 컴포넌트입니다.
interface RedZoneEffectProps {
  currentLevel: RiskLevel; // 현재 계산된 위험 레벨
  isLoading: boolean; // 로딩 상태 여부 (애니메이션 비활성화용)
}

const RedZoneEffect: React.FC<RedZoneEffectProps> = ({ currentLevel, isLoading }) => {
  // RedZone 효과를 적용할지 결정하는 핵심 로직
  const isCritical = currentLevel === 'critical' && !isLoading; 
  const isWarning = currentLevel === 'warning';

  return (
    <div className={`red-zone-container ${isCritical ? 'active-glitch' : ''} ${isWarning ? 'warning-pulse' : ''}`}>
      {/* 배경 글리치 노이즈는 CSS를 통해 제어됩니다. */}
      <div className="glitch-overlay"></div> 

      <div className={`status-card status-${currentLevel}`}>
        <h3>[SYSTEM ALERT]</h3>
        <p>잠재적 손실액(Total Risk Exposure) 분석 결과:</p>
        {/* 리스크 등급에 따른 구체적인 메시지 */}
        {currentLevel === 'critical' ? (
          <>
            <div className="metric-box">
              <span role="img" aria-label="경고">🔥</span>
              <span className="loss-value">$X,XXX,XXX</span>
              <p>즉각적이고 구조적인 생존 위협 감지. 즉시 행동 필요.</p>
            </div>
          </>
        ) : currentLevel === 'warning' ? (
          <>
            <div className="metric-box">
              ⚠️
              <span className="loss-value">$XX,XXX</span>
              <p>주의 단계: 잠재적 결함이 발견됨. 모니터링 및 개선 권장.</p>
            </div>
          </>
        ) : (
          <>
            <div className="metric-box">✅</div>
            <span className="loss-value">$N/A</span>
            <p>시스템 정상 작동 범위 내. 구조적 안정성이 유지되고 있습니다.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default RedZoneEffect;