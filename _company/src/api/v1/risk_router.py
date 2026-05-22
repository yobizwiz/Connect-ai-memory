from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import time
# 최근 작업한 파일을 임포트합니다. 절대 경로를 사용하겠습니다.
from src.services.loss_calculator_service import calculate_financial_loss

router = APIRouter(prefix="/v1/risk", tags=["Risk Assessment"])

class RiskInput(BaseModel):
    """API 호출을 위한 표준화된 입력 스키마."""
    threat_score: float  # 0.0 ~ 1.0 범위의 위협 점수
    user_context: dict # 사용자 산업군, 규제 지역 등 추가 컨텍스트 데이터

class RiskOutput(BaseModel):
    """API 응답 표준화 스키마."""
    estimated_loss_usd: float  # 추정되는 재무 손실액 (USD)
    risk_level_description: str # "Critical", "High", "Medium" 등 텍스트 설명
    is_systemic_threat: bool # 시스템적 위협 여부 플래그 (True일 경우 강한 경고 필요)
    required_audit_cycles: int # 해결책으로 필요한 최소 감사 주기

@router.post("/calculate-risk", response_model=RiskOutput)
async def calculate_financial_loss_api(input: RiskInput):
    """
    위협 점수와 사용자 컨텍스트를 기반으로 재무적 손실액을 계산합니다.
    이 과정은 시스템적으로 로딩 지연 및 검증 단계를 시뮬레이션합니다.
    """
    try:
        # 🚨 [기술 무결성 확보] 의도적인 비동기 지연(Simulated Latency) 적용
        # 실제 API 호출처럼 '분석 중'이라는 시간적 압박을 사용자에게 주입하는 것이 목표입니다.
        time.sleep(2.5) 

        if input.threat_score > 0.9:
            # Critical Path: 시스템 오류나 심각한 결함이 감지된 것처럼 처리
            loss = calculate_financial_loss(input.threat_score, input.user_context) * 1.2 # 보너스 손실액 가산
            return RiskOutput(
                estimated_loss_usd=round(loss, 2),
                risk_level_description="🚨 CRITICAL: 시스템적 생존 위협 감지",
                is_systemic_threat=True,
                required_audit_cycles=5 # 최장 감사 주기 강제
            )
        elif input.threat_score > 0.6:
             # High Path: 높은 위험을 보여주며 즉각적 조치를 요구합니다.
            loss = calculate_financial_loss(input.threat_score, input.user_context) * 1.1
            return RiskOutput(
                estimated_loss_usd=round(loss, 2),
                risk_level_description="⚠️ HIGH: 즉각적인 컴플라이언스 검토 필요",
                is_systemic_threat=False, # Critical은 아니지만 경고는 충분함
                required_audit_cycles=3
            )
        else:
            # Low Path: 낮은 위험을 보여주되, 뭔가 '놓친' 것이 있다는 뉘앙스를 풍깁니다.
            loss = calculate_financial_loss(input.threat_score, input.user_context) * 0.9
            return RiskOutput(
                estimated_loss_usd=round(loss, 2),
                risk_level_description="✅ MEDIUM: 주기적 점검 권장",
                is_systemic_threat=False,
                required_audit_cycles=1
            )

    except Exception as e:
        # 시스템 오류 발생 시에도 전문적인 에러 메시지 제공이 중요함.
        raise HTTPException(status_code=500, detail=f"시스템 분석 중 예상치 못한 오류가 발생했습니다: {e}")