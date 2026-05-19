from fastapi import APIRouter, HTTPException, status
from src.api.v1.schemas.audit_schema import AuditRequest, AuditReport
from src.api.v1.services.report_service import generate_mock_audit_report

# 라우터 초기화 (API Gateway 역할을 수행)
router = APIRouter(prefix="/audit", tags=["Audit Report"])

@router.post("/request", response_model=AuditReport, status_code=status.HTTP_200_OK)
async def process_audit_request(request: AuditRequest):
    """
    사용자로부터의 감사 요청을 받아 Mock 리스크 진단 보고서를 생성하고 반환합니다.
    이 엔드포인트는 시스템적 절차를 강제하는 Compliance Gateway 역할을 수행합니다.
    """
    try:
        # 1. Input 유효성 검증은 Pydantic (request: AuditRequest)에 의해 이미 처리됨.
        # 2. 비즈니스 로직 호출 (Mock Report Generator 실행)
        report = generate_mock_audit_report(request)
        
        # 성공적으로 보고서가 생성되었음을 반환합니다.
        return report

    except Exception as e:
        # 예상치 못한 시스템 오류는 사용자에게 노출하지 않고, 500 에러를 반환하며 로깅해야 합니다.
        print(f"[ERROR] Audit Report Generation Failed: {e}") # 실제로는 Logger 사용
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="시스템 내부 오류로 보고서를 생성할 수 없습니다. 관리자에게 문의해주세요."
        )