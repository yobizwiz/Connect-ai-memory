import { NextApiRequest, NextApiResponse } from 'next';
export interface PurchasePayload {
    userId: string;
    amountCents: number;
    purchaseType: 'AUDIT_RIGHT';
}

export interface PaymentResult {
    success: boolean;
    transactionId: string;
    statusMessage?: string;
}

export class TransactionError extends Error {
    code: string;
    constructor(code: string, message: string) {
        super(message);
        this.code = code;
        this.name = "TransactionError";
    }
}

export const processPayment = async (payload: PurchasePayload): Promise<PaymentResult> => {
    console.log(`[Mock processPayment] Processing payment of ${payload.amountCents} cents for user: ${payload.userId}`);
    return { success: true, transactionId: `mock_txn_${Date.now()}` };
};

export const recordPurchaseHistory = async (userId: string, payload: PurchasePayload, result: PaymentResult): Promise<void> => {
    console.log(`[Mock recordPurchaseHistory] Recording purchase for ${userId}:`, result);
};

/**
 * POST /api/v1/audit-purchase
 * Audit Right 구매를 처리하는 백엔드 API 엔드포인트입니다.
 * 이 함수는 모든 트랜잭션 흐름과 에러 코드를 관리합니다.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: "METHOD_NOT_ALLOWED", 
            message: "Only POST requests are permitted for purchase transactions." 
        });
    }

    const { userId, amountCents } = req.body;
    if (!userId || !amountCents) {
         return res.status(400).json({ 
            error: "ERR_MISSING_PAYLOAD", 
            message: "Payload must include 'userId' and 'amountCents'." 
        });
    }

    const payload: PurchasePayload = {
        userId: String(userId),
        amountCents: Number(amountCents),
        purchaseType: 'AUDIT_RIGHT', // 현재 구매하는 상품 유형
    };

    let paymentResult: PaymentResult;
    let isSuccess = false;

    try {
        // 1. 결제 프로세스 시작 (핵심 로직)
        paymentResult = await processPayment(payload);
        isSuccess = true;

        // 2. 구매 기록 저장
        await recordPurchaseHistory(payload.userId, payload, paymentResult);

        // 성공 응답: 시스템은 정상적으로 작동했다고 보고합니다.
        return res.status(200).json({
            success: true,
            message: "Audit Right Acquisition Protocol Initiated. Access granted.",
            data: paymentResult,
            systemLog: "[SUCCESS] Audit Right protocol activated. Funds secured and access rights assigned."
        });

    } catch (error) {
        // 3. 에러 핸들링 및 시스템 로그 기록 (가장 중요!)
        let systemError = "UNKNOWN_PROTOCOL_FAILURE";
        let statusCode = 500;
        let clientMessage = "An unexpected protocol error occurred.";

        if (error instanceof TransactionError) {
            // 예측 가능한 트랜잭션 에러 처리
            systemError = `[ERROR CODE: ${error.code}]`;
            statusCode = 400; // 클라이언트 측 오류로 간주
            clientMessage = `Transaction Failed (${error.code}). Please verify your details or try again.`;

            // DB 기록 시도 (실패했더라도 로그는 남겨야 합니다)
            await recordPurchaseHistory(payload.userId, payload, { success: false, transactionId: 'N/A', statusMessage: `FAILED - ${error.code}` });
        } else {
             // 예측 불가능한 시스템 에러 처리 (서버 내부 오류)
            systemError = "[CRITICAL_SYSTEM_FAILURE]";
            statusCode = 503; // 서비스 사용 불가로 간주
            clientMessage = "System diagnostic required. Please contact support with the error code.";
        }

        // 실패 응답: 사용자에게 전문적이고 위협적인 에러 메시지를 전달합니다.
        return res.status(statusCode).json({
            success: false,
            error: systemError,
            message: clientMessage,
            systemLog: `[SYSTEM ALERT] Transaction failed due to ${systemError}. Required action: Manual review.`
        });
    }
}