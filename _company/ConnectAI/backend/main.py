from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import random
import time

# --- 1. 데이터 스키마 정의 (Input Schema) ---
class RegulatoryData(BaseModel):
    """사용자로부터 입력받는 규제 관련 데이터 필드."""
    regulatory_gap_score: float = Field(..., description="현재 발견된 규제적 공백의 점수 (0-100)")
    exposure_type: str = Field(..., description="주요 노출 유형 (예: PII, Financial, Operational)")
    historical_violation_count: int = Field(..., ge=0, description="과거 위반 횟수")

# --- 2. 응답 스키마 정의 (Output Schema) ---
class RiskDiagnosisResult(BaseModel):
    """진단 결과 및 UI 상태 제어 정보를 담는 최종 구조."""
    risk_score: float = Field(..., description="최종 산출된 위험 지수 (TRE)")
    l_min_saved: float = Field(..., description="이 모달을 통해 확보 가능한 최소 재무적 가치")
    diagnosis_status: str = Field(..., description="진단 상태 (NORMAL, CRITICAL, SAFE)")
    next_ui_state: str = Field(..., description="프론트엔드에 강제 전환할 다음 UI 상태")
    message: str = Field(..., description="사용자에게 보여줄 피드백 메시지")

# --- 3. FastAPI 앱 인스턴스 생성 ---
app = FastAPI(title="Risk Diagnosis API", version="v1")

@app.post("/api/v1/risk-diagnosis", response_model=RiskDiagnosisResult)
async def diagnose_risk(data: RegulatoryData):
    """
    사용자 입력 데이터를 기반으로 리스크 점수와 강제 전환 상태를 진단합니다.
    이 함수는 TARS 계산 로직을 시뮬레이션합니다.
    """
    try:
        # 💡 Core Logic Mockup: TARS Calculation Simulation (가중치 적용)
        base_score = data.regulatory_gap_score * 0.5 # Gap Score에 가중치 부여
        violation_impact = data.historical_violation_count * 15.0 # 위반 횟수 영향력
        exposure_modifier = 1.0
        if data.exposure_type == "Financial":
            exposure_modifier = 1.5 # 금융 노출이 가장 위험함 가정

        risk_score = (base_score + violation_impact) * exposure_modifier
        
        # 임계치 정의: TARS Critical Threshold (예시 값)
        CRITICAL_THRESHOLD = 60.0 

        if risk_score >= CRITICAL_THRESHOLD:
            diagnosis_status = "CRITICAL"
            l_min_saved = round(max(150.0, risk_score * 3), -1) # 최소 확보 가치 산정 (적어도 $150 이상)
            next_ui_state = "PAYWALL_BARRIER"
            message = f"🚨 경고: 리스크 점수({risk_score:.2f})가 임계치를 초과했습니다. 즉각적인 전문 진단이 필요합니다."
        elif risk_score > 30.0:
            diagnosis_status = "WARNING"
            l_min_saved = round(max(10.0, (risk_score - CRITICAL_THRESHOLD) * 0.5), -1) # 경고 수준의 가치 제시
            next_ui_state = "GLITCH_NOTICE"
            message = f"⚠️ 주의: 리스크 점수({risk_score:.2f})가 높아지고 있습니다. 더 깊은 분석이 필요합니다."
        else:
            diagnosis_status = "SAFE"
            l_min_saved = 0.0
            next_ui_state = "NORMAL"
            message = f"✅ 진단 완료: 현재 리스크 점수({risk_score:.2f})는 허용 범위 내입니다."

        return RiskDiagnosisResult(
            risk_score=round(risk_score, 2),
            l_min_saved=l_min_saved,
            diagnosis_status=diagnosis_status,
            next_ui_state=next_ui_state,
            message=message
        )

    except Exception as e:
        # 필수 에러 가드 처리 (Robustness 확보)
        print(f"API Error caught: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during diagnosis.")