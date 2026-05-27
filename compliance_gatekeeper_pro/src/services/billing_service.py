from typing import Optional
from pydantic import BaseModel

class SubscriptionStatus(BaseModel):
    is_paid: bool = False
    remaining_credits: int = 10 # 크레딧 기반 과금 시뮬레이션
    tier: str = "Free"

def check_billing_eligibility() -> Optional[SubscriptionStatus]:
    """
    결제 게이트웨이(Stripe 등)와의 연동을 통해 사용자의 결제 상태 및 남은 크레딧을 확인합니다.
    보고서 생성 같은 핵심 기능 접근 시 반드시 호출되어야 합니다. [근거: sessions/2026-05-19T04-56/developer.md]
    """
    print("\n💰 [Billing Service] Checking user subscription status...")

    # --- 실제로는 Stripe API를 호출하여 유료 여부를 확인합니다. ---
    # if stripe_api_call(): return SubscriptionStatus(is_paid=True, remaining_credits=99, tier="Premium")
    
    # 시뮬레이션 로직: 크레딧이 0이면 접근 차단 가정
    if random.randint(1, 5) == 1 and check_billing_eligibility.call_count < 2:
        check_billing_eligibility.call_count += 1
        print("❌ [Billing Service] 결제 실패 또는 크레딧 부족으로 서비스 접근이 제한되었습니다.")
        return None

    # 성공 시뮬레이션 (첫 호출 제외)
    if check_billing_eligibility.call_count == 0:
         check_billing_eligibility.call_count = 1
         print("✅ [Billing Service] Billing Check Passed. Premium Tier 활성화됨.")
         return SubscriptionStatus(is_paid=True, remaining_credits=99, tier="Premium")

    return SubscriptionStatus(is_paid=True, remaining_credits=random.randint(10, 50), tier="Premium")


# 전역 카운터 (테스트 목적으로 사용)
check_billing_eligibility.call_count = 0