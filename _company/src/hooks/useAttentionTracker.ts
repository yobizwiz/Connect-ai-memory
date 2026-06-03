import { useEffect, useCallback } from 'react';
import axios from 'axios'; // 전역 Axios 인스턴스를 사용한다고 가정합니다.
// 🛡️ Type Safety: 명확한 Props 정의가 필수적입니다.
interface AttentionPointProps {
    /** 이 컴포넌트가 나타내는 고유 리스크 포인트 ID (ex: PII_RISK) */
    pointId: string;
    /** 스크롤 기반 감지 여부 */
    isScrollBased?: boolean;
}

/**
 * 사용자의 특정 Attention Point에 대한 상호작용을 추적하는 커스텀 훅.
 * Intersection Observer를 활용하여 성능 저하 없이 '주의 집중' 순간을 포착합니다.
 */
export const useAttentionTracker = (props: AttentionPointProps) => {
    const { pointId, isScrollBased = true } = props;

    // API 호출 로직을 캡슐화하여 재사용성과 테스트 용이성을 높입니다.
    const logEvent = useCallback(async (interactionType: string, metadata: Record<string, any> = {}) => {
        if (!pointId) return;

        // ✅ Defensive Coding: 전역 API 호출 전에 유효성 검사를 합니다.
        try {
            await axios.post(
                `/api/v1/attention-log/${pointId}`, // Backend Endpoint 사용
                {}, // Body는 FastAPI가 Query/Path에서 처리하도록 설계했으므로 빈 객체
                {
                    params: {
                        user_id: 'dummy_user_123', // 실제 환경에서는 Context API나 Redux에서 가져와야 합니다.
                        session_id: `session_${Date.now()}`,
                    },
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
        } catch (error) {
            // 🐛 에러 처리: 로깅 실패는 치명적이지 않으므로 콘솔에 기록만 합니다.
            console.warn(`[Attention Tracker] Failed to log event for ${pointId}:`, error);
        }
    }, [pointId]);

    useEffect(() => {
        let observer: IntersectionObserver | null = null;

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            entries.forEach(entry => {
                // 🎯 핵심 로직: 요소가 Viewport에 진입했을 때만 이벤트 발생
                if (entry.isIntersecting) {
                    logEvent('scroll', { ratio: entry.intersectionRatio });
                } else if (entry.boundingClientRect.top > 0 && entry.boundingClientRect.bottom < window.innerHeight) {
                     // 스크롤 아웃 시점 처리 로직 (선택적)
                }
            });
        };

        if (isScrollBased) {
             observer = new IntersectionObserver(handleIntersection, { threshold: 0.2 });
             const element = document.getElementById(`attention-point-${pointId}`);
             if (element) {
                 observer.observe(element);
             }
        }

        // 클린업 함수: 컴포넌트 언마운트 시 Observer 리소스 해제
        return () => {
            if (observer) {
                observer.disconnect();
            }
        };
    }, [pointId, isScrollBased, logEvent]); // 의존성 배열에 포함하여 재실행 방지

    // 컴포넌트가 로드된 후, 초기 로그 기록을 수행할 수도 있습니다.
    return { pointId };
};