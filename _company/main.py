from fastapi import FastAPI, HTTPException
from api.schemas.user_input import RiskInput
from api.services.risk_calculator import calculate_lmax, format_lmax_to_usd, format_top_risks
from pydantic import ValidationError

app = FastAPI(title="Yobizwiz LMAX Calculation Engine", version="1.0")

@app.post("/api/calculate-lmax")
async def calculate_total_lmax(input: RiskInput):
    """
    사용자 데이터를 기반으로 최대 잠재적 손실액(L_totalMax)을 계산합니다.
    이 엔드포인트는 C-Level 의사결정을 강제하는 핵심 엔진입니다.
    """
    try:
        # 1. 리스크 계산 실행 (Core Business Logic)
        lmax_raw, top_3_risks = calculate_lmax(input)

        # 2. 결과 포맷팅 및 가드 처리
        final_lmax_formatted = format_lmax_to_usd(lmax_raw)
        top_3_formatted = format_top_risks(top_3_risks)

        return {
            "success": True,
            "calculation_timestamp": "System Time Placeholder", # 실제로는 datetime.now() 사용
            "L_totalMax": final_lmax_formatted,
            "risk_summary": top_3_formatted,
            "message": "최대 잠재적 손실액 계산 완료. 즉각적인 시스템 개선이 필요합니다."
        }

    except ValidationError as e:
        # Pydantic 유효성 검사 실패 처리 (가장 흔한 실수)
        raise HTTPException(status_code=422, detail=f"입력 데이터 스키마 오류: {e.errors()}")
    except Exception as e:
        # 예상치 못한 시스템 에러 처리 (최종 방어벽)
        print(f"CRITICAL ERROR in LMAX calculation: {str(e)}")
        raise HTTPException(status_code=500, detail="Lmax 계산 엔진에서 치명적인 오류가 발생했습니다. 재시도하거나 관리자에게 문의하세요.")

# 테스트용 명령어 제공 (사용자가 로컬에서 실행할 수 있도록)
print("\n===========================================================")
print("✅ API 스켈레톤 배포 완료: api/main.py")
print("설치 및 실행 방법:")
print("1. pip install fastapi uvicorn pydantic")
print("2. uvicorn main:app --reload")
print("3. 테스트 URL: http://127.0.0.1:8000/docs (Swagger UI)")
print("===========================================================\n")