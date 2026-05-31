from fastapi import FastAPI, HTTPException
from typing import List, Dict
import math

# 같은 세션에서 생성한 스키마를 임포트
from .schemas import RiskInputPayload, RegulatoryRisk, RiskScoreResult 

app = FastAPI(title="yobizwiz Compliance Engine")

def calculate_lmax(risks: List[RegulatoryRisk]) -> tuple[float, Dict[str, float]]:
    """
    핵심 로직: 리스크 입력 데이터를 받아 $L_{max}$를 계산하는 함수.
    $L_{max} = \sum [(\text{Base Fine Estimate}) / (\text{Control Maturity Score} - 1) * (M_t)]$
    (주의: Control Maturity Score가 1일 경우 분모가 0이 되어 무한대가 되므로, 별도 처리 필요.)
    """
    risk_breakdown = {}
    total_lmax = 0.0

    for risk in risks:
        domain = risk.domain_name
        base_fine = risk.base_fine_estimate
        maturity = risk.control_maturity_score
        multiplier = risk.multiplier_trend if risk.multiplier_trend is not None else 1.0

        # 🛡️ Defensive Coding Check: 내부 통제 점수가 너무 낮을 경우 (Maturity=1) 특수 처리
        if maturity <= 1:
            # 만약 통제가 '미흡'하다면, 기본 벌금에 가장 높은 가중치를 부여하여 경고.
            score = base_fine * multiplier * 5.0 # 임시 최대 계수 적용
        else:
            # 핵심 로직: (기본벌금 / (점수 - 1)) -> 통제 점수가 높을수록 패널티 감소 효과.
            # 여기에 구조적 리스크 증폭 계수를 곱함.
            penalty_factor = base_fine / (maturity - 1)
            score = penalty_factor * multiplier

        risk_breakdown[domain] = round(score, 2)
        total_lmax += score
    
    return total_lmax, risk_breakdown


@app.post("/api/v1/risk-assessment", response_model=RiskScoreResult)
async def assess_risk_level(payload: RiskInputPayload):
    """
    사용자로부터 리스크 데이터를 받아 최대 재무 손실액 ($L_{max}$)을 계산하는 엔드포인트.
    """
    if not payload.risks:
        raise HTTPException(status_code=400, detail="평가할 규제 리스크 데이터가 필요합니다.")

    # 1. 핵심 로직 실행
    total_lmax, breakdown = calculate_lmax(payload.risks)

    # 2. 요약문 생성 (System Message Generation)
    summary = f"종합 진단 결과: 귀사의 총 최대 재무 손실액($L_{max}$)은 {round(total_lmax, 2)} 만 달러로 산출되었습니다.\n"
    summary += "이는 현재의 데이터 공백과 통제 미흡이 구조적으로 증폭될 때 발생하는 예측적 위험입니다. 즉각적인 내부 통제 시스템 업그레이드가 필수적입니다."

    # 3. 결과 반환
    return RiskScoreResult(
        total_maximum_financial_loss_lmax=round(total_lmax, 2),
        risk_breakdown=breakdown,
        assessment_summary=summary
    )