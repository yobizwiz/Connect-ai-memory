// A/B Test Mockup Configuration (Hardcoded for initial development)
export type ABTestVariantKeys = 'v1_financial' | 'v2_operational';

interface VariantCopy {
    headline: string;
    ctaButtonText: string;
    conclusionMessage: string;
}

export const A_B_TEST_VARIANTS: Record<ABTestVariantKeys, VariantCopy> = {
    // [Version 1] 🔥 파국적 손실 공포 자극형 (The Financial Loss Fear)
    'v1_financial': {
        headline: "🚨 [경고] 현재 프로세스대로라면, 귀사는 매 분기마다 최소 X억 원의 '법적 손실'을 감수하고 있습니다.",
        ctaButtonText: "▶️ 리스크 진단 및 손실액 계산하기 (무료)",
        conclusionMessage: "문제는 규정 위반 자체가 아닙니다. 사후 증명 불가능한 프로세스는 존재 자체를 무너뜨릴 수 있습니다. 구조적 안전장치만이 생존을 보장합니다.",
    },
    // [Version 2] ⚙️ 통제 상실 및 비효율 공포 자극형 (The Operational Control Loss Fear)
    'v2_operational': {
        headline: "\"A-B-C 과정만으로는 부족합니다. 당신의 플로우에서 누락된 'D 체크'가 존재합니다.\"",
        ctaButtonText: "🔍 우리 조직의 숨겨진 리스크 흐름도 검토하기",
        conclusionMessage: "수동적인 매뉴얼 점검만으로는 안 됩니다. 통합적이고 구조화된 안전장치만이 생존을 보장합니다.",
    },
};

// 초기 디폴트 값을 설정 (실제 환경에서는 서버 응답에 따라 결정됨)
export const initialABTestVariant: VariantCopy = A_B_TEST_VARIANTS['v1_financial'];