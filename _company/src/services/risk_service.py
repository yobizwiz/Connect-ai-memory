import os
from typing import List
from pydantic import ValidationError
from src.schemas.models import UserInput, DiagnosisReport, PaymentRequest

# 환경 변수에서 PG 키를 읽는 함수 (보안 원칙 1)
def get_pg_api_key() -> str:
    """환경 변수에서 PG API Key를 로드합니다. 실패 시 예외 발생."""
    api_key = os.environ.get("PG_SANDBOX_KEY")
    if not api_key:
        raise EnvironmentError("🚨 Fatal Error: PG_SANDBOX_KEY가 환경 변수에 설정되지 않았습니다.")
    return api_key

# --- 1. QLoss 계산 및 진단 로직 (핵심 비즈니스) ---
def calculate_diagnosis(user_data: UserInput, risk_metrics: List[dict]) -> DiagnosisReport:
    """
    QLoss를 기반으로 종합적인 리스크 보고서를 생성합니다.
    @param user_data: 사용자 입력 정보
    @param risk_metrics: 수집된 개별 위험 지표 목록 (딕셔너리 형태)
    """
    print(f"⚙️ [Service] Diagnosis 시작: {user_data.user_id}님 분석 중...")
    
    # 가상의 QLoss 계산 로직 (구조적 무결성 확보를 위해 단순화)
    total_risk = sum(m['value'] for m in risk_metrics if isinstance(m, dict)) / len(risk_metrics)
    
    if total_risk > 0.7:
        assessment = "🚨 경고: 현재 귀하의 시스템은 치명적인 구조적 결함에 노출되어 있습니다. 즉각적인 '보험료(Premium)' 납부가 필수입니다."
    elif total_risk > 0.4:
        assessment = "⚠️ 주의: 중대한 취약점이 발견되었습니다. QLoss를 막기 위해 전문가의 개입이 필요합니다."
    else:
        assessment = "✅ 안정적이나, 최적화 기회를 놓치고 있습니다. 리스크 관리 포트폴리오 재점검을 권장합니다."

    # 보고서 생성 및 반환
    return DiagnosisReport(
        report_id=f"YOB-{user_data.user_id}-{datetime.datetime.now().strftime('%y%m%d')}",
        user_id=user_data.user_id,
        total_risk_score=round(total_risk, 4),
        overall_assessment=assessment,
        critical_issues=[{"metric": m['metric'], "description": f"위험 레벨 {m['risk_level']} 감지", "severity": total_risk * 100}]
    )

# --- 2. PG 결제 게이트웨이 통합 시뮬레이션 (핵심 트랜잭션) ---
def process_payment(request: PaymentRequest):
    """
    PG 연동을 시뮬레이션합니다. 실제 API 호출은 try/except로 감싸야 합니다.
    @param request: 사용자가 요청한 결제 정보 스키마
    """
    try:
        # 1. PG 키 로드 및 검증 (보안 원칙)
        pg_key = get_pg_api_key() 
        print(f"🔑 [Service] PG 인증 시도... Key Prefix: {pg_key[:5]}...")

        if request.amount_usd < 100:
             # 비즈니스 로직에 따른 강제 게이트키핑 예시 (Minimum Premium)
            raise ValueError("🚨 최소 보험료(Premium) 요구액은 $100 USD입니다. 낮은 금액으로는 분석을 진행할 수 없습니다.")

        # 2. PG API 호출 시뮬레이션 (실제로는 HTTP 요청 발생)
        print(f"💳 [Service] 결제 게이트웨이로 {request.amount_usd} USD 전송 요청...")
        
        # 성공적인 트랜잭션 가정 및 반환
        return {"transaction_id": f"TRX-{hash(str(request))}", "status": "SUCCESS", "premium_level": "Gold"}

    except EnvironmentError as e:
        # 환경 설정 오류 처리 (가장 심각한 에러)
        print(f"❌ [Service Error] 치명적인 백엔드 환경 오류 발생: {e}")
        raise ConnectionError("시스템 오류로 PG 서비스를 이용할 수 없습니다. 관리자에게 문의하십시오.")

    except ValueError as e:
        # 비즈니스 로직 오류 처리 (예: 최소 금액 미달)
        print(f"❌ [Service Error] 비즈니스 규칙 위반: {e}")
        raise RuntimeError(str(e))
    
    except Exception as e:
        # Catch-all 에러 핸들링
        print(f"❌ [Service Error] 예상치 못한 오류 발생: {type(e).__name__} - {e}")
        raise ConnectionError("외부 서비스 호출 중 알 수 없는 문제가 발생했습니다. 잠시 후 다시 시도하십시오.")