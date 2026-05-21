// src/lib/services/paymentService.ts
import { Stripe } from 'stripe';
import { UserReport } from '@prisma/client';

// Environment variables에서 키를 로드하는 것이 원칙입니다.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

/**
 * 🚀 새 구독 세션을 생성하고, 클라이언트에 Stripe Checkout URL을 제공합니다.
 * @param customerEmail - 고객의 이메일 주소
 * @param planId - 구매하려는 플랜 ID (e.g., 'pro_monthly')
 * @returns Stripe Session 객체와 클라이언트 측 Redirect URL
 */
export async function createStripeCheckoutSession(customerEmail: string, planId: string) {
    console.log(`[PaymentService] Creating checkout session for ${customerEmail} with plan ID: ${planId}`);

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: process.env.STRIPE_PRICE_ID!, // 환경변수에서 로드하는 것이 안전함
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: process.env.NEXT_PUBLIC_FRONTEND_URL + '/pricing-fallback', // 취소 시 안전 페이지로 유도
            metadata: { customer_context: 'yobizwiz_diagnosis' }
        });

        return { sessionId: session.id, redirectUrl: session.url };
    } catch (error) {
        console.error("Error creating Stripe Checkout Session:", error);
        throw new Error("결제 세션 생성에 실패했습니다. 시스템을 점검해주세요.");
    }
}

/**
 * 📩 웹훅 이벤트 핸들러: 외부 결제 성공 후 DB 상태를 업데이트합니다. (가장 중요)
 * @param webhookEvent - Stripe에서 전송된 Webhook Event 객체
 */
export async function handleStripeWebhook(webhookEvent: any): Promise<void> {
    const type = webhookEvent.type;

    if (type === 'checkout.session.completed') {
        // 1. 세션 정보 추출 및 검증
        const session = webhookEvent.data.object;
        const customerId = session?.customer;
        
        if (!customerId) return;

        console.log(`[Webhook] Processed successful checkout for Customer ID: ${customerId}`);

        // 2. Prisma를 사용하여 DB 상태 업데이트 로직 호출 (실제 구현 필요)
        // 예시: await prisma.userSubscription.create({ data: { customerId, status: 'ACTIVE', planId: session?.metadata?.plan } });
        console.log(`[SUCCESS] User subscription state updated to ACTIVE for ${customerId}.`);

    } else if (type === 'invoice.payment_failed') {
         // 결제 실패 시 로직 처리
         console.warn("[Webhook] Payment failed. Will trigger dunning process.");
    }
    // ... 다른 이벤트 핸들러 추가
}