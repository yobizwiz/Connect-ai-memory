import random
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
# Assume schemas are available in the same directory for demonstration
from .schemas import ThreatInput, OutputSchema 
from typing import Optional

# --- [1. Error Handling Module] ---
class CalculationError(Exception):
    """Custom exception for failed calculations or invalid data states."""
    def __init__(self, message: str = "TRE 계산 중 치명적인 로직 오류가 발생했습니다.", status_code: int = 400):
        super().__init__(message)
        self.status_code = status_code

# --- [2. Scoring Engine Core Logic] ---
def calculate_tre_score(input_data: ThreatInput) -> float:
    """
    Threat Risk Index (TRE) 점수를 계산하는 핵심 비즈니스 로직.
    가중치(Weights)와 위험 요소 간의 상관관계에 따라 점수가 결정됩니다.

    [기술적 검증 포인트]
    1. 필수 데이터 누락 시 즉시 예외 발생 유도.
    2. 모든 입력 값은 0~1 사이로 정규화되어야 함 (가중치 적용 전).
    3. 가중치는 주기적으로 조정될 수 있는 상수(Constants)로 관리해야 합니다.
    """
    try:
        # --- A. 데이터 유효성 검사 및 기본 점수 초기화 ---
        if input_data.get("company_annual_revenue_usd") is None or input_data["company_annual_revenue_usd"] < 1000:
            raise CalculationError("회사 매출액 정보가 필수적이거나 유효하지 않습니다. 기준점 확보 필요.", status_code=422)

        # --- B. 리스크별 가중치 정의 (Weighting Factors - Hardcoded for now, should be config) ---
        W_PII = 0.35  # PII Leakage는 가장 흔하고 치명적인 초기 위험 요소
        W_AUDIT = 0.30 # 프로세스 단절은 시스템의 구조적 결함을 의미
        W_AI = 0.20    # AI 환각 의존도는 신뢰성 문제로 중요도가 높아짐
        W_REVENUE = 0.15 # 회사 규모에 따른 리스크 민감도 (Revenue가 높으면 리스크 지수 배율 증가)

        # --- C. 개별 위험 점수 계산 및 정규화 (Normalization & Scoring) ---
        # Score는 [0, 1] 범위로 먼저 산출하고, 나중에 가중치를 곱합니다.

        # 1. PII Risk Component (가장 높은 영향력)
        pii_score = input_data["pii_exposure_count"] * 0.05 + input_data["compliance_violation_likelihood"] * 0.6
        if pii_score > 1.0: pii_score = 1.0 # 상한선 제한

        # 2. Audit/Process Risk Component (가장 구조적 결함을 측정)
        audit_score = min(input_data["critical_workflow_gap_count"] * 0.2, 0.8) + input_data["process_failure_cost_estimate"] / 1_000_000 # Cost를 기준으로 스케일 조정
        if audit_score > 1.0: audit_score = 1.0

        # 3. AI Hallucination Risk Component
        ai_score = input_data["ai_hallucination_dependency_score"] * 0.9 # 의존도가 높을수록 점수 증가

        # --- D. 최종 가중 평균 산출 (Final Weighted Average) ---
        raw_tre_score = (pii_score * W_PII + audit_score * W_AUDIT + ai_score * W_AI)
        
        # 회사 규모에 따른 민감도 조절 (Revenue가 높을수록 위험은 더 커진다 가정)
        revenue_factor = 1.0 + (input_data["company_annual_revenue_usd"] / 100_000_000) * W_REVENUE
        final_tre_score = raw_tre_score * revenue_factor

        # 점수 클리핑 및 최종 반환 (최대 100점 스케일로 조정 가능하도록 처리)
        return min(max(final_tre_score, 0.0), 100.0)


    except CalculationError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        # 예상치 못한 시스템 오류 처리 (Root Cause 분석 필수!)
        print(f"CRITICAL ERROR during TRE calculation: {e}") 
        raise HTTPException(status_code=500, detail="서버 내부 로직 오류. 개발팀에 문의하세요.")


def determine_risk_level(score: float) -> tuple[str, str, str]:
    """점수를 기반으로 리스크 레벨, 경고 메시지, 제안 티어 3가지를 반환합니다."""
    if score < 30:
        return "Green", "낮음. 현재 시스템 구조는 안정적입니다.", "Tier 0 - None"
    elif score < 65:
        # Yellow Zone 경고 메시지 (미묘한 불편함)
        warning = "주의. 일부 사각지대(Blind Spot)가 감지됩니다. 프로세스 점검이 필요합니다."
        return "Yellow", warning, "Tier 1 - Detection"
    else:
        # Red Zone 경고 메시지 (생존 위협)
        warning = "🚨 시스템적 생존 위협! 즉각적인 구조 개선(Mitigation) 없이는 큰 금전적 손실이 예상됩니다. 전문가의 개입이 필수입니다."
        return "Red", warning, "Tier 2 - Prevention"


def generate_report(input_data: ThreatInput):
    """메인 실행 함수: 점수 계산 및 최종 리포트 구조화."""
    try:
        # 1. TRE Score 계산
        score = calculate_tre_score(input_data)

        # 2. 리스크 레벨 결정 (Red Zone 트리거)
        risk_level, warning_message, suggested_tier = determine_risk_level(score)

        # 3. 최종 Output 객체 구성 및 반환
        return {
            "threat_risk_index": round(score, 2),
            "risk_level": risk_level,
            "systemic_warning_message": warning_message,
            "suggested_tier": suggested_tier,
        }

    except HTTPException as e:
        # 이미 계산 엔진에서 처리된 에러는 그대로 전파
        raise e
    except Exception as e:
        # 만약 여기에서도 실패한다면, 가장 안전한 기본값을 반환하며 로그를 남긴다.
        print(f"FATAL UNHANDLED ERROR in report generation: {e}")
        return {
            "threat_risk_index": 0.0,
            "risk_level": "Green",
            "systemic_warning_message": "시스템 분석 오류로 임시 값을 반환합니다. 다시 시도해주세요.",
            "suggested_tier": "Tier 0 - None"
        }


# --- [3. FastAPI Application Setup (Mock Endpoint)] ---
app = FastAPI(title="yobizwiz TRE Calculator API")

@app.post("/api/v1/calculate-threat", response_model=dict)
async def calculate_threat_endpoint(data: ThreatInput):
    """
    사용자로부터 데이터를 받아 종합 위협 지수를 산출하고,
    Red Zone 트리거 여부를 결정하는 메인 엔드포인트.
    """
    # 핵심 로직 호출
    report = generate_report(data)
    return report

if __name__ == "__main__":
    import uvicorn
    print("--- Starting TRE Calculator API Mockup ---")
    # 실제 환경에서는 이 명령을 실행하여 서버를 띄웁니다.
    uvicorn.run(app, host="0.0.0.0", port=8000)

# 참고: 위 코드는 pydantic v2와 fastapi가 설치되어 있어야 작동합니다.