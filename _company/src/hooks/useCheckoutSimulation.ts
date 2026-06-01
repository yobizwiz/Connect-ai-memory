/**
 * src/hooks/useCheckoutSimulation.ts
 * @description 결제 API 호출 시뮬레이션 및 UIUX 긴장감(Timi) 유발 훅.
 */

import { useState, useCallback } from 'react';

// 가상의 Payment Gateway API Endpoint
const CHECKOUT_ENDPOINT = '/api/v1/process-payment';

/**
 * 결제 프로세스를 시뮬레이션하고, 사용자가 지루함을 느끼지 않도록 단계적 피드백을 제공합니다.
 * @returns {object} [isProcessing: boolean, processPayment] - 상태와 실행 함수.
 */
export const useCheckoutSimulation = () => {
    const [isProcessing, setIsProcessing] = useState(false);

    /**
     * 결제 단계를 시뮬레이션합니다 (Mock API Call).
     * @param {string} tierType - 구매할 티어 ('Bronze', 'Silver', 'Gold').
     * @returns {Promise<boolean>} 결제 성공 여부.
     */
    const processPayment = useCallback(async (tierType: string): Promise<boolean> => {
        if (!tierType) return false;

        setIsProcessing(true);
        console.log(`[SIMULATION] Starting payment flow for ${tierType} tier...`);

        // 1. [Timi - 단계 1: 데이터 검증 지연 (300ms)]
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('[SIMULATION] Step 1/3: Validating user payment details...');

        // 2. [Timi - 단계 2: 백엔드 로직 처리 지연 (800ms)]
        await new Promise(resolve => setTimeout(resolve, 800));
        console.log('[SIMULATION] Step 2/3: Running anti-fraud checks and ledger entry...');

        // 3. [Timi - 단계 3: 게이트웨이 통신 지연 (500ms)]
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('[SIMULATION] Step 3/3: Communicating with Payment Gateway...');

        // 실제 API 호출을 시뮬레이션합니다. 여기서는 항상 성공한다고 가정합니다.
        const success = true; // const response = await fetch(CHECKOUT_ENDPOINT, { method: 'POST', body: JSON.stringify({ tierType }) }); 

        setIsProcessing(false);
        return success;

    }, []);

    return { isProcessing, processPayment };
};