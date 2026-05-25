import { useState, useEffect } from 'react';

/**
 * 주어진 초기 시간을 기반으로 카운트다운 타이머를 구현하는 커스텀 훅.
 * 시스템적 제약 조건(예: 세션 만료)을 시뮬레이션할 때 사용됩니다.
 * @param initialSeconds - 초 단위의 시작 시간 (기본값: 300초 = 5분)
 * @returns {number} 현재 남은 시간을 초 단위로 반환합니다.
 */
export const useTimer = (initialSeconds: number = 300): number => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return; // 타이머가 0이 되면 작동 중지

    // 매 초마다 상태 업데이트
    const intervalId = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds - 1);
    }, 1000);

    // 클린업 함수: 컴포넌트 언마운트 시 인터벌 정리 (메모리 누수 방지)
    return () => clearInterval(intervalId);
  }, [initialSeconds]); // initialSeconds가 변경되어도 재실행되지 않도록 의존성 배열에 넣음

  return seconds;
};