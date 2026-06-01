from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
import json
from typing import List, Dict

# 핵심 로직 서비스 임포트 (절대 경로 사용)
from ..services.risk_calculator_service import calculate_tre 

# API 버전 및 초기화
app = FastAPI(title="yobizwiz Risk Calculation Engine", version="v1")

# 입력 데이터 스키마 정의 (Pydantic을 이용한 엄격한 타입 검증)
class ClientPayload(BaseModel):
    """클라이언트가 제출하는 규제 리스크 데이터를 구조화합니다."""
    data_source: str = Field(..., description="데이터의 출처 (예: GDPR, CCPA, Internal Audit)")
    pii_count: int = Field(..., ge=0, description="처리된 PII 데이터 개수")
    compliance_gap_score: float = Field(..., ge=0.0, le=10.0, description="규정 준수 공백 점수 (0~10)")
    storage_duration_years: int = Field(..., ge=0, description="데이터 저장 예상 기간 (년)")
    systemic_invalidating_coefficient_alpha: float = Field(..., gt=0.0, description="시스템 무효화 계수 α")

class RiskScoreResponse(BaseModel):
    """API 응답 구조 정의."""
    status: str = "SUCCESS"
    final_risk_exposure_score: float = Field(..., description="최종 위험 노출 점수 (TRE).")
    l_total_max_estimate: float = Field(..., description="$L_{totalMax}$ 추정치.")
    calculated_timestamp: str = Field(..., description="계산 시점 (UTC).")

@app.post("/api/v1/risk-score", response_model=RiskScoreResponse, summary="최종 위험 노출 점수(TRE) 계산 및 $L_{totalMax}$ 추정 API.")
async def calculate_risk_score(payload: ClientPayload):
    """
    클라이언트가 제공한 규제 데이터셋을 기반으로 최종 위험 점수를 계산하고 
    재무적 손실액($L_{totalMax}$)까지 예측하여 반환합니다.
    지수적 성장 로직과 시스템 무효화 계수(α)를 반영합니다.
    """
    try:
        # 1. 입력 데이터 유효성 검사 (Pydantic에서 이미 수행됨)
        client_data = payload.model_dump()

        # 2. 핵심 비즈니스 로직 호출 및 예외 처리 (Defensive Coding 적용)
        # calculate_tre 함수가 내부적으로 모든 계산을 처리하고, 필요한 값이 없을 경우 에러를 발생시킬 수 있음.
        try:
            final_score, l_total_max = calculate_tre(
                pii_count=client_data['pii_count'],
                compliance_gap_score=client_data['compliance_gap_score'],
                storage_duration_years=client_data['storage_duration_years'],
                alpha=client_data['systemic_invalidating_coefficient_alpha']
            )
        except TypeError as e:
             # 필수 파라미터 누락 등 내부 로직 오류 포착
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Core Logic Error: 필수 데이터 타입 또는 값이 부족합니다. ({e})")
        except Exception as e:
             # 기타 예측 불가능한 시스템 오류 포착
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Internal Calculation Failure: 계산 엔진에서 예상치 못한 에러가 발생했습니다. ({type(e).__name__})")

        # 3. 성공적인 응답 반환
        return RiskScoreResponse(
            final_risk_exposure_score=final_score,
            l_total_max_estimate=l_total_max,
            calculated_timestamp="2026-06-01T12:37:59Z" # 실제 시간으로 대체 필요
        )

    except HTTPException as e:
        # FastAPI가 정의한 HTTP 예외 처리 반환
        raise e
    except Exception as e:
        # 최종적으로 catch되지 않은 모든 오류는 500 에러로 처리 (Fail Safe)
        print(f"CRITICAL FAILURE IN API ROUTER: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Critical System Failure: 리스크 점수 계산에 실패했습니다.")

# 참고: FastAPI 실행을 위한 메인 블록 (테스트용)
if __name__ == "__main__":
    import uvicorn
    # 실제 운영 환경에서는 이 방식으로 실행하지 않고, 별도 서버에서 호출해야 합니다.
    print("--- API Router Initialized ---")
    uvicorn.run(app, host="0.0.0.0", port=8000)