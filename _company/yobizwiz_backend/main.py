from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from typing import Dict, Any
from .services.risk_engine import RiskEngineService
from .services.audit_ledger import AuditLedgerService
from .models import AuditLogCreate, AuditLogResponse, VerificationResult

app = FastAPI(title="Yobizwiz Risk Engine API", version="1.0")
risk_service = RiskEngineService() # Singleton instance for consistency
audit_service = AuditLedgerService() # Singleton instance for Audit Logs

# -----------------------------------------------------
# Endpoint 1: GET /api/calculate_risk - 실시간 리스크 점수 계산 및 진단
# -----------------------------------------------------
@app.get("/api/calculate_risk", response_model=Dict[str, Any], summary="실시간 규제 기반 위험 노출도(TRE) 계산")
async def calculate_risk(user_data: dict = Body(..., embed=True)):
    """
    사용자 입력 데이터를 받아 GDPR, CCPA, HIPAA 등 주요 규제별 리스크 점수를 실시간으로 계산합니다.
    이 함수는 시스템의 핵심 지표인 총 위험 노출도(TRE)를 산출하는 역할을 합니다.
    """
    try:
        # 1. 데이터 유효성 검증 (가드 로직)
        if not user_data or "user_profile" not in user_data:
            raise ValueError("필수 사용자 프로필 데이터를 제공해주세요.")

        user_profile = user_data["user_profile"]
        user_id = user_profile.get("user_id", "ANONYMOUS")

        # 2. 리스크 엔진 호출 및 결과 받기
        results = risk_service.calculate_risk(user_profile)

        # [연동] B2B 감사 로그 원장에 진단 실행 기록 무결하게 자동 적재
        try:
            audit_service.append_log(
                user_id=user_id,
                action="DIAGNOSIS",
                details={
                    "total_risk_exposure": results.get("total_risk_exposure"),
                    "violation_count": results.get("violation_count"),
                    "risk_scores_summary": [
                        {"regulation": r.get("regulation"), "score": r.get("score")}
                        for r in results.get("risk_scores", [])
                    ]
                }
            )
        except Exception as audit_err:
            print(f"Failed to append diagnosis to audit ledger: {audit_err}")

        return {
            "status": "SUCCESS",
            "message": "규제 기반 위험 진단이 완료되었습니다.",
            "risk_metrics": results
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Internal Server Error during risk calculation: {e}")
        raise HTTPException(status_code=500, detail="시스템 오류로 리스크 계산을 수행할 수 없습니다.")


# -----------------------------------------------------
# Endpoint 2: POST /api/diagnosis_request - 진단 요청 및 구매 유도 로직
# -----------------------------------------------------
@app.post("/api/diagnosis_request", summary="진단 결과를 바탕으로 솔루션 구매 여부 결정 (Paywall Trigger)")
async def request_diagnosis(data: dict = Body(...)):
    """
    클라이언트가 계산된 리스크 점수를 보내 진단 요청을 합니다. 
    리스크 등급이 'Critical'일 경우에만, 다음 단계인 유료 솔루션 구매 모달로의 진입을 트리거합니다.
    """
    try:
        risk_score = data.get("tre_score")
        violation_count = data.get("violation_count")

        if risk_score is None or violation_count is None:
            raise ValueError("진단 요청을 위해 'tre_score'와 'violation_count'가 모두 필요합니다.")
        
        # 2. 핵심 비즈니스 로직 (Paywall 트리거)
        if risk_score > 75 and violation_count >= 1: 
            return {
                "status": "CRITICAL",
                "message": "🚨 경고! 시스템적 생존 위험도가 매우 높습니다. 즉각적인 전문 진단이 필요합니다.",
                "action": "TRIGGER_PAYWALL", 
                "payload": {"recommended_product": "Survival Insurance Plan"}
            }
        else:
            return {
                "status": "LOW_RISK",
                "message": "현재 리스크 레벨은 관리 가능한 수준입니다. 다음 검토를 권장합니다.",
                "action": "CONTINUE_FREE_TRIAL"
            }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# -----------------------------------------------------
# Endpoint 3: POST /api/audit/logs - 신규 감사 로그 기록 추가
# -----------------------------------------------------
@app.post("/api/audit/logs", response_model=AuditLogResponse, summary="위변조 방지 원장에 감사 로그 기록")
async def add_audit_log(payload: AuditLogCreate = Body(...)):
    """
    행위(DIAGNOSIS, PAYMENT 등)와 상세 내역을 받아 Immutable 감사 원장에 추가합니다.
    """
    try:
        new_block = audit_service.append_log(
            user_id=payload.user_id,
            action=payload.action,
            details=payload.details
        )
        return new_block
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error appending log: {e}")
        raise HTTPException(status_code=500, detail="감사 원장 기록 실패")


# -----------------------------------------------------
# Endpoint 4: GET /api/audit/verify - 감사 원장 체인 검증
# -----------------------------------------------------
@app.get("/api/audit/verify", response_model=VerificationResult, summary="감사 원장 전체의 무결성 및 위변조 여부 검증")
async def verify_audit_ledger():
    """
    현재까지 원장에 기록된 전체 해시체인의 일관성과 불변성을 전수 검사합니다.
    """
    try:
        is_valid = audit_service.verify_chain()
        msg = "감사 원장 해시체인이 안전하며, 데이터 무결성이 완벽하게 증명되었습니다." if is_valid else "[경고] 감사 원장에서 위변조 또는 끊어진 해시체인이 감지되었습니다!"
        return {
            "is_valid": is_valid,
            "message": msg
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"원장 검증 수행 중 시스템 오류: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)