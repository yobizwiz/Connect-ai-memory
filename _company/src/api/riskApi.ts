/**
 * @module riskApi
 * useCheckoutStateMachine에서 사용하는 가상의 리스크 API 모듈.
 */

export interface StructuralFlawResult {
    requiredAmount: number;
    flawIndex: number;
    description: string;
}

export const calculateStructuralFlaw = async (userData: any): Promise<StructuralFlawResult> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                requiredAmount: 50000000, // 50M KRW
                flawIndex: 78,
                description: "Critical data leakage vulnerability detected in legacy components."
            });
        }, 1000);
    });
};

export const processPayment = async (paymentDetails: any, amount: number): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 90% 확률로 성공하도록 시뮬레이션 설정
            const isSuccess = Math.random() > 0.1;
            resolve(isSuccess);
        }, 1000);
    });
};
