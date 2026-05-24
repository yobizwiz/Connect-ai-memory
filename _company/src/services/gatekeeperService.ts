/**
 * @module gatekeeperService
 * @description yobizwiz의 핵심 인터랙티브 CTA 기능을 처리하는 API 서비스 계층입니다.
 * 모든 외부 호출은 여기서 관리하며, Mocking을 통해 테스트 용이성을 확보합니다.
 */

/**
 * 사용자의 초기 리스크 진단 요청을 시뮬레이션하고 게이트키퍼 플로우를 시작합니다.
 * @param initialData - 사용자 입력 데이터 (예: 산업군, 법규 준수 여부 등)
 * @returns Promise<GatekeeperResponse> - 게이트키퍼 상태 응답
 */
export const initiateRiskCheck = async (initialData: { industry: string; complianceStatus: boolean }): Promise<GatekeeperResponse> => {
    console.log(`[API Call] Starting Gatekeeper flow for ${initialData.industry}...`);

    // 실제 환경에서는 Next.js API Route나 별도의 백엔드 서버를 호출해야 합니다.
    // 여기서는 구조적 무결성을 위해 Mocking을 사용합니다.
    await new Promise<void>(resolve => setTimeout(() => resolve(), 1500)); // 시간 지연 시뮬레이션 (Time Pressure)

    if (!initialData.complianceStatus) {
        return {
            status: 'CRITICAL', // Critical Red Zone
            riskScore: Math.floor(Math.random() * 90) + 70, // 높은 점수 강제
            message: "🚨 CRITICAL EXPOSURE DETECTED: 법적 준수 결함이 감지되었습니다. 즉각적인 안전장치가 필요합니다.",
            actionRequired: 'PAYMENT_REQUIRED',
            dataPayload: { lossEstimateY: 50000 } // $Y 수치화 강제
        };
    } else if (Math.random() < 0.3) {
         // 낮은 확률로 경고만 주는 경우
        return {
            status: 'WARNING', // Warning Yellow Zone
            riskScore: Math.floor(Math.random() * 20) + 40,
            message: "⚠️ 주의: 몇 가지 사소한 비준수 위험이 감지되었습니다. 정기 검토가 권장됩니다.",
            actionRequired: 'FREE_REPORT', // 무료 리포트로 유도
            dataPayload: { lossEstimateY: null }
        };
    } else {
        // 정상 또는 무위험 상태 (전환율 관점에서는 거의 오지 않아야 함)
         return {
            status: 'SAFE', // Safe Green Zone
            riskScore: Math.floor(Math.random() * 15) + 20,
            message: "✅ 현재 시스템은 안정적입니다. 하지만 잠재적 위협을 완전히 배제할 수는 없습니다.",
            actionRequired: 'NONE',
            dataPayload: { lossEstimateY: null }
        };
    }
};

/**
 * 결제 게이트키퍼 로직의 2단계(Paywall)를 시뮬레이션합니다.
 * @param riskDetails - 이전 단계에서 얻은 리스크 상세 정보
 */
export const processPaymentGatekeeper = async (riskDetails: { lossEstimateY: number }): Promise<{ success: boolean, message: string }> => {
    console.log(`[API Call] Attempting payment gatekeeper logic...`);

    await new Promise<void>(resolve => setTimeout(() => resolve(), 2000)); // 긴 지연 시간 (Decisiveness required)

    if (riskDetails.lossEstimateY && riskDetails.lossEstimateY > 10000) {
        // 결제 유도 성공 시나리오
        return { success: true, message: `✅ 안전장치 구독이 완료되었습니다. $${(riskDetails.lossEstimateY / 1000).toFixed(0)}K의 손실을 막았습니다.` };
    } else {
         // 결제 실패 또는 거부 시나리오
        return { success: false, message: "❌ 게이트키퍼 시스템이 작동하지 않았습니다. 재점검이 필요합니다." };
    }
};

export type GatekeeperResponse = {
    status: 'SAFE' | 'WARNING' | 'CRITICAL'; // Red Zone 상태
    riskScore: number; // 0-100
    message: string; // UI에 표시될 경고 메시지
    actionRequired: 'PAYMENT_REQUIRED' | 'FREE_REPORT' | 'NONE'; // 다음 액션 지시
    dataPayload?: { lossEstimateY: number | null };
};

export type GatekeeperAction = {
    success: boolean;
    message: string;
}