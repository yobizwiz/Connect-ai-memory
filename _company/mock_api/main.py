from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
import random
import time

# --- 데이터 모델 정의 (Pydantic Schema) ---
class ReportData(BaseModel):
    user_id: str
    report_type: str # 예: 'Financial', 'Legal', 'Operational'
    input_params: dict # 사용자 입력 값들
    transaction_token: str = None

class ValidationResult(BaseModel):
    is_compliant: bool
    risk_score: float # 0.0 (안전) ~ 10.0 (치명적 리스크)
    compliance_reason: str # 'PASS', 'WARNING', 'CRITICAL'
    structural_flaw_detected: bool

class PaymentResult(BaseModel):
    success: bool
    transaction_id: str | None = None
    message: str


app = FastAPI(title="MiniReport Gateway Mock API", version="v1.0.0-staging")

# --- 🚨 핵심 엔드포인트 1: 리스크 검증 (Gatekeeper Logic) ---
@app.post("/api/v1/validate_report", response_model=ValidationResult)
async def validate_report(data: ReportData):
    """
    사용자 데이터를 받아 구조적 무결성 및 법규 준수 여부를 시뮬레이션합니다.
    이 함수는 모든 후속 로직의 근거가 됩니다.
    """
    print(f"--- [API CALL] Validating report for User: {data.user_id} ---")

    # 1. 시나리오 기반 리스크 강제 주입 (Test Case A/B)
    if data.input_params.get("trigger_critical_flaw"):
        return ValidationResult(
            is_compliant=False,
            risk_score=9.5, # 높은 점수
            compliance_reason="CRITICAL",
            structural_flaw_detected=True
        )

    # 2. 시나리오 기반 경고 조건 주입 (Test Case C/D)
    if data.input_params.get("trigger_warning"):
        return ValidationResult(
            is_compliant=True,
            risk_score=4.0, # 중간 점수
            compliance_reason="WARNING",
            structural_flaw_detected=False
        )

    # 3. 기본 성공 시나리오 (Test Case B)
    time.sleep(random.uniform(0.5, 1.5)) # 비동기 로딩 시간 시뮬레이션
    return ValidationResult(
        is_compliant=True,
        risk_score=1.2 + random.random() * 2.0, # 낮은 점수 (무작위)
        compliance_reason="PASS",
        structural_flaw_detected=False
    )

# --- 💳 핵심 엔드포인트 2: 결제 처리 게이트웨이 Mock ---
@app.post("/api/v1/process_payment", response_model=PaymentResult)
async def process_payment(data: ReportData):
    """
    결제를 시도합니다. 유효성 검증 결과를 확인하여 결제 가능 여부를 결정해야 합니다.
    """
    # 1. 전처리: 필수적으로 리스크 검증을 재실행한다고 가정 (Defense in Depth)
    try:
        validation_data = await validate_report(ReportData(**data)) # 자기 호출로 최신 로직 반영
    except Exception as e:
        return PaymentResult(success=False, message=f"Validation Error during pre-check: {str(e)}")

    # 2. 구조적 무결성 실패 검사 (가장 중요한 게이트키퍼 로직)
    if not validation_data.is_compliant or validation_data.risk_score >= 8.0:
        return PaymentResult(
            success=False,
            message="[STRUCTURAL INTEGRITY FAILURE] 보고서의 구조적 무결성이 검증되지 않아 결제가 거부되었습니다. 추가 진단이 필요합니다."
        )

    # 3. 일반적인 PG사 실패 시뮬레이션 (Test Case F)
    if data.transaction_token == "FAIL_CARD":
         return PaymentResult(success=False, message="결제 카드 정보가 유효하지 않거나 승인 거부되었습니다.")

    # 4. 성공 로직
    time.sleep(0.5) # 결제 지연 시뮬레이션
    transaction_id = f"TXN-{int(time.time())}-{random.randint(100, 999)}"
    return PaymentResult(success=True, transaction_id=transaction_id, message="결제가 성공적으로 완료되었습니다.")

# --- 테스트 실행 명령 (README에 포함할 예정) ---
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Mock API Staging"}