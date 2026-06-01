import json
from typing import Dict, Any, List, Optional

# 리스크 임계값 상수는 코드 최상단에 정의하여 관리 효율성 확보 (Config Principle)
RISK_THRESHOLD = 85

def load_risk_schema(schema_path: str) -> Optional[Dict[str, Any]]:
    """
    지정된 경로에서 규제 리스크 스키마를 안전하게 로드합니다.
    파일 부재 또는 JSON 파싱 오류 시 None을 반환하여 시스템 충돌 방지.
    """
    try:
        with open(schema_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"🚨 Error: Schema file not found at {schema_path}")
        return None
    except json.JSONDecodeError:
        print("🚨 Error: Invalid JSON format in the schema file.")
        return None

def calculate_total_lmax_score(input_data: Dict[str, float], risk_schema: Dict[str, Any]) -> Dict[str, Any]:
    """
    제공된 입력 데이터와 리스크 스키마를 기반으로 totalLMaxScore를 계산합니다.

    Args:
        input_data: 각 리스크 변수에 대한 실제 측정값 (예: 'hallucination_score': 8.5).
        risk_schema: KnowledgeBase/Regulatory_Risk_Input_Schema.json에서 로드된 스키마 구조.

    Returns:
        계산된 점수와 실패 플래그를 포함하는 딕셔너리.
    """
    if not risk_schema or 'risk_factors' not in risk_schema:
        raise ValueError("Invalid Risk Schema provided. Cannot calculate score.")

    total_score = 0.0
    weighted_contributions: List[Dict[str, float]] = []

    for factor in risk_schema['risk_factors']:
        factor_name = factor['regulatory_theme']
        impact_variables = factor.get('failure_scenario', {}).get('impact_variables', {})

        # 안전하게 변수와 가중치를 추출합니다 (KeyError 방지)
        try:
            for var_key, var_data in impact_variables.items():
                weighting_factor = var_data.get('weighting_factor')
                if weighting_factor is None:
                    print(f"Warning: Weighting factor missing for {var_key}. Skipping.")
                    continue

                # 🚨 Defensively Coding: 입력 데이터에 해당 키가 있는지 확인합니다.
                input_value = input_data.get(var_key)
                if input_value is None or not isinstance(input_value, (int, float)):
                    print(f"Warning: Input value missing or invalid for {var_key}. Using 0.")
                    contribution = 0.0
                else:
                    # 핵심 계산 로직: 점수 기여도 = 입력값 * 가중치
                    contribution = input_value * weighting_factor

                weighted_contributions.append({
                    "variable": var_key,
                    "input_value": float(input_value),
                    "weighting_factor": float(weighting_factor),
                    "contribution": contribution
                })
                total_score += contribution

        except Exception as e:
            # 예상치 못한 오류 발생 시 로직이 중단되지 않도록 로그만 남기고 진행합니다.
            print(f"Critical calculation error for factor {factor_name}: {e}")


    is_systemic_failure = total_score >= RISK_THRESHOLD

    return {
        "total_lmax_score": round(total_score, 2),
        "risk_threshold": RISK_THRESHOLD,
        "is_systemic_failure": is_systemic_failure,
        "details": weighted_contributions
    }

# ====================================================
# [MOCK API Wrapper Example - FastAPI Context]
# 실제 배포 시 이 함수를 FastAPI 엔드포인트에 바인딩하게 됩니다.
# ====================================================

async def run_lmax_api(input_data: Dict[str, float], schema_path: str) -> dict:
    """
    전체 프로세스를 묶어 실행하는 Mock API Wrapper입니다.
    """
    risk_schema = load_risk_schema(schema_path)

    if risk_schema is None:
        return {"error": "Initialization failed", "message": "Failed to load or parse the core risk schema."}

    try:
        result = calculate_total_lmax_score(input_data, risk_schema)
        return result
    except ValueError as e:
        # 논리적 오류 (예: 스키마 자체가 잘못된 경우) 처리
        return {"error": str(e), "message": "Calculation logic failed due to invalid schema structure."}
    except Exception as e:
        # 치명적인 시스템 에러 처리
        print(f"UNEXPECTED SYSTEM ERROR during LMax calculation: {e}")
        return {"error": "Internal Server Error", "message": "An unexpected error occurred on the server side. Check logs."}

if __name__ == "__main__":
    # 테스트 실행 예시 (실제 API 호출 흐름을 시뮬레이션)
    print("--- Running LMax Score Calculation Mockup ---")
    
    # 🚨 중요: 실제 JSON 스키마 파일의 절대 경로를 사용해야 합니다.
    SCHEMA_PATH = "KnowledgeBase/Regulatory_Risk_Input_Schema.json"
    
    # 테스트용 입력 데이터 (실제 측정값이 들어온다고 가정)
    mock_input = {
        'hallucination_score': 9.2, # 높은 리스크 값 설정
        'data_sovereignty_violation_count': 5,
        'operational_downtime_hours': 48
    }

    result = run_lmax_api(mock_input, SCHEMA_PATH)
    print("\n✅ FINAL CALCULATED RESULT:")
    print(json.dumps(result, indent=2))
    
    if result.get('is_systemic_failure'):
        print("\n🚨 SYSTEM ALERT: CRITICAL FAILURE DETECTED! User must upgrade immediately.")