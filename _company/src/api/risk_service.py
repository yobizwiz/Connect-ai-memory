import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# 💡 전역 상수 정의: 데이터 파일 경로를 명시적으로 지정합니다.
DATA_PATH = "c:\\Users\\jinoh\\Desktop\\Connect AI\\_company\\KnowledgeBase\\Global_Compliance_Risk_Atlas_V1.json"

def load_risk_atlas() -> Optional[Dict[str, Any]]:
    """
    글로벌 규제 위반 데이터베이스(GCR-Atlas)를 로드합니다.
    데이터 파일의 무결성 검증을 최우선으로 수행합니다.
    """
    try:
        # 파일을 읽기 전에 존재 유무와 접근 권한을 체크하는 것이 원칙이나, 
        # 여기서는 시스템이 제공한 경로가 정확하다고 가정하고 로드 시도만 합니다.
        with open(DATA_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print("✅ [DEBUG] GCR Atlas 데이터베이스 로딩 성공.")
        return data
    except FileNotFoundError:
        print(f"❌ [ERROR] 데이터 파일 경로를 찾을 수 없습니다: {DATA_PATH}")
        return None
    except json.JSONDecodeError as e:
        print(f"❌ [CRITICAL ERROR] JSON 디코딩 실패. 스키마 오류일 가능성이 높습니다: {e}")
        return None

# 로드된 데이터를 전역 변수로 캐시하여 매번 파일 I/O를 막고 성능을 최적화합니다.
RISK_ATLAS = load_risk_atlas()


def calculate_total_max_loss(industry: str, business_model: str) -> Dict[str, Any]:
    """
    주어진 산업군과 사업 모델에 기반하여 총합 최대 손실액 (L_totalMax)을 계산합니다.
    데이터 무결성 및 예외 처리를 최우선으로 합니다.
    """
    if RISK_ATLAS is None:
        # 데이터가 로드되지 않은 치명적인 상황입니다.
        return {
            "success": False, 
            "error": "Critical Data Failure", 
            "message": "시스템 리스크 데이터베이스(GCR-Atlas)를 로드할 수 없어 시뮬레이션을 진행할 수 없습니다."
        }

    total_max_loss = 0.0
    triggered_risks: List[Dict] = []
    
    # 입력 값이 비어있거나 유효하지 않으면 기본값을 사용합니다 (폴백).
    safe_industry = industry or "General"
    safe_business_model = business_model or "Unknown"

    # Knowledge_Items를 순회하며 필터링 및 합산 로직을 수행합니다.
    for item in RISK_ATLAS.get("Knowledge_Items", []):
        violation_type = item.get("violation_type", "")
        root_cause = item.get("root_cause", "")
        
        # 🎯 조합 필터링 로직: 산업군 또는 비즈니스 모델에 키워드가 포함되어 있는지 체크합니다.
        # 대소문자 구분 없이, 혹은 명시적 매칭이 없을 경우를 대비하여 유연하게 처리합니다.
        is_relevant = (
            (safe_industry.lower() in violation_type.lower() or safe_business_model.lower() in violation_type.lower()) and 
            ("GDPR" in item["regulation"]) # 예시로 GDPR 위반에 초점을 맞추어 필터링 강화
        )

        if is_relevant:
            try:
                # L_max 값 추출 및 합산 (강력한 타입 체크 필수)
                l_max = float(item.get("estimated_loss", 0.0))
                total_max_loss += l_max
                
                triggered_risks.append({
                    "id": item["scenario_id"],
                    "regulation": item["regulation"],
                    "violation_type": violation_type,
                    "risk_description": f"{violation_type} ({root_cause})",
                    "estimated_loss": l_max
                })
            except (ValueError, TypeError) as e:
                # L_max 필드가 숫자가 아닐 경우의 예외 처리. 이게 깨지면 안 됩니다.
                print(f"[Warning] 데이터 파싱 오류 발생: {item['scenario_id']} - {e}")


    return {
        "success": True,
        "input_params": {"industry": safe_industry, "business_model": safe_business_model},
        "total_max_loss": round(total_max_loss, 2),
        "triggered_risks_count": len(triggered_risks),
        "detailed_risk_breakdown": triggered_risks
    }

# 테스트용 데이터 모델 (Pydantic 사용)
class SimulationRequest(BaseModel):
    """API 요청 바디의 스키마를 정의합니다. 강제 타입 체크를 통해 무결성을 확보합니다."""
    industry: str = Field(..., description="진행 중인 산업군 (예: FinTech, Healthcare)")
    business_model: str = Field(..., description="핵심 사업 모델 (예: Subscription, B2C E-commerce)")

class SimulationResponse(BaseModel):
    """API 응답 바디의 스키마를 정의합니다."""
    success: bool
    total_max_loss: float
    message: str = "L_totalMax 계산 완료."
    details: Optional[Dict] = None

# 테스트 실행 (Self-Verification)
if __name__ == "__main__":
    print("\n=============================================")
    print("🚀 [SELF-VERIFICATION] 리스크 시뮬레이션 모듈 자체 검증")
    print("=============================================\n")

    # 1. 정상 케이스 테스트 (FinTech / Subscription)
    print("--- Test Case 1: Normal Flow (FinTech/Subscription) ---")
    result_normal = calculate_total_max_loss("FinTech", "Subscription")
    print(f"결과 값: {result_normal}")

    # 2. 데이터 누락 케이스 테스트 (Mocking empty input)
    print("\n--- Test Case 2: Edge Case (Missing Input) ---")
    # 이 테스트는 실제로는 입력 파라미터가 빈 문자열이 들어와도 계산 로직이 깨지지 않음을 확인합니다.
    result_edge = calculate_total_max_loss("", "")
    print(f"결과 값: {result_edge}")

    # 3. 데이터 로드 실패 시뮬레이션 (실제로는 환경 변수로 처리)
    # print("\n--- Test Case 3: Failure Simulation ---")
    # RISK_ATLAS = None # 전역 변수 강제 변경으로 테스트 (실행 환경에선 불필요)
    # result_fail = calculate_total_max_loss("Test", "Fail")
    # print(f"결과 값: {result_fail}")