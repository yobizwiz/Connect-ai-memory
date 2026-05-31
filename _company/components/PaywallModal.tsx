import React from 'react';
import { usePaywallFlowHook } from '../contexts/PaywallContext';
import AnalyticsService from '../services/AnalyticsService';

/**
 * PaywallModal: 시스템적 공포를 이용해 구매를 유도하는 결제 게이트 컴포넌트.
 * 이 모달은 전역 상태(context)가 'PAYWALL_ACTIVE'로 변경되었을 때 렌더링됩니다.
 */
const PaywallModal = () => {
    const { state } = usePaywallFlowHook();

    // Context의 상태를 확인하여, 오직 PAYWALL_ACTIVE일 때만 렌더링되도록 강제합니다.
    if (state !== 'PAYWALL_ACTIVE') return null;

    /**
     * Paywall 구매 핸들러: 가상의 결제 API 호출을 시뮬레이션합니다.
     */
    const handlePurchase = async (planName) => {
        console.log(`[Paywall Modal] 💳 ${planName} 플랜 구매 시도...`);

        // 실제 환경에서는 Stripe SDK를 사용해야 하지만, 여기서는 성공/실패 로직을 분리합니다.
        try {
            await new Promise(resolve => setTimeout(resolve, 800)); // 결제 처리 지연 시뮬레이션

            // 임의로 70% 확률로 성공하도록 설정 (A/B 테스트 요소)
            if (Math.random() < 0.7) {
                // SUCCESS Path
                AnalyticsService.logTransactionSuccess(planName);
                alert(`✅ ${planName} 플랜 결제가 완료되었습니다! 시스템 접근 권한이 활성화됩니다.`);
                console.log('[Paywall Modal] Success: 사용자에게 가치를 전달합니다.');
            } else {
                // FAILURE Path (Grace Recovery 테스트용)
                const failureReason = Math.random() < 0.5 ? 'CARD_DECLINED' : 'NETWORK_TIMEOUT';
                AnalyticsService.logTransactionFailure(failureReason);
                alert(`❌ 결제 실패: ${failureReason} 오류가 발생했습니다. 다른 카드를 시도하거나 잠시 후 다시 시도해주세요.`);
            }
        } catch (error) {
            console.error("Payment processing failed:", error);
            AnalyticsService.logTransactionFailure('FATAL_API_ERROR');
        }
    };

    return (
        <div style={styles.overlay}>
            {/* 🚨 시스템적 공포를 유도하는 UI 구조 */}
            <div style={styles.modalContent}>
                <h2 style={styles.header}>[SYSTEM ALERT] 접근 권한 위협 감지</h2>
                <p style={styles.subHeader}>{"당신의 시스템은 현재 $M_{Complexity}$ 임계치를 초과하여 운영 위험에 처했습니다."}</p>

                {/* Interdiction Message */}
                <div style={styles.warningBox}>
                    ⚠️ **경고: 데이터 무결성 손실 우려.** 무료 진단 보고서만으로는 구조적 재앙을 막을 수 없습니다.<br/>
                    시스템의 완전한 보호를 위해서는 유료 방어벽이 필수입니다.
                </div>

                {/* Solution Gateway (CTA) */}
                <div style={styles.solutionGateway}>
                    <h3>🛡️ Silver Tier: 시스템 생존 보험 가입</h3>
                    <p>최신 위협 예측($I_k$) 데이터와 무결성 검증을 24시간 제공받으세요.</p>
                    <button 
                        onClick={() => handlePurchase('Silver Tier')} 
                        style={styles.ctaButton}
                    >
                        시스템 보호 가입 (지금 결제)
                    </button>
                </div>

                {/* 추가 CTA */}
                 <button 
                    onClick={() => AnalyticsService.logPaywallEvent('FREE_REPORT_CLICK', { source: 'Modal' })}
                    style={{...styles.ctaButton, backgroundColor: '#444', marginTop: '10px'}}
                >
                    무료 진단 보고서만 요청하기 (로그 기록됨)
                </button>
            </div>
        </div>
    );
};

// 기본적인 스타일 정의 (실제로는 CSS/Styled-Components 사용 권장)
const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    },
    modalContent: {
        background: '#1a1a2e', padding: '40px', borderRadius: '15px', maxWidth: '600px', width: '90%', boxShadow: '0 0 30px rgba(255, 0, 0, 0.5)'
    },
    header: { color: '#ff4d4d', borderBottom: '2px solid #ff4d4d', paddingBottom: '10px' },
    subHeader: { fontSize: '1.1em', color: '#ccc' },
    warningBox: { background: '#3a0000', padding: '20px', borderLeft: '5px solid #ff0000', margin: '20px 0' },
    solutionGateway: { padding: '20px', borderTop: '1px dashed #4CAF50', marginTop: '20px' },
    ctaButton: {
        padding: '12px 25px', fontSize: '1.1em', cursor: 'pointer', 
        border: 'none', borderRadius: '8px', transition: 'background-color 0.3s', margin: '5px'
    },
};

export default PaywallModal;