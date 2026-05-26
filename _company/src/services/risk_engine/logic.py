# src/services/risk_engine/logic.py

import typing as t
from pydantic import BaseModel, Field

# ==============================================================================
# 🛡️ 데이터 모델 (MECE 분류 구조화)
# ==============================================================================

class RiskInputData(BaseModel):
    """
    고객의 리스크 지표를 MECE하게 수집하는 입력 데이터 스키마.
    이 구조는 모든 종류의 외부 API 소스에서 데이터를 받아 통합할 기준점이 됩니다.
    """
    # 1. 재무적 위험 (Financial Risk - FR)
    cash_reserves_ratio: t.Optional[float] = Field(None, description="현금 비축률 (0.0 ~ 1.0)")
    debt_to_equity_ratio: t.Optional[float] = Field(None, description="부채 대 자본 비율")

    # 2. 법규/컴플라이언스 위험 (Regulatory Risk - RR)
    has_pending_litigation: bool = Field(False, description="현재 진행 중인 소송 여부")
    industry_compliance_score: t.Optional[float] = Field(None, description="산업별 규제 준수 점수 (0.0 ~ 1.0)")

    # 3. 운영/기술적 위험 (Operational Risk - OR)
    system_uptime_ratio: t.Optional[float] = Field(None, description="평균 시스템 가동률 (0.0 ~ 1.0)")
    data_security_audit_passed: bool = Field(False, description="최신 데이터 보안 감사 통과 여부")


# ==============================================================================
# 💰 결과 모델 및 계산 로직 (Core Logic)
# ==============================================================================

class ELEResult(BaseModel):
    """추정 손실 노출액 계산의 최종 출력 스키마."""
    total_risk_score: float = Field(..., description="0.0 (안전) ~ 100.0 (위험)")
    estimated_loss_exposure_usd: float = Field(..., description="추정되는 최소 손실액 (USD).")
    recommendation_level: str = Field(..., description="['Low', 'Medium', 'High', 'Critical'] 중 하나.")


def calculate_ele(input_data: RiskInputData, is_mock_mode: bool) -> ELEResult:
    """
    MECE로 구조화된 데이터를 기반으로 추정 손실 노출액과 위험 점수를 계산하는 핵심 비즈니스 로직.
    [근거: 💻 코다리 개인 메모리]
    """
    # --- 가중치 및 계수 정의 (매우 민감한 값) ---
    WEIGHT_FINANCIAL = 0.35  # 재무적 위험이 가장 큰 변수라 가정
    WEIGHT_REGULATORY = 0.45 # 규제 실패가 치명적인 리스크를 유발한다고 가정
    WEIGHT_OPERATIONAL = 0.20

    # --- 1. 개별 리스크 점수 계산 (Raw Score) ---

    # 재무적 위험 점수 (FR): 부채 비율과 현금 비축률 기반
    fr_score = 0.0
    if input_data.debt_to_equity_ratio is not None:
        fr_score += min(1.0, input_data.debt_to_equity_ratio * 2) # D/E가 높으면 점수 증가
    if input_data.cash_reserves_ratio is not None:
        # 현금 비축률이 낮을수록 위험도가 높아지므로 역비례 가중치 적용
        fr_score += (1.0 - input_data.cash_reserves_ratio) * 1.5

    # 규제 위험 점수 (RR): 소송 및 컴플라이언스 기반
    rr_score = 0.0
    if input_data.has_pending_litigation:
        rr_score += 30.0 # 소송 자체로 큰 감점 요인
    if input_data.industry_compliance_score is not None:
        rr_score += (1.0 - input_data.industry_compliance_score) * 50.0

    # 운영/기술적 위험 점수 (OR): 가동률 및 보안 기반
    or_score = 0.0
    if input_data.system_uptime_ratio is not None:
        or_score += (1.0 - input_data.system_uptime_ratio) * 25.0
    if not input_data.data_security_audit_passed:
        or_score += 20.0 # 보안 감사 실패는 즉각적인 위험 요인

    # --- 2. 최종 리스크 점수 및 손실액 계산 (Normalization & Synthesis) ---

    total_risk_score = (
        (fr_score * WEIGHT_FINANCIAL / 100) +  # Scale down to fit max 100 range
        (rr_score * WEIGHT_REGULATORY / 50) +   # Scale down
        (or_score * WEIGHT_OPERATIONAL / 25)   # Scale down
    )

    # Mock Mode에서는 점수가 더 드라마틱하게 나오도록 임의 조정 (테스트용 트릭)
    if is_mock_mode:
        total_risk_score = min(100.0, total_risk_score * 1.2 + 5.0)

    # 추정 손실액 계산 (ELE): 리스크 점수에 비례하여 기하급수적으로 증가하도록 설계
    estimated_loss_exposure_usd = round(
        100000 + (total_risk_score ** 1.5 * 2500), # 최소 10만 달러부터 시작
        2
    )

    # --- 3. 레벨 결정 (Decision Making) ---
    if total_risk_score >= 85:
        recommendation_level = "Critical"
    elif total_risk_score >= 65:
        recommendation_level = "High"
    elif total_risk_score >= 35:
        recommendation_level = "Medium"
    else:
        recommendation_level = "Low"

    return ELEResult(
        total_risk_score=round(total_risk_score, 2),
        estimated_loss_exposure_usd=estimated_loss_exposure_usd,
        recommendation_level=recommendation_level
    )

# 참고: 실제 운영 환경에서는 이 함수가 외부 데이터베이스나 다른 마이크로서비스를 호출할 것입니다.
print("✅ Risk Engine Core Logic Loaded Successfully.")