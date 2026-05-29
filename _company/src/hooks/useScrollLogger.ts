// useScrollLogger.ts
import { useEffect, useState } from 'react';

/**
 * 스크롤 위치가 특정 영역(Attention Point)에 멈추는 시간을 측정하고 로깅하는 커스텀 훅입니다.
 * A/B 테스트 및 사용자 행동 분석에 활용됩니다.
 * @param attentionPoints - 추적할 Attention Point의 ID 배열 (예: ['kpi-section', 'cta-block'])
 */
const useScrollLogger = (attentionPoints: string[]) => {
    // 로깅된 이벤트를 저장하는 상태 (실제로는 전역 스토어/API 호출로 대체)
    const [loggedEvents, setLoggedEvents] = useState<any[]>([]);

    useEffect(() => {
        if (!window || !attentionPoints.length) return;

        // 디바운싱을 위한 타이머 및 상태
        let scrollTimer: number | null = null;
        let lastScrollTime = Date.now();

        const handleScroll = () => {
            const currentTime = Date.now();
            const timeDifference = Math.abs(currentTime - lastScrollTime);

            // 1. 스크롤이 급격하게 변했거나 (지속적인 움직임) 시간이 너무 짧으면 무시합니다.
            if (timeDifference < 50 || !scrollTimer) return;
            lastScrollTime = currentTime;

            // 2. 일정 시간(예: 300ms) 동안 스크롤 이벤트가 발생하지 않으면 'Attention Point'로 간주하고 로깅을 시도합니다.
            if (scrollTimer && scrollTimer > 150) { // 150ms 이상 정지 상태 유지 시 트리거
                const currentScroll = {
                    x: window.scrollX,
                    y: window.scrollY,
                    timeStoppedMs: Math.floor(currentTime - lastScrollTime),
                    timestamp: new Date().toISOString(),
                    attentionPointsChecked: attentionPoints // 어떤 지점을 확인했는지 기록
                };

                console.log("🚨 [Attention Point Detected] Logging Scroll Stop:", currentScroll);
                // 실제 로깅 API 호출을 시뮬레이션합니다.
                setLoggedEvents(prev => [...prev, { ...currentScroll, id: Date.now() }]);
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll); // 크기 변경 시점도 로깅 포인트로 활용 가능

        // 컴포넌트 언마운트 시 리스너 제거 및 타이머 정리
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
            if (scrollTimer) clearTimeout(scrollTimer);
        };
    }, [attentionPoints]);

    // 개발용 디버깅 로직: 로그된 이벤트를 반환합니다.
    return { loggedEvents };
};

export default useScrollLogger;