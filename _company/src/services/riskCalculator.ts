/**
 * @fileoverview L_totalMax (Total Maximum Loss) 계산 핵심 서비스 레이어.
 * 리스크 점수 산출 공식의 순수 로직을 담당하며, UI나 상태 관리에 의존하지 않음 (SRP 준수).
 */

import { InputData } from '../types/inputTypes'; // 가정된 타입 정의 파일

// ==============================================
// 🚨 핵심 상수: $L_{totalMax}$ 계산 가중치 계수 및 고정 비용 (V1.0)
// 이 값들은 KnowledgeBase/Algorithmic_Spec_LtotalMax_v1.0.md 를 기반으로 합니다.
// ==============================================

/**
 * 기본 운영 리스크 할당액 ($L_{base}$)
 */
const BASE_LOSS: number = 5000; // 산업군별 최소 규제 위반 비용 가정

/**
 * 고정 패널티 비용 (법무 자문 및 초기 컴플라이언스 재구축)
 */
const FIXED_PENALTY: number = 12000;

// 변수명: [변수가 의미하는 리스크] : 가중치 계수 W_i
export const WEIGHTS = {
    regulatoryFailureRate: 3500,  // 규제 미준수율 (R)에 대한 중대한 영향도
    systemicGapExposure: 2800,   // 시스템적 공백 노출 정도 (S)에 대한 중요도
    dataIntegrityWeakness: 1500, // 데이터 무결성 취약점
};

/**
 * 리스크 진단 도구의 핵심 로직. 사용자 입력 데이터를 받아 $L_{totalMax}$를 산출합니다.
 * @param inputData 사용자가 체크한 리스크 변수 값들 (0~1 사이의 실수 또는 정수).
 * @returns 계산된 총 재정적 최대 손실액 ($L_{totalMax}$).
 */
export const calculateTotalMaximumLoss = (inputData: InputData): number => {
    // 1. 입력 데이터 유효성 검사 및 안전장치 마련 (Defensive Coding)
    const regulatoryFailureRate = inputData?.regulatoryFailureRate ?? 0;
    const systemicGapExposure = inputData?.systemicGapExposure ?? 0;
    const dataIntegrityWeakness = inputData?.dataIntegrityWeakness ?? 0;

    // 2. $L_{totalMax}$ 공식 적용: L_totalMax = Base Loss + Σ(V_i * W_i) + C_Fixed
    let variableLossSum = 0;

    try {
        // 각 변수 값 V_i에 가중치 계수 W_i를 곱하여 합산합니다.
        variableLossSum += (regulatoryFailureRate * WEIGHTS.regulatoryFailureRate);
        variableLossSum += (systemicGapExposure * WEIGHTS.systemicGapExposure);
        variableLossSum += (dataIntegrityWeakness * WEIGHTS.dataIntegrityWeakness);

        // 최종 합산
        const totalMaxLoss = BASE_LOSS + variableLossSum + FIXED_PENALTY;

        // 로직 검증: 혹시 음수가 나오거나 NaN이 발생하는지 체크합니다.
        if (isNaN(totalMaxLoss) || totalMaxLoss < 0) {
            console.error("Critical Error: L_totalMax 계산 결과가 유효하지 않습니다.");
            return 0; // 안전한 폴백 값 반환
        }

        // 금액 단위는 소수점 둘째 자리에서 반올림하여 정수로 반환하는 것이 적절합니다.
        return Math.round(totalMaxLoss);

    } catch (error) {
        console.error("L_totalMax 계산 중 런타임 예외 발생:", error);
        // 에러가 발생하면 최대 리스크를 가정하여 높은 값을 반환하거나, 안전값 0을 반환합니다.
        return BASE_LOSS + FIXED_PENALTY; // 최소한의 기본 손실액을 보장
    }
};

/**
 * 주어진 $L_{totalMax}$ 값에 따라 리스크 레벨을 판별하고 Paywall 진입 여부를 결정합니다.
 * @param lossAmount 계산된 L_totalMax 금액.
 * @returns {isHighRisk: boolean, level: 'Low' | 'Medium' | 'Critical'}
 */
export const determineRiskLevel = (lossAmount: number): { isHighRisk: boolean; level: 'Low' | 'Medium' | 'Critical' } => {
    // 임계값 설정 (이 값들은 비즈니스 결정에 따라 변경될 수 있습니다.)
    const CRITICAL_THRESHOLD = 40000; // 4만 달러 초과 시 치명적
    const MEDIUM_THRESHOLD = 15000;  // 1만 5천 달러 초과 시 중위험

    let level: 'Low' | 'Medium' | 'Critical';
    let isHighRisk: boolean;

    if (lossAmount >= CRITICAL_THRESHOLD) {
        level = 'Critical';
        isHighRisk = true; // Paywall 강제 진입 상태 트리거
    } else if (lossAmount >= MEDIUM_THRESHOLD) {
        level = 'Medium';
        isHighRisk = false; // 경고만 표시, 하지만 높은 리스크임.
    } else {
        level = 'Low';
        isHighRisk = false;
    }

    return { isHighRisk, level };
};