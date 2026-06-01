from fastapi import APIRouter, HTTPException, status
# 🚨 절대 경로 사용: 이전 단계에서 생성한 서비스 파일을 임포트합니다.
from .risk_calculator_service import calculate_gold_premium, UserInput, LegalTrendData

router = APIRouter(prefix="/api", tags=["Liability Calculation"])


@router.post("/calculate_liability")
async def calculate_liability_endpoint(
    user_input: UserInput, 
    legal_data: LegalTrendData
):
    """
    미개방 책임 보험료 (P_gold)를 계산하고 JSON 형태로 반환하는 엔드포인트.
    사용자 입력과 법적 트렌드를 결합하여 의무 납부 금액을 확정합니다.
    """
    try:
        # 1. 서비스 레이어 호출 (Business Logic 실행)
        result = calculate_gold_premium(user_input, legal_data)
        return result

    except ValueError as e:
        # 비즈니스 로직 단계에서 정의된 오류를 처리합니다. (400 Bad Request)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception:
        # 예상치 못한 서버 레벨의 에러는 내부 500으로 처리하여 정보를 노출하지 않습니다.
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="서버 측 계산 오류가 발생했습니다. 관리자에게 문의하세요.")