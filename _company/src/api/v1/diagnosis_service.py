# src/api/v1/diagnosis_service.py
"""
진단 로직 핵심 모듈 (Mock API Service Layer).
외부 결제나 복잡한 DB 통신 없이, 비즈니스 리스크 계산만 전담합니다.
모든 계산은 '시스템적 생존 위협'을 유도하도록 설계되어야 합니다.
"""

from pydantic import BaseModel, Field
from typing import Dict, Any
import random

# ====================================
# 1. 데이터 모델 정의 (Input & Output)
# ====================================

class DiagnosisRequest(BaseModel):
    """사용자 입력 데이터를 받는 스키마."""
    company_name: str = Field(..., description="진단을 요청하는 회사명.")
    data_storage_period_years: int = Field(..., ge=1, description="데이터 보관 기간 (년).")
    use_external_vendor: bool = Field(..., description="외부 벤더 사용 여부.")
    has_encryption_policy: bool = Field(..., description="종단 간 암호화 정책 유무.")

class DiagnosisResult(BaseModel):
    """진단 결과를 담는 표준화된 응답 스키마."""
    status: str = Field("Success", description="API 호출 상태 (Success/Error).")
    risk_level: str = Field(..., description="산출된 리스크 레벨 (Critical, High, Medium, Low).")
    risk_score: float = Field(..., ge=0.0, le=10.0, description="정량화된 위험 점수 (0.0~10.0).")
    compliance_status: str = Field(..., description="최신 법규 준수 상태 (Compliant/Non-Compliant).")
    recommendation: Dict[str, Any] = Field(..., description="필요한 해결책 및 다음 단계 가이드.")


# ====================================
# 2. 핵심 비즈니스 로직 (Mock API Routine)
# ====================================

def calculate_risk_and_compliance(request_data: DiagnosisRequest) -> DiagnosisResult:
    """
    입력된 데이터를 기반으로 Mock 리스크 점수와 컴플라이언스 상태를 계산합니다.
    이 함수는 비즈니스 규칙을 캡슐화하여, 프론트엔드는 오직 이 결과만 신뢰해야 합니다.
    [근거: 💻 코다리 개인 메모리 - 핵심은 '시스템적 생존 위협']
    """
    print(f"--- [DIAGNOSIS SERVICE] Starting risk calculation for {request_data.company_name} ---")

    # 초기 리스크 점수 및 컴플라이언스 상태 설정 (최대 10점)
    total_risk_score = 0.0
    compliance_status = "Compliant"

    # Rule 1: 데이터 보관 기간 - 가장 큰 위험 요소로 가정합니다.
    if request_data.data_storage_period_years > 5:
        total_risk_score += 4.0  # 4점 가중치 부여
        compliance_status = "Non-Compliant (Data Retention)"

    # Rule 2: 외부 벤더 사용 여부 - 통제 불가능한 영역에 대한 리스크를 증가시킵니다.
    if request_data.use_external_vendor and not request_data.has_encryption_policy:
        total_risk_score += 3.0
        compliance_status = "Non-Compliant (Vendor Risk)"

    # Rule 3: 암호화 정책 유무 - 가장 기본적인 방어선에 대한 체크입니다.
    if not request_data.has_encryption_policy:
        total_risk_score += 2.0
        compliance_status = "Non-Compliant (Encryption Gap)"

    # 최종 점수 조정 및 리스크 레벨 결정 (10점을 넘지 않게)
    final_risk_score = min(total_risk_score, 10.0)
    
    if final_risk_score >= 8.5:
        risk_level = "Critical"
    elif final_risk_score >= 6.0:
        risk_level = "High"
    elif final_risk_score >= 3.0:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    # 결과물 포장 (Recommendation)
    recommendation = {
        "action_required": True,
        "severity": risk_level,
        "steps": [
            f"1. 데이터 보관 기간을 재검토하고 법적 근거를 마련하십시오.",
            f"2. 외부 벤더 이용 시에는 반드시 전송/저장 단계의 암호화 정책(Encryption Gate)을 의무화해야 합니다.",
            "3. 본 진단 보고서를 기반으로 다음 단계인 '맞춤형 컴플라이언스 로드맵' 워크숍을 예약하십시오." # CTA 강화
        ]
    }

    return DiagnosisResult(
        status="Success", 
        risk_level=risk_level, 
        risk_score=round(final_risk_score, 1), 
        compliance_status=compliance_status, 
        recommendation=recommendation
    )

# ====================================
# 테스트용 예시 실행 (개발자 확인용)
# ====================================
if __name__ == "__main__":
    # Case 1: 위험도가 높은 시나리오 (Critical)
    critical_request = DiagnosisRequest(
        company_name="A Corp",
        data_storage_period_years=7, # > 5년
        use_external_vendor=True,  # 외부 사용
        has_encryption_policy=False # 암호화 미흡
    )
    import json
    print("\n========== 테스트 케이스 1: Critical Failure ==========")
    result = calculate_risk_and_compliance(critical_request)
    print(json.dumps(result.model_dump(), indent=2, ensure_ascii=False))

    # Case 2: 안전한 시나리오 (Low)
    low_request = DiagnosisRequest(
        company_name="B Corp",
        data_storage_period_years=3, # <= 5년
        use_external_vendor=False, # 외부 안 사용
        has_encryption_policy=True  # 암호화 정책 있음
    )
    print("\n========== 테스트 케이스 2: Low Risk ==========")
    result = calculate_risk_and_compliance(low_request)
    print(json.dumps(result.model_dump(), indent=2, ensure_ascii=False))