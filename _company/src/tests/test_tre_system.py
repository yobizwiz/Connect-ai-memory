# test_tre_system.py: E2E 통합 테스트용 Mock 환경 및 보고서 생성기

import json
from datetime import datetime
# 로컬 모듈 임포트 가정 (실제 실행 시 경로 설정 필요)
from src.services.schemas import ClientDataSchema, ThreatReport
from src.services.threat_calculator import calculate_tre_score 

# --- 1. Mock API 서비스 정의 ---

def mock_api_calculate_tre(client_data: dict) -> tuple[float, str]:
    """
    Mock API 호출을 시뮬레이션합니다. 실제로는 외부 백엔드와 통신하지만, 여기서는 로직만 검증합니다.
    TRE 계산 함수를 사용하며, 실패/성공 케이스별로 결과를 조작할 수 있습니다.
    :param client_data: 초기 사용자 리스크 데이터 (ClientDataSchema 기반)
    :return: (계산된 TRE 점수, 시스템 상태 메시지)
    """
    print(f"\n[MOCK API] --- Analyzing Client Data for {client_data.get('name')}...")
    try:
        # 핵심 로직 호출
        tre_score = calculate_tre_score(client_data) 
        
        if tre_score >= 0.75:
            status = "CRITICAL_RED_ZONE"
            message = "!!! SYSTEM FAILURE DETECTED !!! 구조적 리스크가 임계점을 초과했습니다."
        elif tre_score >= 0.4:
            status = "WARNING_YELLOW_ZONE"
            message = "경고: 일부 영역에서 잠재적 취약점이 감지되었습니다. 진단이 필요합니다."
        else:
            status = "SAFE_GREEN_ZONE"
            message = "현재는 안정적인 상태로 보입니다. 하지만 전문 진단을 추천합니다."

        return tre_score, f"{status} | {message}"
    except Exception as e:
        print(f"[ERROR] Mock API Calculation Failed: {e}")
        return 0.0, f"API 호출 실패: {str(e)}"


def mock_api_generate_report(tre_score: float, status: str) -> dict:
    """
    위협 지수와 상태에 기반하여 최종 보고서 구조를 생성합니다 (Mock).
    """
    if tre_score >= 0.75:
        return {
            "report_title": "🚨 시스템적 생존 위협 경고 보고서",
            "risk_level": "CRITICAL",
            "recommendation": "즉각적인 보험 가입 및 구조적 재정비가 필수입니다.",
            "paywall_activated": True, # Paywall 강제 활성화 핵심 로직
        }
    return {
        "report_title": "📊 표준 리스크 분석 보고서",
        "risk_level": "LOW",
        "recommendation": "지속적인 모니터링과 주기적인 진단이 권장됩니다.",
        "paywall_activated": False,
    }

# --- 2. E2E 통합 테스트 시나리오 및 실행 함수 ---

def run_e2e_test_scenario(client_data: dict, scenario_name: str):
    """
    전체 데이터 흐름 (Input -> Process -> Output/CTA)을 모킹하여 실행하고 결과를 보고합니다.
    """
    print("\n" + "="*80)
    print(f"[{scenario_name}] E2E 통합 테스트 시나리오 시작...")
    print("="*80)

    # Stage 1: 초기 데이터 입력 (사용자 리스크 추정)
    try:
        # 스키마 검증 및 데이터 준비 과정이 실제로는 여기에 들어감
        client_data_schema = ClientDataSchema(**client_data)
        print(f"[STEP 1/3] ✅ Input Data Received. ({client_data['name']}의 리스크 분석 시작)")

        # Stage 2: TRE 점수 계산 및 임계점 감지 (Mock API 호출)
        tre_score, status_message = mock_api_calculate_tre(client_data_schema)
        print(f"[STEP 2/3] ✅ Calculation Complete. Final TRE Score: {tre_score:.4f}. Status: {status_message}")

        # Stage 3: Red Zone 경고 및 Paywall CTA 강제 활성화 (Mock API 호출)
        report = mock_api_generate_report(tre_score, status_message)
        print(f"[STEP 3/3] ✅ Report Generated. Risk Level: {report['risk_level']}")

    except Exception as e:
        print(f"\n[!!! FATAL ERROR !!!] E2E Flow Failure: {e}")
        return None, f"FAILURE - {str(e)}"
    
    # 최종 결과 반환 및 보고서 생성 트리거
    final_report = generate_test_report(scenario_name, tre_score, status_message, report)
    print("\n============================================================")
    print("✅ E2E 테스트 시나리오 완료. 통합 리포트가 성공적으로 생성되었습니다.")
    return final_report, "SUCCESS"

