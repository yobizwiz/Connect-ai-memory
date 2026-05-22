// interfaces.ts: 데이터 구조와 에러 핸들링의 기준을 정의합니다. (Strict Typing)

/** @description 결제 게이트웨이 종류를 명확히 합니다. */
export type PaymentGatewayType = "PAYPAL" | "STRIPE";

/** @description 결제 요청 시 필요한 최소한의 데이터 구조입니다. */
export interface PaymentRequest {
    amount: number; // 처리할 금액 (USD 기준)
    token: string;  // 사용자의 토큰화된 결제 정보 (PCI Compliant)
}

/** @description API 호출 과정에서 발생 가능한 모든 오류를 통합합니다. */
export class PaymentError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "PaymentError";
    }
}

/** @description 결제 성공 후 반환되는 트랜잭션 결과 구조입니다. */
export interface TransactionResult {
    transactionId: string; // 외부 게이트웨이에서 제공하는 고유 ID
    gatewayUsed: PaymentGatewayType;
}