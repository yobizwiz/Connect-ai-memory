# backend/app/main.py
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
import uvicorn
import os

# ------------------------------------------------------
# [1] API 초기화 및 라우터 설정
# ------------------------------------------------------
app = FastAPI(
    title="yobizwiz Risk Analyzer Backend",
    description="시스템적 생존 위협 분석을 위한 백엔드 API. 모든 트랜잭션은 강력한 유효성 검사를 거칩니다.",
    version="1.0.0"
)

# ------------------------------------------------------
# [2] 데이터 모델 정의 (Pydantic Schemas)
# ------------------------------------------------------
class UserData(BaseModel):
    """사용자가 제출하는 일반적인 비즈니스 정보."""
    company_name: str = "Acme Corp"
    industry: str = "Tech/Software"
    employee_count: int = 50
    annual_revenue_usd: float = 1000000.0

class RiskSubmission(BaseModel):
    """사용자가 '진단 요청'을 제출할 때 사용하는 최종 페이로드."""
    user_data: UserData
    analysis_trigger: str # 예: "Initial Diagnostic Report"
    submitted_by_email: str
    # 보안 강화를 위해 API Key나 Secret Hash를 추가하는 것이 좋습니다.

class WebhookPayload(BaseModel):
    """결제 게이트웨이(PG)에서 수신할 웹훅 페이로드."""
    transaction_id: str
    status: str # 'SUCCESS', 'FAILED'
    amount: float
    timestamp: str
    # 실제 운영 환경에서는 PG사 제공의 서명 검증 (Signature Verification) 로직 필수

class DiagnosisResult(BaseModel):
    """시스템이 최종적으로 계산하여 프론트엔드에 전달할 진단 결과."""
    risk_score: int # 0-100 사이 값. 높을수록 위험함.
    compliance_status: str # 'Compliant', 'Minor Issue', 'Critical Failure'
    qloss_usd: float # $QLoss$ 수치화된 최대 손실액 (핵심 지표)
    suggested_solution: str

# ------------------------------------------------------
# [3] 핵심 엔드포인트 구현
# ------------------------------------------------------

@app.post("/api/v1/diagnose/submit", response_model=DiagnosisResult)
async def submit_diagnosis(submission: RiskSubmission):
    """
    사용자 데이터 제출 및 분석 요청 처리. (시뮬레이션 로직 포함)
    이 함수는 실제로는 복잡한 비동기 계산 엔진을 호출해야 합니다.
    """
    print(f"--- [API LOG] Received diagnosis request from {submission.submitted_by_email} ---")

    # 💡 핵심: 여기서 '시스템적 무지'를 자극하는 로직이 실행되어야 함.
    # 데이터가 충분하면 (예: revenue > threshold) 리스크 점수가 낮게 나오지만,
    # 특정 키워드나 구조적 결함(Simulated Failure)을 발견하면 높은 $QLoss$를 반환해야 합니다.

    # 임시 시뮬레이션 로직
    if submission.user_data.annual_revenue_usd < 50000:
        risk = 92 # 낮은 수익 -> 위험도 높음
        qloss = submission.user_data.annual_revenue_usd * 1.5
        status = "Critical Failure"
    elif "legacy" in submission.user_data.company_name.lower():
        risk = 75
        qloss = 50000.0 # 특정 위험군에 대한 고정 손실액
        status = "Minor Issue"
    else:
        risk = 20
        qloss = 10000.0
        status = "Compliant"

    return DiagnosisResult(
        risk_score=risk,
        compliance_status=status,
        qloss_usd=round(qloss, 2),
        suggested_solution="즉시 전문가의 컨설팅 및 시스템 통합이 필요합니다."
    )


@app.post("/api/v1/webhook/payment")
async def handle_payment_webhook(payload: WebhookPayload):
    """
    PG Sandbox로부터 결제 웹훅을 수신하는 엔드포인트. (Webhook Listener)
    반드시 트랜잭션 서명 검증 로직이 포함되어야 합니다.
    """
    print(f"--- [WEBHOOK LOG] Received payment webhook for TX ID: {payload.transaction_id} ---")

    if payload.status == "SUCCESS":
        # 1. DB에 결제 기록 저장 (Transaction Status = PAID)
        # 2. 사용자 계정 상태 변경 (Account Tier = Premium/Gold)
        print(f"✅ [DB SUCCESS] Transaction {payload.transaction_id} recorded as successful.")
        return {"status": "success", "message": "Payment processed and verified."}
    elif payload.status == "FAILED":
        # 1. DB에 결제 실패 기록 저장 (Transaction Status = FAILED)
        print(f"❌ [DB FAIL] Transaction {payload.transaction_id} recorded as failed.")
        return {"status": "failure", "message": f"Payment failed: {payload.status}."}
    else:
        raise HTTPException(status_code=400, detail="Unknown payment status received.")


@app.get("/api/v1/secure/report-gatekeeper")
async def get_report_access(payment_success: bool):
    """
    결제 게이트키핑 역할을 하는 최종 API. 접근 권한을 검증합니다.
    프론트엔드는 이 API를 호출하여 접근 여부를 판단해야 합니다.
    """
    if payment_success is True:
        # 🟢 결제가 완료된 경우, 보고서에 대한 '권위적 접근' 허용
        return {"access": True, "message": "접근 권한이 활성화되었습니다. 진단 결과를 확인하십시오."}
    else:
        # 🔴 결제가 실패했거나 누락된 경우, 강제 게이트키핑 발동
        return {"access": False, "message": "시스템적 리스크 분석 보고서 접근을 위해서는 유효한 구독이 필요합니다. [QLoss 재경고]"}

if __name__ == "__main__":
    # 개발 환경에서 uvicorn 실행하는 방법
    uvicorn.run(app, host="0.0.0.0", port=8000)