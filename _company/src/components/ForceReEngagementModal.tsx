import React from 'react';

interface ModalProps {
    onAcknowledge: () => void; // 사용자가 경고를 인지하고 다음 단계로 넘어갈 때 호출되는 콜백
}

const ForceReEngagementModal: React.FC<ModalProps> = ({ onAcknowledge }) => {
    return (
        <div style={styles.backdrop}>
            <div style={styles.modalContent}>
                <h2 style={styles.header}>🚨 SYSTEM INTERVENTION REQUIRED 🚨</h2>
                <p style={styles.bodyText}>
                    잠시만요. 결제 과정 중 **시스템적 구조적 결함(Structural Flaw)**이 감지되었습니다.
                </p>
                <div style={styles.warningBox}>
                    <strong>[경고]</strong> 현재 귀사가 직면한 리스크는 단순한 불편함 수준을 넘어, 
                    최소 연간 ${'12,345,678'} 이상의 재무적 손실(Quantified Loss)을 야기할 수 있습니다.
                </div>
                <p style={styles.ctaText}>
                    이 리스크를 방치하고 이탈하는 것은 시스템의 가장 큰 결함입니다. 
                    정확한 진단과 해결책은 유료 플로우를 통해서만 접근 가능합니다.
                </p>
                <button onClick={onAcknowledge} style={styles.button}>
                    [시스템 인지] 경고 메시지 확인 및 다음 단계 진행
                </button>
            </div>
        </div>
    );
};

export default ForceReEngagementModal;

// 간단한 스타일 정의 (실제 프로젝트에서는 CSS 모듈 사용)
const styles: { backdrop: any, modalContent: any, header: any, bodyText: any, warningBox: any, ctaText: any, button: any } = {
    backdrop: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: '#2c3e50', padding: '40px', borderRadius: '10px', maxWidth: '600px', width: '90%', boxShadow: '0 0 20px rgba(255, 0, 0, 0.5)' },
    header: { color: '#e74c3c', borderBottom: '2px solid #e74c3c', paddingBottom: '10px' },
    bodyText: { fontSize: '1.1em', margin: '20px 0' },
    warningBox: { background: '#8b0000', color: '#f0f0f0', padding: '15px', borderRadius: '5px', marginBottom: '20px', borderLeft: '5px solid #ff4d4d' },
    ctaText: { fontSize: '0.9em', color: '#bdc3c7', textAlign: 'center', marginBottom: '30px' },
    button: { backgroundColor: '#e74c3c', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.3s' }
};