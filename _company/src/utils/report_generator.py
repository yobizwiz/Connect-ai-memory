"""
최종 리포트 생성 유틸리티 (Report Generator)
리스크 점수를 기반으로 고객에게 제공할 최종 진단 리포트를 생성합니다.

공개 API:
    - generate_final_report(user_input, risk_score) -> dict
"""
from typing import Dict, Any


# =============================================================
# 리스크 등급 판정 기준
# =============================================================
_THRESHOLDS = {
    "CRITICAL": 80,   # Red Zone
    "HIGH": 60,       # Yellow Zone
    "MODERATE": 40,   # Orange Zone
}

# 등급별 메시지 템플릿
_MESSAGES = {
    "CRITICAL": (
        "🚨 [RED ZONE] 귀사의 시스템은 구조적 자본 손실이 임박한 상태입니다. "
        "현재 규제 노출 수준에서 즉각적인 조치가 없을 경우, "
        "연간 예상 손실액이 기하급수적으로 증가할 수 있습니다."
    ),
    "HIGH": (
        "⚠️ [WARNING ZONE] 귀사의 규제 준수 상태에 구조적 자본 손실 위험이 감지되었습니다. "
        "현재 수준이 유지될 경우 중대한 재무적 영향이 발생할 수 있습니다."
    ),
    "MODERATE": (
        "📋 [REVIEW ZONE] 일부 규제 항목에서 개선이 필요한 영역이 발견되었습니다. "
        "선제적 조치를 통해 리스크를 최소화할 수 있습니다."
    ),
    "LOW": (
        "✅ [GREEN ZONE] 현재 규제 준수 상태는 양호합니다. "
        "지속적인 모니터링을 권장합니다."
    ),
}

# 등급별 권장 조치
_RECOMMENDATIONS = {
    "CRITICAL": {"action": "즉시 컨설팅 필요", "urgency": "IMMEDIATE"},
    "HIGH":     {"action": "48시간 내 전문가 검토 필요", "urgency": "HIGH"},
    "MODERATE": {"action": "분기 내 내부 감사 권장", "urgency": "MODERATE"},
    "LOW":      {"action": "정기 모니터링 유지", "urgency": "LOW"},
}


def _determine_risk_level(score: float) -> str:
    """점수에 따라 리스크 등급을 반환합니다."""
    if score >= _THRESHOLDS["CRITICAL"]:
        return "CRITICAL"
    elif score >= _THRESHOLDS["HIGH"]:
        return "HIGH"
    elif score >= _THRESHOLDS["MODERATE"]:
        return "MODERATE"
    else:
        return "LOW"


def generate_final_report(
    user_input: Dict[str, Any],
    risk_score: float,
) -> Dict[str, Any]:
    """
    최종 진단 리포트를 생성합니다.

    Args:
        user_input: 사용자가 입력한 원본 데이터
        risk_score: calculate_risk_score()로 산출된 0~100 점수

    Returns:
        dict: risk_level, message, recommendation, score, input_summary 포함
    """
    risk_level = _determine_risk_level(risk_score)

    return {
        "risk_level": risk_level,
        "score": risk_score,
        "message": _MESSAGES[risk_level],
        "recommendation": _RECOMMENDATIONS[risk_level],
        "input_summary": user_input,
    }
