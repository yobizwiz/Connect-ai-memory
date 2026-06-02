import os
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from typing import Dict, Any

# --- 1. 데이터 스키마 정의 (Pydantic Model) ---
class DiagnosisInput(BaseModel):
    """사용자로부터 입력받는 비즈니스 데이터를 구조화합니다."""
    company_industry: str = Field(..., description="회사 업종 (예: Healthcare, Finance)")
    employee_count: int = Field(..., gt=0, description="직원 수")
    data_pii_count: int = Field(..., ge=0, description="처리하는 PII 데이터 개수")
    compliance_gap_score: float = Field(..., ge=0.0, le=1.0, description="현재 규정 준수 격차 점수 (0.0~1.0)")

class DiagnosisResult(BaseModel):
    """API 성공 시 반환되는 구조화된 보고서 데이터."""
    total_risk_exposure_lmax: float = Field(..., description="최대 예상 손실액 (Lmax) - 공포 유발 핵심 지표.")
    required_compliance_steps: list[str] = Field(..., description="즉각적인 개선이 필요한 규정 목록.")
    diagnosis_report_url: str = Field(..., description="상세 진단 보고서 다운로드 링크 (Mock).")

# --- 2. 비즈니스 로직 및 수학적 모델링 ---

def calculate_lmax(input_data: DiagnosisInput) -> float:
    """
    Researcher가 정의한 Lmax 공식을 기반으로 총 위험 노출도를 계산합니다.
    Lmax = [(C_Reg * R_Exp) + (O_Op * E) + L_Lit] * (1 + S_Adj)
    
    주의: 이 함수는 가상의 계수를 사용하며, 실제 비즈니스 로직이 들어갈 자리입니다.
    """
    # --- 💡 Mocking Coefficients & Variables ---
    
    # C_Reg: 규제 벌금 기본 계수 (업종 기반 - 예시)
    C_REG = {
        "Healthcare": 500_000_000,  # 의료정보는 위험도가 높다고 가정
        "Finance": 300_000_000,
        "Tech": 100_000_000,
    }.get(input_data.company_industry, 50_000_000) # 기본값 설정

    # R_Exp: 규제 노출 계수 (입력된 Gap Score 사용)
    R_EXP = input_data.compliance_gap_score * 1.2
    
    # O_Op: 운영 손실 기본 계수 (데이터 PII 개수에 비례)
    O_OP = 50_000 * input_data.data_pii_count

    # E: 직원 수/데이터 복잡도 계수
    E = input_data.employee_count * 1500

    # L_Lit: 법적 리스크 (업종에 따른 기본값)
    L_LIT = C_REG * 0.2
    
    # S_Adj: 가중치 조정 계수 (복잡도에 비례)
    S_ADJ = input_data.compliance_gap_score * 0.5

    try:
        lmax = ((C_REG * R_EXP) + (O_OP * E) + L_LIT) * (1 + S_ADJ)
        return round(lmax, -2) # 최소 단위에서 반올림하여 정수로 만듦
    except Exception:
        # 계산 중 오류 발생 시 폴백 값 처리
        return 0.0

def generate_report_data(input_data: DiagnosisInput) -> tuple[list[str], str]:
    """진단 보고서의 부가 정보를 생성합니다."""
    steps = []
    if input_data.compliance_gap_score > 0.7:
        steps.append("1. 즉각적인 법적 문서화 감사(Audit Trail) 구축이 필수입니다.")
        steps.append("2. 데이터 접근 권한의 역할 기반 통제(RBAC)를 재설계해야 합니다.")
    elif input_data.employee_count > 50:
        steps.append("3. 팀별 워크플로우에 대한 전사적 규정 교육 프로그램 도입이 시급합니다.")
    else:
        steps.append("4. 기본적인 문서화 프로세스를 점검하여 위험 요소를 사전에 제거하세요.")
    
    report_url = f"/reports/diagnosis/{input_data.company_industry}_report"
    return steps, report_url

# --- 3. FastAPI Application Setup ---

app = FastAPI(title="Yobizwiz Diagnosis API")

@app.post("/api/v1/diagnosis", response_model=DiagnosisResult)
async def run_diagnosis(input: DiagnosisInput):
    """
    사용자 입력 데이터를 받아 Lmax를 계산하고 진단 보고서를 생성하는 핵심 엔드포인트.
    """
    print("--- 🧠 API Call Received ---")
    
    # [1] 필수 유효성 검증 (Guard Clauses)
    if input.company_industry not in ["Healthcare", "Finance", "Tech"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                            detail="지원하지 않는 업종입니다. 의료/금융/IT 중 선택해주세요.")

    # [2] 핵심 로직 실행 및 계산
    lmax = calculate_lmax(input)
    steps, report_url = generate_report_data(input)
    
    # [3] 결과 구조화 및 반환
    return DiagnosisResult(
        total_risk_exposure_lmax=lmax,
        required_compliance_steps=steps,
        diagnosis_report_url=report_url
    )

@app.get("/api/v1/status")
async def get_status():
    """API 서버 상태 확인용 (Health Check)."""
    return {"status": "operational", "version": "1.0"}
#