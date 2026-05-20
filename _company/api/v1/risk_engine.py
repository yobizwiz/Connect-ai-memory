from typing import Dict, Any
from .schemas import RiskInputVariables

class ComplianceRiskEngine:
    """
    ComplianceGatekeeper Pro의 핵심 도메인 로직을 담당하는 클래스입니다.
    외부 데이터 기반으로 구조적 리스크를 계산하고 Loss Amount를 산출합니다.
    이 클래스는 API 계층과 분리되어 순수 비즈니스 로직만을 담보해야 합니다 (SRP).
    """

    def __init__(self):
        # 내부 상수 정의: 위험 가중치 설정
        self.WEIGHT_COMPLIANCE = 0.4  # 규정 준수가 가장 중요함
        self.WEIGHT_EFFICIENCY = 0.3  # 운영 효율성도 큰 변수
        self.WEIGHT_VOLATILITY = 0.3 # 시장 변동성은 위험 증폭기 역할

    def calculate_risk_score(self, variables: RiskInputVariables) -> float:
        """
        입력된 변수를 바탕으로 종합적인 구조적 리스크 점수를 계산합니다 (0.0 ~ 1.0).
        점수가 높을수록(=1에 가까울수록) 위험도가 높음을 의미합니다.
        """
        score = (
            (1.0 - variables.regulatory_compliance_score) * self.WEIGHT_COMPLIANCE +
            (1.0 - variables.operational_efficiency_rate) * self.WEIGHT_EFFICIENCY +
            variables.market_volatility_index * self.WEIGHT_VOLATILITY # 변동성은 위험 증가 요인으로 활용
        )
        # 점수는 0에서 1 사이로 제한합니다.
        return min(max(score, 0.0), 1.0)

    def calculate_loss_amount(self, risk_score: float) -> float:
        """
        계산된 리스크 스코어를 기반으로 구체적인 재무 손실액을 USD 단위로 산출합니다.
        [가정] 베이스 리스크는 10,000 USD이며, 점수가 높을수록 기하급수적으로 증가한다고 가정.
        """
        # 위험 증폭 모델: Base * (Score ^ Power)
        BASE_LOSS = 5000.0 # 최소 손실액 설정
        EXPONENT = 2.5    # 지수 적용으로 높은 점수에 더 큰 페널티 부여
        loss = BASE_LOSS * (risk_score ** EXPONENT)
        return round(loss, 2)

    def assess_risk(self, variables: RiskInputVariables) -> tuple[str, float, str]:
        """
        전체 위험 평가를 수행하고 (등급, 손실액, 메시지)를 반환합니다.
        이것이 핵심 비즈니스 로직의 최종 결과입니다.
        """
        risk_score = self.calculate_risk_score(variables)
        loss_amount = self.calculate_loss_amount(risk_score)

        # 위험 등급 및 메시지 결정 (규칙 기반 분기 처리)
        if risk_score >= 0.8:
            level = "CRITICAL"
            message = f"🚨 시스템적 생존 위협 감지! 구조적 결함이 확인되었습니다. 즉각적인 운영 통제가 필요합니다."
        elif risk_score >= 0.5:
            level = "HIGH"
            message = f"⚠️ 주의가 필요합니다. 주요 프로세스에 리스크가 포착되었으며, 진단 및 개선이 시급합니다."
        elif risk_score >= 0.2:
            level = "MEDIUM"
            message = f"💡 부분적인 취약점이 발견되었습니다. 선제적 대응을 통해 안정성을 높일 것을 권고합니다."
        else:
            level = "LOW"
            message = "✅ 시스템 무결성이 양호합니다. 현재 운영 상태는 기준치를 충족하고 있습니다."

        return level, loss_amount, message