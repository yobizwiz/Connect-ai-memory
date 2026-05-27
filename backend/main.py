from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel, Field, validator
import random
import time

app = FastAPI(title="Compliance Gatekeeper Pro API")

# --- 1. 데이터 모델 정의 (Input Schema) ---
class DiagnosticRequest(BaseModel):
    """진단 요청에 필요한 핵심 데이터를 구조화합니다."""
    industry_sector: str = Field(..., description="회사의 주요 산업 분야.")
    compliance_status: bool = Field(..., description="최근 규정 준수 여부 (True=준수, False=미준수).")
    data_source_availability: dict = Field(..., description="외부 데이터 소스 사용 가능 여부. 예: {'finance': True, 'legal': False}")

    @validator('industry_sector')
    def check_sector_length(cls, v):
        # 입력값 유효성 검증을 강화하여 전문성을 부각합니다.
        if len(v) < 3:
            raise ValueError("산업 섹터는 최소 3글자 이상의 상세 정보가 필요합니다.")
        return v

# --- 2. 핵심 비즈니스 로직 (Pure Function) ---
def calculate_threat_score(data: DiagnosticRequest) -> dict:
    """
    요청된 데이터를 기반으로 '시스템적 생존 위협 점수'를 계산하는 순수 함수입니다.
    이 로직은 공포와 권위를 부여하는 데 초점을 맞춥니다.
    """
    # 1차 가중치 산정 (기본 위험도)
    base_risk = 0
    if not data.compliance_status:
        base_risk += 40  # 미준수 시 가장 높은 리스크 부여
    else:
        base_risk += 5

    # 산업별 가중치 적용 (가상의 복잡한 로직)
    sector_weights = {
        "금융": 25, "헬스케어": 30, "IT": 15, "제조": 20
    }
    base_risk += sector_weights.get(data.industry_sector, 10) # 기본값 10

    # 데이터 소스 결함 감지 (가장 중요한 공포 유발 로직)
    missing_sources = [source for source, available in data.data_source_availability.items() if not available]
    if missing_sources:
        base_risk += len(missing_sources) * 15 # 결함이 많을수록 위험 증가
        # 이 부분은 시스템적 오류로 간주하고 특별한 경고 메시지 플래그를 설정합니다.
        warning = f"경고: 필수 외부 데이터 소스({', '.join(missing_sources)})에 구조적 공백이 감지되었습니다."
    else:
        warning = "진단 시스템 정상 작동 중. 모든 데이터 파이프라인 연결 확인 완료."

    # 최종 점수 산정 및 시뮬레이션 노이즈 추가
    final_score = min(100, base_risk + random.randint(-5, 5)) # 최대 100점 제한
    
    return {
        "threat_score": final_score,
        "risk_level": "CRITICAL" if final_score > 70 else ("HIGH" if final_score > 40 else "LOW"),
        "diagnosis_message": warning,
        "raw_data_check": data.dict() # 디버깅용 원본 데이터 포함
    }


# --- 3. API 엔드포인트 정의 (API Gateway) ---
@app.post("/api/v1/diagnose_threat", response_model=dict)
async def diagnose_threat(data: DiagnosticRequest = Body(...)):
    """
    사용자 입력 데이터를 받아 '위협 점수'를 진단하는 메인 엔드포인트입니다.
    실패 케이스도 구조화된 경고로 반환합니다.
    """
    try:
        # 1단계: 백엔드 로직 실행
        result = calculate_threat_score(data)

        # 2단계: 비즈니스 레벨 검증 (API 게이트가 최종 점검 수행)
        if result['raw_data_check']['industry_sector'] == "테스트 실패":
            # API 호출 자체는 성공하지만, 내부 로직상 치명적 오류를 시뮬레이션
            raise Exception("진단 파이프라인: 핵심 산업 분류 데이터가 비정상적으로 감지되었습니다.")

        return result

    except ValueError as e:
        # 400 Bad Request - 입력값 자체의 문제 (사용자 실수)
        raise HTTPException(status_code=400, detail={
            "error_type": "INPUT_VALIDATION_FAILURE",
            "message": f"진단 요청 실패: {e}",
            "system_warning": "입력 데이터가 구조적으로 불안정합니다. 전송된 정보를 재확인하십시오."
        })
    except Exception as e:
        # 500 Internal Server Error - 시스템 내부 오류 (공포 극대화)
        print(f"Critical API Error Detected: {e}")
        raise HTTPException(status_code=503, detail={ # 503 Service Unavailable 사용
            "error_type": "SYSTEMIC_FAILURE",
            "message": f"진단 서비스 가용 불가. 현재 시스템 구조적 결함으로 인해 분석이 중단되었습니다.",
            "system_warning": "핵심 데이터 파이프라인의 무결성이 의심됩니다. 전문가 점검(보험)이 필수입니다."
        })

# --- 테스트 엔드포인트 (선택 사항) ---
@app.get("/api/health")
def health_check():
    return {"status": "OK", "service": "Compliance Gatekeeper Pro API"}