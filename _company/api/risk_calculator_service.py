# Python 3.10+ 및 Pydantic v2, FastAPI가 설치되어 있다고 가정합니다.
from pydantic import BaseModel, Field
from typing import Dict, Any, List
import random

# =============================================
# 1. Data Models (Schema Definition)
# riskTypes.ts에서 가져온 구조를 반영하여 Pydantic 모델 정의
# =============================================

class RiskKPI(BaseModel):
    """핵심 리스크 KPI 값."""
    tre: float = Field(description="Total Risk Exposure (재무적 최대 손실액)")
    pig: float = Field(description="Potential Impact Gradient")
    ars: float = Field(description="Accumulated Rate of Stress")
    cdr: float = Field(description="Compliance Drift Ratio")
    ail: float = Field(description="Anomaly Index Level")
    ksd: float = Field(description="Knowledge Stability Deficit")

class SystemState(BaseModel):
    """시스템의 현재 위험 상태."""
    state_code: str = Field(description="현재 시스템 경고 코드 (e.g., NORMAL, YELLOW, RED)")
    risk_level: int = Field(description="위험 레벨 (0=Normal, 1=Yellow, 2=Red)")
    is_critical: bool = Field(description="임계 위험 상태 여부")

class RiskReport(BaseModel):
    """API가 반환하는 최종 보고서 구조."""
    initial_report_time: str
    final_state: SystemState
    kpis: RiskKPI
    transition_history: List[Dict[str, Any]] = Field(description="상태 전이 기록")

# =============================================
# 2. Core Logic Service (The State Machine)
# =============================================

def calculate_risk_score(kpi: RiskKPI) -> float:
    """전체 리스크 점수 계산 로직 (예시). 모든 KPI의 가중합을 사용한다고 가정."""
    return kpi.tre * 0.5 + kpi.pig * 1.2 + kpi.ars * 0.8

def determine_state(score: float) -> tuple[str, int, bool]:
    """리스크 점수에 따라 시스템 상태를 결정합니다."""
    if score >= 90 and score > 75: # Critical threshold (Red Zone)
        return "RED", 2, True
    elif score >= 50 and score <= 75: # Warning threshold (Yellow Zone)
        return "YELLOW", 1, False
    else: # Normal zone (Green/Normal)
        return "NORMAL", 0, False

def simulate_state_transition(initial_kpis: RiskKPI, steps: int = 3) -> RiskReport:
    """
    주어진 초기 리스크 벡터를 기반으로 시간 경과에 따른 시스템 상태 전이를 시뮬레이션합니다.
    Yellow Zone -> Red Zone 전환 로직을 포함합니다.
    """
    current_kpis = initial_kpis
    history = []
    report_time = "Simulated Time Start"

    for step in range(steps):
        # 1. 시뮬레이션: KPI 값의 자연스러운 변동 (가상의 데이터 변화)
        # 리스크는 시간이 지남에 따라 누적되는 경향을 반영합니다.
        current_kpis.tre += random.uniform(-5, 20) # TRE 상승 가능성 부여
        current_kpis.pig = max(10.0, current_kpis.pig + random.uniform(-3, 8))
        current_kpis.ars = min(100.0, current_kpis.ars + random.uniform(1, 5))

        # 2. 상태 결정 및 기록
        current_score = calculate_risk_score(current_kpis)
        state_code, risk_level, is_critical = determine_state(current_score)
        
        history.append({
            "step": step + 1,
            "time": f"{step+1} unit later",
            "score": round(current_score, 2),
            "state": state_code,
            "kpis": current_kpis.model_dump() # Dict로 변환하여 저장
        })

    # 최종 보고서 생성
    final_score = calculate_risk_score(current_kpis)
    final_state_code, final_risk_level, final_is_critical = determine_state(final_score)
    final_kpis = current_kpis # 마지막 시뮬레이션 결과를 최종 KPI로 사용

    return RiskReport(
        initial_report_time=report_time,
        final_state=SystemState(
            state_code=final_state_code, 
            risk_level=final_risk_level, 
            is_critical=final_is_critical
        ),
        kpis=final_kpis,
        transition_history=history
    )

# =============================================
# 3. FastAPI Endpoint Simulation (Actual API Layer)
# 이 코드는 FastAPI 애플리케이션의 라우터에 연결됩니다.
# =============================================

from fastapi import APIRouter, Body, HTTPException
router = APIRouter()

@router.post("/api/v1/risk_assessment", response_model=RiskReport)
async def assess_risk(initial_kpis: RiskKPI = Body(...), simulation_steps: int = 3):
    """
    최초 리스크 벡터를 받아 상태 전이 시뮬레이션을 실행하고 최종 보고서를 반환합니다.
    - initial_kpis: 시뮬레이션 시작 시점의 KPI 값들 (필수 입력)
    - simulation_steps: 시뮬레이션을 진행할 시간 단계 수 (기본 3단계)
    """
    print(f"--- API Call Received: Starting risk assessment for {simulation_steps} steps ---")
    try:
        report = simulate_state_transition(initial_kpis, simulation_steps)
        return report
    except Exception as e:
        # 에러 처리 로직 (Rate Limit, Input Validation 등)
        print(f"Error during risk assessment: {e}")
        raise HTTPException(status_code=500, detail="Failed to process risk data.")

# Note: FastAPI setup is assumed in a separate main.py file.