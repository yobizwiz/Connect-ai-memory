import pytest
from src.risk_service.risk_calculator_service import calculate_gold_premium, UserInput, LegalTrendData
import math

# --- 테스트 케이스 1: 성공적인 정상 계산 (Happy Path) ---
def test_successful_calculation():
    """일반적인 데이터로 P_gold가 MIN_COMPLIANCE_COST보다 높게 계산되는지 확인."""
    user = UserInput(
        user_dataset_score=8.0, 
        violation_count=3, 
        jurisdiction_type="GDPR" # GDPR은 가중치 0.5 적용 가정
    )
    legal = LegalTrendData(
        current_fine_average=15000.0, 
        risk_trend_factor=1.2
    )
    # Expected Calculation: TRE = (8.0 * 3) + 0.5 = 24.5
    # Potential P_gold = ceil(0.8 * 1.2 * 24.5) = ceil(23.52) = 24 (-> 이 예시 계산은 너무 작음. 임계치 초과를 유도하는 데이터로 재설정.)

    # 재설정: P_gold가 MIN_COMPLIANCE_COST(5000)보다 크도록 데이터를 조정합니다.
    user = UserInput(user_dataset_score=120.0, violation_count=5, jurisdiction_type="GDPR") # 높은 점수 사용
    legal = LegalTrendData(current_fine_average=30000.0, risk_trend_factor=1.5)

    # Expected Calculation: TRE = (120 * 5) + 0.5 = 600.5
    # Potential P_gold = ceil(0.8 * 1.5 * 600.5) = ceil(720.6) = 721
    # Final P_gold = max(5000, 721) = 5000 (이 경우 Min Cost가 더 크게 나옴)

    # 최종 목표: 계산 결과가 MIN_COMPLIANCE_COST를 초과하게 만듭니다.
    user = UserInput(user_dataset_score=900.0, violation_count=10, jurisdiction_type="GDPR") 
    legal = LegalTrendData(current_fine_average=50000.0, risk_trend_factor=2.0)

    # Expected Calculation: TRE = (900 * 10) + 0.5 = 9000.5
    # Potential P_gold = ceil(0.8 * 2.0 * 9000.5) = ceil(14400.8) = 14401
    expected_p_gold = 14401
    
    result = calculate_gold_premium(user, legal)
    assert result["status"] == "success"
    assert result["calculated_premium_usd"] == float(expected_p_gold)

# --- 테스트 케이스 2: Min Cost가 우선하는 경우 (Floor Check) ---
def test_min_cost_floor():
    """계산된 잠재적 프리미엄이 MIN_COMPLIANCE_COST보다 작을 때, 최소 금액이 적용되는지 확인."""
    user = UserInput(user_dataset_score=1.0, violation_count=1, jurisdiction_type="CCPA") 
    legal = LegalTrendData(current_fine_average=1000.0, risk_trend_factor=0.5)

    # Expected Calculation: TRE = (1 * 1) + 0.3 = 1.3
    # Potential P_gold = ceil(0.8 * 0.5 * 1.3) = ceil(0.52) = 1
    expected_p_gold = 5000 # Min Cost가 승리해야 함

    result = calculate_gold_premium(user, legal)
    assert result["status"] == "success"
    # Pydantic 모델의 강한 타입 체크와 min cost 로직을 모두 검증합니다.
    assert result["calculated_premium_usd"] == float(expected_p_gold)


# --- 테스트 케이스 3: 유효성 검사 실패 (Bad Input Test - Missing Data) ---
def test_invalid_input_handling():
    """필수 입력 변수가 누락되었을 때, ValueError를 발생시키는지 확인."""
    with pytest.raises(ValueError):
        # user_dataset_score를 의도적으로 생략하여 Pydantic Validation 에러 유발
        dummy_user = UserInput(user_dataset_score=None, violation_count=1, jurisdiction_type="GDPR") 
        legal = LegalTrendData(current_fine_average=1000.0, risk_trend_factor=1.0)
        calculate_gold_premium(dummy_user, legal)

# --- 테스트 케이스 4: 외부 데이터 오류 처리 (Extreme Edge Case Test) ---
def test_extreme_edge_case():
    """데이터가 비정상적으로 큰 값을 가질 때도 시스템이 무너지지 않고 안정적인 결과를 내는지 확인."""
    user = UserInput(user_dataset_score=1e6, violation_count=1000, jurisdiction_type="GDPR") # 매우 큰 값
    legal = LegalTrendData(current_fine_average=999e3, risk_trend_factor=5.0)

    # 계산은 여전히 float/int 타입 처리의 안정성을 보여야 합니다.
    result = calculate_gold_premium(user, legal)
    assert result["status"] == "success"
    # 값이 매우 커지더라도 max()와 ceil() 로직이 정상적으로 동작하는지 확인합니다.
    assert result["calculated_premium_usd"] > 1e6 # 충분히 큰 값을 기대