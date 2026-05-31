import json
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field, ValidationError
from fastapi import FastAPI, HTTPException, status
import os

# 절대 경로 상수 정의 (Researcher가 제공한 파일)
REGULATORY_WEIGHTS_PATH = r"c:\Users\jinoh\Desktop\Connect AI\_company\KnowledgeBase\RegulatoryWeights_Lmax_Schema_v2.0.json"


class LmaxInput(BaseModel):
    """API 입력 스키마: 리스크 계산에 필요한 변수들을 정의합니다."""
    pii_record_count: int = Field(..., ge=0, description="개인 식별 정보 기록 건수 (PII Count).")
    base_violation_rate: float = Field(..., ge=0.0, le=1.0, description="기본 규정 위반 비율 (Base Fine Rate).")
    exposure_hours: float = Field(..., ge=0.0, description="위반 노출 시간 (Exposure Time) [시간].")


class LmaxOutput(BaseModel):
    """API 출력 스키마: 구조화된 리스크 점수와 분석 내용을 반환합니다."""
    total_risk_score_lmax: float = Field(..., gt=0, description="$L_{max}$ 최종 계산된 재무적 최대 손실액.")
    calculation_details: Dict[str, Any] = Field(..., description="각 요소별 기여도 분석 결과.")
    is_compliant: bool = Field(True, description="현재 시스템 기준 컴플라이언스 준수 여부.")


# 전역 변수로 가중치 데이터를 로드하고 에러 처리합니다. (Singleton 패턴 지향)
_LMAX_WEIGHTS: Optional[Dict[str, Any]] = None

def load_regulatory_weights() -> Dict[str, Any]:
    """
    규제 가중치 파일을 로드하고 파싱하는 함수입니다. 
    파일 시스템 오류나 JSON 포맷 오류 발생 시 예외 처리(Graceful Failure)를 수행합니다.
    """
    global _LMAX_WEIGHTS
    if _LMAX_WEIGHTS is not None:
        return _LMAX_WEIGHTS

    try:
        print("⚙️ Lmax Weights 데이터 로딩 중...")
        with open(REGULATORY_WEIGHTS_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        _LMAX_WEIGHTS = data
        return _LMAX_WEIGHTS
    except FileNotFoundError:
        # 치명적인 오류: 필수 데이터 파일이 없음 (Graceful Failure 1)
        raise RuntimeError("Fatal Error: 규제 가중치 파일 경로를 찾을 수 없습니다. 시스템 설정을 확인해야 합니다.")
    except json.JSONDecodeError as e:
        # 포맷 오류: JSON 파싱 불가 (Graceful Failure 2)
        raise ValueError(f"Fatal Error: 규제 가중치 JSON 포맷에 문제가 있습니다. {e}")


def calculate_lmax(input_data: LmaxInput) -> LmaxOutput:
    """
    핵심 비즈니스 로직: PII, 위반율, 노출시간을 기반으로 $L_{max}$를 계산합니다.
    KeyError 및 데이터 유효성 오류에 대한 방어적 코딩이 적용되어 있습니다.
    """
    weights = load_regulatory_weights()
    if not weights or 'regulations' not in weights:
        # 로드 실패가 이미 위에서 처리되었지만, 안전을 위해 다시 체크
        raise RuntimeError("Calculation Failed: 필수 규제 가중치 데이터셋을 불러올 수 없습니다.")

    lmax_components = {}
    
    try:
        # A. PII Leakage Cost 계산 (GDPR 섹션 참조)
        gdpr_data = weights['regulations'][0] 
        pii_leak_coeff = gdpr_data.get('penalty_breakdown', [{}])[0].get('coefficient_Wfine')
        if pii_leak_coeff is None:
             raise KeyError("PII Leakage Coefficient (coefficient_Wfine) missing.")

        pii_leak_cost = int(pii_leak_coeff) * input_data.pii_record_count
        lmax_components['PII_Leakage_Cost'] = pii_leak_cost

        # B. Base Fine Rate 계산 (전체 매출액 기반 벌금, 임의 기준 $1000 가정)
        base_fine_penalty = input_data.base_violation_rate * 1000 
        lmax_components['Base_Violation_Penalty'] = base_fine_penalty

        # C. Operational Downtime Cost (노출 시간에 비례, 임의 상수 $5000/hour 가정)
        operational_cost = input_data.exposure_hours * 5000
        lmax_components['Operational_Downtime_Cost'] = operational_cost

    except KeyError as e:
        # 데이터셋 구조가 변경되거나 필요한 키가 누락되었을 때 (방어적 실패 처리)
        raise RuntimeError(f"Calculation Error: 가중치 데이터셋의 필수 요소({e})를 찾지 못했습니다. 아키텍처 재검토가 필요합니다.")
    except Exception as e:
         # 기타 예상치 못한 계산 오류 포착
        raise RuntimeError(f"Critical Calculation Failure: {type(e).__name__}: {str(e)}")

    # --- 2. 최종 Lmax 합산 및 스코어 산출 ---
    total_lmax = (
        lmax_components['PII_Leakage_Cost'] +
        lmax_components['Base_Violation_Penalty'] +
        lmax_components['Operational_Downtime_Cost']
    )

    # 준수 여부 판단 로직: 임계값(Threshold) $1,000,000 설정 (Red Zone 진입 기준)
    is_compliant = total_lmax < 1000000

    return LmaxOutput(
        total_risk_score_lmax=round(total_lmax, 2),
        calculation_details={
            "PII Leakage Cost": lmax_components['PII_Leakage_Cost'],
            "Base Violation Penalty": lmax_components['Base_Violation_Penalty'],
            "Operational Downtime Cost": lmax_components['Operational_Downtime_Cost']
        },
        is_compliant=is_compliant
    )


# FastAPI 엔드포인트 설정 (실제 API 진입점)
app = FastAPI(
    title="Lmax Calculator API",
    description="규제 위반 시나리오 기반의 재무적 최대 손실액($L_{max}$)을 계산합니다. 모든 입력값은 방어적으로 검증됩니다."
)

@app.post("/api/calculate_lmax", response_model=LmaxOutput)
async def calculate_endpoint(input: LmaxInput):
    """
    사용자로부터 리스크 변수를 받아 $L_{max}$를 계산하고 구조화된 JSON을 반환합니다.
    """
    try:
        result = calculate_lmax(input)
        return result
    except RuntimeError as e:
        # 1. 로직 또는 데이터셋 자체의 문제 발생 시 (503 Service Unavailable - 서비스 장애 수준)
        print(f"🔥 Critical Runtime Error in Lmax API: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail={
            "error": "Service Unavailable", 
            "message": str(e), 
            "action": "관리자에게 연락하여 가중치 데이터셋의 무결성을 점검해야 합니다."
        })
    except Exception as e:
        # 2. 예측하지 못한 모든 예외 포착 (500 Internal Server Error - 치명적 장애)
        print(f"🔥 Unexpected Error in Lmax API: {type(e).__name__}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail={
            "error": "Internal Server Failure", 
            "message": "시스템 처리 중 예상치 못한 오류가 발생했습니다.",
            "trace": str(e)
        })

# 테스트 실행용 명령어 추가 (API 진입점이 명확하도록)
if __name__ == "__main__":
    import uvicorn
    print("--- Lmax API 서버를 시작합니다. ---")
    uvicorn.run(app, host="0.0.0.0", port=8001)