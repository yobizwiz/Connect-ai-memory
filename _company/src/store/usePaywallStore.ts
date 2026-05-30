import { create, StoreApi, UseBoundStore } from 'zustand';
import { fetchInitialRiskMetrics, fetchDiagnosisSolutionDetails } from '../services/mockApi';

// 1. 상태 정의 (TypeScript Exhaustive Check를 위한 유니온 타입)
export type PaywallState = 'IDLE' | 'LOADING_INITIAL_RISK' | 'RED_ZONE_ALERT' | 'SUCCESS' | 'ERROR';

export interface PaywallStoreState {
    state: PaywallState;
    riskData: any | null;
    isLoading: boolean;
    error: string | null;
}

type PaywallActions = {
    // 🟢 IDLE -> LOADING_INITIAL_RISK 전환 (진단 시작 버튼 클릭)
    startDiagnosisFlow: () => Promise<void>;
    // 🔴 RED_ZONE_ALERT -> SUCCESS 전환 (구매 완료 시뮬레이션)
    completePurchase: () => void;
};

export const usePaywallStore = (create as any)((set: any) => ({
    state: 'IDLE',
    riskData: null,
    isLoading: false,
    error: null,

    // 🟢 IDLE -> LOADING_INITIAL_RISK (첫 번째 비동기 호출)
    startDiagnosisFlow: async () => {
        set({ state: 'LOADING_INITIAL_RISK', isLoading: true, error: null });
        try {
            const initialInput = { industry: "Finance", employeeCount: 50 }; // 임시 입력값
            // API 호출 및 강제 대기 (3초) -> 이 시간 동안 로딩 UI와 긴장감을 유지합니다.
            const riskData = await fetchInitialRiskMetrics(initialInput);

            set({ 
                riskData: riskData, 
                state: 'RED_ZONE_ALERT', // 데이터 수신 즉시 다음 단계로 강제 전환
                isLoading: false 
            });

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "알 수 없는 오류";
            set({ state: 'ERROR', isLoading: false, error: errorMessage });
        }
    },

    completePurchase: () => {
        set({ state: 'SUCCESS' });
        console.log("🎉 Payment successful! Conversion Loop Completed.");
    }
})) as any;