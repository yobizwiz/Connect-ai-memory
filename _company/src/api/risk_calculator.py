from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any
import math

# =============================================================================
# 1. SCHEMA DEFINITION (Pydantic - 엄격한 데이터 계약)
# =============================================================================

class ViolationInput(BaseModel):
    """클라이언트의 위반 행동을 모델링하는 표준 입력 스키마."""
    consent_missing: bool = Field(..., description="개인정보 처리 동의 누락 여부.")
    pii_data_leakage_count: int = Field(default=0, description="유출된 개인 식별 정보(PII) 기록 총 수량.")
    is_health_record: bool = Field(default=False, description="민감 의료 정보(PHI) 포함 여부.")

    @validator('pii_data_leakage_count')
    def check_positive_count(cls, v):
        if v < 0:
            raise ValueError("PII 유출 건수는 음수가 될 수 없습니다.")
        return v

class RiskReport(BaseModel):
    """최종 리스크 계산 결과를 담는 구조화된 보고서."""
    total_estimated_loss: float = Field(..., description="총 예상 손실액 (TRE). 모든 규제를 합산한 값.")
    risk_level: str = Field(..., description="위험 레벨 (Low, Medium, High, Critical).")
    violation_details: Dict[str, Any] = Field(..., description="규제별 상세 페널티 및 근거 데이터.")

# =============================================================================
# 2. CORE CALCULATION LOGIC (SRP 원칙 준수)
# =============================================================================

def calculate_total_risk(data: ViolationInput) -> tuple[float, Dict[str, Any]]:
    """
    클라이언트 위반 데이터를 받아 여러 규제에 걸친 총 예상 손실액을 계산합니다.
    이 함수는 순수 로직(Pure Logic)으로 분리되어 테스트 용이성을 극대화했습니다.
    """
    # 1. 기본 가중치 정의 (Researcher가 제공한 구조 기반)
    weights = {
        "GDPR": {"penalty_per_violation": 750, "multiplier": 1.8}, # EU 기준 높은 벌금
        "CCPA": {"penalty_per_violation": 300, "multiplier": 1.2},  # US 소비자 보호 중심
        "HIPAA": {"penalty_per_violation": 500, "multiplier": 2.5} # 의료 정보 특성상 가장 높은 가중치
    }

    total_loss = 0.0
    details = {}

    # 2. 개별 규제 로직 적용 및 계산
    for reg, params in weights.items():
        component_loss = 0.0
        violation_reason = []

        # A. 기본 벌금 (PII 유출 건수 기반)
        if data.pii_data_leakage_count > 0:
            base_penalty = data.pii_data_leakage_count * params["penalty_per_violation"]
            component_loss += base_penalty
            violation_reason.append(f"{reg} PII 유출 ({data.pii_data_leakage_count}건): ${base_penalty:,.0f}")

        # B. 동의 누락 페널티 (가장 심각한 위협)
        if data.consent_missing:
            consent_penalty = params["penalty_per_violation"] * 2.5 # 가중치 상향 조정
            component_loss += consent_penalty
            violation_reason.append(f"{reg} 동의 누락 감지: ${consent_penalty:,.0f}")

        # C. 민감 정보 추가 페널티 (HIPAA, GDPR에 특히 중요)
        if data.is_health_record and reg in ["GDPR", "HIPAA"]:
            sensitivity_penalty = params["penalty_per_violation"] * 3.5 # 최고 가중치 부여
            component_loss += sensitivity_penalty
            violation_reason.append(f"{reg} 민감 의료 정보 포함: ${sensitivity_penalty:,.0f}")

        # 최종 계산 (시스템적 곱셈자 적용)
        regulatory_score = component_loss * params["multiplier"]
        total_loss += regulatory_score
        
        details[reg] = {
            "component_loss": round(component_loss, 2),
            "systemic_multiplier": params["multiplier"],
            "calculated_score": round(regulatory_score, 2),
            "violation_reasons": violation_reason
        }

    # 3. 리스크 레벨 결정 (Critical: >$1M, High: $500K~$1M, Medium: $100K~$500K, Low: <$100K)
    if total_loss >= 1_000_000:
        risk_level = "Critical"
    elif total_loss >= 500_000:
        risk_level = "High"
    elif total_loss >= 100_000:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return round(total_loss, 2), details, risk_level

# =============================================================================
# 3. FASTAPI ENDPOINT SETUP (통합 시스템 인터페이스)
# =============================================================================

app = FastAPI(title="Yobizwiz Risk Assessment API")

@app.post("/api/calculate_risk", response_model=RiskReport, status_code=status.HTTP_200_OK)
async def calculate_risk(violation: ViolationInput):
    """
    클라이언트 행동 데이터에 기반하여 실시간 총 예상 손실액(TRE)을 계산합니다.
    이 엔드포인트는 yobizwiz의 핵심 무기입니다.
    """
    try:
        total_loss, details, risk_level = calculate_total_risk(violation)

        return RiskReport(
            total_estimated_loss=total_loss,
            risk_level=risk_level,
            violation_details=details
        )
    except Exception as e:
        # 구조적 에러 포착 및 명확한 메시지 반환 (운영 안정성 확보)
        print(f"🚨 Critical Error during risk calculation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="시스템 오류 발생. 리스크 계산을 수행할 수 없습니다. 로그를 확인하세요."
        )

@app.get("/health")
async def health_check():
    """API의 정상 작동 여부를 확인하는 헬스 체크 엔드포인트."""
    return {"status": "Operational", "service": "RiskEngine v3.1"}
# =============================================================================
# 끝
# =============================================================================