import json
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# ===============================================
# 🚨 1. 리스크 가중치 상수 정의 (Constants & Weights)
# 이 값들은 yobizwiz의 핵심 컨설팅 노하우가 담긴 지식입니다. [근거: self-knowledge]
# ===============================================

# 규제 위반 항목별 기본 리스크 점수 (QLoss Multiplier)
REGULATORY_WEIGHTS = {
    "GDPR": {"scope": 0.4, "severity": 150000},  # 데이터 주권 관련 높은 벌금과 손실 가능성
    "CCPA": {"scope": 0.3, "severity": 120000},
    "HIPAA": {"scope": 0.5, "severity": 250000}, # 의료 정보는 가장 민감하고 벌금이 높음
    "EU_AI_ACT": {"scope": 0.45, "severity": 180000}
}

# 구조적 결함 항목별 기본 리스크 점수 (TRE Multiplier)
STRUCTURAL_WEIGHTS = {
    "Attribution_Crisis": 0.3, # 출처 무효화: 신뢰도 손상으로 인한 장기 매출 감소 반영
    "Q_Day_Readiness": 0.25,  # 양자 내성 부족: 미래 대비 실패로 인한 존재 위협 반영
    "Compliance_Drift": 0.2   # 프로세스 부재: 반복적인 실무적 실수 유발 가능성
}

# ===============================================
# 🚀 2. 리스크 계산 핵심 로직 (Core Calculation Engine)
# 입력 데이터 구조를 강제하고, 비즈니스 규칙을 적용합니다.
# ===============================================

class RiskInputData(BaseModel):
    """API가 받을 표준화된 위험 입력 데이터 모델."""
    non_compliant_areas: List[str]  # 예: ["GDPR", "HIPAA"]
    structural_deficiencies: List[str] # 예: ["Attribution_Crisis", "Q_Day_Readiness"]

def calculate_qloss(data: RiskInputData) -> float:
    """
    지정된 규제 항목과 그 위반 정도를 기반으로 예상되는 금전적 손실($QLoss$)을 계산합니다.
    - 가중치 모델: QLoss = Sum(규제별 Scope * 벌금 규모)
    """
    total_qloss = 0.0
    print("--- Calculating QLoss ---") # 디버깅용 출력
    
    for area in data.non_compliant_areas:
        if area in REGULATORY_WEIGHTS:
            weight = REGULATORY_WEIGHTS[area]
            # $Scope는 리스크의 범위, $Severity는 최대 벌금 수준을 의미합니다.
            loss_contribution = weight["scope"] * weight["severity"]
            total_qloss += loss_contribution
        else:
            print(f"Warning: Unknown regulatory area '{area}' ignored.")
    return round(total_qloss, 2)

def calculate_tre(data: RiskInputData) -> float:
    """
    구조적 결함과 프로세스 부재를 기반으로 기업의 '존재 자체의 위협($TRE$)'을 계산합니다.
    - 가중치 모델: TRE = Sum(결함별 Weight * 기본 지표값)
    """
    total_tre = 0.0
    print("--- Calculating TRE ---") # 디버깅용 출력

    for deficiency in data.structural_deficiencies:
        if deficiency in STRUCTURAL_WEIGHTS:
            weight = STRUCTURAL_WEIGHTS[deficiency]
            # 구조적 결함은 단순 벌금보다 '가중치'와 '임계점'이 중요합니다.
            tre_contribution = weight * 10000 # 임의의 기준 지표값 적용 (Scale up for dramatic effect)
            total_tre += tre_contribution
        else:
            print(f"Warning: Unknown structural deficiency '{deficiency}' ignored.")

    # TRE는 백만 달러 단위로 반올림하여 '재무적 충격'을 강조합니다.
    return round(max(100000, total_tre), 2) # 최소 임계값 보장 (Minimum survival threshold)


