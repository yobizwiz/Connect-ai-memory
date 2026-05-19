import uuid
from datetime import datetime
from typing import List
from src.api.v1.schemas.audit_schema import AuditRequest, AuditReport

def _generate_risk_score(request: AuditRequest) -> float:
    """
    [Private Method] 입력 데이터의 키워드를 분석하여 구조적 리스크 점수를 산출합니다. 
    이 로직은 비즈니스 컨텍스트(규제 위반 강조)를 반영해야 합니다.
    """
    score = 5.0  # 기본점수 (중립)
    risk_words = ["PII", "감사 추적", "법적 리스크", "준수 의무"]
    
    input_text = f"{request.client_name} {request.industry_sector} {request.regulatory_concern}"
    
    for word in risk_words:
        if word in input_text:
            score += 1.5  # 핵심 키워드가 포함되면 점수 상승
    
    if "레거시" in str(request.current_process_description):
        score += 2.0 # 레거시는 항상 위험 요소
        
    return min(max(score, 4.0), 9.5) # 범위 제한 (최소 4점, 최대 9.5점)


def generate_mock_audit_report(request: AuditRequest) -> AuditReport:
    """
    진입점 함수: 요청 데이터를 받아 구조적이고 권위적인 가짜 감사 보고서를 생성합니다.
    실제 데이터베이스 조회나 외부 API 호출 없이, 논리 기반으로 리스크를 산출합니다.
    """
    # 1. 리스크 점수 산출 (비즈니스 로직)
    risk_score = _generate_risk_score(request)

    # 2. 준수 상태 결정 (규칙 기반)
    if risk_score >= 8.0:
        status = "High Risk"
        vulnerabilities = [
            f"{request.regulatory_concern}의 근본적인 프로세스 결함",
            "자동 감사 추적(Audit Trail) 기능 부재로 인한 책임 소재 불명확성."
        ]
        recommendations = [
            "즉시 Compliance Gateway 모듈 도입 검토.",
            "전사적 PII 마스킹 및 접근 제어 시스템 구축 필수."
        ]
    elif risk_score >= 5.0:
        status = "Moderate Risk"
        vulnerabilities = [f"산업 특성상 {request.industry_sector} 분야에서 일반적인 규제 사각지대 존재."]
        recommendations = ["표준 감사 체크리스트를 활용한 내부 프로세스 정기 점검을 권고합니다."]
    else:
        status = "Compliant"
        vulnerabilities = []
        recommendations = ["현재 구조는 기본 컴플라이언스를 만족하는 것으로 보이나, 시스템적 개선 여지를 확인해야 합니다."]

    # 3. 보고서 객체 생성
    return AuditReport(
        report_id=str(uuid.uuid4()).split('-')[0].upper(), # 고유 ID Mocking
        generated_at=datetime.utcnow().isoformat() + 'Z',
        overall_risk_score=round(risk_score, 2),
        compliance_status=status,
        critical_vulnerabilitys=vulnerabilities,
        recommendations=recommendations
    )