import { useState, useCallback } from 'react';
import * as api from '../api/riskApi'; // 가상의 리스크 API 모듈

// ------------------
// [TYPE DEFINITIONS]
// 실제 환경에서는 별도 파일에 분리되어야 합니다.
type CheckoutState = 'IDLE' | 'LOADING_RISK' | 'DATA_COLLECTION' | 'REVIEWING' | 'PAYMENT_PENDING' | 'SUCCESS' | 'FAILED';

interface StateMachine {
    state: CheckoutState;
    riskData: any | null; // API에서 받은 구조적 결함 데이터
    error: string | null;
}

// ------------------
// [CORE HOOK]
export const useCheckoutStateMachine = () => {
    const [state, setState] = useState<CheckoutState>('IDLE');
    const [riskData, setRiskData] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    // 1. 리스크 데이터 수집 및 로딩 상태 전환
    const fetchInitialRiskData = useCallback(async (userData: any) => {
        setState('LOADING_RISK');
        setError(null);
        try {
            // API 호출 시뮬레이션 (실제로는 서버 통신 발생 지점)
            const data = await api.calculateStructuralFlaw(userData); 
            setRiskData(data);
            setState('DATA_COLLECTION');
            return true; // 성공적으로 데이터를 가져옴을 의미
        } catch (e: any) {
            setError(`데이터 수집 중 오류 발생: ${e.message}`);
            setState('FAILED');
            return false;
        }
    }, []);

    // 2. 결제 시도 및 상태 관리 (핵심 로직)
    const handlePaymentAttempt = useCallback(async (paymentDetails: any): Promise<boolean> => {
        if (!riskData || state !== 'REVIEWING') {
            setError("먼저 리스크 진단을 완료해주세요.");
            setState('FAILED');
            return false;
        }

        setState('PAYMENT_PENDING');
        setError(null);
        console.log("[System Log] Attempting payment with data:", paymentDetails);

        try {
            // 실제 결제 게이트웨이 API 호출 시뮬레이션
            const success = await api.processPayment(paymentDetails, riskData.requiredAmount); 
            
            if (success) {
                setState('SUCCESS');
                return true;
            } else {
                throw new Error("결제 승인 실패: 계좌/카드 정보 확인 필요.");
            }

        } catch (e: any) {
            // *** 여기가 핵심 Loopback 지점입니다. ***
            console.error("[System Log] Payment failed. Triggering loopback logic...");
            setError(`[FATAL ERROR] 결제 실패: ${e.message}. 구조적 리스크가 해결되지 않았습니다.`);
            setState('FAILED'); // 오류 상태 유지
            return false;
        } finally {
             // payment 시도와 관계없이, 다음 액션을 위해 상태를 준비합니다.
            setTimeout(() => setState('REVIEWING'), 500); 
        }
    }, [riskData, state]);

    // 초기화 및 리셋 함수 (필요할 때 사용)
    const resetState = useCallback(() => {
        setState('IDLE');
        setRiskData(null);
        setError(null);
    }, []);


    return { 
        state, 
        riskData, 
        error, 
        fetchInitialRiskData, 
        handlePaymentAttempt, 
        resetState 
    };
};

/**
 * @description 이 훅은 결제 플로우의 모든 상태 변화를 관리하며, 실패 시 리스크 상기 로직을 포함합니다.
 */
export default useCheckoutStateMachine;