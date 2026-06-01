import { useState, useEffect } from 'react';

/**
 * @description 상태 전이 시 발생하는 비동기 효과 (지연, 애니메이션 트리거)를 관리하는 훅.
 * @param initialValue 초기 값
 * @param transitionDelayMillis 전환에 걸릴 시간(ms). 이보다 긴 시간을 사용해 강제적인 체감 지연을 만듭니다.
 */
export const useTransitionEffect = (initialValue: number, transitionDelayMillis: number) => {
  const [currentLMax, setCurrentLMax] = useState<number>(initialValue);

  useEffect(() => {
    // 상태 초기화 및 안전 장치
    if (initialValue !== undefined && currentLMax === initialValue) return;

    setCurrentLMax(prev => prev || 0); // Fallback for null/undefined state

    const timer = setTimeout(() => {
      console.log(`[Transition Hook]: ${transitionDelayMillis}ms 후, L_max 값이 ${currentLMax}에서 새로운 값으로 전이 준비됨.`);
    }, transitionDelayMillis);

    return () => clearTimeout(timer);
  }, [initialValue, transitionDelayMillis]);

  // 강제적인 시각적 지연을 유발하여 사용자의 주의를 끌고 다음 상태로의 진입을 늦춥니다.
  const resetLMax = (newValue: number) => {
    setCurrentLMax(newValue);
  };

  return [currentLMax, resetLMax];
};