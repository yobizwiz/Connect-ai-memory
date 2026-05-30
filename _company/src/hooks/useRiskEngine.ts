import { useState, useEffect } from 'react';
import { RiskState, RiskParameters } from '../types/risk-types';

// L_max 임계값을 기준으로 리스크 점수를 관리하고 Critical 상태를 판단하는 커스텀 훅
export const useRiskEngine = (params: RiskParameters) => {
    const [riskState, setRiskState] = useState<RiskState>({
        currentScore: params.initialScore,
        isCritical: false,
        lastChecked: new Date(),
    });

    // 리스크 점수 업데이트 함수 (외부 입력 시뮬레이션)
    const updateScore = (newPointsDelta: number) => {
        setRiskState(prev => {
            let newScore = Math.max(0, prev.currentScore + newPointsDelta);
            const isCritical = newScore >= params.lMaxThreshold;

            // 점수 변화가 있을 때마다 상태 업데이트 및 로깅 시뮬레이션
            return {
                currentScore: parseFloat(newScore.toFixed(2)),
                isCritical: isCritical,
                lastChecked: new Date(),
            };
        });
    };

    // [시뮬레이션] 3초마다 리스크 점수가 자연스럽게 악화되는 로직 (테스트용)
    useEffect(() => {
        const intervalId = setInterval(() => {
             // 매 3초마다 임의로 점수를 하락(위험 증가) 시킵니다.
            updateScore(Math.random() * 5 - 2); // -2 ~ +3 사이 변화
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);


    // 사용 가능한 상태와 액션 반환
    return {
        riskState,
        updateScore,
        isCritical: riskState.isCritical,
        currentScore: riskState.currentScore,
    };
};