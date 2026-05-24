from fastapi import FastAPI, HTTPException, Depends, status
from src.schemas.models import UserInput, DiagnosisReport, PaymentRequest, RiskDataPoint
from src.services.risk_service import calculate_diagnosis, process_payment
import os

# 환경 변수 설정 (실제 운영 시에는 Docker/K8s에서 주입되어야 함)
# 테스트 목적으로 임시로 더미 키를 로드한다고 가정합니다.
os.environ["PG_SANDBOX_KEY"] = "sk_test_xxxxxxxxxxxxxxx" 

app = FastAPI(title="yobizwiz Compliance Gatekeeper Pro API", version="v1")

@app.get("/health")
def read_root():
    """시스템 상태 확인 엔드포인트."""
    return {"status": "operational", "service": "ComplianceGatekeeperPro"}

# ==============================================================
# 🎯 1. 리스크 진단 시작 (Trigger) Endpoint
# 사용자 입력 -> QLoss 계산 트리거
@app.post("/api/v1/diagnosis/start", response_model=DiagnosisReport, status_code=status.HTTP_200_OK)
async def start_diagnosis(user_data: UserInput):
    """사용자 데이터를 받아 리스크 진단 프로세스를 시작하고 보고서를 생성합니다."""
    try:
        # 1. 가상의 리스크 데이터 수집 시뮬레이션 (실제는 외부 API 호출 필요)
        simulated_metrics = [
            {"metric": "PII 마스킹 실패율", "value": 0.85, "risk_level": "High"}, # 고위험 가정
            {"metric": "규정 준수 기록 누락", "value": 0.62, "risk_level": "Medium"},
            {"metric": "데이터 무결성 점수", "value": 0.31, "risk_level": "Low"}
        ]

        # 2. 핵심 비즈니스 로직 실행 (Service Layer 호출)
        report = calculate_diagnosis(user_data, simulated_metrics)
        return report

    except Exception as e:
        # 모든 예외를 캐치하여 사용자에게는 모호하지만 전문적인 에러 메시지 제공
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"진단 프로세스 실행 중 구조적 오류가 발생했습니다. {str(e)}")


# ==============================================================
# 🛡️ 2. 결제 처리 (Paywall) Endpoint
# 보고서 ID + 금액 -> PG 연동 및 보험료 강제 결제
@app.post("/api/v1/payment/process", response_model=dict, status_code=status.HTTP_200_OK)
async def process_premium(request: PaymentRequest):
    """진단 보고서를 기반으로 유료 감사 및 보험료를 결제합니다."""
    try:
        # 1. 핵심 비즈니스 로직 실행 (Service Layer 호출)
        payment_result = process_payment(request)
        return payment_result

    except ConnectionError as e:
        # 환경 설정이나 외부 서비스 접속 문제 처리
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except RuntimeError as e:
        # 비즈니스 로직 위반 (예: 최소 금액 미달) 처리
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        # 모든 기타 에러 처리
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="결제 처리에 실패했습니다. 재시도하거나 관리자에게 문의하십시오.")

# (참고) 보고서 조회 엔드포인트는 인증/인가 로직이 추가되어야 합니다.
# @app.get("/api/v1/diagnosis/report/{user_id}")
# async def get_report(user_id: str): ...