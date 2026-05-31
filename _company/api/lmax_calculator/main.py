from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import math

app = FastAPI(title="Lmax Calculator API", description="Maximum Financial Loss (Lmax) calculation service for OIP.")

# --- 1. 데이터 스키마 정의 (Researcher의 JSON 기반으로 Pydantic 모델링) ---

class ComplianceRiskInput(BaseModel):
    """규제 준수 위반 리스크를 계산하기 위한 입력 필드."""
    leaked_record_count: int = Field(..., description="유출된 개인 식별 정보(PII)의 총 기록 수.")
    affected_entity_count: int = Field(..., description="영향을 받은 법인/엔티티의 개수.")

class OperationalRiskInput(BaseModel):
    """운영 중단 리스크를 계산하기 위한 입력 필드."""
    downtime_days: float = Field(..., gt=0, description="예상 운영 중단 일수 (일 단위).")
    recovery_cost_factor: float = Field(..., gt=0, description="복구 노력에 대한 가중치 계수.")

class LmaxCalculationRequest(BaseModel):
    """API가 받을 전체 리스크 데이터 모델."""
    compliance_risk: ComplianceRiskInput
    operational_risk: OperationalRiskInput


# --- 2. 비즈니스 로직 서비스 레이어 (무결성 검증이 필요한 핵심 영역) ---

def calculate_compliance_contribution(data: ComplianceRiskInput) -> float:
    """규제 준수 위반 리스크 기여도를 계산합니다. Lmax = BaseFineRate * Weight * Count"""
    # Defensive Coding: 최소값을 1로 설정하여 log(0) 오류 방지
    safe_leaked_records = max(1, data.leaked_record_count)
    
    # 가중치 공식 적용: 0.5 * log(N)
    weighting_factor = 0.5 * math.log(safe_leaked_records)
    
    # 임의 설정된 Base Fine Rate (실제 값은 Config/DB에서 로드되어야 함)
    BASE_FINE_RATE = 10000  # 예시: 최소 위반 벌금 $10,000
    
    contribution = BASE_FINE_RATE * weighting_factor * data.affected_entity_count
    return round(contribution, 2)

def calculate_operational_contribution(data: OperationalRiskInput) -> float:
    """운영 중단 기회비용을 계산합니다."""
    # Formula: Downtime Days * Recovery Cost Factor * (1 + Time Decay Factor)
    TIME_DECAY_FACTOR = 0.2 # 시간이 지날수록 복구 비용이 증가하는 가정
    contribution = data.downtime_days * data.recovery_cost_factor * (1 + TIME_DECAY_FACTOR)
    return round(contribution, 2)


def calculate_lmax(request: LmaxCalculationRequest) -> dict:
    """전체 리스크를 합산하여 최종 $L_{max}$를 계산하는 메인 함수."""
    try:
        # 1. 컴플라이언스 기여도 계산
        compliance_contribution = calculate_compliance_contribution(request.compliance_risk)

        # 2. 운영 기회비용 계산
        operational_contribution = calculate_operational_contribution(request.operational_risk)

        # 3. 최종 Lmax 산출 (Total Loss Amount)
        total_lmax = compliance_contribution + operational_contribution
        
        return {
            "Lmax": round(total_lmax, 2),
            "breakdown": {
                "compliance_risk_contribution": compliance_contribution,
                "operational_downtime_cost": operational_contribution
            },
            "currency": "USD",
            "message": f"경고: 현재 상태 유지 시 최소 예상 재정적 손실액(Lmax)은 {total_lmax:,.2f}달러입니다."
        }

    except Exception as e:
        # 치명적인 에러 처리 (Defensive Catch)
        print(f"Error during Lmax calculation: {e}")
        raise HTTPException(status_code=500, detail="Lmax 계산 중 내부 시스템 오류가 발생했습니다. 입력 데이터와 서버 로직을 확인하세요.")


# --- 3. API 엔드포인트 정의 (최종 노출 인터페이스) ---

@app.post("/api/v1/calculate-lmax")
async def calculate_lmax_endpoint(request: LmaxCalculationRequest):
    """Lmax 계산 요청을 받아 최종 재무적 리스크 점수를 반환합니다."""
    return calculate_lmax(request)


# 테스트용 실행 명령 (API를 구동할 때 사용)
# <run_command>uvicorn api.lmax_calculator.main:app --reload</run_command>