from typing import Literal, Dict, Any
from pydantic import BaseModel, Field
import math

# =============================================================
# 📜 ERQM 모델 변수 및 가중치 정의 (Hardcoded Weights)
# 이 값들은 초기 MVP 단계에서 임시로 설정하며, 추후 데이터 기반으로 조정되어야 합니다.
# =============================================================

REG_WEIGHTS: Dict[str, float] = {
    "금융": 0.9,  # 규제 복잡도 높음
    "헬스케어": 1.2, # 가장 높은 규제 위험 (HIPAA 등)
    "IT 서비스": 0.5, # 비교적 낮음
}

AUTO_FAILURE_WEIGHT: float = 0.8 # 운영 실패의 기본 가중치

# =============================================================
# 📦 Pydantic 스키마 정의
# 요청 및 응답 구조를 명확하게 합니다.
# =============================================================

class RiskInput(BaseModel):
    """API 요청 본문 (Body)에 사용되는 필수 입력 변수들을 정의합니다."""
    industry: Literal["금융", "헬스케어", "IT 서비스"] = Field(..., description="업종 분류. 규제 위험도를 결정하는 핵심 요소.")
    operational_duration_years: float = Field(..., ge=0.1, le=50, description="운영 기간 (년). 안정성 및 성숙도에 영향을 줍니다.")
    automation_level: Literal["low", "medium", "high"] = Field(..., description="자동화 수준. 운영 실패 취약성을 결정합니다.")

class RiskBreakdown(BaseModel):
    """리스크 분석의 세부 항목들을 정의합니다."""
    regulatory_gap_score: float = Field(description="규제적 격차 지수 (R_Reg). 업종과 기간에 따라 계산됩니다.")
    operational_failure_score: float = Field(description="운영 실패 취약성 지수 (R_OpFail). 자동화 수준에 의해 결정됩니다.")
    market_volatility_weight: float = Field(description="시장 변동성 가중치 (W_Market). 전반적인 위험을 증폭시키는 외부 요인입니다.")

class RiskAssessmentResponse(BaseModel):
    """최종 API 응답 스키마를 정의합니다."""
    overall_risk_score: float = Field(..., description="최종 존재론적 리스크 점수 (R_Total). 높은 값이 위협을 의미합니다.")
    risk_breakdown: RiskBreakdown

# =============================================================
# 🧠 핵심 ERQM 계산 로직
# R_Total = (R_Reg * R_OpFail) + W_Market 형태를 따릅니다.
# =============================================================

def calculate_erqm(input_data: RiskInput) -> tuple[float, RiskBreakdown]:
    """
    요청된 데이터를 기반으로 존재론적 리스크 점수 (ERQM)를 계산합니다.
    이 로직은 연구원님이 제시한 복합적인 곱셈 구조를 반영합니다.
    """

    # 1. R_Reg: 규제적 격차 지수 계산
    industry_weight = REG_WEIGHTS[input_data.industry]
    # 기간이 짧을수록(신생 기업) 그리고 규제가 복잡할수록 리스크가 높아지도록 가중치 적용
    reg_gap_score = industry_weight * (1 + (1 / (1 + input_data.operational_duration_years)))
    
    # 2. R_OpFail: 운영 실패 취약성 지수 계산
    auto_map = {"low": 0.5, "medium": 0.7, "high": 1.0}
    base_vulnerability = auto_map[input_data.automation_level]
    # 자동화 레벨이 낮을수록(사람 의존도 높음) 그리고 기간이 짧을수록 취약성이 높아지도록 가중치 적용
    op_fail_score = base_vulnerability * (1 + (1 / (1 + input_data.operational_duration_years)))

    # 3. W_Market: 시장 변동성 가중치 계산 (간단화)
    market_weight = 0.5 + (input_data.automation_level == 'low' and input_data.industry != "IT 서비스") * 0.5 # 낮은 자동화+고위험 업종에 추가 가산점

    # 4. R_Total: 최종 존재론적 리스크 점수 계산
    # R_Total = (R_Reg * R_OpFail) + W_Market
    overall_risk_score = (reg_gap_score * op_fail_score) + market_weight

    breakdown = RiskBreakdown(
        regulatory_gap_score=round(reg_gap_score, 2),
        operational_failure_score=round(op_fail_score, 2),
        market_volatility_weight=round(market_weight, 2)
    )

    return round(overall_risk_score, 2), breakdown


from fastapi import FastAPI
from src.api.risk_calculator import RiskInput, RiskAssessmentResponse, calculate_erqm

app = FastAPI(title="Yobizwiz Risk Assessment API", version="v1")

@app.post("/api/v1/risk-assessment", response_model=RiskAssessmentResponse)
async def assess_risk(input: RiskInput):
    """
    주어진 입력 변수를 기반으로 시스템적 생존 위협 점수 (ERQM)를 계산합니다.
    이 엔드포인트는 고객에게 공포와 긴급성을 체험하게 만드는 핵심 엔진입니다.
    """
    try:
        overall_score, breakdown = calculate_erqm(input)

        return RiskAssessmentResponse(
            overall_risk_score=overall_score,
            risk_breakdown=breakdown
        )
    except Exception as e:
        # 에러 발생 시에도 시스템적 오류 메시지처럼 보이도록 처리하는 것이 중요합니다.
        print(f"API Error during assessment: {e}")
        raise Exception("시스템 과부하 또는 데이터 입력 오류가 감지되었습니다. 재시도를 권장합니다.")