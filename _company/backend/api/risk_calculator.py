from typing import List, Dict, Any
from pydantic import BaseModel, Field, ValidationError
from datetime import date
import random

# --- 1. 데이터 모델 정의 (현빈님 로직 반영) ---
class InputStep(BaseModel):
    step_id: int = Field(..., description="규정 단계 ID")
    name: str = Field(..., description="단계 이름")
    actual_date: date = Field(..., description="실제 완료 날짜 (YYYY-MM-DD)")

class DiagnosisInput(BaseModel):
    client_id: str = Field(..., json_schema_extra={"example": "CUST-001"}, description="고객 식별자")
    workflow_name: str = Field(..., json_schema_extra={"example": "Contract_Approval"}, description="분석 대상 프로세스명")
    input_steps: List[InputStep] = Field(..., description="고객이 수행한 실제 단계 목록.")

# --- 2. 리스크 가중치 (시스템 내부 지식 Mock) ---
RISK_WEIGHTS: Dict[str, Dict[str, int]] = {
    "Contract_Approval": {
        "Legal": {"weight": 500, "description": "법무팀 검토 누락 시 예상 손실"},
        "Compliance": {"weight": 800, "description": "규정 준수 미흡으로 인한 벌금 위험"},
        "Audit": {"weight": 300, "description": "감사팀 최종 승인 부재로 인한 지연 비용"}
    }
}

# --- 3. 핵심 로직 함수 (Total Risk Exposure 계산) ---
def calculate_total_risk_exposure(input_data: DiagnosisInput) -> float:
    """
    입력된 데이터와 시스템 내부의 필수 단계, 가중치를 기반으로 총 노출 손실액을 계산합니다.
    [근거: 현빈 개인 메모리]
    """
    workflow = input_data.workflow_name
    if workflow not in RISK_WEIGHTS:
        return 0.0 # 워크플로우가 없으면 위험도 없음

    risk_score = 0.0
    mandatory_weights = RISK_WEIGHTS[workflow]
    
    # Mock 로직: 필수 단계 중 누락된 단계를 찾아 가중치 적용
    for step_name, weights in mandatory_weights.items():
        is_present = any(step.name == step_name for step in input_data.input_steps)
        if not is_present:
            risk_score += weights["weight"]

    # 시뮬레이션 변수 추가 (랜덤 요소로 '시스템적 위협' 체감 유도)
    random_factor = random.uniform(0, 50)
    return round(risk_score + random_factor, 2)


def calculate_audit_readiness_score(input_data: DiagnosisInput) -> float:
    """
    규정 승인 단계를 기준으로 감사 준비도 점수를 계산합니다. (100점 만점)
    [근거: 현빈 개인 메모리]
    """
    # 현재는 입력된 단계 수에 비례하여 100점에서 감점하는 방식으로 시뮬레이션합니다.
    # 실제로는 '필수 단계 대비 완료율'이 중요합니다.
    max_score = 100.0
    total_steps = len(input_data.input_steps)
    
    if total_steps == 0:
        return 0.0

    # 단순화된 로직: 단계가 많을수록, 그리고 특정 키워드가 빠질수록 점수가 낮아짐 (위험 상승)
    score = max_score - (total_steps * 5)
    
    # 최종적으로 최소 점수를 보장하고 반올림합니다.
    return max(0.0, round(score, 1))

def diagnose_risk(input_data: DiagnosisInput) -> Dict[str, Any]:
    """
    진단 로직을 통합 실행하여 모든 지표를 반환합니다.
    """
    tre = calculate_total_risk_exposure(input_data)
    score = calculate_audit_readiness_score(input_data)

    # 리스크 레벨 판단 (UI에 사용될 핵심 결정 로직)
    if tre > 1000 or score < 30:
        level = "High" # 빨간색/위협적
        status_msg = f"🚨 시스템 경고: 총 노출 손실액 {tre}로 심각한 규정 취약성이 발견되었습니다."
    elif tre > 400 or score < 60:
        level = "Medium" # 주황색/주의 필요
        status_msg = f"⚠️ 주의 필요: 프로세스에 일부 미흡한 단계가 있습니다. 추가 검토가 필요합니다."
    else:
        level = "Low" # 초록색/안전
        status_msg = "✅ 분석 완료: 현재 규정 승인 흐름은 안정적이며 높은 준수도를 보입니다."

    return {
        "total_risk_exposure": tre,
        "audit_readiness_score": score,
        "risk_level": level,
        "status_message": status_msg
    }

# FastAPI Endpoint Mock (실제 API 서버 역할)
async def get_diagnosis_endpoint(input_json: str):
    try:
        from fastapi import HTTPException # 임포트 가상화
        data = DiagnosisInput.model_validate_json(input_json)
        result = diagnose_risk(data)
        return result
    except ValidationError as e:
        # 입력 데이터 유효성 검사 실패 시
        raise HTTPException(status_code=400, detail=f"Invalid Input Data Format: {e}")

# 테스트용 초기 실행 (실제로는 FastAPI가 처리함)
if __name__ == "__main__":
    print("--- Backend Risk Calculator Initialized ---")
    # 테스트 케이스 1: 위험도가 높은 경우 시뮬레이션 데이터
    test_input = """{"client_id": "CUST-TEST", "workflow_name": "Contract_Approval", "input_steps": [{"step_id": 1, "name": "법무팀 검토", "actual_date": "2024-06-01"}]}"""
    print("\n[Test Case 1: High Risk Simulation]")
    # 실제로는 await로 처리되어야 함. 여기서는 동기 함수처럼 실행.
    from json import loads
    test_data = DiagnosisInput.model_validate(loads(test_input))
    result = diagnose_risk(test_data)
    print(f"TRE: {result['total_risk_exposure']}, Score: {result['audit_readiness_score']}, Level: {result['risk_level']}")