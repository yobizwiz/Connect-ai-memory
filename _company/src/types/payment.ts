/**
 * src/types/payment.ts
 * @description 결제 플랜 및 티어에 대한 타입 정의.
 */

export type PaymentTier = {
    type: 'Bronze' | 'Silver' | 'Gold';
    name: string;
    price: number; // USD 기준 가격 (예시)
    savedValue: number; // 예상 절감 가치 ($L_Saved$)
    description: string;
};

export const TIER_DATA: Record<PaymentTier['type'], PaymentTier> = {
    Bronze: {
        type: 'Bronze',
        name: "Basic Shield (기본 방어)",
        price: 99, // $99/Year
        savedValue: 300, 
        description: "최소한의 규정 준수 항목을 커버합니다. 리스크 발생 시 제한적 대응이 가능합니다.",
    },
    Silver: {
        type: 'Silver',
        name: "Pro Shield (전문가 방어)",
        price: 299, // $299/Year
        savedValue: 1500, 
        description: "주요 규제 Gap과 법적 부채에 대비합니다. 가장 많은 고객이 선택하는 필수 플랜입니다.",
    },
    Gold: {
        type: 'Gold',
        name: "Ultimate Shield (궁극 방어)",
        price: 999, // $999/Year
        savedValue: 5000, 
        description: "모든 알려진 시스템적 리스크와 미래의 규제까지 아우르는 완벽한 보험료입니다. 권장됩니다.",
    }
};