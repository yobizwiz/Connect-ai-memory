from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List
import json
import hashlib

# ===============================================================
# 🛡️ 데이터 모델 정의 (Pydantic Schema)
# ===============================================================

class CustomerData(BaseModel):
    """가상의 고객 데이터를 구조화합니다. 시스템이 검증할 원본 입력값입니다."""
    customer_id: str = Field(description="고유한 식별자.")
    ai_report_source: str | None = Field(default=None, description="AI 보고서의 출처 (Provenance).")
    data_masking_used: bool = Field(default=False, description="PII 마스킹 처리가 되었는지 여부.")
    audit_trail_exists: bool = Field(default=False, description="감사 로그 기록이 존재하는지 여부.")
    decision_context: str | None = Field(default=None, description="결정이 내려진 구체적 맥락 (Audit Context).")

class LmaxResult(BaseModel):
    """API의 최종 구조화된 출력값입니다. 불확실성을 제거한 절대적인 지표여야 합니다."""
    risk_score: float = Field(description="종합 위험 점수 (0~100점). 높을수록 즉각적 조치 필요.")
    major_violation: str = Field(description="가장 심각하게 위반된 규정 및 프로세스 공백 이름.")
    recommendation: str = Field(description="위험 감소를 위한 필수적인 해결책 (Mandate Tone).")

# ===============================================================
# ⚙️ 핵심 로직 구현: $L_{max}$ 계산 엔진
# ===============================================================

def calculate_lmax_score(data: CustomerData) -> tuple[float, str]:
    """
    입력된 고객 데이터를 바탕으로 프로세스 공백을 검증하고 Lmax 점수를 산출합니다.
    이 함수는 단일 책임 원칙(SRP)에 따라 리스크 계산만 전담합니다.
    """
    
    violation_scores = []
    major_violation_name = "No Major Violation Detected"
    
    # 1. Provenance Gap 검증 (EU AI Act, Transparency Mandates)
    if not data.ai_report_source or len(data.ai_report_source) < 5:
        violation_scores.append({"name": "Provenance Gap", "score": 30, "basis": "AI 출처 추적 불가"})
        major_violation_name = "Provenence Gap (EU AI Act)"

    # 2. De-identification Validation Gap 검증 (GDPR Article 25)
    if not data.data_masking_used:
        violation_scores.append({"name": "De-identification Validation Gap", "score": 25, "basis": "PII 재식별 위험성 미검증"})
        # 이전 위반보다 점수가 낮다면 교체하지 않음 (가장 높은 리스크만 강조)
        if not major_violation_name.startswith("Provenence"): # Provenance Gap이 더 심각하다고 가정
             major_violation_name = "De-identification Validation Gap (GDPR Article 25)"

    # 3. Audit Trail Completeness Gap 검증 (Compliance Drift)
    if not data.audit_trail_exists:
        violation_scores.append({"name": "Audit Trail Completion Gap", "score": 20, "basis": "감사 기록의 연속성 및 무결성 결여"})
        # 현재 major violation이 더 낮은 경우에만 업데이트 (예: Provenance가 이미 가장 높음)
        if not major_violation_name.startswith("Provenence") and 20 > max([s['score'] for s in violation_scores]):
            major_violation_name = "Audit Trail Completion Gap"

    # 4. Decision Context Gap 검증 (Operational Process Gap)
    if not data.decision_context:
        violation_scores.append({"name": "Decision Context Gap", "score": 15, "basis": "의사결정의 근거 맥락 부족"})


    # 최종 점수 합산 및 최대 위반점 결정
    total_score = sum(item['score'] for item in violation_scores)
    
    if not violation_scores:
        return 0.0, "Compliant"

    # 가장 높은 점수를 가진 항목을 최종 Major Violation으로 확정 (이 로직이 핵심입니다.)
    final_major = max(violation_scores, key=lambda x: x['score'])
    if final_major['score'] > 20 and major_violation_name != final_major['name']:
        major_violation_name = final_major['name']
    else:
         major_violation_name = final_major['name']

    return round(total_score, 2), major_violation_name


# ===============================================================
# 🌐 FastAPI App Setup
# ===============================================================

app = FastAPI(title="Lmax Risk Assessment API")

@app.post("/api/v1/lmax-assessment", response_model=LmaxResult)
async def assess_lmax_risk(data: CustomerData):
    """
    클라이언트가 제출한 고객 데이터를 기반으로 Lmax 위험 점수를 계산하고, 
    필수적인 규정 위반 및 권고 사항을 반환합니다.
    """
    try:
        # 리스크 스코어와 가장 큰 위반점을 계산합니다.
        score, violation = calculate_lmax_score(data)

        if score == 0.0 and violation == "Compliant":
            return LmaxResult(risk_score=0.0, major_violation="No Major Violation Detected", recommendation="현재 프로세스 흐름은 법규 요건을 충족합니다. 그러나 지속적인 감사 기록 유지가 필수적입니다.")

        # 권고 사항 생성 (Mandate Tone 적용)
        recommendation = f"⚠️ [필수 조치] 즉시 {violation}에 대한 원인 분석 및 보강이 필요합니다. 내부 프로세스 점검을 통해 최소 3가지 이상의 감사 추적(Audit Trail) 요소를 추가하십시오."

        return LmaxResult(
            risk_score=score,
            major_violation=violation,
            recommendation=recommendation
        )

    except Exception as e:
        # 모든 외부 입력은 예외 처리가 필수입니다. (Defensive Coding Principle)
        print(f"🚨 Critical API Error during Lmax calculation: {e}")
        raise HTTPException(status_code=500, detail="Lmax 계산 엔진 내부 오류 발생. 데이터를 점검해 주십시오.")

# ===============================================================
# 🧪 테스트용 데이터 및 엔드포인트 안내
# ===============================================================
print("✅ API 초기화 완료. 다음 단계는 로컬 환경에서 테스트를 실행하는 것입니다.")