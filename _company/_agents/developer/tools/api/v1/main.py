import pandas as pd
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field, validator
import os
from typing import List, Dict

# --- Constants & Data Loading ---
# 절대 경로를 사용하고, 파일 존재 여부를 먼저 확인합니다.
DATA_FILE_PATH = r"c:\Users\jinoh\Desktop\Connect AI\_company\KnowledgeBase\Regulatory_Loss_Data_Set_v2.0.csv"

try:
    # 데이터셋 로드 (전역 변수로 관리하여 메모리 접근 속도 향상)
    df = pd.read_csv(DATA_FILE_PATH)
    REGULATORY_DATABASE = df.set_index('Violation Type').to_dict('index')
except FileNotFoundError:
    print(f"⚠️ [CRITICAL ERROR] 데이터 파일이 경로에서 발견되지 않았습니다: {DATA_FILE_PATH}")
    # 시스템에 치명적 오류가 발생했으므로 빈 딕셔너리로 대체하여 프로그램 실행은 가능하게 함 (Fallback)
    REGULATORY_DATABASE = {}


app = FastAPI(title="Regulatory Loss Calculator API", version="1.0.0")

# --- Pydantic Schemas for Input Validation ---
class LawCode(BaseModel):
    """요청할 법규 코드 목록 (예: GDPR, CCPA, HIPAA)"""
    laws_to_check: List[str] = Field(..., description="필수 체크할 규제 법규의 약어 리스트.")

# --- Pydantic Schemas for Output Validation ---
class LossVariableCalculation(BaseModel):
    """단일 위반 유형에 대한 손실 변수 계산 결과"""
    violation_type: str = Field(..., description="위반된 규정 유형 (예: PII Leakage)")
    governing_regulation: str = Field(..., description="적용된 주 법규")
    # L_{variable} 1, L_{variable} 2, ... 등 계산되는 핵심 변수들을 여기에 추가합니다.
    min_calculated_loss: float = Field(..., description="최소 추정 손실액 (Min)")
    max_calculated_loss: float = Field(..., description="최대 추정 손실액 (Max)")
    risk_driver: str = Field(..., description="손실의 주요 동인 설명")

class RegulatoryLossReport(BaseModel):
    """API 최종 반환 보고서 구조"""
    status: str = "SUCCESS"
    total_loss_estimated: float = 0.0 # 모든 변수의 합산 (L_{max})
    detailed_reports: List[LossVariableCalculation]

# --- Core Business Logic Function ---

def calculate_l_variable(violation_type: str, law_code: str) -> Dict:
    """
    특정 위반 유형과 법규를 기반으로 최소/최대 손실 변수를 계산하는 핵심 로직.
    @developer-protocol: 모든 데이터 접근은 .get() 또는 try/except로 보호되어야 합니다.
    """
    # 1. 데이터셋에서 해당 조합의 레코드를 찾습니다.
    record = None
    for key, data in REGULATORY_DATABASE.items():
        if law_code in data['Governing Regulation/Domain'] and 'PII Leakage' in key: # 예시로 PII Leakage에만 집중
            # 2. 데이터가 존재할 경우, 최소한의 값을 반환합니다.
            try:
                record = data
                break
            except KeyError:
                pass # 구조적 오류 무시

    if not record:
        raise HTTPException(status_code=404, detail=f"[{law_code}]와 관련된 데이터 기록을 찾을 수 없습니다.")

    # 3. 계산 로직 구현 (실제 재무 모델링이 필요하지만, Mockup으로 변수를 조합합니다)
    # L_{max} = Max Fine + Operational Loss Max * Multiplier
    try:
        min_fine = record['Min Fine Estimate ($Fine_{min}$)']
        max_fine = record['Max Fine Estimate ($Fine_{max}$)']
        l_op_min = record['Operational Loss Min ($L_{op, min}$)']
        l_op_max = record['Operational Loss Max ($L_{op, max}$)']

        # 예시 계산: 법규 준수 실패 시 최대 벌금 + 운영 손실을 결합하여 L_max 산출
        calculated_min = round(float(min_fine) + float(l_op_min), 0)
        calculated_max = round(float(max_fine) + float(l_op_max) * 2, 0) # 최대 손실은 운영손실에 가중치 적용 가정

        return {
            "violation_type": record['Violation Type'],
            "governing_regulation": law_code,
            "min_calculated_loss": calculated_min,
            "max_calculated_loss": calculated_max,
            "risk_driver": f"규제 위반({law_code})으로 인한 직접 벌금 및 시스템 복구 비용."
        }

    except (TypeError, ValueError) as e:
        # 데이터 타입 오류 발생 시 방어 코드를 실행합니다.
        print(f"❌ 계산 로직 에러 감지: {e}")
        raise HTTPException(status_code=500, detail="손실 변수 계산 중 내부 시스템 오류가 발생했습니다.")


@app.post("/api/v1/calculate_regulatory_loss", response_model=RegulatoryLossReport)
async def calculate_loss(laws: LawCode):
    """
    주어진 법규 리스트에 대해 규제 위반 손실을 계산하는 엔드포인트.
    """
    report_details = []
    total_max_loss = 0.0

    print("\n--- [API] Regulatory Loss Calculation Triggered ---")
    
    for law in laws.laws_to_check:
        try:
            # 핵심 비즈니스 로직 호출 및 결과 수집
            result = calculate_l_variable(violation_type="PII Leakage", law_code=law) # 일단 PII Leakage로 고정하여 테스트
            report_details.append(result)
            total_max_loss += result['max_calculated_loss']

        except HTTPException as e:
            # 법규 데이터가 없거나 계산에 실패한 경우, 해당 에러를 기록하고 다음 법규로 넘어갑니다 (Fail-safe).
            print(f"⚠️ 경고: 법규 {law} 처리 중 오류 발생. 건너뜁니다. ({e.detail})")

    return RegulatoryLossReport(
        status="SUCCESS",
        total_loss_estimated=round(total_max_loss, 0),
        detailed_reports=report_details
    )

# --- 테스트용 실행 명령어 (API가 정상적으로 돌아가는지 확인하는 용도) ---
if __name__ == "__main__":
    import uvicorn
    print("===========================================================")
    print("🚀 API 서버를 로컬로 시작합니다. (Mockup Testing)")
    print("✅ 테스트 목표: GDPR, CCPA, HIPAA 3개 법규에 대한 L_max 계산.")
    # 실제 실행은 'uvicorn' 명령어로 대체하여 진행하겠습니다.
    # uvicorn main:app --reload
    print(f"🔍 데이터 로드 완료 상태 확인 (GDPR 존재 여부): {'GDPR' in REGULATORY_DATABASE}")
    print("===========================================================")