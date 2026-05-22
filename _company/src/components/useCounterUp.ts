import { useState, useEffect } from 'react';

/**
 * @description 숫자 카운터 업 효과를 구현하는 커스텀 훅 (Hook).
 * @param initialValue - 시작 값 (숫자)
 * @param duration - 애니메이션 지속 시간 (ms)
 * @returns {number} 현재 계산된 값
 */
export const useCounterUp = (initialValue: number, duration: number): number => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
        return;
      }
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1); // 0 to 1 사이의 진행률
      
      // Easing function (smooth step: 3t^2 - 2t^3) 적용하여 부드럽게 증가시킴
      const currentValue = initialValue * (progress < 0.5 ? 2 * progress * progress : Math.min(1, 1 - Math.pow(2 * progress - 2, 2)) / 2);

      setCount(Math.floor(currentValue));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
         // 정확한 최종 값으로 고정
         setCount(initialValue);
      }
    };

    const animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [initialValue, duration]);

  return count;
};