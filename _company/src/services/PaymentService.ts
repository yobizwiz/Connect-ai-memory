import { PaywallStateController } from '../services/PaywallStateController';

/**
 * 결제 트랜잭션을 처리하는 서비스 계층. Stripe/PayPal 등 실제 게이트웨이와의 통신을 담당합니다.
 */
export class PaymentService {
    private readonly stripeClient: any; // TODO: @stripe/stripe-node 초기화 및 인증 로직 추가
    private readonly paywallController: PaywallStateController;

    constructor(paywallController: PaywallStateController) {
        this.paywallController = paywallController;
        // TODO: 실제 환경 변수에서 API Key를 가져와 클라이언트를 초기화해야 합니다.
        // this.stripeClient = require('stripe')(process.env.STRIPE_SECRET_KEY); 
    }

    /**
     * 사용자가 결제 버튼을 누르면 호출되는 메인 트랜잭션 실행 함수.
     * @param paymentMethodToken - 클라이언트 측에서 생성된 토큰 (카드 정보 등).
     * @param planId - 구매하려는 플랜 ID ('premium-annual' 등).
     * @returns 성공 시 트랜잭션 결과 객체, 실패 시 에러를 포함한 결과.
     */
    public async processPayment(paymentMethodToken: string, planId: string): Promise<{ success: boolean; transactionId?: string; message: string }> {
        try {
            // 1. 상태 전이: PROCESSING으로 전환 (UI에 로딩 스피너 표시)
            this.paywallController.transition(PaymentState.PROCESSING);

            console.log(`[API Call] Attempting payment for Plan ${planId} with Token ${paymentMethodToken}...`);

            // **********************************************************
            // !!! 중요: 이 섹션은 실제 Stripe/PayPal SDK 호출로 대체되어야 합니다.
            // 예시: const charge = await this.stripeClient.charges.create({ ... });
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network latency

            const isSuccessSimulated = Math.random() > 0.2; // 80% 성공률 시뮬레이션

            if (!isSuccessSimulated) {
                throw new Error('Payment gateway declined transaction due to insufficient funds or expired card.');
            }
            // **********************************************************

            const successfulTransactionId = `txn_${Date.now()}_${planId}`;

            // 2. 상태 전이 및 로그 기록 (SUCCESS)
            this.paywallController.transition(PaymentState.SUCCESS, { transactionId: successfulTransactionId });
            await this.logAuditEvent('PAYMENT_SUCCESS', { transactionId: successfulTransactionId, planId: planId });

            return { success: true, transactionId: successfulTransactionId, message: '✅ 결제에 성공했습니다. 보고서를 즉시 확인하세요.' };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown API Error';
            console.error(`[ERROR] Payment failure detected: ${errorMessage}`);
            
            // 3. 상태 전이 및 로그 기록 (FAILED)
            this.paywallController.transition(PaymentState.FAILED);
            await this.logAuditEvent('PAYMENT_FAILURE', { reason: errorMessage, planId: planId });

            // Writer가 작성한 에러 카피를 여기서 활용하여 사용자에게 노출해야 합니다.
            return { success: false, message: `❌ 결제에 실패했습니다. 시스템 오류 또는 카드 문제입니다. (${errorMessage})` };
        }
    }
    
    /**
     * Audit Log Service를 호출하여 이벤트 기록을 보장합니다. (Transaction Guard)
     */
    private async logAuditEvent(eventType: string, data: any): Promise<void> {
        // TODO: 실제 구현 시에는 이 함수 내부에서 SHA-256 해시 체인 로직이 실행되어야 합니다.
        console.log(`[AUDIT LOG] Recording immutable event: ${eventType} with payload:`, data);
        // await AuditLogService.recordEvent(eventType, data); 
    }
}