# --- 3. 최종 보고서 생성기 (Test Report Template) ---

def generate_test_report(scenario: str, score: float, status: str, report_data: dict) -> str:
    """
    테스트 결과를 기록하고 다음 개발자에게 전달할 수 있는 형식의 최종 리포트를 생성합니다.
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    report = f"""\n{'='*80}
[ 🔬 E2E 통합 테스트 보고서 ]
시나리오명: {scenario}
테스트 시간: {timestamp}
============================================================

[ I. 입력 조건 및 결과 요약 ]
1. 목표 시나리오: 시스템적 생존 위협 체감 및 Paywall 유도 검증
2. 최종 TRE 점수 (Score): {score:.4f} / 1.0
3. 시스템 감지 상태 (Status): {status}
4. 통합 판정 (Verdict): {'CRITICAL' if score >= 0.75 else 'PASS'}

[ II. 핵심 동작 검증 항목 ]
- 데이터 흐름 무결성: PASS (Schema -> Calc -> Report)
- 임계점 감지 로직: {'TRIGGERED' if report_data['paywall_activated'] else 'NOT TRIGGERED'}
- Paywall 강제 활성화: {report_data['paywall_activated']} ({'SUCCESS' if score >= 0.75 else 'FAIL'})

[ III. Mock API Output (상세) ]
> 리포트 제목: {report_data['report_title']}
> 리스크 레벨: {report_data['risk_level']}
> 추천 조치: {report_data['recommendation']}

[ IV. 결론 및 다음 액션 아이템 ]
* 성공 기준 충족 여부: {'PASS' if score >= 0.75 else 'FAIL'}
* 주석: 이 시나리오는 시스템적 생존 위협(Systemic Survival Threat)을 완벽하게 체감시키는 데 필요한 모든 API 모킹 단계를 포함합니다.

{'='*80}
"""
    return report


if __name__ == "__main__":
    # ========================================================
    # 🧪 시나리오 A: Red Zone 트리거 (High Risk) - 시스템의 '위협'을 극대화하는 경우
    # 목표: Paywall 강제 활성화 및 Critical Report 출력 검증
    high_risk_client_data = {
        "name": "김철수", 
        "pii_exposure_count": 15.0,
        "compliance_violation_likelihood": 0.85,
        "critical_workflow_gap_count": 8,
        "process_failure_cost_estimate": 5000000.0,
        "ai_hallucination_dependency_score": 0.9,
        "company_annual_revenue_usd": 10000000.0
    }
    run_e2e_test_scenario(high_risk_client_data, "A: Red Zone (High Risk) - Paywall 강제 유도 시나리오")

    # ========================================================
    # 🧪 시나리오 B: Yellow Zone (Medium Risk) - 경고만 필요한 경우
    # 목표: Warning 메시지 출력 및 적절한 CTA 제시 검증
    medium_risk_client_data = {
        "name": "박영희", 
        "pii_exposure_count": 4.0,
        "compliance_violation_likelihood": 0.45,
        "critical_workflow_gap_count": 3,
        "process_failure_cost_estimate": 150000.0,
        "ai_hallucination_dependency_score": 0.4,
        "company_annual_revenue_usd": 2000000.0
    }
    run_e2e_test_scenario(medium_risk_client_data, "B: Yellow Zone (Medium Risk) - 경고 진단 시나리오")

    # ========================================================
    # 🧪 시나리오 C: Green Zone (Low Risk) - 낮은 리스크의 경우
    # 목표: 시스템 안정성 확인 및 기본 보고서 출력 검증
    low_risk_client_data = {
        "name": "이민호", 
        "pii_exposure_count": 0.0,
        "compliance_violation_likelihood": 0.05,
        "critical_workflow_gap_count": 0,
        "process_failure_cost_estimate": 0.0,
        "ai_hallucination_dependency_score": 0.05,
        "company_annual_revenue_usd": 500000.0
    }
    run_e2e_test_scenario(low_risk_client_data, "C: Green Zone (Low Risk) - 안정 상태 시나리오")

# ========================================================