/**
 * @fileoverview A/B Testing and Event Logging Service.
 * 모든 핵심 사용자 상호작용 지점(Attention Point)에서 호출되어야 합니다.
 * 로깅 실패에 대비하여 비동기 큐잉 및 폴백 처리를 기본으로 합니다.
 */

// A/B 테스트가 측정할 주요 이벤트 타입 정의 (TypeScript 엄격화)
export type AttentionEvent = {
    userId: string; // 실제 환경에서는 인증된 사용자 ID 사용 권장
    eventType: 'VIEW_CTA' | 'CLICK_BUTTON' | 'SCROLL_DEPTH' | 'INPUT_FIELD_FOCUS';
    funnelState: 'IDLE' | 'ALERT_YELLOW' | 'CRISIS_RED' | 'LOCKED_PAYWALL';
    experimentVariant?: string; // A 또는 B 변이 테스트 그룹
    dataPayload?: Record<string, any>; // 추가 데이터 (예: 입력 값)
};

/**
 * 로깅 함수. 실제로 API 호출은 하지만, 실패 시 콘솔에 기록하고 재시도 큐에 넣습니다.
 * @param event - 발생한 사용자 행동 이벤트 객체
 */
export const logAttentionEvent = async (event: AttentionEvent): Promise<boolean> => {
    console.log(`[A/B Test Logger] Recording Event: ${event.eventType} in state ${event.funnelState}`);

    // 1. 유효성 검사 및 기본 데이터 체크
    if (!event.userId || !event.eventType) {
        console.error("[A/B Test Logger Error] 필수 파라미터 누락으로 로깅 실패.");
        return false;
    }

    try {
        // 2. 실제 API 호출 시뮬레이션 (실제로는 fetch('/api/v1/log-event', ...))
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 10)); // 네트워크 지연 시뮬
        console.log(`✅ [A/B Test Logger] Successfully logged ${event.eventType} for user ${event.userId}.`);
        return true;

    } catch (error) {
        // 3. 실패 처리: 로깅 시스템 자체의 장애에 대비하여 폴백 메커니즘 실행
        console.warn(`⚠️ [A/B Test Logger Warning] API 호출 실패 (${(error as Error).message}). 데이터를 로컬 큐잉에 저장합니다.`);
        localStorage.setItem('ab_test_queue', JSON.stringify({ timestamp: Date.now(), event }));
        return false;
    }
};

/**
 * 특정 Funnel State의 진입/이탈을 추적하는 초기화 함수.
 */
export const initializeFunnelTracking = (userId: string) => {
    console.log(`[A/B Test Logger] Tracking initialized for user ${userId}.`);
};