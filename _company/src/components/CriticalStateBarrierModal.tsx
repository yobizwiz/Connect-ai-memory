import React from 'react';
// Designer가 정의한 토큰을 기반으로 스타일링합니다. (CSS Module 가정)
import styles from './CriticalStateBarrierModal.module.css'; 

interface ModalProps {
    isOpen: boolean;
    onCloseAction: () => void; // Paywall 종료 시 액션
}

// Modal 컴포넌트 - 이 컴포넌트는 Critical 상태 진입을 유도하는 '게이트' 역할을 합니다.
const CriticalStateBarrierModal: React.FC<ModalProps> = ({ isOpen, onCloseAction }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Critical Risk Warning">
            <div className={styles.modalContent}>
                {/* 1. 상단 시스템 경고 헤더 */}
                <header className={styles.header}>
                    <span className={`${styles.icon}`}>⚠️</span>
                    <h1 className={styles.title}>SYSTEM ALERT: Critical Structural Gap Detected</h1>
                </header>

                {/* 2. 공포 조성 섹션 (L_max 임계값 제시) */}
                <section className={styles.coreMessageContainer}>
                    <p className={styles.warningText">
                        현재 귀사의 운영 리스크 점수가 **임계치($L_{max}$)를 초과**했습니다.
                    </p>
                    <div className={styles.riskDisplay}>
                        <span>최대 허용 위험:</span> 
                        <strong className={styles.lMaxValue}>XXX $</strong>
                    </div>
                </section>

                {/* 3. 결제 유도 및 CTA */}
                <div className={styles.ctaSection}>
                    <p className={styles.reasoningText}>
                        이러한 수준의 구조적 공백(Structural Gap)은 외부 법규 위반이나 재정 손실($L_{max}$)로 즉시 이어질 수 있습니다. 
                        **yobizwiz의 Gap Analysis 보고서가 유일한 해결책입니다.**
                    </p>
                    <button 
                        className={styles.paywallButton} 
                        onClick={() => {
                            // 실제 결제 API 호출 로직이 여기에 들어갑니다.
                            console.log("--- Payment Gateway Triggered ---");
                            onCloseAction(); // 모달 종료 및 다음 페이지로 이동 시뮬레이션
                        }}
                    >
                        Gap Analysis 보고서 구매 ($1,999)
                    </button>
                </div>

                {/* 4. 애니메이션 Placeholder (Glitch Noise) */}
                <div className={styles.glitchPlaceholder}>
                    {/* 실제 구현 시: CSS Keyframe/WebGL을 이용한 Glitch Effect 적용 필요 */}
                    [SYSTEM GLITCH NOISE ACTIVE]
                </div>
            </div>
        </div>
    );
};

export default CriticalStateBarrierModal;