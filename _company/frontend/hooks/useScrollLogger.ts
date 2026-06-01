import { useEffect, useState } from 'react';

/**
 * @description A/B 테스트를 위한 사용자 행동 추적 훅.
 * 스크롤 위치 변화가 감지될 때마다 특정 로직을 실행하여 데이터를 기록합니다.
 * 이 함수는 실제 Analytics API (GA4 등) 호출로 대체되어야 합니다.
 */
export const useScrollLogger = (loggingKey: string) => {
    const [hasLogged, setHasLogged] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return; // SSR 방지

        let lastPosition = 0;

        const handleScroll = () => {
            const currentPosition = window.scrollY || document.documentElement.scrollTop;
            
            // 스크롤 임계값 설정: 너무 작은 변화는 무시하고, 일정 수준 이상 이동했을 때만 기록
            if (Math.abs(currentPosition - lastPosition) > 100 && !hasLogged) {
                const logData = {
                    timestamp: new Date().toISOString(),
                    scroll_y: currentPosition,
                    session_key: loggingKey || 'default',
                    action: "SCROLL_EVENT",
                    is_critical_stop: true // Critical Stop 지점 플래그 (A/B 테스트 변수)
                };

                // 💡 실제 환경에서는 fetch('/api/log-scroll', { method: 'POST', body: JSON.stringify(logData) }) 를 사용해야 함.
                console.info(`[🔬 LOGGING]: Critical Scroll Stop Point Detected. Logging Key: ${loggingKey}. Y: ${currentPosition}`);
                
                // 로깅 후 플래그 설정하여 중복 기록 방지 (또는 일정 시간 간격으로 리셋 필요)
                setHasLogged(true); 

            } else {
                 // console.log(`[🔬 LOGGING]: Scroll event detected, but not critical enough.`);
            }
            lastPosition = currentPosition;
        };

        window.addEventListener('scroll', handleScroll);
        // 초기 로드 시 한번 실행하여 위치 기록 (Optional)
        handleScroll(); 

        return () => {
            window.removeEventListener('scroll', handleScroll); // Cleanup
        };
    }, [loggingKey, hasLogged]);

    return { isLoggerActive: true };
};