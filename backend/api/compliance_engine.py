from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import random
import time

# --- 1. Pydantic Schema 정의 (입력/출력 구조 명확화) ---
class ProcessInputs(BaseModel):
    """사용자가 입력하는 가상의 프로세스 데이터."""
    process_efficiency_score: float # 0.0 ~ 1.0
    regulatory_compliance_gap_count: int # 미준수 항목 개수 (Critical Gap Count)
    operational_cycle_time_days: float # 현재 운영 주기 시간(일)

class RiskAssessmentResult(BaseModel):
    """API가 최종적으로 반환하는 구조화된 결과 데이터."""
    risk_level: str  # "LOW", "MEDIUM", "HIGH"
    financial_loss_estimate_usd: float # 예상 재무 손실 ($)
    opportunity_cost_hours: int # 기회비용 시간 (시간 단위)
    is_critical_failure: bool # 시스템적 실패 여부 (Red Zone 트리거)
    report_summary: str # 사용자에게 보여줄 핵심 경고 메시지

# --- 2. 비즈니스 로직: Opportunity Cost Engine (핵심 계산 엔진) ---
def calculate_risk(inputs: ProcessInputs) -> tuple[str, float, int, bool, str]:
    """
    입력된 프로세스 데이터 기반으로 구조적 위험을 판단하고 비용을 추정합니다.
    이 함수는 yobizwiz의 핵심 지식 자산입니다. [근거: 💻 코다리 개인 메모리]
    """
    # 효율성 점수와 미준수 항목 개수를 조합하여 기초 리스크 스코어 산출 (0~100)
    base_score = (1 - inputs.process_efficiency_score) * 60 + (inputs.regulatory_compliance_gap_count * 5)
    
    # 운영 주기 시간은 시스템적 비효율성(Opportunity Cost)에 기여
    time_penalty = min(inputs.operational_cycle_time_days / 7, 2.0) * 15 # 최대 30시간 페널티
    
    final_risk_score = base_score + int(time_penalty)

    # 리스크 레벨 및 임계값 설정
    if final_risk_score >= 85:
        level, loss_multiplier, is_critical = "HIGH", 1.5, True # Red Zone 강제
        report = f"🚨 경고! 시스템적 생존 위협 감지. 리스크 스코어 {final_risk_score}은(는) 임계치를 초과했습니다."
    elif final_risk_score >= 50:
        level, loss_multiplier, is_critical = "MEDIUM", 0.8, False
        report = f"⚠️ 주의 필요. 프로세스 비효율성으로 인해 {final_risk_score}점의 위험도가 측정되었습니다."
    else:
        level, loss_multiplier, is_critical = "LOW", 0.2, False
        report = f"✅ 현재 시스템은 구조적 무결성을 유지하고 있습니다. 최적화 여지가 있습니다."

    # 재무 손실 추정 (가장 중요한 출력 변수)
    financial_loss = round(final_risk_score * loss_multiplier * random.uniform(100, 500), -2) # $100~$500 범위에서 조정
    
    # 최종 결과 반환
    return level, financial_loss, int(time_penalty + (base_score / 2)), is_critical, report

# --- 3. FastAPI Application Setup ---
app = FastAPI(title="Compliance Gatekeeper API")

@app.post("/api/v1/risk-assessment", response_model=RiskAssessmentResult)
async def assess_risk(inputs: ProcessInputs):
    """사용자 입력 데이터를 받아 구조적 리스크 및 재무 손실을 평가하는 엔드포인트."""
    try:
        level, loss, hours, is_critical, report = calculate_risk(inputs)

        # 결과 데이터 모델에 맞게 포장하여 반환
        return RiskAssessmentResult(
            risk_level=level,
            financial_loss_estimate_usd=round(loss, 2),
            opportunity_cost_hours=hours,
            is_critical_failure=is_critical,
            report_summary=report
        )

    except Exception as e:
        print(f"Error during risk assessment: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error during assessment.")


# 테스트용 실행 명령 (사용자에게는 보여주지 않음)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("compliance_engine:app", host="127.0.0.1", port=8000, reload=True)