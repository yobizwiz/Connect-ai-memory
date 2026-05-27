"""
리스크 점수 임계치 설정 (Risk Threshold Configuration)
비즈니스 규칙과 기술 구현을 분리하기 위해 임계치를 별도 모듈로 관리합니다.

공개 API:
    - THRESHOLDS: 등급별 임계치 딕셔너리
    - get_score_level(score) -> str: 점수에 해당하는 등급 반환
"""
from typing import Dict

# =============================================================
# 등급별 최소 점수 기준 (하한값)
# =============================================================
THRESHOLDS: Dict[str, float] = {
    "CRITICAL": 80.0,    # Red Zone    — 즉시 조치 필요
    "HIGH": 60.0,        # Yellow Zone — 48시간 내 검토 필요
    "MODERATE": 40.0,    # Orange Zone — 분기 내 감사 권장
    "LOW": 0.0,          # Green Zone  — 정기 모니터링
}


def get_score_level(score: float) -> str:
    """
    리스크 점수(0~100)를 받아 해당하는 등급 문자열을 반환합니다.

    Args:
        score: 0~100 범위의 리스크 점수

    Returns:
        str: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'

    Examples:
        >>> get_score_level(92)
        'CRITICAL'
        >>> get_score_level(15)
        'LOW'
    """
    if score >= THRESHOLDS["CRITICAL"]:
        return "CRITICAL"
    elif score >= THRESHOLDS["HIGH"]:
        return "HIGH"
    elif score >= THRESHOLDS["MODERATE"]:
        return "MODERATE"
    else:
        return "LOW"
