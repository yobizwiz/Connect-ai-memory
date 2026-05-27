from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import random
import time

# FastAPI 애플리케이션 초기화
app = FastAPI(title="Yobizwiz Compliance Engine")

# 사용자 입력 데이터 스키마 정의 (시뮬레이션용)
class InputData(BaseModel):
    """사용자가 분석을 요청하는 핵심 비즈니스 데이터."""
    industry: str
    annual_revenue_usd: float
    regulatory_compliance_score: float # 0.0 ~ 1.0
    data_source_integrity_check: bool

# API 엔드포인트 정의
@app.post("/api/v1/simulate_risk")
async def calculate_structural_risk(data: InputData):
    """
    사용자 입력 데이터를 받아 구조적 리스크를 시뮬레이션하고, 
    재무적 손실액과 위험 등급을 계산하여 반환합니다. (핵심 기능)
    """
    # --- [시뮬레이션 로직 시작] ---
    
    # 1. 데이터 유효성 및 구조적 결함 체크 (Structural Flaw Detection)
    structural_integrity_score = data.regulatory_compliance_score * data.data_source_integrity_check
    
    if structural_integrity_score < 0.4 or not data.data_source_integrity_check:
        # 심각한 결함 발견 시, 리스크를 급격히 증가시킵니다.
        risk_multiplier = random.uniform(1.8, 2.5)
        loss_amount_usd = max(300000, data.annual_revenue_usd * (1 - structural_integrity_score) * risk_multiplier)
        risk_level = "CRITICAL" # Red Zone Trigger
        failure_type = "Structural Flaw Detected: Data Source Integrity Failure."
    elif data.regulatory_compliance_score < 0.7:
        # 경미한 결함 발견 시, 중간 수준의 리스크를 유발합니다.
        risk_multiplier = random.uniform(1.2, 1.8)
        loss_amount_usd = max(50000, data.annual_revenue_usd * (0.7 - data.regulatory_compliance_score) * risk_multiplier)
        risk_level = "HIGH" # Orange Zone Trigger
        failure_type = f"Compliance Gap Identified: {data.industry} sector requires immediate review."
    else:
        # 안전한 경우, 낮은 리스크를 보고합니다.
        loss_amount_usd = random.uniform(10000, 50000)
        risk_level = "LOW" # Green Zone Trigger
        failure_type = "Preliminary analysis suggests compliance adherence."

    # 최종 결과를 구조화하여 반환 (프론트엔드가 소비할 JSON 형식)
    return {
        "status": "SUCCESS",
        "risk_score": round(min(1.0, structural_integrity_score * 0.9 + random.uniform(0.05)), 2), # Score는 항상 0~1 사이를 유지하도록 조정
        "loss_amount_usd": round(loss_amount_usd, 2),
        "risk_level": risk_level,
        "failure_type": failure_type,
        "analysis_time_ms": int(time.time() * 1000) # 분석 시간 시뮬레이션
    }

# 테스트용 root 경로 추가 (실제 사용 시 제거 가능)
@app.get("/")
async def read_root():
    return {"message": "Yobizwiz Compliance Engine API Operational"}