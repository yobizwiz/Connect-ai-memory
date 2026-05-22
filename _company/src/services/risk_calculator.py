from typing import Dict, Any
import time

# 가중치 정의 (이 수치는 비즈니스 의사결정에 따라 조정되어야 합니다.)
TDR_WEIGHT = 0.4  # 시간적 공포의 영향력 (Critical: 3.0)
FRI_WEIGHT = 0.6  # 재무적 손실의 영향력 (High: 3.0)

def calculate_threat_score(time_danger_rating: float, financial_risk_index: float) -> Dict[str, Any]:
    """
    TDR과 FRI를 결합하여 최종 위협 점수와 리스크 등급을 계산합니다.
    Threat Score = (TDR * TDR_WEIGHT) + (FRI * FRI_WEIGHT)

    Args:
        time_danger_rating: 시간적 공포 지표 (0.0 ~ 3.0).
        financial_risk_index: 재무적 손실 위험 지수 (0.0 ~ 3.0).

    Returns:
        최종 위협 점수, 리스크 등급(Low/Medium/High), 필요한 조치(Action)를 포함하는 딕셔너리.
    """
    if time_danger_rating < 0 or financial_risk_index < 0:
        raise ValueError("TDR과 FRI는 음수가 될 수 없습니다.")

    # 핵심 로직: 가중 평균을 이용한 통합 위협 점수 계산
    threat_score = (time_danger_rating * TDR_WEIGHT) + (financial_risk_index * FRI_WEIGHT)

    if threat_score < 1.5:
        risk_level = "LOW"
        action_needed = None
        message = "현재 시스템적 위협은 낮은 수준입니다. 모니터링을 권장합니다."
    elif threat_score < 2.8:
        risk_level = "MEDIUM"
        # TDR이나 FRI 중 하나라도 특정 임계치를 넘으면 '경고'로 처리하여 공포감을 유발함.
        action_needed = "자세한 진단 보고서가 필요합니다." if time_danger_rating > 1.5 or financial_risk_index > 1.5 else None
        message = f"⚠️ 경고: 특정 영역에서 잠재적 시스템 오류가 감지되었습니다. ({'시간적 위험' if time_danger_rating > 1.5 else ''} / {'재무적 손실' if financial_risk_index > 1.5 else ''})"
    else: # score >= 2.8
        risk_level = "CRITICAL"
        # Critical 상황에서는 시간과 돈 모두를 건드려야 함.
        action_needed = "즉시 전문가 진단이 필요합니다. $49 Basic Audit Trial로 시스템 안정성을 확보하십시오."
        message = "🚨 경고! 구조적 무결성이 심각하게 훼손되었습니다. 즉각적인 조치 없이는 막대한 재무적 손실($XXX)을 피할 수 없습니다."

    return {
        "threat_score": round(threat_score, 2),
        "risk_level": risk_level,
        "action_needed": action_needed,
        "message": message
    }

def calculate_estimated_loss(threat_score: float) -> Dict[str, Any]:
    """위협 점수를 기반으로 예상되는 재무적 손실액을 추정합니다."""
    # 임의의 비즈니스 로직 (예시): 위협 점수 * 1000 + 기본 벌금 (최소 500$)
    estimated_loss = max(500.0, round(threat_score * 1500))
    return {
        "estimated_loss": estimated_loss,
        "currency": "USD",
        "message": f"현재 위협 점수({round(threat_score, 2)})를 기반으로 예상되는 최소 재무적 손실액은 ${estimated_loss:,.0f}입니다."
    }

# Test용 더미 데이터 (실제 서비스에서는 DB나 외부 API 호출 필요)
DUMMY_API_CALL = "SUCCESS"