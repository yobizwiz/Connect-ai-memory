import { useState, useEffect, useCallback } from 'react';

// QLoss 레벨 정의 (0~100)
export type QLossValue = number; 

// 리스크 단계와 그에 따른 UI 상태를 정의합니다.
interface RiskState {
    level: QLossValue; // 현재 $QLoss$ 값 (0-100)
    riskLevel: 'GREEN' | 'YELLOW' | 'RED'; // 시각적 경고 레벨
    alertActive: boolean; // 경고 모달/플래시가 활성화되었는지 여부
    ctaForced: boolean; // 강제 결제 CTA가 나타나야 하는지 여부
}

// 초기 상태 설정 (낮은 리스크)
const INITIAL_STATE: RiskState = {
    level: 10,
    riskLevel: 'GREEN',
    alertActive: false,
    ctaForced: false,
};


/**
 * QLoss 시뮬레이션 및 상태 관리를 담당하는 훅.
 * 이 로직은 외부 API 호출이 아닌 클라이언트 측의 시간 경과와 사용자 입력에 반응합니다.
 */
export const useQLossSimulation = (initialValue: number = 10) => {
    const [state, setState] = useState<RiskState>(() => ({
        level: Math.min(Math.max(initialValue, 0), 100),
        riskLevel: 'GREEN',
        alertActive: false,
        ctaForced: false,
    }));

    // QLoss 값을 기반으로 리스크 상태를 업데이트하는 핵심 로직 (Pure Function)
    const calculateRiskState = useCallback((currentValue: number): RiskState => {
        let newLevel = Math.min(Math.max(currentValue, 0), 100);
        let riskLevel: 'GREEN' | 'YELLOW' | 'RED';
        let alertActive = false;
        let ctaForced = false;

        if (newLevel < 35) { // GREEN Zone
            riskLevel = 'GREEN';
        } else if (newLevel < 75) { // YELLOW Zone (경고 시작)
            riskLevel = 'YELLOW';
            alertActive = true; // 경미한 알림 활성화
        } else { // RED Zone (위협 임계치 도달)
            riskLevel = 'RED';
            alertActive = true; // 강제 플래시/모달 활성화
            ctaForced = true; // 결제 CTA 필수 노출
        }

        return { level: newLevel, riskLevel: riskLevel, alertActive: alertActive, ctaForced: ctaForced };
    }, []);


    // 1. QLoss 증가 시뮬레이션 (시간 경과에 따른 시스템적 불안감 조성)
    const simulateQLossIncrease = useCallback((incrementAmount: number = 1): void => {
        setState(prevState => {
            let newLevel = Math.min(prevState.level + incrementAmount, 100);
            return calculateRiskState(newLevel);
        });
    }, [calculateRiskState]);

    // 2. QLoss 수동 감소 시뮬레이션 (사용자 행동 유도)
    const mitigateQLoss = useCallback((decreaseAmount: number): void => {
        setState(prevState => {
            let newLevel = Math.max(prevState.level - decreaseAmount, 0);
            return calculateRiskState(newLevel);
        });
    }, [calculateRiskState]);


    // 초기 로딩 시 또는 주기적인 업데이트를 위한 Effect (실제 배포 시 타이머로 대체)
    useEffect(() => {
        // 데모 목적으로 QLoss가 1초마다 증가하는 효과를 추가합니다.
        const interval = setInterval(() => {
            setState(prevState => {
                let newLevel = Math.min(prevState.level + 2, 100); // 초당 2씩 증가
                return calculateRiskState(newLevel);
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [calculateRiskState]);


    return {
        state,
        simulateQLossIncrease,
        mitigateQLoss,
        resetSimulation: () => setState({ level: 10, riskLevel: 'GREEN', alertActive: false, ctaForced: false }),
    };
};

export type QLossState = ReturnType<typeof useQLossSimulation>['state'];