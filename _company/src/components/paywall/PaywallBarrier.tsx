// src/components/paywall/PaywallBarrier.tsx

import React, { useState, useEffect, useCallback } from 'react';
import styles from './PaywallBarrier.module.css'; // CSS 모듈 사용을 가정합니다.

/**
 * PaywallBarrier 컴포넌트: 리스크 점수를 기반으로 결제 장벽(Funneling)을 구현합니다.
 * @param {number} initialRiskScore - 백엔드에서 받아온 초기 리스크 점수 (0~100).
 * @param {function} onDiagnosisRequest - 진단 요청 CTA 클릭 시 호출될 콜백 함수.
 */
interface PaywallBarrierProps {
  initialRiskScore: number;
  onDiagnosisRequest: (score: number) => void; // A/B 테스트 로직 포함
}

// 🚨 상수 정의 (Hardcoding 금지 원칙을 따르기 위해 상수로 정의, 실제는 환경변수 사용 권장)
const CRITICAL_SCORE_THRESHOLD = 75; // 임계값 설정
const GLITCH_DURATION_MS = 150;

/**
 * PaywallBarrier 컴포넌트 구현
 */
const PaywallBarrier: React.FC<PaywallBarrierProps> = ({ initialRiskScore, onDiagnosisRequest }) => {
  // State Management: 리스크 점수와 실패 여부를 관리합니다.
  const [currentRiskScore, setCurrentRiskScore] = useState(initialRiskScore);
  const [isCriticalFailure, setIsCriticalFailure] = useState(false);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  // 1. 리스크 점수 감지 및 Glitch 상태 트리거 (useEffect)
  useEffect(() => {
    if (initialRiskScore >= CRITICAL_SCORE_THRESHOLD) {
      setIsCriticalFailure(true);
      console.warn(`[SYSTEM ALERT] Critical Risk Score detected: ${initialRiskScore}. Activating Paywall.`);
    } else {
      setIsCriticalFailure(false);
    }
  }, [initialRiskScore]);

  // 2. 결제 요청 핸들러 (Interaction Logic)
  const handleDiagnosisRequest = useCallback(async () => {
    if (!isCriticalFailure) {
        console.error("Paywall가 활성화되지 않아 진단 요청을 차단했습니다.");
        alert("경고: 먼저 시스템 오류 상태를 확인해야 합니다.");
        return;
    }

    setIsLoadingPayment(true);
    // 💡 A/B 테스트 로직 시뮬레이션 (실제는 API 호출 필요)
    console.log(`[A/B Test Log] User attempted diagnosis request at score: ${currentRiskScore}. Channel: ?`);

    try {
      // 🚨 실제로는 백엔드 API를 호출하여 결제 플로우 진입을 요청해야 합니다.
      await new Promise(resolve => setTimeout(resolve, 1500)); // 네트워크 지연 시뮬레이션
      onDiagnosisRequest(currentRiskScore); // 상위 컴포넌트의 콜백 실행 (결제 모달 강제 오픈)
    } catch (error) {
      console.error("Payment Flow Error:", error);
      alert("시스템 오류: 결제 플로우를 초기화할 수 없습니다.");
    } finally {
      setIsLoadingPayment(false);
    }
  }, [isCriticalFailure, currentRiskScore, onDiagnosisRequest]);

  // 3. UI 렌더링 로직 (Mobile First)
  const renderPaywallContent = () => {
    if (!isCriticalFailure && !isLoadingPayment) {
      return <p className={styles.subWarning}>현재 리스크 수준은 관리 가능한 범위 내에 있습니다.</p>;
    }

    // 글리치 애니메이션 적용된 핵심 경고 블록 (Designer Spec 기반)
    const GlitchComponent = (
        <div className={`${styles.alertBox} ${isCriticalFailure ? styles.glitchActive : ''}`} 
             style={{ animationDuration: `${GLITCH_DURATION_MS / 1000}s` }}>
            <h1 className={styles.systemAlertTitle}>SYSTEM ALERT: CRITICAL FAILURE IMMINENT</h1>
            <p className={styles.warningMessage}>WARNING: Your current compliance posture has failed to account for 'Unforeseen Structural Vulnerabilities.' Immediate structural remediation is required.</p>
            <div className={styles.statusCode}>
                &lt;STATUS_CODE&gt; FAILURE | L_GAP: ${currentRiskScore.toLocaleString()} (예상 최대 손실액) &lt;/STATUS_CODE&gt;
            </div>
        </div>
    );

    return (
      <div className={styles.container}>
        {GlitchComponent}
        
        <p className={styles.legalDisclaimer}>📜 법적 의무 고지: '미인지 리스크'에 대한 귀사의 면책은 존재하지 않습니다.</p>

        <button 
          className={`${styles.ctaButton} ${isLoadingPayment ? styles.loading : ''}`} 
          onClick={handleDiagnosisRequest} 
          disabled={isLoadingPayment}
        >
          {isLoadingPayment ? 'VERIFYING INTEGRITY...' : `즉시 전체 무결성 검증 패키지 확보 (${currentRiskScore > 0 ? '구매' : '진단'})`}
        </button>
      </div>
    );
  };

  return (
    <div className={styles.paywallWrapper}>
      {renderPaywallContent()}
    </div>
  );
};

export default PaywallBarrier;