/**
 * PaymentService: 모든 결제 게이트웨이 통신을 추상화합니다.
 * 실제 PayPal, Stripe 등 외부 SDK 호출 로직은 이곳에 분리되어야 합니다.
 */
export class TransactionError extends Error {
    constructor(message: string, public code: string) {
        super(message);
        this.name = 'TransactionError';
    }
}

/**
 * 결제 트랜잭션 결과를 정의하는 타입입니다.
 */
export type PaymentResult = {
    success: boolean;
    transactionId: string;
    statusMessage: string;
};

/**
 * 가상의 금액 단위 (USD)를 사용합니다. 실제 시스템에서는 소수점 처리에 매우 주의해야 합니다.
 */
export interface PurchasePayload {
    userId: string;
    amountCents: number; // 센트 단위로 받습니다.
    purchaseType: 'AUDIT_RIGHT' | 'PREMIUM_DIAGNOSTICS';
}

/**
 * 결제 게이트웨이와의 상호작용을 시뮬레이션합니다.
 * @param payload - 구매 요청 페이로드 (사용자 ID, 금액 센트, 상품 유형)
 * @returns Promise<PaymentResult>
 */
export async function processPayment(payload: PurchasePayload): Promise<PaymentResult> {
    console.log(`[SYSTEM LOG] Initiating payment transaction for User ${payload.userId} (${payload.purchaseType}). Amount: $${(payload.amountCents / 100).toFixed(2)}`);

    // --- [Critical Logic Point] 실제 외부 API 호출 시뮬레이션 영역 ---
    await new Promise(resolve => setTimeout(resolve, 500)); // 네트워크 지연 시간 모방

    // 1. 가짜 실패 조건: 금액이 너무 적거나 유효하지 않은 경우 (Client-side Validation Failure)
    if (!payload.userId || payload.amountCents <= 0) {
        throw new TransactionError("Invalid payment parameters detected.", "ERR_INVALID_PAYLOAD");
    }

    // 2. 가짜 실패 조건: 재고 또는 시스템 한계 초과 (Server-side Constraint Failure)
    if (payload.purchaseType === 'AUDIT_RIGHT' && payload.amountCents < 10000) { // 예시: 최소 $100 필요 가정
        throw new TransactionError("Minimum required investment for Audit Right is $100.", "ERR_MINIMUM_INVESTMENT");
    }

    // 3. 가짜 실패 조건: 네트워크 또는 게이트웨이 문제 (External System Failure)
    if (Math.random() < 0.1) { // 10% 확률로 시스템 오류 발생 시뮬레이션
        throw new TransactionError("Payment Gateway connection timed out or declined.", "ERR_GATEWAY_TIMEOUT");
    }

    // 성공 로직
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    return {
        success: true,
        transactionId: transactionId,
        statusMessage: "Transaction successfully processed and Audit Right activated.",
    };
}

/**
 * 사용자의 구매 이력을 데이터베이스에 저장하는 로직을 시뮬레이션합니다.
 */
export async function recordPurchaseHistory(userId: string, payload: PurchasePayload, result: PaymentResult): Promise<boolean> {
    console.log(`[SYSTEM LOG] Recording transaction history for User ${userId}. Status: ${result.statusMessage}`);
    // 실제 DB 호출 로직이 들어갑니다 (e.g., await db.save(historyData))
    return true; // 성공 가정
}