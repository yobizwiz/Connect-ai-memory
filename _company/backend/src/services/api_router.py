import os
from typing import Dict, Any
from fastapi import APIRouter, Body, HTTPException, status
# 로직이 정의된 기존 파일을 임포트합니다. (절대 경로 사용 원칙 준수)
from .risk_calculator import calculate_tre_score 
# 가상의 A/B 테스트 및 로그 서비스 모듈을 가정합니다.
# 실제 프로젝트에서는 별도의 DB 커넥션을 통해 구현해야 합니다.
def log_ab_test(user_id: str, ab_group: str, event: str) -> None:
    """A/B 테스트 결과를 로깅하는 더미 함수입니다."""
    print(f"[LOGGING] A/B Test Logged | User: {user_id}, Group: {ab_group}, Event: {event}")

# 라우터 초기화 (API 엔드포인트 정의)
router = APIRouter()

@router.post("/risk_assessment")
async def assess_risk(
    data: Dict[str, Any], 
    user_id: str = Body(..., embed=True, description="사용자 고유 ID"),
    ab_group: str = Body(..., embed=True, description="A/B 테스트 그룹 식별자")
):
    """
    제공된 입력 데이터를 기반으로 최대 재무 손실액 (TRE)을 계산하고, 
    위험 상태 및 다음 액션을 결정합니다.

    Args:
        data (dict): 위험 관련 데이터 구조 (e.g., {'scope_violation': True, ...})
        user_id (str): API 호출 사용자 식별자.
        ab_group (str): A/B 테스트 그룹 ('A' 또는 'B').

    Returns:
        Dict[str, Any]: 계산된 점수, 위험 상태, Paywall 진입 여부.
    """
    try:
        # 1. 입력 유효성 및 타입 검증 (Defensive Coding)
        if not isinstance(data, dict):
            raise HTTPException(status_code=400, detail="Invalid data format. Must be a JSON object.")
        
        # 2. A/B 테스트 로깅 선행 실행
        log_ab_test(user_id, ab_group, "risk_assessment_attempt")

        # 3. 핵심 로직 호출 (TRE 점수 계산)
        tre_score = calculate_tre_score(**data) # **kwargs를 사용해 모든 인자를 전달합니다.
        
        # 4. 상태 변화 및 Paywall 트리거 로직 검증
        is_critical = tre_score >= 1200
        
        if is_critical:
            assessment_state = "CRITICAL"
            paywall_triggered = True
            visual_trigger = "Glitch Noise Active (Paywall required)"
        else:
            assessment_state = "NORMAL" if tre_score < 800 else "MODERATE"
            paywall_triggered = False
            visual_trigger = "Normal UI Flow"

        # 5. 최종 결과 반환
        return {
            "success": True,
            "risk_score_tre": round(tre_score, 2),
            "assessment_state": assessment_state,
            "paywall_triggered": paywall_triggered,
            "visual_trigger": visual_trigger,
            "recommendation": "Immediate audit required." if is_critical else "Monitor risk factors."
        }

    except Exception as e:
        # 모든 예외를 포괄하여 클라이언트에게 노출하지 않고 내부 에러 코드를 반환합니다.
        print(f"[CRITICAL ERROR] Risk Assessment Failed: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during risk calculation.")

# 라우터 테스트용 실행 예시 (실제 사용 시에는 main.py에서 통합)
if __name__ == "__main__":
    print("--- api_router.py 로컬 테스트 시작 ---")
    # 가짜 데이터로 1200점 초과 시나리오 테스트
    high_risk_data = {
        "scope_violation": True, 
        "pii_leakage_index": 0.95, 
        "compliance_drift_score": 0.8, 
        "source_attribution_deficit": True
    }
    # 이 테스트는 FastAPI 서버가 구동되어야 제대로 실행됩니다.
    print("테스트 데이터 준비 완료: 고위험 시나리오 감지 예정.")