import { RiskCaseStudy, getMostShockingRisk, RiskApiResponse } from "../api/riskApiTypes";

/**
 * src/services/riskService.ts
 * 🚨 리스크 점수 계산 및 플래시 케이스를 조회하는 서비스 레이어 (Mocked API Call)
 */

// 실제로는 Axios 등을 사용하여 FastAPI 엔드포인트 호출이 될 것입니다.
export const fetchFlashRiskCase = async (lTotalMax: number): Promise<RiskApiResponse> => {
    console.log(`[Service] Fetching flash risk case for L_totalMax: ${lTotalMax.toLocaleString()} USD.`);

    // 1초 지연을 시뮬레이션하여 비동기 API 호출 느낌 부여
    await new Promise(resolve => setTimeout(resolve, 1000));

    const flashCase = getMostShockingRisk(lTotalMax);

    if (flashCase) {
        return {
            flashCase: flashCase,
            status: 'HIGH_RISK',
        };
    } else if (lTotalMax > 0) {
         // 임계치를 넘지 않았지만 위험도가 0은 아닌 경우
        return {
            flashCase: null, // 특정 플래시는 없으나 경고 상태는 유지
            status: 'OK',
        };
    } else {
         return { flashCase: null, status: 'LOW_RISK' };
    }
};