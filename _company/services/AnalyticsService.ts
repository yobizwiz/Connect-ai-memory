/**
 * AnalyticsService: 모든 핵심 사용자 상호작용을 기록하는 서비스 계층입니다.
 * A/B 테스트를 염두에 둔 구조로 설계되었습니다.
 */

// 가상의 환경 변수 또는 API 호출 함수라고 가정합니다.
const sendEventToServer = (eventKey, properties) => {
    console.log(`[ANALYTICS] -> Event Sent: ${eventKey}`, properties);
    // 실제 구현 시: fetch('/api/analytics', { method: 'POST', body: JSON.stringify({ event: eventKey, data: properties }) });
};

/**
 * Paywall Flow에서 발생하는 핵심 이벤트를 기록합니다.
 * @param {string} stage - 현재 트랜잭션 단계 (e.g., 'FREE_REPORT_CLICK', 'PAYWALL_VIEW', 'PURCHASE_SUCCESS')
 * @param {object} [data={}] - 추가 메타데이터 (e.g., userTier, source)
 */
export const logPaywallEvent = (stage, data = {}) => {
    const timestamp = new Date().toISOString();
    
    // A/B 테스트 그룹 식별자를 강제합니다.
    const abGroup = localStorage.getItem('ab_test_group') || 'control'; 

    sendEventToServer(`paywall_${stage}`, { 
        timestamp, 
        ...data, 
        ab_group: abGroup 
    });
};

/**
 * 트랜잭션 완료 후 성공 로깅
 * @param {string} planName - 구매한 플랜 이름 (예: 'Silver Tier')
 */
export const logTransactionSuccess = (planName) => {
    logPaywallEvent('TRANSACTION_SUCCESS', { 
        purchased_plan: planName, 
        status: 'success' 
    });
};

/**
 * 트랜잭션 실패 로깅 (Grace Recovery 준비)
 * @param {string} reason - 실패 이유 (예: 'CARD_DECLINED', 'API_ERROR')
 */
export const logTransactionFailure = (reason) => {
    logPaywallEvent('TRANSACTION_FAILURE', { 
        failure_reason: reason, 
        status: 'failed' 
    });
};

export default {
    logPaywallEvent,
    logTransactionSuccess,
    logTransactionFailure,
};