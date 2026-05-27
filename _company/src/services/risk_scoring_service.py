"""
리스크 점수 산정 서비스 (Risk Scoring Service)
테스트 스켈레톤(test_risk_scoring.py)이 기대하는 공개 인터페이스를 구현합니다.

공개 API:
    - InputDataSchema: 입력 데이터 필수 필드 정의
    - RiskScoringService: 입력 유효성 검증 서비스 클래스
    - calculate_risk_score(data): 순수 함수 — 리스크 점수(0~100) 반환
"""
from typing import Dict, Any

# =============================================================
# 입력 스키마 정의
# =============================================================
REQUIRED_FIELDS: Dict[str, type] = {
    "compliance_score": (int, float),
    "regulatory_exposure_years": (int, float),
    "financial_transaction_volume": (int, float),
    "is_system_critical": (bool,),
}


class InputDataSchema:
    """입력 데이터의 필수 필드와 타입을 정의하는 스키마 클래스."""

    required_fields = REQUIRED_FIELDS

    @classmethod
    def validate(cls, data: Dict[str, Any]) -> bool:
        """모든 필수 필드가 존재하고 올바른 타입인지 검증합니다."""
        if not isinstance(data, dict):
            return False
        for field, expected_types in cls.required_fields.items():
            if field not in data:
                return False
            if not isinstance(data[field], expected_types):
                return False
        return True


# =============================================================
# 서비스 클래스
# =============================================================
class RiskScoringService:
    """리스크 점수 산정을 위한 서비스 객체."""

    def validate_input(self, data: Dict[str, Any]) -> bool:
        """InputDataSchema 기반으로 입력 데이터를 검증합니다."""
        return InputDataSchema.validate(data)


# =============================================================
# 핵심 계산 함수 (순수 함수)
# =============================================================
def calculate_risk_score(data: Dict[str, Any]) -> float:
    """
    리스크 점수를 0~100 범위로 계산합니다.

    공식 개요:
        - compliance_score가 낮을수록 위험 ↑
        - regulatory_exposure_years가 길수록 위험 ↑
        - financial_transaction_volume이 클수록 위험 ↑
        - is_system_critical이 True이면 가중치 증폭

    Args:
        data: REQUIRED_FIELDS에 정의된 키를 포함하는 딕셔너리

    Returns:
        float: 0~100 사이의 리스크 점수

    Raises:
        TypeError: compliance_score 등 숫자 필드에 문자열이 들어온 경우
    """
    compliance = data["compliance_score"]
    exposure = data["regulatory_exposure_years"]
    volume = data["financial_transaction_volume"]
    critical = data["is_system_critical"]

    # ── 타입 검증 (TypeError 발생) ──
    if not isinstance(compliance, (int, float)):
        raise TypeError(
            f"compliance_score는 숫자여야 합니다. 받은 값: {type(compliance).__name__}"
        )
    if not isinstance(exposure, (int, float)):
        raise TypeError(
            f"regulatory_exposure_years는 숫자여야 합니다. 받은 값: {type(exposure).__name__}"
        )
    if not isinstance(volume, (int, float)):
        raise TypeError(
            f"financial_transaction_volume은 숫자여야 합니다. 받은 값: {type(volume).__name__}"
        )

    # ── 개별 위험 요소 정규화 (0~1) ──
    # compliance_score: 100 = 완전 안전 → 0 risk,  0 = 최대 위험 → 1 risk
    compliance_risk = max(0.0, min(1.0, (100 - compliance) / 100))

    # exposure_years: 0~10년 범위로 정규화
    exposure_risk = max(0.0, min(1.0, exposure / 10.0))

    # volume: 로그 스케일 정규화 (1,000 ~ 1,000,000,000 기준)
    import math
    if volume <= 0:
        volume_risk = 0.0
    else:
        volume_risk = max(0.0, min(1.0, (math.log10(max(volume, 1)) - 3) / 6))

    # ── 가중 합산 ──
    # compliance가 가장 큰 비중, 그 다음 exposure, volume 순
    raw_score = (
        compliance_risk * 0.45
        + exposure_risk * 0.30
        + volume_risk * 0.25
    )

    # ── 시스템 크리티컬 증폭 ──
    if critical:
        raw_score = raw_score * 1.25  # 25% 증폭

    # ── 최종 스케일링 (0~100) ──
    final_score = max(0.0, min(100.0, raw_score * 100))

    return round(final_score, 2)
