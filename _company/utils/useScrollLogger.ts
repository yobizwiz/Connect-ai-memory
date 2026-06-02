/**
 * utils/useScrollLogger.ts
 * @description 사용자의 스크롤 위치를 감지하여 A/B 테스트 로그로 전송하는 커스텀 훅.
 */
import { useEffect } from 'react';

// 로깅 인터페이스 (유형 안전성 확보)
interface LogData {
    timestamp: number;
    scrollPosition: { x: number; y: number };
    isAttentionPoint: boolean; // A/B 테스트 기준 지점 여부
}

/**
 * 스크롤 위치를 감지하고, 특정 지점에서만 로깅하는 커스텀 훅.
 * @param attentionPoints - 스크롤을 로깅할 중요 좌표 (예: { top: 500, bottom: 800 })
 */
export const useScrollLogger = (attentionPoints: Array<{ top: number; bottom: number }>) => {
    useEffect(() => {
        const handleScroll = () => {
            const currentY = window.scrollY || document.documentElement.scrollTop;

            // 스크롤 위치가 정의된 어텐션 포인트 내에 있는지 확인하는 로직 (Defensive Check)
            const isAttentionPoint = attentionPoints.some(point => 
                currentY >= point.top && currentY <= point.bottom
            );

            const logData: LogData = {
                timestamp: Date.now(),
                scrollPosition: { x: window.innerWidth, y: currentY }, // X는 스크롤 위치가 아니라 viewport width를 사용한다고 가정
                isAttentionPoint: isAttentionPoint,
            };

            // 실제 API 호출을 시뮬레이션 (실제 백엔드 엔드포인트 필요)
            if (logData.isAttentionPoint) {
                console.log(`[AB-Test Log] Critical Attention Point Detected at Y=${currentY}. Logging:`, logData);
                // axios.post('/api/ab_test/log', logData); // 실제 구현 시 사용할 API 호출 자리
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // 초기 로드 시 한 번 실행하여 상태 확인

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [attentionPoints]);
};