import json
from typing import Dict, Any
# 최근 작업한 파일: threat_calculator.py를 사용하여 TRE 계산을 가져옵니다.
from .threat_calculator import calculate_tre

# 임계점 정의 (CEO 지시 기반)
THRESHOLD_CRITICAL = 75  # Red Zone & Forced Paywall
THRESHOLD_WARNING = 40   # Subtle Warning/Soft CTA

def generate_e2e_payload(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    사용자 데이터를 받아 End-to-End 시뮬레이션 페이로드를 생성합니다.
    이는 단순한 리스크 점수 계산을 넘어, UI/UX에 필요한 '상태'를 결정하는 게이트 역할을 합니다.

    Args:
        user_data: 사용자로부터 수집된 구조적 데이터 (재무, 규정 준수 등).

    Returns:
        End-to-End 시뮬레이션 페이로드 객체.
    """
    print(f"--- [System Log] E2E Simulation Started for user data ---")
    
    # 1. 백엔드 핵심 로직 호출: $TRE$ 계산
    try:
        risk_score = calculate_tre(user_data)
        print(f"[System Log] Calculated Threat Index (TRE): {risk_score:.2f}")
    except Exception as e:
        # 데이터 파이프라인 실패 시 가장 안전하고 고권위적인 기본값 반환
        print(f"[ERROR] TRE Calculation Failed: {e}. Defaulting to High Risk.")
        return {
            "success": False,
            "risk_score": 0.0,
            "is_red_zone_active": True,
            "message": "System Analysis Failure: Critical Data Integrity Compromised.",
            "required_action": "Mandatory Diagnostic Check (Paywall)"
        }

    # 2. 비즈니스 임계점 기반 상태 전환 로직 (핵심 게이트)
    is_red_zone = False
    requires_paywall = False
    message = f"Your current risk profile is within acceptable operational parameters."
    required_action = "Proceed with Free Diagnosis."

    if risk_score >= THRESHOLD_CRITICAL:
        # CRITICAL ZONE: Red Zone 강제 활성화 및 Paywall 필수화
        is_red_zone = True
        requires_paywall = True
        message = (f"⚠️ ALERT! CRITICAL FAILURE DETECTED. Your structural integrity is compromised, "
                   f"exceeding the critical threshold of {THRESHOLD_CRITICAL}%. Immediate action required.")
        required_action = "Mandatory Diagnostic Check (Paywall)"

    elif risk_score >= THRESHOLD_WARNING:
        # WARNING ZONE: 경고 메시지 및 Soft CTA 유도
        is_red_zone = False # Red Zone은 아니지만, 위험도가 높음을 시각적으로 표현해야 함.
        requires_paywall = False
        message = (f"🚨 CAUTION! Warning detected. Your risk score of {risk_score:.2f} is elevated "
                   f"(above {THRESHOLD_WARNING}%). Immediate review is strongly advised.")
        required_action = "Review Detailed Report & Consult Expert."

    else:
        # NORMAL ZONE: 정상 상태 유지
        is_red_zone = False
        requires_paywall = False
        message = f"✅ Analysis Complete. Your system appears stable (TRE: {risk_score:.2f}). However, proactive risk mitigation is always advised."
        required_action = "Free Diagnosis Available."

    # 3. 최종 페이로드 구성
    e2e_payload = {
        "success": True,
        "risk_score": round(risk_score, 2),
        "is_red_zone_active": is_red_zone,
        "requires_paywall": requires_paywall,
        "message": message,
        "required_action": required_action
    }

    return e2e_payload

# --- API Mock Endpoint Simulation (FastAPI/Express 등 백엔드 엔드포인트 역할을 가정) ---
def simulate_api_call(user_data: Dict[str, Any]) -> str:
    """
    실제 HTTP 요청을 받아 JSON 문자열로 응답하는 모의 함수.
    프론트엔드는 이 결과를 받아서 Red Zone UI를 렌더링하게 됩니다.
    """
    payload = generate_e2e_payload(user_data)
    return json.dumps(payload, indent=4)

# 테스트용 데이터 구조 예시 (실제로는 사용자 입력으로 대체됨)
EXAMPLE_USER_DATA_CRITICAL = {
    "compliance_gap": 0.95,  # 매우 높은 리스크
    "financial_exposure": 120000, # 고가치 손실 위험
    "systemic_vulnerability": "Outdated API dependency"
}

EXAMPLE_USER_DATA_NORMAL = {
    "compliance_gap": 0.30,
    "financial_exposure": 5000,
    "systemic_vulnerability": "Standard cloud setup"
}

if __name__ == "__main__":
    print("="*60)
    print("✅ E2E Simulator API Mock Test (Critical Case)")
    critical_payload = simulate_api_call(EXAMPLE_USER_DATA_CRITICAL)
    print("\n--- [OUTPUT PAYLOAD] ---")
    print(critical_payload)

    print("\n" + "="*60)
    print("✅ E2E Simulator API Mock Test (Normal Case)")
    normal_payload = simulate_api_call(EXAMPLE_USER_DATA_NORMAL)
    print("\n--- [OUTPUT PAYLOAD] ---")
    print(normal_payload)