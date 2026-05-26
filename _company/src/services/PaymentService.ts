// paymentService.ts: 결제 및 위험 평가 통합 비즈니스 로직 처리
import { PaymentGatewayType } from './interfaces';

/**
 * @description 외부 API 호출의 안정성을 위한 재시도 횟수 제한 (Exponential Backoff)
 * @param fn 실행할 함수
 * @param maxRetries 최대 재시도 횟수
 */
async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            console.log(`[PaymentService] Attempt #${attempt + 1} 실행 시도...`);
            return await fn();
        } catch (e) {
            lastError = e as Error;
            // 지수 백오프: 2^attempt * 1000ms 마다 대기 (1s, 2s, 4s...)
            const delay = Math.pow(2, attempt) * 1000;
            console.warn(`[PaymentService] 실패 감지. ${delay / 1000}초 후 재시도합니다. 에러: ${e instanceof Error ? e.message : '알 수 없는 오류'}`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    // 모든 시도가 실패했을 경우 최종적으로 에러를 던집니다.
    throw new PaymentError(`결제 게이트웨이 연동에 실패했습니다. 최대 재시도 횟수(${maxRetries}) 초과. 마지막 오류: ${lastError?.message}`);
}


/**
 * @description 최소 보험료 지불을 처리하는 메인 트랜잭션 로직 (Core Business Logic)
 * @param treValue 총 위험 노출액 (Total Risk Exposure). 고객에게 보여주는 핵심 데이터.
 * @param premiumAmount 계산된 최소 보험료 금액.
 * @returns 성공적으로 결제 및 처리가 완료되었음을 나타내는 객체.
 */
export async function processMinimumPremiumPayment(treValue: number, premiumAmount: number): Promise<{ success: boolean; transactionId: string }> {
    console.log(`\n[CORE LOGIC] TRE 기반 보험료 지불 프로세스 시작.`);

    // 1. 입력 유효성 검사 (Guard Clause)
    if (isNaN(treValue) || treValue <= 0 || isNaN(premiumAmount) || premiumAmount <= 0) {
        throw new PaymentError("TRE 또는 최소 보험료 금액이 유효하지 않습니다. 데이터 흐름을 점검해주세요.");
    }

    // 2. 결제 게이트웨이 호출 (재시도 메커니즘 적용)
    const paymentResult = await retryWithBackoff(async () => {
        if (paymentGateway === 'PAYPAL') {
            return StripePaymentService.processPayment({ amount: premiumAmount, token: "mock_token" }); // Mock API 호출
        } else if (paymentGateway === 'STRIPE') {
            // 실제 환경에서는 이 부분에 Stripe SDK 연동 코드가 들어갑니다.
            return PayPalPaymentService.processPayment({ amount: premiumAmount, token: "mock_token" }); 
        } else {
             throw new PaymentError("지원되지 않는 결제 게이트웨이입니다.");
        }
    });

    // 3. 성공 후 로직 처리 (핵심 가치 부여)
    console.log(`[CORE LOGIC] ✅ 트랜잭션 ${paymentResult.transactionId} 완료. 고객의 생존 위협 리스크가 해소되었습니다.`);
    return { success: true, transactionId: paymentResult.transactionId };
}

// ===============================================
// MOCK GATEWAY SERVICES (실제 환경에서는 API 클라이언트 호출)
// ===============================================

const paymentGateway = process.env.PAYMENT_GATEWAY || 'STIPE'; // 환경 변수로 게이트웨이 결정

/** @type {PaymentGateway} */
interface PaymentGateway {
    TYPE: "PAYPAL" | "STRIPE";
}

export const StripePaymentService = {
    async processPayment(data: { amount: number; token: string }): Promise<{ transactionId: string }> {
        // 실제로는 axios.post('stripe/api', ...) 등이 들어갑니다.
        console.log(`[MOCK API] 💰 Stripe를 통해 ${data.amount} 처리 시도...`);
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 100)); // 네트워크 지연 시뮬레이션
        if (Math.random() < 0.1) { // 10% 확률로 실패 시뮬레이션
            throw new PaymentError("Stripe API: 일시적인 서버 과부하 오류 발생.");
        }
        return { transactionId: `mock_txn_${Date.now()}_STRIPE` };
    }
};

export const PayPalPaymentService = {
    async processPayment(data: { amount: number; token: string }): Promise<{ transactionId: string }> {
        // 실제로는 SDK 연동이 들어갑니다.
        console.log(`[MOCK API] 💳 PayPal을 통해 ${data.amount} 처리 시도...`);
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 100)); // 네트워크 지연 시뮬레이션
        if (Math.random() < 0.1) { // 10% 확률로 실패 시뮬레이션
            throw new PaymentError("PayPal API: 계정 인증 오류 발생.");
        }
        return { transactionId: `mock_txn_${Date.now()}_PAYPAL` };
    }
};

// ===============================================
// INTERFACES AND UTILITIES
// ===============================================

export class PaymentError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "PaymentError";
    }
}

/** @type {PaymentGateway} */
export type PaymentGateways = PaymentGateway;