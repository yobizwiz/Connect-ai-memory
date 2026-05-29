import { useEffect, useState } from 'react';

/**
 * @description 특정 요소(Ref)가 화면에 진입하는 것을 감지하여 로그를 남기는 커스텀 훅.
 * A/B 테스트 및 사용자 행동 분석용 Attention Point 로깅 기능을 제공합니다.
 * @param ref - 관찰할 DOM 요소를 참조하는 React Ref 객체.
 * @param logEndpoint - 로그를 전송할 가상의 API 엔드포인트 (실제 구현 시 사용).
 */
export const useScrollLogger = (ref: React.RefObject<HTMLElement>, logEndpoint: string) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current || !logEndpoint) return;

    // Intersection Observer를 사용하여 요소의 가시성을 관찰합니다.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        // 로깅 함수 호출 시뮬레이션
        console.log(`[A/B Test Log] Attention Point Detected: ${logEndpoint} at section ID ${ref.current?.id}`);
        // 실제 환경에서는 fetch(logEndpoint, { method: 'POST', body: JSON.stringify({ event: 'attention_point', id: ref.current?.id }) }); 를 사용해야 합니다.
      } else {
        setIsVisible(false);
      }
    }, {
      rootMargin: '0px 0px -10% 0px', // 화면 하단에서 90%까지 진입했을 때 감지
    });

    observer.observe(ref.current);

    // 클린업 함수: 컴포넌트 언마운트 시 Observer를 반드시 연결 해제합니다. (메모리 누수 방지)
    return () => {
      observer.disconnect();
    };
  }, [ref, logEndpoint]);
};