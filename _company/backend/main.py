from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import random
import time

app = FastAPI(title="Yobizwiz Risk Diagnostic API")

# --- Pydantic Schema for Input Validation (Defensive Programming) ---
class UserContext(BaseModel):
    """사용자의 기본적인 컨텍스트 정보를 받아옵니다."""
    user_id: str = Field(..., description="고유 사용자 식별자")
    data_source: str = Field(..., description="진단에 사용될 데이터 출처 (e.g., KYC, Transaction)")
    input_risk_score: float = Field(..., ge=0.0, le=10.0, description="초기 입력된 리스크 점수 (0~10)")

# --- Pydantic Schema for Output Data Consistency ---
class RiskAnalysisResult(BaseModel):
    """진단 결과를 포함하는 표준화된 응답 구조."""
    status_gauge_value: float = Field(..., ge=0.0, le=100.0, description="StatusGauge에 바인딩될 0~100 사이의 값")
    lmax_calculated: float = Field(..., gt=0.0, description="최대 재무 손실액 ($L_{max}$) (단위: USD)")
    risk_level_message: str = Field(..., description="사용자에게 보여줄 리스크 레벨 메시지")
    is_paywall_triggered: bool = Field(..., description="페이월 결제 모달 활성화 여부 플래그")

# --- Core Business Logic (Lmax Calculation & Status Gauge Update) ---
def calculate_lmax_and_status(context: UserContext) -> tuple[float, float]:
    """
    핵심 비즈니스 로직: 리스크 온톨로지 기반 $L_{max}$ 및 StatusGauge 값 산출.
    실제 환경에서는 복잡한 DB 쿼리와 ML 모델 호출이 들어갈 자리입니다.
    여기서는 시뮬레이션합니다.
    """
    # 1. Lmax 계산 (위험 증폭 모델 적용)
    # 예시: 입력 점수 * 상수 + 랜덤 변동성
    base_lmax = context.input_risk_score * 5000
    time_factor = time.time() % 10 / 10 # 시간에 따른 미세 변화 시뮬레이션
    lmax = round(base_lmax + (context.input_risk_score * 100) * random.random(), 2)

    # 2. Status Gauge Value 산출 (Lmax에 비례하며, 100을 초과할 수 없음)
    # Lmax가 커지면 게이지 값이 높게 설정되어야 합니다.
    status_gauge_value = min(100.0, context.input_risk_score * 8 + (lmax / 500))

    return lmax, status_gauge_value


@app.post("/api/v1/diagnose-risk", response_model=RiskAnalysisResult)
async def diagnose_risk(context: UserContext):
    """
    사용자 입력 데이터를 받아 실시간 리스크 진단을 수행하고 결과를 반환합니다.
    이 엔드포인트는 Paywall 로직의 핵심입니다.
    """
    try:
        # 1. 비즈니스 규칙 실행 및 데이터 산출
        lmax, status_gauge = calculate_lmax_and_status(context)

        # 2. 결과 해석 및 플래그 설정 (Paywall Triggering Logic)
        if lmax > 5000: # 임계값 정의 ($L_{max}$가 높을수록 Paywall 유도 강함)
            risk_level = "CRITICAL: 즉각적인 재정적 위험이 감지되었습니다."
            is_paywall = True
        elif status_gauge >= 75.0:
            risk_level = "HIGH: 주의가 필요하며, 전문 진단이 권장됩니다."
            is_paywall = False # 낮은 Lmax라도 게이지만으로 경고 가능
        else:
            risk_level = "LOW: 현재 리스크 수준은 관리 가능한 범위입니다."
            is_paywall = False

        # 3. 최종 결과 모델 반환 (타입 안전성 확보)
        return RiskAnalysisResult(
            status_gauge_value=round(status_gauge, 2),
            lmax_calculated=round(lmax, 2),
            risk_level_message=risk_level,
            is_paywall_triggered=is_paywall
        )

    except Exception as e:
        # Catch-all for unexpected errors (Root Cause Analysis 필요 영역)
        print(f"🚨 Internal Server Error during diagnosis: {e}")
        raise HTTPException(status_code=500, detail="진단 프로세스 중 예상치 못한 오류가 발생했습니다. 관리자에게 문의하세요.")

# --- Basic Health Check Endpoint ---
@app.get("/health")
def check_health():
    return {"status": "OK", "service": "Yobizwiz Risk Diagnostic Engine"}