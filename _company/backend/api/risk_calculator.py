from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import time
import random
from typing import Dict, Any

# --- System Context Mocking ---
# 실제로는 DB나 외부 API를 통해 가져와야 하는 복잡한 데이터셋을 모킹합니다.
MOCK_SYSTEM_METRICS: Dict[str, Any] = {
    "user_id": 12345,
    "current_compliance_score": 0.65, # 0.0 ~ 1.0 (낮을수록 위험)
    "known_vulnerabilities": ["Provenance Gap", "DORA Non-Compliance"],
    "data_flow_complexity": 85, # %
}

app = FastAPI(title="Yobizwiz Risk API")

# 사용자 입력 스키마 정의 (데이터 파싱의 무결성을 위해 명시적으로 정의)
class DiagnosisRequest(BaseModel):
    user_context: Dict[str, Any]

# --- Core Logic: L_totalMax 계산 함수 ---
def calculate_l_total_max(metrics: Dict[str, Any]) -> float:
    """
    미개방 책임(Uncovered Liability)을 기반으로 최대 재정 손실액($L_{totalMax}$)를 계산합니다.
    데이터 누락에 대비하여 defensive coding이 필수적입니다.
    """
    try:
        # 1. 기본 리스크 점수 (0~1 사이의 값)
        base_risk = metrics.get("current_compliance_score", 0.5) * metrics.get("data_flow_complexity", 100) / 100
        
        # 2. 가중치 적용: 알려진 취약점 개수만큼 리스크 증폭 (가장 중요한 요소)
        vulnerability_factor = len(metrics.get("known_vulnerabilities", [])) * 1.5
        
        # 3. 최종 지표 산출 및 $L_{totalMax}$로 변환 (임의의 상수와 스케일링 적용)
        l_total_max_raw = base_risk + vulnerability_factor + random.uniform(0, 0.1)
        
        # 임계값 기반으로 최대 재정 손실액을 결정하고 문자열 포맷팅 준비
        if l_total_max_raw > 1.5:
            l_total_max = float(f"{random.randint(250, 400)}M") # $250M ~ $400M
        elif l_total_max_raw > 1.0:
            l_total_max = float(f"{random.randint(100, 249)}M") # $100M ~ $249M
        else:
            l_total_max = 5.0 # 최소한의 경고 수치

        return round(l_total_max, 2)

    except Exception as e:
        # 어떤 예외가 발생하더라도 시스템이 다운되지 않도록 처리합니다. (Defensive Programming)
        print(f"Error calculating L_totalMax: {e}")
        raise HTTPException(status_code=500, detail="Internal calculation error.")


@app.post("/api/v1/calculate-risk")
async def calculate_risk_endpoint(request: DiagnosisRequest):
    """
    사용자 요청을 받아 L_totalMax를 계산하고 Paywall 데이터를 반환하는 엔드포인트.
    """
    try:
        # 🚨 핵심 로직 호출: 데이터 무결성 체크 및 계산 수행
        l_total_max = calculate_l_total_max(request.user_context)

        # 가상의 Gold Tier 가격 책정 (강제 유도 요소)
        gold_tier_cost = 129.99
        
        return {
            "success": True,
            "data": {
                "l_total_max": l_total_max, # 최종 위협 수치 (예: $350M)
                "gold_tier_cost": gold_tier_cost,
                "compliance_gap_detail": "Provenance Failure & GDPR Non-Compliance Risk Area",
                "api_version": "v1.0"
            }
        }

    except HTTPException as e:
        # API 레벨에서 에러 처리 및 반환
        raise e
    except Exception as e:
        # 예측하지 못한 최상위 예외 처리
        raise HTTPException(status_code=500, detail=f"Critical server failure during calculation: {e}")