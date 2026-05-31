// PaywallBarrierModal.tsx - Core Component: Displays the calculated risk level and forces action.

import React, { useState } from 'react';

interface RiskResult {
    lMax: number; // 최대 잠재 손실액 (Millions USD)
    tre: number;  // 최종 위험 노출도 (TRE Score)
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface PaywallBarrierModalProps {
    result: RiskResult;
    onActionClick: () => void; // 강제 진입 시뮬레이션 핸들러
}

const getRiskColor = (level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
    switch (level) {
        case 'LOW': return '#2ecc71'; // Green, 낮은 경고
        case 'MEDIUM': return '#f39c12'; // Orange/Yellow, 주의
        case 'HIGH': return '#e67e22'; // Strong Orange, 위험 감지
        case 'CRITICAL': return '#C0392B'; // Dark Crimson, 시스템 오류 경고 (Self-RAG)
    }
};

const PaywallBarrierModal: React.FC<PaywallBarrierModalProps> = ({ result, onActionClick }) => {
    // StatusGauge 시각화를 위한 계산된 색상과 텍스트
    const riskColor = getRiskColor(result.riskLevel);
    const titleText = `[🚨 시스템 경고] 위험 노출도 초과 감지 (${result.riskLevel} 레벨)`;

    return (
        <div style={styles.modalOverlay}>
            <div style={{...styles.modalContent, border: `1px solid ${riskColor}`, boxShadow: `0 0 30px rgba(192, 57, 43, 0.5)`}}>
                
                {/* Header & Title */}
                <header style={styles.header}>
                    <h1 className="neon-glow">{titleText}</h1>
                </header>

                {/* StatusGauge Display (The Core Value) */}
                <section style={styles.statusGaugeContainer}>
                    <h2>🌐 실시간 위험 노출도 분석 결과</h2>
                    <div style={styles.gaugeWrapper}>
                        <div style={{ 
                            ...styles.gaugeFill, 
                            width: `${Math.min(100, result.tre * 0.5)}%`, // TRE를 기준으로 시각적 크기 조정
                            backgroundColor: riskColor 
                        }}></div>
                    </div>
                    <p style={styles.gaugeValue}>{result.tre.toLocaleString()} Score</p>
                </section>

                {/* The Paywall Barrier */}
                <div style={styles.paywallBox}>
                    <h3>🔒 시스템 접근 불가 (Access Denied)</h3>
                    <p className="warning-message">
                        현재 분석된 위험 노출도(TRE: {result.tre} Score, Lmax: ${result.lMax.toLocaleString()}M)는 비즈니스 활동의 지속 가능성을 위협하는 수준입니다. 
                        이 리스크를 무시하고 진행할 경우, 최대 잠재 손실액($L_{max}$) 초과로 인한 법적/재무적 피해가 예상됩니다.
                    </p>
                    <button onClick={onActionClick} style={styles.ctaButton}>
                        ✅ 생존 필수 보험료 결제 및 시스템 권한 확보 ({riskColor})
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PaywallBarrierModal;


// ⚠️ 스타일 정의 (Design Tokens 기반)
const styles = {
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(5px)'
    },
    modalContent: {
        maxWidth: '900px', width: '95%', padding: '40px', borderRadius: '15px', 
        background: 'rgba(26, 26, 26, 0.8)', // --color-bg
        border: '2px solid #333', 
        textAlign: 'center'
    },
    header: {
        marginBottom: '30px',
    },
    statusGaugeContainer: {
        padding: '40px 0', borderBottom: '1px dashed #444', marginBottom: '30px'
    },
    gaugeWrapper: {
        height: '25px', backgroundColor: '#333', borderRadius: '12.5px', overflow: 'hidden', margin: '20px 0'
    },
    gaugeFill: {
        height: '100%', transition: 'width 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)', // 애니메이션 효과 추가
        transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    },
    gaugeValue: {
        fontSize: '3rem', color: '#E0E0E0', fontFamily: 'Roboto Mono, monospace' // --font-data
    },
    paywallBox: {
        padding: '40px 20px', backgroundColor: 'rgba(35, 128, 185, 0.1)', borderTop: '2px solid #2980B9' // --color-blue-authority
    },
    warningMessage: {
        fontSize: '1.1rem', color: '#E0E0E0', marginBottom: '30px', lineHeight: '1.6'
    },
    ctaButton: {
        padding: '15px 40px', fontSize: '1.2rem', cursor: 'pointer', border: 'none', 
        borderRadius: '8px', backgroundColor: '#2980B9', color: 'white', transition: 'background-color 0.3s'
    }
};