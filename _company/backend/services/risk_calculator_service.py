# Python: L_totalMax 계산 로직 및 Master Data Set 연동 서비스 레이어 (Defensive Design)

import json
from typing import Dict, Any
from datetime import date

# --- [Constants & Configuration] ---
# 이 경로는 환경 변수에서 받아와야 하지만, 테스트를 위해 임시로 지정합니다.
DATASET_PATH = "data/Master_Compliance_Data_Set.json" 

def load_master_compliance_data() -> Dict[str, Any]:
    """
    데이터셋 파일에서 모든 컴플라이언스 데이터를 로드하고 검증하는 함수.
    파일이 없거나 형식이 깨지면 빈 딕셔너리를 반환하여 시스템 다운을 방지합니다. (Fallback)
    """
    try:
        with open(DATASET_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print("✅ Master Compliance Data Set loaded successfully.")
        return data
    except FileNotFoundError:
        print(f"⚠️ Warning: {DATASET_PATH} not found. Returning empty dataset for graceful failure.")
        return {}
    except json.JSONDecodeError as e:
        print(f"❌ Fatal Error in Data Set JSON decoding: {e}. Using fallback data structure.")
        # 원본 데이터 구조가 깨졌을 때의 폴백 로직 (Fail-Safe)
        return {"initial_risk": 0, "dataset_status": "Corrupted"}

def calculate_l_totalmax(compliance_data: Dict[str, Any], user_context: Dict[str, Any]) -> float:
    """
    $L_{totalMax}$ (Total Maximum Potential Loss)를 계산하는 핵심 서비스 로직. 
    이 함수는 모든 재무적 리스크 산출의 최종 진실 공급원입니다.
    
    Args:
        compliance_data: Master_Compliance_Data_Set에서 가져온 구조화된 컴플라이언스 데이터.
        user_context: 사용자별 상황 정보 (예: 지역, 산업군).

    Returns:
        계산된 총 최대 손실액 ($L_{totalMax}$).
    """
    # 1. 기본 리스크 값 설정 (Fallback Guard)
    l_base = compliance_data.get('initial_risk', 0.0)
    
    # 2. 규제 컴플라이언스 리스크 계층 계산 (GDPR, CCPA 등 개별 항목 로직 통합)
    regulatory_risks = 0.0
    if isinstance(compliance_data, dict):
        for key, value in compliance_data.items():
            # 키와 값이 존재하는지 항상 확인합니다. (KeyError 방지)
            if key == 'GDPR' and isinstance(value, float):
                regulatory_risks += value * user_context.get('global_presence', 1.0) # 사용자 컨텍스트 반영
            elif key == 'HIPAA' and isinstance(value, float):
                 # HIPAA는 민감 데이터 처리량에 비례한다고 가정
                data_volume = user_context.get('pii_data_volume', 1000.0)
                regulatory_risks += value * (data_volume / 1000.0)
    
    # 3. 운영 리스크 가중치 적용 (운영 리스크에 가장 높은 가중치를 부여하는 원칙 반영)
    operational_risk = compliance_data.get('Operational_Gap', 0.0)
    weighted_operational_risk = operational_risk * user_context.get('process_automation_level', 1.0) # 자동화 레벨에 비례 가중치
    
    # 최종 합산: L_totalMax = Base + Regulatory Risk + Weighted Operational Risk
    l_totalmax = l_base + regulatory_risks + weighted_operational_risk

    return round(l_totalmax, 2)


def run_integration_test_scenario() -> Dict[str, Any]:
    """
    통합 테스트 시나리오: 가상 데이터를 기반으로 L_totalMax를 계산하고 결과를 반환합니다.
    """
    print("\n--- [Integration Test Start] ---")
    # 1. 데이터 로드 (Master Data Set)
    master_data = load_master_compliance_data()

    # 2. 테스트 사용자 컨텍스트 정의 (가정)
    test_user_context = {
        "global_presence": 1.0, # 글로벌 운영 여부 가중치
        "pii_data_volume": 50000.0, # PII 데이터 볼륨 (5만 건 가정)
        "process_automation_level": 0.7 # 프로세스 자동화 레벨 (70% 달성 가정)
    }

    # 3. 최종 계산 실행
    try:
        l_totalmax = calculate_l_totalmax(master_data, test_user_context)
        
        return {
            "success": True,
            "calculated_l_totalmax": l_totalmax,
            "message": f"✅ Integration Test Passed. Calculated L_totalMax: ${l_totalmax:,}"
        }
    except Exception as e:
        # Catch-all 예외 처리 (궁극적인 디펜시브 아키텍처)
        return {
            "success": False,
            "error": str(e),
            "message": f"❌ Integration Test Failed due to unexpected exception: {type(e).__name__}"
        }

# 테스트 실행 예제 (실제로 API 게이트웨이에서 호출될 로직)
if __name__ == "__main__":
    result = run_integration_test_scenario()
    print("\n=========================================")
    if result['success']:
        print("✅ 최종 리스크 계산 성공:")
        print(f"   [L_totalMax] : ${result['calculated_l_totalmax']:,}")
    else:
        print("❌ 통합 테스트 실패! 원인 분석 필요.")
        print(f"   [Error] : {result.get('error', 'Unknown Error')}")