/**
 * @fileoverview 리스크 진단 데이터 계산 로직 (Mock API Service).
 * 이 훅은 UI 컴포넌트가 직접 비즈니스 규칙에 의존하는 것을 방지합니다.
 */
import { useState, useCallback } from 'react';
import { RiskInput, LmaxResult, CRITICAL_THRESHOLD } from '../types/risk-types';

// --- [Mock API Simulation] ---
/**
 * Mock API 호출을 시뮬레이션하며 리스크 점수를 계산합니다.
 * 실제 환경에서는 fetch() 또는 axios를 통해 백엔드 엔드포인트를 호출해야 합니다.
 * @param inputs - 사용자로부터 받은 리스크 입력 값들.
 * @returns LmaxResult 객체.
 */
const calculateLmax = (inputs: RiskInput): LmaxResult => {
    // 1. 규정 준수 점수에 기반한 기본 위험도 계산 (Compliance Loss)
    const complianceLoss = Math.max(0, 100 - inputs.regulatoryComplianceScore);

    // 2. 데이터 보안 레벨에 따른 가중치 적용 (Security Multiplier)
    let securityWeight: number;
    if (inputs.dataStorageSecurityLevel === 'Low') {
        securityWeight = 1.5; // Low는 위험도가 높다고 가정하고 가중치를 크게 부여
    } else if (inputs.dataStorageSecurityLevel === 'Medium') {
        securityWeight = 1.0;
    } else {
        securityWeight = 0.8; // High Security는 약간의 완충 효과가 있다고 가정
    }

    // 3. 교육 빈도에 따른 위험 증가 (Training Gap) - 숫자가 작을수록(드물게) 점수가 높아짐.
    const trainingGapFactor = Math.max(1, 10 / inputs.employeeTrainingFrequencyDays);

    // 총 리스크 지표 계산 (가중치 적용 및 결합)
    // L_max = (ComplianceLoss * SecurityWeight) + (TrainingGapFactor * Constant)
    let lmaxScore = (complianceLoss * securityWeight) + (trainingGapFactor * 15);

    // 최종 TRI 점수 (정규화된 값, 최대 100점)
    let totalResilienceIndex = Math.min(100, lmaxScore * 2 + inputs.regulatoryComplianceScore / 2);


    // $L_{max}$ 임계치 초과 감지 로직 구현
    const isCritical = lmaxScore >= CRITICAL_THRESHOLD;

    return {
        totalResilienceIndex: parseFloat(totalResilienceIndex.toFixed(1)),
        lmaxScore: parseFloat(Math.min(100, Math.max(0, lmaxScore)).toFixed(1)), // 점수는 0~100으로 제한
        isCritical: isCritical
    };
};

/**
 * 리스크 계산 상태를 관리하는 커스텀 훅.
 * 이 훅은 모든 UI 컴포넌트가 사용하는 '단일 진실 공급원' 역할을 합니다.
 */
export const useRiskCalculation = (initialInputs: RiskInput) => {
    const [inputs, setInputs] = useState<RiskInput>(initialInputs);
    const [result, setResult] = useState<LmaxResult | null>(null);

    // 입력 값 변경 시 리스크 계산을 트리거하는 핸들러
    const updateInputs = useCallback((newInputs: Partial<RiskInput>) => {
        setInputs(prev => ({ ...prev, ...newInputs }));
    }, []);

    // 메인 로직 실행 함수 (API 호출 대체)
    const calculateRisk = useCallback(() => {
        try {
            if (!inputs) throw new Error("Input data cannot be null.");
            const calculatedResult = calculateLmax(inputs);
            setResult(calculatedResult);
        } catch (error) {
            console.error("🚨 Lmax Calculation Failed:", error);
            setResult({ totalResilienceIndex: 0, lmaxScore: 0, isCritical: false }); // 에러 시 기본값 설정
        }
    }, [inputs]);

    // 컴포넌트 마운트 또는 의존성 변경 시 계산 실행
    useState(() => {
        calculateRisk();
    });

    return {
        inputs,
        result,
        updateInputs,
        calculateRisk // 외부에서 강제로 재계산해야 할 경우를 대비해 노출
    };
};