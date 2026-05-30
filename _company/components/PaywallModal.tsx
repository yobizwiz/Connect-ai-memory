import React from 'react';
import { RiskData } from './types';
// ⚙️ 이 컴포넌트는 useDiagnosisFlow에서 전달받은 props를 통해 데이터를 바인딩합니다.

interface PaywallProps {
    riskData: RiskData;
    onClose: () => void;
    onSubscribe: (data: RiskData) => Promise<boolean>; // 구독 로직 함수 받기
}

const PaywallModal: React.FC<PaywallProps> = ({ riskData, onClose, onSubscribe }) => {
    // 1. 데이터 바인딩 기반의 경고 메시지 생성 로직 (Lmax 활용)
    const getWarningMessage = () => {
        if (riskData.riskLevel === 'CRITICAL') {
            return `🚨 CRITICAL ALERT: 현재 당신의 총 위험 노출액($TRE=${riskData.totalRiskExposure}점)은 시스템 임계치를 심각하게 초과했습니다. 즉각적인 보호 조치가 필요합니다.`;
        }
        return `⚠️ WARNING: 위험 수준이 감지되었습니다. 추가 진단 및 보험 가입을 권장합니다.`;
    };

    // 2. 구독(결제) 핸들러
    const handleSubscription = async () => {
        console.log("Attempting subscription...");
        try {
            const success = await onSubscribe(riskData); // 실제 결제 API 호출 시뮬레이션
            if (success) {
                alert('✅ 구독이 성공적으로 완료되었습니다! 리스크 방어 시스템이 활성화됩니다.');
                // TODO: Success 상태로 플로우를 종료하고, 사용자에게 Dashboard 업데이트 요청
            } else {
                alert('❌ 결제 실패. 카드 정보를 확인해 주세요.');
            }
        } catch (e) {
            alert('🚨 치명적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
    };

    return (
        <div className="modal-overlay" style={{ 
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div className="paywall-modal" style={{ 
                background: '#2c3e50', color: '#ecf0f1', padding: '40px', borderRadius: '15px', maxWidth: '600px', width: '90%', boxShadow: '0 0 30px rgba(255, 0, 0, 0.7)'
            }}>
                <h2 style={{ color: '#e74c3c' }}>🔒 시스템 경고: 리스크 방어 Paywall</h2>
                <p style={{ fontSize: '1.1em', marginBottom: '20px' }}>{getWarningMessage()}</p>

                <div style={{ borderTop: '1px solid #34495e', padding: '20px 0' }}>
                    <h3>진단 보고서 요약</h3>
                    <p><strong>총 위험 노출액 (TRE):</strong> {riskData.totalRiskExposure}점</p>
                    <p><strong>위험 등급:</strong> <span style={{ color: riskData.riskLevel === 'CRITICAL' ? '#e74c3c' : '#f1c40f', fontWeight: 'bold' }}>{riskData.riskLevel}</span></p>
                </div>

                <div style={{ marginTop: '30px' }}>
                    <button 
                        onClick={handleSubscription} 
                        style={{ padding: '15px 30px', fontSize: '1.2em', cursor: 'pointer', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px' }}
                    >
                        {"🛡️ 리스크 방어 보험 가입 (지금 $L_{max}$를 막으세요)"}
                    </button>
                </div>

                <button 
                    onClick={onClose} 
                    style={{ marginLeft: '15px', padding: '10px 20px', fontSize: '1em', cursor: 'pointer', background: '#34495e', color: 'white', border: 'none', borderRadius: '8px' }}
                >
                    닫기 (진단 보고서만 보기)
                </button>
            </div>
        </div>
    );
};

export default PaywallModal;