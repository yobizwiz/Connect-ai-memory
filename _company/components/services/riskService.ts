/**
 * @description Lmax (Maximum Loss) Score 계산 서비스 레이어.
 * 실제 환경에서는 이 로직이 Next.js API Route (e.g., /api/calculate-risk)를 통해 호출되어야 합니다.
 * 현재는 Mockup을 위해 클라이언트 사이드에서 비즈니스 규칙을 시뮬레이션합니다.
 */

import { RiskInputs, CalculatedResult } from '../types';

// 임계값 상수 정의 (CEO 지시 기반)
export const MAX_LOSS_THRESHOLD: number = 1200;

/**
 * 규제 리스크를 기반으로 추정 최대 손실액(Lmax) 점수를 계산합니다.
 * @param inputs - 사용자로부터 입력받은 리스크 데이터 필드들.
 * @returns CalculatedResult 객체 (점수, 경고 여부).
 */
export const calculateLmaxScore = (inputs: RiskInputs): CalculatedResult => {
    // 1. 기본 점수 합산 로직 정의 (가중치 적용)
    let score = 0;

    // A. 직원 수 기반 리스크 (Personnel Risk) - 가중치 2.5
    const employeeRiskScore = inputs.employeeCount || 0;
    score += Math.min(employeeRiskScore * 1.5, 300); // 최대 300점 제한

    // B. 규제 준수율 기반 리스크 (Compliance Risk) - 가중치 4.0 (가장 중요!)
    const complianceRate = inputs.complianceRate || 0; // 0 ~ 1 사이 값
    // Compliance Rate가 낮을수록(위험할수록) 점수가 높게 올라감.
    score += (1 - complianceRate) * 500;

    // C. AI 활용 범위 기반 리스크 (AI Attribution Risk) - 가중치 3.0
    const aiUsageScope = inputs.aiUsageScope || 0; // 0 ~ 1 사이 값
    score += Math.pow(aiUsageScope, 2) * 400 + 50;

    // D. 기타 요소 (예: 데이터 저장 기간 등)
    if (inputs.dataRetentionYears && inputs.dataRetentionYears > 7) {
        score += 150; // 장기 데이터 보관 시 추가 리스크
    }

    const finalScore = Math.round(Math.min(score, 5000)); // 최대 점수 제한 (안정성 확보)

    // 2. 결과 및 경고 상태 결정
    const isCriticalRisk = finalScore >= MAX_LOSS_THRESHOLD;

    return {
        lmaxScore: finalScore,
        isCritical: isCriticalRisk,
        threshold: MAX_LOSS_THRESHOLD
    };
};