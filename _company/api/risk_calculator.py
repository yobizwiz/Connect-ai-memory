import json
from typing import Dict, Any

# --- Constants & Weights (Editable via Config) ---
# Researcher가 정의한 가중치 및 상한값은 이곳에 정의합니다.
REGULATORY_WEIGHT = 0.7  # W_R: 규제 위험 가중치
PII_WEIGHT = 1.5         # PII의 민감도 가중치

def calculate_lmax(user_data: Dict[str, Any]) -> tuple[float, str]:
    """
    $L_{totalMax}$ (Total Maximum Financial Loss)를 계산합니다.
    입력된 사용자 데이터로부터 규제 리스크 점수를 산출하고 위험 등급을 반환합니다.

    Args:
        user_data: 클라이언트의 비즈니스 정보를 포함하는 딕셔너리.

    Returns:
        (Lmax Score, Risk Level)
    """
    try:
        # Defensive Coding: 모든 입력값에 대한 기본 가드와 타입 체크를 수행합니다.
        r_score = user_data.get("compliance_score", 0.0) # R_score (직접적인 벌금 점수)
        pii_level = user_data.get("pii_level", "low")       # PII 민감도 ("low", "medium", "high")

        # L_HIPAA_max 등 특정 최대 손실값을 계산하기 위한 로직 추가 (예시)
        if pii_level == "high":
            l_hipaa_max = 50000.0  # 고위험 PII의 예시 최대 손실액
        elif pii_level == "medium":
            l_hipaa_max = 10000.0
        else:
            l_hipaa_max = 0.0

        # 1. 핵심 리스크 컴포넌트 계산: (W_R * R_score) + (PII_weight * L_HIPAA_max)
        core_risk_component = (REGULATORY_WEIGHT * r_score) + \
                               (PII_WEIGHT * l_hipaa_max)

        # 2. 운영 리스크 및 AI 책임 통합 (가정): O_loss + A_risk
        # 실제로는 이 변수들이 복잡한 데이터 파이프라인에서 산출되어야 함을 주석으로 명시합니다.
        o_loss = user_data.get("operational_instability", 0.0) * 0.1
        a_risk = user_data.get("ai_bias_exposure", 0.0) * 0.5

        # 최종 Lmax 계산 (수학적 무결성 검증):
        l_total_max = core_risk_component + o_loss + a_risk

    except TypeError as e:
        print(f"Error calculating Lmax due to type mismatch: {e}")
        return 0.0, "Error - Check Input Types"


    # --- Risk Level Determination (Defensive Logic) ---
    if l_total_max >= 15000.0:
        risk_level = "RED (Critical)"  # 재앙적 손실 위협
    elif l_total_max >= 5000.0:
        risk_level = "ORANGE (Warning)" # 잠재적 위험 감지
    else:
        risk_level = "GREEN (Safe/Monitor)" # 양호

    return round(l_total_max, 2), risk_level


def generate_diagnosis_report(lmax: float, level: str) -> Dict[str, Any]:
    """
    Lmax 점수와 위험 등급에 기반하여 상세 진단 보고서 구조를 생성합니다.
    """
    base_report = {
        "timestamp": "2026-06-01T12:00:00Z", # 실제 API 호출 시점으로 대체 필요
        "lmax_score": lmax,
        "risk_level": level,
        "summary": "",
        "diagnosis": {
            "structural_gap": "현재 비즈니스 모델의 주요 취약 지점을 설명합니다.",
            "compliance_status": {"passed": False, "details": []},
            "operational_risks": ["주요 시스템 의존성 분석 및 해결 방안."],
            "ai_liability_assessment": ["AI 사용 과정에서 발생 가능한 윤리적/법적 리스크 점검."]
        }
    }

    # Level에 따른 요약 메시지 작성 (Writer가 채울 내용)
    if level == "RED (Critical)":
        base_report["summary"] = "⚠️ 경고: 즉각적인 시스템 생존 조치가 필요합니다. 현재의 리스크는 최대 재정적 손실을 초래할 수 있습니다."
        base_report["diagnosis"]["compliance_status"]["passed"] = False
    elif level == "ORANGE (Warning)":
        base_report["summary"] = "🟡 주의: 잠재적인 취약점이 감지되었습니다. 선제적 개선 계획이 필요합니다."
        base_report["diagnosis"]["compliance_status"]["passed"] = False
    else: # GREEN
        base_report["summary"] = "✅ 양호: 현재 규정 준수 및 운영 리스크는 허용 가능한 범위 내에 있습니다. 지속적인 모니터링을 권장합니다."
        base_report["diagnosis"]["compliance_status"]["passed"] = True

    return base_report

# 이 함수가 FastAPI 라우트에서 호출될 메인 로직입니다.
def process_risk_assessment(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """API의 최종 진입점 (Entry Point)"""
    lmax, level = calculate_lmax(user_data)
    report = generate_diagnosis_report(lmax, level)
    return report

# 테스트용 데이터 예시 (단위 테스트 시 활용)
if __name__ == "__main__":
    test_high_risk = {
        "compliance_score": 8.0,  # 높은 점수 -> 큰 벌금 예상
        "pii_level": "high",       # 고민감 데이터 사용
        "operational_instability": 3.5, # 불안정 운영 요소
        "ai_bias_exposure": 1.2    # AI 편향 노출 높음
    }
    print("--- High Risk Test ---")
    result = process_risk_assessment(test_high_risk)
    print(json.dumps(result, indent=4))

    test_low_risk = {
        "compliance_score": 1.0,
        "pii_level": "low",
        "operational_instability": 0.5,
        "ai_bias_exposure": 0.2
    }
    print("\n--- Low Risk Test ---")
    result = process_risk_assessment(test_low_risk)
    print(json.dumps(result, indent=4))