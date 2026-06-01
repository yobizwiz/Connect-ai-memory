import { useState, useEffect } from 'react';
import { RiskInputs, RiskOutput } from '../components/types/RiskInputs';

// 🚨 중요: Lmax 계산 공식 정의 (Researcher의 스키마를 기반으로 구현)
const calculateLmax = (inputs: RiskInputs): number => {
    const N = inputs.numberOfAffectedRecords;
    const R = inputs.riskMultiplier;
    const T_rate = inputs.dailyLossRate / 100; // 퍼센트를 소수점으로 변환

    // Lmax = (Sum L_규제 벌금) + L_소송 합의액 + L_운영/신뢰도 손실
    // 현재는 Mock 계산을 사용하며, 실제 값은 외부 API에서 받아와야 합니다.
    const regulatoryFineMock = 1000 * N * R; // 예시: 벌금 = N * R
    const litigationSettlementMock = N * T_rate * 5000; // 예시: 합의액 = N * T_rate * 상수
    const operationalLossMock = Math.pow(R, 2) * 1000; // 예시: 운영 손실

    // 최종 Lmax 계산 (가중치 부여 및 조합)
    let lTotalMax = regulatoryFineMock + litigationSettlementMock + operationalLossMock;
    return parseFloat(lTotalMax.toFixed(2));
};

/**
 * 리스크 입력값 변화에 따라 실시간으로 총 리스크 점수와 상태를 계산하는 커스텀 훅.
 * @param initialInputs 초기 리스크 입력값들
 * @returns {RiskOutput} 최종 계산된 위험 출력 객체 (Lmax, Critical 여부 등)
 */
export const useRiskCalculation = (initialInputs: RiskInputs): [RiskOutput, React.Dispatch<React.SetStateAction<RiskInputs>>] => {
    const [inputs, setInputs] = useState<RiskInputs>(initialInputs);

    // 계산 로직을 실행하는 내부 함수
    const calculateAndCheck = (currentInputs: RiskInputs): RiskOutput => {
        const lTotalMax = calculateLmax(currentInputs);
        
        // 🚨 임계값 체크 로직 정의: Lmax가 특정 금액(예: 100,000)을 초과하면 Critical.
        const CRITICAL_THRESHOLD = 100000; 
        const isCritical = lTotalMax >= CRITICAL_THRESHOLD;

        let message = `현재 리스크 노출 지표는 ${lTotalMax.toLocaleString()} 수준입니다.`;
        if (isCritical) {
            message = "🚨 경고: 임계치를 초과했습니다. 즉각적인 구조적 위험 분석이 필수적입니다.";
        } else if (lTotalMax > 50000) {
             message = "⚠️ 주의: 리스크 점수가 상승하고 있습니다. 다음 단계의 방어책을 마련해야 합니다.";
        }

        return { lTotalMax, isCritical, message };
    };

    // 입력값이 바뀔 때마다 계산 로직이 실행되도록 useEffect 사용 (핵심)
    const riskOutput = calculateAndCheck(inputs);

    // 상태 업데이트 함수를 반환하여 컴포넌트에서 사용할 수 있게 합니다.
    return [riskOutput, setInputs];
};