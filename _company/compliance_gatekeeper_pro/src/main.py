from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Annotated
import os
# 내부 서비스 임포트 (Module Path)
from services.auth_service import get_current_user, User
from services.regulatory_service import fetch_regulatory_data, generate_detailed_report
from services.billing_service import check_billing_eligibility, SubscriptionStatus

app = FastAPI(title="Compliance Gatekeeper Pro API")

# CORS 미들웨어 등록: 모든 출처에서의 교차 요청을 허용하여 CORS 차단 에러 방지
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 의존성 주입 (Dependency Injection) 설정: 인증 및 결제 게이트웨이를 필수로 만듭니다.
def get_user() -> Annotated[User]:
    """JWT 토큰을 기반으로 사용자 객체를 가져오는 의존성."""
    # 실제로는 헤더에서 Bearer Token을 추출해야 합니다. 여기서는 시뮬레이션합니다.
    mock_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlJlYWQxIiwiZXhwIjoxNzE4MjIwMDAwfQ.S_A-fake-token"
    user = get_current_user(mock_token)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
    return user

def check_billing() -> Annotated[SubscriptionStatus]:
    """결제 상태가 유효한지 확인하는 의존성."""
    billing = check_billing_eligibility()
    if billing is None or not billing.is_paid:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Service access denied. Please update your subscription.")
    return billing

@app.get("/api/v1/report")
async def generate_compliance_report(
    user: Annotated[User] = Depends(get_user), 
    billing: Annotated[SubscriptionStatus] = Depends(check_billing),
    query: str = "PII Data Handling", # 테스트용 기본값 설정
    jurisdiction: str = "EU" # 테스트용 기본값 설정
):
    """
    메인 엔드포인트: 규제 검색 보고서 생성 워크플로우를 실행합니다.
    Auth -> Billing -> Regulatory 순으로 단계적 게이트웨이 검증을 거칩니다.
    """
    print("\n=============================================")
    print("🚀 [Workflow Start] Compliance Gatekeeper Pro API Call")
    print(f"User: {user.user_id} | Tier: {billing.tier}")

    try:
        # 1. 외부 데이터 수집 (Regulatory DB 호출)
        regulatory_data = fetch_regulatory_data(query, jurisdiction)
        
        # 2. 보고서 가공 및 최종 결과 생성
        report_content = generate_detailed_report(regulatory_data)

        return {
            "status": "SUCCESS",
            "message": f"Compliance Report generated successfully for '{query}'.",
            "report_details": report_content,
            "risk_assessment": regulatory_data.model_dump() # Pydantic v2 방식
        }

    except Exception as e:
        print(f"🛑 [ERROR] Critical failure in workflow: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal processing error.")