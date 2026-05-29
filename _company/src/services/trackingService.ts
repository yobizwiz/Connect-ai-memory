/**
 * @fileoverview A/B 테스트 및 사용자 주의 집중도(Attention) 로깅을 담당하는 서비스 계층.
 * 실제 API와 연동될 지점을 모킹합니다.
 */
export interface AttentionData {
    scrollPosition: number; // 현재 스크롤 위치 (픽셀)
    elementId: string;      // 사용자가 포커스한 요소 ID 또는 섹션 Key
    timeSpentMs: number;    // 해당 요소를 본 시간 (모킹)
}

/**
 * 가상의 A/B 테스트 로깅 API 호출 함수.
 * 실제 환경에서는 서버 측(Backend Gateway)에서 처리되어야 합니다.
 * @param data - 추적할 상세 데이터 객체
 */
export const logAttentionData = async (data: AttentionData): Promise<boolean> => {
    console.log(`[Tracking Service] Logging attention event for ID: ${data.elementId}`);
    // ⚠️ 중요: 실제로는 fetch('/api/v1/track', { method: 'POST', body: JSON.stringify(data) })를 사용해야 합니다.
    await new Promise(resolve => setTimeout(resolve, 50)); // API Latency Mock
    console.log(`[Tracking Service] Successfully logged attention data.`);
    return true;
};

/**
 * 특정 섹션에 진입했을 때의 시각적/행동 변화를 로깅합니다.
 */
export const logSectionEnter = async (sectionKey: string): Promise<boolean> => {
    const data: AttentionData = {
        scrollPosition: window.scrollY,
        elementId: sectionKey,
        timeSpentMs: 0, // 초기 값
    };
    return await logAttentionData(data);
};

// (Self-Correction Check): 이 서비스는 반드시 서버 게이트웨이를 거쳐야 한다는 점을 주석으로 명시했습니다.