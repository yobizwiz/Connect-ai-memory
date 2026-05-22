from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field

# --- [1] 데이터 모델 정의 (Input & Output Schema) -----------------
class RiskAssessmentInput(BaseModel):
    """사용자로부터 받는 진단 요청 입력값의 스키마."""
    company_name: str = Field(..., description="진단 대상 회사 이름")
    industry: str = Field(..., description="주요 산업 분야 (예: 금융, 의료, 제조)")
    data_volume_tb: float = Field(..., gt=0, description="보유 데이터 총량 (테라바이트 단위)")
    compliance_focus: Optional[str] = Field("GDPR", description="현재 가장 신경 쓰는 규제 분야 (예: GDPR, CCPA, Quantum)")

class RiskReport(BaseModel):
    """API 응답으로 반환되는 구조화된 리스크 보고서."""
    overall_risk_score: float = Field(..., ge=0.0, le=10.0, description="총체적 위험 점수 (높을수록 위협).")
    risk_level: str = Field(..., enum=["Low", "Medium", "High", "Existential"], description="종합 리스크 등급.")
    summary_threat: str = Field(..., description="가장 시급하게 해결해야 할 핵심 위협 요약 (Fear Hook).")
    detailed_findings: Dict[str, Any] = Field(..., description="위험 요소별 세부 진단 결과. 예: {'Quantum': '위험합니다.', ...}")
    mitigation_roadmap: list[str] = Field(..., description="향후 12개월간의 필수 해결 로드맵 제안 (Solution).")

# --- [2] FastAPI 애플리케이션 초기화 및 API 엔드포인트 정의 -----------------
app = FastAPI(title="yobizwiz Risk Assessment API", version="v1.0")

@app.post("/api/v1/risk-assessment", response_model=RiskReport)
async def assess_risk(input: RiskAssessmentInput):
    """
    사용자 입력값을 받아 존재론적 리스크 점수를 계산하고 구조화된 보고서를 반환합니다.
    [근거: 💻 코다리 개인 메모리, sessions/2026-05-19T13:40]
    """
    # [진단 과정 시작] - 시스템 로딩 시뮬레이션 (실제로는 비동기 작업)
    print(f"--- Assessing risk for {input.company_name} in {input.industry}... ---")

    try:
        # 1. 유효성 검증 및 입력값 처리
        if input.data_volume_tb < 0:
            raise ValueError("데이터 볼륨은 음수일 수 없습니다.")

        # 2. 핵심 리스크 스코어링 로직 (Mock Calculation)
        score, findings = _calculate_composite_risk(input)

        # 3. 결과 보고서 구조화
        report = RiskReport(
            overall_risk_score=round(score, 2),
            risk_level=_determine_risk_level(score),
            summary_threat=f"경고: 귀사의 {input.compliance_focus} 준수 상태는 현재 시스템의 존속을 위협하는 수준입니다.",
            detailed_findings=findings,
            mitigation_roadmap=[
                "P0 (최우선): 법률 전문 파트너와의 즉각적인 진단 컨설팅 연동",
                "P1: 데이터 아키텍처 전면 재검토 및 마이그레이션 로드맵 수립",
                "P2: 내부 컴플라이언스 모니터링 시스템 구축"
            ]
        )

        return report

    except ValueError as e:
        # 클라이언트 입력값 오류 처리 (400 Bad Request)
        raise HTTPException(status_code=400, detail=f"입력 데이터 유효성 검증 실패: {e}")
    except Exception as e:
        # 서버 내부 로직 오류 처리 (500 Internal Server Error)
        print(f"Unhandled API Error: {e}")
        raise HTTPException(status_code=500, detail="시스템 분석 중 알 수 없는 오류가 발생했습니다. 관리자에게 문의하십시오.")


# --- [3] 핵심 비즈니스 로직 함수 (Mock Core Logic) -----------------

def _calculate_composite_risk(input: RiskAssessmentInput) -> tuple[float, Dict[str, str]]:
    """
    입력값을 기반으로 가상의 복합 리스크 점수를 계산하는 함수.
    이 부분이 Mock Data의 핵심입니다.
    """
    total_score = 0.0
    findings = {}

    # 1. 규제 준수 위협 (Compliance Threat) 로직 구현
    if input.compliance_focus == "Quantum":
        threat_score = 4.5 # 높은 가중치 부여
        findings["Quantum"] = "경고: 현재의 암호 체계는 양자 컴퓨팅 공격에 매우 취약합니다. 데이터가 전송되는 순간부터 위협받습니다."
    elif input.compliance_focus == "GDPR":
        threat_score = 2.5
        if input.data_volume_tb > 10:
             findings["GDPR"] = f"주의: {input.data_volume_tb}TB 이상의 데이터는 국경 간 전송 시 법적 리스크가 매우 높습니다."
        else:
            findings["GDPR"] = "현재 규제 준수 수준은 양호합니다. 다만, 내부 감사 기록(Audit Trail)의 투명성을 확보해야 합니다."
    else:
        threat_score = 1.0
        findings[input.compliance_focus] = f"[{input.compliance_focus}]: 기본 검사 통과. 지속적인 모니터링이 필요합니다."

    # 2. 데이터 볼륨 및 산업 특화 위협 (Data Volume & Industry Threat) 로직 구현
    volume_score = min(1.5, input.data_volume_tb / 30.0) # 볼륨에 따라 점수 증가 제한
    industry_factor = 1.0

    if "금융" in input.industry:
        industry_factor = 1.8
        findings["Industry"] = "경고: 금융 산업은 규제 변화의 속도가 가장 빠릅니다. 실시간 컴플라이언스 모니터링이 필수입니다."
    elif "공급망" in input.industry:
        industry_factor = 1.5
        findings["Industry"] = "주의: 공급망 데이터는 파편화되기 쉬우며, 지정학적 분열 리스크에 취약합니다."

    # 최종 점수 계산 및 가중치 적용
    total_score = (threat_score * industry_factor) + volume_score
    return total_score, findings


def _determine_risk_level(score: float) -> str:
    """점수에 따라 리스크 레벨을 결정합니다."""
    if score >= 8.0:
        return "Existential" # 존재론적 위협
    elif score >= 5.0:
        return "High"
    elif score >= 2.5:
        return "Medium"
    else:
        return "Low"

# --- [4] 테스트용 실행 스크립트 (Self-Test) -----------------
if __name__ == "__main__":
    import uvicorn
    print("==================================================")
    print("🚀 API 로컬 서버를 시작합니다. POST 요청으로 테스트하세요.")
    # 실제 사용 시에는 FastAPI run 명령어를 통해 실행됩니다.
    # 예시: uvicorn src.api.risk_assessment_service:app --reload
    # uvicorn.run(app, host="0.0.0.0", port=8000)