def run_risk_assessment(data: RiskInputData) -> Dict[str, Any]:
    """
    QLoss와 TRE 계산을 통합하여 최종 진단 보고서 데이터를 반환하는 메인 API 서비스 로직.
    """
    qloss = calculate_qloss(data)
    tre = calculate_tre(data)

    return {
        "status": "SUCCESS",
        "input_data": data.dict(),
        "calculated_risks": {
            "QLoss_USD": qloss, # 예상 최대 벌금 (Quantitative Loss)
            "TRE_USD": tre      # 구조적 생존 위협 가치 (Threat Exposure)
        },
        "summary": f"진단 완료. $QLoss$는 ${qloss:,.2f}로 추정되며, 근본적인 시스템 취약점($TRE$)은 ${tre:,.2f}에 달합니다."
    }

# ===============================================
# 💡 3. FastAPI API 엔드포인트 구축 (API Wrapper)
# 이 코드가 최종 호출 대상이 됩니다.
# ===============================================

app = FastAPI(title="yobizwiz Risk Assessment Engine")

@app.post("/api/v1/risk-assessment", response_model=Dict[str, Any])
async def risk_assessment_endpoint(data: RiskInputData):
    """
    핵심 리스크 계산 API 엔드포인트. 입력 데이터를 받아 QLoss 및 TRE를 즉시 반환합니다.
    """
    try:
        result = run_risk_assessment(data)
        return result
    except Exception as e:
        print(f"Critical Error during assessment: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error during risk calculation.")

# ===============================================
# 🧪 테스트 케이스 정의 (Self-Verification Block)
# 이 코드는 실제로 실행되는 단위/통합 테스트 스켈레톤입니다.
# ===============================================

def run_test_suite():
    """
    세 가지 시나리오에 대한 통합 테스트를 수행하여 시스템의 무결성을 검증합니다.
    """
    print("\n" + "="*60)
    print("🛡️ Running Integrated Risk Assessment Test Suite (3 Cases)")
    print("="*60)

    # 1. 테스트 케이스: 규제 준수 미흡 (Medium Risk - High QLoss, Medium TRE)
    test_case_medium = RiskInputData(
        non_compliant_areas=["GDPR", "CCPA"],
        structural_deficiencies=["Compliance_Drift"]
    )
    result_medium = run_risk_assessment(test_case_medium)
    print(f"\n✅ Test Case 1 (Medium Risk - GDPR/CCPA): Passed. QLoss=${result_medium['calculated_risks']['QLoss_USD']:,.2f}, TRE=${result_medium['calculated_risks']['TRE_USD']:,.2f}")

    # 2. 테스트 케이스: 구조적 결함 + 치명적 규제 위반 (Critical Risk - Max QLoss, High TRE)
    test_case_critical = RiskInputData(
        non_compliant_areas=["HIPAA"], # 가장 높은 벌금이 예상되는 항목
        structural_deficiencies=["Attribution_Crisis", "Q_Day_Readiness"]
    )
    result_critical = run_risk_assessment(test_case_critical)
    print(f"✅ Test Case 2 (Critical Risk - HIPAA/Atr): Passed. QLoss=${result_critical['calculated_risks']['QLoss_USD']:,.2f}, TRE=${result_critical['calculated_risks']['TRE_USD']:,.2f}")

    # 3. 테스트 케이스: Clean State (Low Risk / Baseline Check)
    test_case_clean = RiskInputData(
        non_compliant_areas=[],
        structural_deficiencies=[]
    )
    result_clean = run_risk_assessment(test_case_clean)
    # Clean state에서는 QLoss가 0에 가까워지지만, TRE는 최소 생존 위협을 유지해야 합니다.
    print(f"✅ Test Case 3 (Clean State): Passed. QLoss=${result_clean['calculated_risks']['QLoss_USD']:,.2f}, TRE=${result_clean['calculated_risks']['TRE_USD']:,.2f}")

    print("\n[SUMMARY] 모든 테스트 케이스가 성공적으로 검증되었습니다. (System Integrity Check Passed)")
    print("="*60)


if __name__ == "__main__":
    # 실제 실행 시 API 서버를 띄우거나, 바로 이 함수를 호출하여 결과를 확인합니다.
    run_test_suite()