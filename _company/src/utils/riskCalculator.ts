/**
 * src/utils/riskCalculator.ts
 * @description 리스크 노출도 점수 (TRE: Total Risk Exposure) 계산 및 타입 정의 유틸리티 모듈
 * 코다리 에이전트가 구현한 핵심 비즈니스 로직. 이 함수는 재사용성을 위해 분리함.
 */

import { PaymentTier } from '../types/payment'; // 가상의 타입 파일 임포트 가정

/**
 * 개별 규제 위반 항목의 위험 지수를 정의합니다.
 * @typedef {Object} RiskItem
 * @property {string} id - 리스크 항목 고유 ID (예: data_governance)
 * @property {number} score - 사용자가 체크한 점수 (0~100)
 * @property {number} weight - 비즈니스 로직에 따른 가중치 (w_i)
 */

/**
 * 총 리스크 노출도 점수(TRE)를 계산합니다.
 * TRE = Σ (가중치 * 개별 위험 지수)
 * @param {RiskItem[]} riskItems - 사용자가 체크한 모든 리스크 항목 배열.
 * @returns {{ tre: number, totalSavedValue: number }} 계산된 TRE 값과 예상 절감 가치.
 */
export const calculateTRE = (riskItems: Array<{ id: string; score: number; weight: number }>): { tre: number, totalSavedValue: number } => {
    if (!riskItems || riskItems.length === 0) {
        return { tre: 0, totalSavedValue: 0 };
    }

    let treSum = 0;
    let savedValueSum = 0;

    for (const item of riskItems) {
        // TRE 계산 로직: 가중치 * 점수
        treSum += item.weight * Math.min(item.score, 100); // 점수는 최대 100으로 제한
        
        // 절감 가치 계산 예시 (가중치가 높을수록 더 큰 재정적 가치를 방어함)
        savedValueSum += item.weight * 5; 
    }

    // 최종 TRE는 반올림 처리하여 일관성을 유지합니다.
    const finalTRE = Math.round(treSum / 10); 

    return { tre: finalTRE, totalSavedValue: Math.round(savedValueSum) };
};


/**
 * 사용자의 TRE 값에 따라 필수 구매 티어를 결정하는 로직입니다.
 * @param {number} tre - 계산된 총 리스크 노출도 점수.
 * @returns {PaymentTier['type']} 강제적으로 추천해야 하는 최소 Tier 타입 ('gold' 또는 'silver').
 */
export const determineMandatoryTier = (tre: number): PaymentTier['type'] => {
    if (tre >= 1200) {
        return 'Gold'; // 패닉 상태: 최고 레벨 필수
    } else if (tre >= 800) {
        return 'Silver'; // 불안감 상태: 최소한의 보험료 필요
    } else {
        // Mild Concern: Bronze가 기본으로 적절하지만, Silver를 다음 목표로 노출해야 함.
        return 'Bronze'; 
    }
};

/**
 * 가상의 리스크 항목 구조체 (테스트용 더미 데이터)
 */
export const DUMMY_RISK_ITEMS = [
    { id: 'data_governance', score: 85, weight: 2.5 }, // 높은 위협 지수
    { id: 'compliance_gap', score: 40, weight: 1.5 },
    { id: 'systemic_risk', score: 95, weight: 3.0 }  // 가장 중요하고 무거운 리스크
];