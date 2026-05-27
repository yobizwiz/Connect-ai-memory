import random
from typing import Dict, Any

# 상수 정의: Loss Meter가 작동하는 기본 재무 단위 (예: 100만 원)
BASE_LOSS_UNIT = 1_000_000  # $X를 산출할 기준 금액

def calculate_structural_risk(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    입력된 구조적 데이터 기반으로 생존 위협 점수와 재무 손실액을 계산합니다.
    
    Args:
        inputs (Dict[str, Any]): 'documentation_status', 'audit_trail_available' 등의 필수 입력값 딕셔너리.

    Returns:
        Dict[str, Any]: 리스크 레벨, 점수, 손실액($X), 상세 진단 결과 포함 딕셔너리.
    """
    # 초기 기본 위험 점수 설정 (최소한의 운영 비용 누락으로 인한 기본 리스크)
    base_score = 10
    total_loss_multiplier = 1.0

    # --- 구조적 결함 체크 로직 ---
    
    # 1. 문서화 상태 검사 (가장 큰 변수)
    if not inputs.get('documentation_status', False):
        base_score += 40  # 심각한 리스크 증가
        total_loss_multiplier *= 2.5 # 손실액 급증
        failure_reason = "🚨 Critical: 필수 프로세스 문서화가 누락되었습니다. 이는 감사 불가능한 지식의 존재를 의미하며, 규제 위반 시 막대한 재무적 책임을 초래합니다."
    else:
        failure_reason = ""

    # 2. 감사 트레일 유무 검사 (신뢰도 확보)
    if not inputs.get('audit_trail_available', False):
        base_score += 30  # 중급 리스크 증가
        total_loss_multiplier *= 1.5 # 손실액 추가 증가
        failure_reason = "⚠️ Warning: 감사 트레일(Audit Trail)이 불완전합니다. 누가, 언제, 무엇을 했는지 추적할 수 없어 책임 소재가 불분명하며, 시스템 무결성 측면에서 취약점을 노출합니다."

    # 3. 외부 규제 준수 여부 (보너스 체크 - 추가 기능 예정)
    if inputs.get('regulatory_compliance', False):
        base_score -= 10 # 안정화 보정
        failure_reason = ""


    # --- 최종 점수 및 손실액 계산 ---
    final_risk_score = min(100, base_score) # 최대 100점으로 제한
    financial_loss_amount = int(BASE_LOSS_UNIT * total_loss_multiplier * random.uniform(0.8, 1.2))

    # 리스크 레벨 판정
    if final_risk_score >= 70:
        risk_level = "🔴 CRITICAL (RED ZONE)"
        status = "Structural Flaw Detected"
    elif final_risk_score >= 30:
        risk_level = "🟠 WARNING (AMBER ZONE)"
        status = "Potential Structural Vulnerability"
    else:
        risk_level = "🟢 SAFE (GREEN ZONE)"
        status = "System Integrity Confirmed"

    # 결과 구조화
    return {
        "success": True,
        "risk_score": final_risk_score,
        "risk_level": risk_level,
        "loss_amount": financial_loss_amount, # 최종 재무 손실액 ($X)
        "status": status,
        "diagnosis": failure_reason if failure_reason else "시스템적 결함이 감지되지 않았습니다. 현재 구조는 양호합니다."
    }

# 테스트용 예시 실행 (로직 검증)
if __name__ == '__main__':
    print("--- Test Case 1: 모든 결함 존재 ---")
    test_inputs_fail = {
        'documentation_status': False,
        'audit_trail_available': False,
        'regulatory_compliance': False
    }
    result_fail = calculate_structural_risk(test_inputs_fail)
    print(f"Result: {result_fail}")

    print("\n--- Test Case 2: 모든 조건 완벽 ---")
    test_inputs_pass = {
        'documentation_status': True,
        'audit_trail_available': True,
        'regulatory_compliance': True
    }
    result_pass = calculate_structural_risk(test_inputs_pass)
    print(f"Result: {result_pass}")