import React from 'react';
import { useRiskEngine } from '../hooks/useRiskEngine';
import { RiskParameters } from '../types/risk-types';

// 리스크 점수 게이지 컴포넌트
const RiskScoreGauge: React.FC<{ params: RiskParameters }> = ({ params }) => {
    // 훅을 사용하여 실시간 상태를 가져옵니다.
    const { riskState, currentScore } = useRiskEngine(params);

    let gaugeColorClass = 'gauge-normal';
    if (riskState.isCritical) {
        gaugeColorClass = 'gauge-critical'; // Critical Red Zone
    } else if (currentScore > params.lMaxThreshold * 0.7) {
        gaugeColorClass = 'gauge-warning'; // Yellow/Orange Warning Zone
    }

    return (
        <div className="risk-score-container">
            <h3>현재 운영 리스크 점수</h3>
            <p className={`score ${gaugeColorClass}`}>{currentScore.toFixed(2)} / {params.lMaxThreshold}</p>
            
            {/* 게이지 바 시각화 */}
            <div className="gauge-bar-wrapper">
                <div 
                    className={`gauge-fill ${gaugeColorClass}`} 
                    style={{ width: `${Math.min(100, (currentScore / params.lMaxThreshold) * 100)}%` }}
                ></div>
            </div>

            <p className="status-text">
                {riskState.isCritical ? "🚨 Critical State: 즉각적인 구조적 위험 감지." : "✅ Normal Status: 안정적으로 운영 중입니다."}
            </p>
        </div>
    );
};

export default RiskScoreGauge;