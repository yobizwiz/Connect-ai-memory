// 실시간 리스크 게이지 컴포넌트 (시각적 공포 유발)
import React, { useContext } from 'react';
import { DiagnosisContextType } from '../context/DiagnosisContext';

interface RiskGaugeProps {}

const RiskGaugeComponent: React.FC<RiskGaugeProps> = () => {
    const context = useDiagnosisContext();
    // 실제 Context에서 최신 L_totalMax 값을 가져와야 함. (여기서는 임시로 0 사용)
    const score = context.lTotalMaxScore;

    // 리스크 레벨에 따른 시각적 스타일링 로직
    let statusColor: string;
    let alertText: string;

    if (score >= 85) {
        statusColor = '#C0392B'; // Critical Red Zone
        alertText = '🚨 CRITICAL ALERT: 시스템 마비 직전. 즉각적인 개입 필수.';
    } else if (score >= 60) {
        statusColor = '#FFB700'; // Warning Yellow Zone
        alertText = '⚠️ HIGH RISK: 구조적 공백이 감지되었습니다. 점검 필요.';
    } else {
        statusColor = '#2ECC71'; // Safe Green (최소한의 안도감)
        alertText = '✅ STABLE: 현재 리스크 레벨은 관리가 가능합니다.';
    }

    return (
        <div style={{ 
            borderLeft: `5px solid ${statusColor}`, 
            padding: '20px', 
            marginRight: '30px', 
            background: '#1A1A1A', 
            color: '#E0E0E0' 
        }}>
            <h3 style={{ color: statusColor, borderBottom: `1px solid ${statusColor}` }}>
                $L_{totalMax}$ (Maximum Loss Exposure)
            </h3>
            <div style={{ fontSize: '4em', fontWeight: 'bold', margin: '10px 0' }}>
                {score.toFixed(2)} / 100
            </div>
            <p style={{ color: statusColor, fontWeight: 'bold' }}>{alertText}</p>
        </div>
    );
};

export default RiskGaugeComponent;