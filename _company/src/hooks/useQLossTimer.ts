// src/hooks/useQLossTimer.ts
import { useState, useEffect, useCallback } from 'react';

/**
 * QLoss (Quality Loss) 타이머 및 계산 로직을 관리하는 커스텀 훅.
 * 시간 경과와 행동 부재에 따른 시스템적 위협(Systemic Threat)을 시뮬레이션합니다.
 * @param initialRisk - 초기 위험 지수 (0~100).
 * @returns { number, boolean } 현재 QLoss 값과 Red Zone 진입 여부.
 */
export const useQLossTimer = (initialRisk: number = 5) => {
  // [WHY] QLoss는 시간이 지나거나 사용자가 행동하지 않을수록 증가해야 합니다.
  const [currentQLoss, setCurrentQLoss] = useState(Math.min(100, initialRisk));
  const [isRedZoneActive, setIsRedZoneActive] = useState(false);

  // 1. 시간 경과에 따른 QLoss 상승 타이머 로직 (매 5초마다 위험 증가)
  // [WHY] 상태 종속성을 최소화하여 5초 인터벌 주기가 리셋 없이 정확하고 일정하게 보장됩니다.
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentQLoss(prevLoss => Math.min(100, prevLoss + 5));
    }, 5000); // 5초 간격으로 실행

    // 클린업 함수: 인터벌을 반드시 해제해야 메모리 누수를 막습니다.
    return () => clearInterval(intervalId);
  }, []);

  // 2. QLoss 위험도 변화에 따른 Red Zone 동기화 로직 (Side-Effect 격리)
  // [WHY] 리액트의 functional state setter 내부에서 다른 상태(setIsRedZoneActive)를 갱신하던 안티패턴을 제거했습니다.
  useEffect(() => {
    if (currentQLoss >= 85) {
      setIsRedZoneActive(true);
    } else {
      setIsRedZoneActive(false);
    }
  }, [currentQLoss]);


  /**
   * 사용자의 '행동' 또는 '진단 완료'를 시뮬레이션하여 QLoss 감소 및 리스크 재설정 로직을 수행합니다.
   * @param actionTaken - 어떤 행동이 취해졌는지 (예: 'diagnosisComplete').
   */
  const resetQLossOnAction = useCallback((actionTaken: string) => {
    let reductionFactor = 0;

    // [WHY] 고객의 적극적인 행동은 리스크 감소로 이어져야 합니다.
    if (actionTaken === 'diagnosisComplete') {
      reductionFactor = 30; // 진단 완료 시 큰 폭으로 리스크 감소
    } else if (actionTaken === 'protocolPurchased') {
      reductionFactor = 100; // 구매 시 리스크 완전 해소/재설정
    }

    setCurrentQLoss(prevLoss => Math.max(0, prevLoss - reductionFactor));
  }, []);


  return { currentQLoss, isRedZoneActive, resetQLossOnAction };
};