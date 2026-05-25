import { useState, useCallback } from 'react';

// --- Mock API Types ---
interface PaymentOptions {
  tier: 'Silver' | 'Gold' | 'Platinum';
  priceId: string; // 실제 PG에서 받을 ID를 모킹
}

interface CheckoutState {
    isLoading: boolean;
    isSuccess: boolean;
    message: string;
    // 사용자를 다음 페이지로 리다이렉트할 수 있는 함수도 포함하는 것이 좋습니다.
}

/**
 * @description 결제 로직과 상태 관리를 담당하는 커스텀 훅. (Payment Logic Concern)
 * 실제 Stripe SDK 호출을 대체하며, 구조적 무결성을 확보하기 위해 Mocking Layer를 사용합니다.
 */
export const usePaymentIntegration = () => {
    const [checkoutState, setCheckoutState] = useState<CheckoutState>({
        isLoading: false,
        isSuccess: false,
        message: '',
    });

    /**
     * @description 결제 프로세스를 시뮬레이션합니다. (가상 PG API 호출)
     * @param options - 구매할 티어와 가격 정보를 받습니다.
     */
    const initiateCheckout = useCallback(async (options?: PaymentOptions): Promise<void> => {
        if (!options || !options.tier || !options.priceId) {
            setCheckoutState({ isLoading: false, isSuccess: false, message: '유효한 구매 옵션이 필요합니다.' });
            return;
        }

        console.log(`[Payment Mock] ${options.tier} 티어 결제 시도 (Price ID: ${options.priceId})`);
        setCheckoutState(prev => ({ ...prev, isLoading: true, isSuccess: false, message: '' }));

        // 3초 동안 로딩 상태 유지 (사용자에게 '진행 중'이라는 인식을 심어줌)
        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
            // Mock API Call Simulation: 성공 확률을 높여서 일단은 성공하는 흐름을 만듭니다.
            if (options.tier === 'Platinum' && Math.random() < 0.2) {
                throw new Error("시스템 과부하로 결제가 실패했습니다. 잠시 후 다시 시도해주세요.");
            }

            // Mock Success State
            setCheckoutState({
                isLoading: false,
                isSuccess: true,
                message: `${options.tier} 티어 구매가 성공적으로 완료되었습니다. 이제 구조적 면책권이 확보되었습니다.`,
            });

        } catch (error) {
            // Mock Failure State
            console.error("Payment Mock Failed:", error);
            setCheckoutState({
                isLoading: false,
                isSuccess: false,
                message: `결제 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}. 다시 시도하거나 고객센터에 문의하세요.`,
            });
        }
    }, []);

    // 결제 완료 후 리다이렉트 로직 (실제 환경에서는 Next.js router를 사용)
    const handlePurchaseSuccess = useCallback(() => {
        alert("구매 성공! 다음 단계로 이동합니다.");
        // 실제 라우터 사용 예: useRouter().push('/dashboard');
    }, []);

    return {
        checkoutState,
        initiateCheckout,
        handlePurchaseSuccess,
    };
};