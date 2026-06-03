import json
from typing import Dict, Any, List, Tuple

# ============================================================
# 🚨 WARNING: CORE CONSTANTS & SCHEMAS (가정된 구조)
# 이 상수들은 Researcher가 제공한 'Evidence Mapping Table' 및 법률 조항을 기반으로 정의되었습니다.
# 실제 구현 시에는 외부 DB 또는 Config Service에서 로드되어야 합니다.
# ============================================================

# [1] $L_{max}$ 가중치 맵 (Violation Type -> Weight Multiplier)
VIOLATION_WEIGHTS: Dict[str, float] = {
    "PII_LEAK": 3500.0,  # 개인정보 유출: 가장 높은 리스크
    "COMPLIANCE_DRIFT": 2000.0, # 규정 드리프트: 프로세스적 실패
    "SYSTEM_VULNERABILITY": 1500.0, # 시스템 취약점 노출: 기술적 실패
}

# [2] 기본 벌금 구조 (Violation Type -> Base Fine)
BASE_FINE_MAP: Dict[str, float] = {
    "GDPR_Article_32": 800000.0, # GDPR Article 32: 보안 조치 미흡 시 최소 벌금
    "CCPA_Failure_To_OptOut": 45000.0, # CCPA: 선택권 고지 실패
    "HIPAA_Breach": 150000.0, # HIPAA: 의료정보 유출 기본 위반액
}

# [3] 법률 근거 매핑 (Violation Type -> Legal Statute)
LEGAL_STATUTES: Dict[str, str] = {
    "PII_LEAK": "GDPR Article 5(1)(f): Integrity and Confidentiality",
    "COMPLIANCE_DRIFT": "CCPA Section 1798.100: Right to Know / Process Gap",
    "SYSTEM_VULNERABILITY": "HIPAA Security Rule §164.308: Technical Safeguards",
}

# ============================================================
# ✅ CORE LOGIC: Lmax Score Calculation Engine (SRP 준수)
# 입력 데이터 구조가 불완전하거나 타입이 맞지 않을 경우를 대비한 방어 로직 필수 탑재
# ============================================================

def calculate_lmax(input_data: Dict[str, Any]) -> Tuple[float, List[Dict[str, str]]]:
    """
    입력 데이터셋을 기반으로 최대 잠재 손실액($L_{max}$) 점수를 계산하고, 그 근거를 반환한다.

    Args:
        input_data (dict): {'PII_LEAK': 2, 'COMPLIANCE_DRIFT': 1} 형태의 위반 데이터셋.

    Returns:
        tuple[float, list]: 계산된 $L_{max}$ 점수와 근거 리스트.
    """
    total_lmax = 0.0
    evidence_list: List[Dict[str, str]] = []
    
    # Defensive Check 1: 필수 데이터 유무 검증
    if not isinstance(input_data, dict) or not input_data:
        return 0.0, [{"error": "Input data must be a non-empty dictionary."}]

    print("\n[INFO] --- Lmax 계산 시작 (Defensive Check Passed) ---")

    for violation_type, count in input_data.items():
        if not isinstance(count, int) or count < 1:
            continue # 숫자가 아니거나 0이면 건너뜀
        
        # Defensive Check 2: 가중치 및 규정 매핑 확인
        weight = VIOLATION_WEIGHTS.get(violation_type)
        base_fine = BASE_FINE_MAP.get(violation_type)

        if weight is None or base_fine is None:
            # 정의되지 않은 위반 유형은 무시하거나 경고 로그를 남겨야 함 (여기서는 스킵 처리)
            print(f"[WARNING] Unknown violation type '{violation_type}'. Skipping calculation.")
            continue

        # Lmax = Sum(Count * Weight) + BaseFine
        lmax_contribution = count * weight + base_fine
        total_lmax += lmax_contribution
        
        evidence_list.append({
            "Violation Type": violation_type,
            "Incident Count": str(count),
            "Calculated Contribution": f"{lmax_contribution:,.2f}",
            "Legal Statute Cited": LEGAL_STATUTES.get(violation_type, "N/A"),
            "Base Fine Reference": str(base_fine)
        })

    return total_lmax, evidence_list


# ============================================================
# 🌐 API Endpoint Simulation (진단 보고서 포맷팅)
# 실제 FastAPI 또는 Flask 라우터에 매핑될 부분입니다.
# ============================================================

def generate_diagnostic_report(input_data: Dict[str, Any]) -> str:
    """
    Lmax 계산 결과를 포함하여 최종 JSON 진단 보고서 초안을 생성한다.
    """
    try:
        lmax_score, evidence_details = calculate_lmax(input_data)

        report = {
            "diagnosis_id": f"LMAX-{hash(json.dumps(input_data)) % 10000}",
            "timestamp": "2026-06-03T12:00:00Z", # 실제 시간으로 변경 필요
            "risk_level": "CRITICAL", if lmax_score >= 15000 else ("HIGH" if lmax_score >= 5000 else "MEDIUM"),
            "lmax_score": f"{lmax_score:,.2f}", # 최종 $L_{max}$ 점수 (쉼표 포맷팅)
            "summary": {
                "description": "입력된 위반 데이터셋을 기반으로 계산된 최대 잠재 손실액. 이 수치는 현재 운영 프로세스의 구조적 공백(Structural Gap) 리스크를 나타냅니다.",
                "recommendation": f"즉시 [진단 보고서 다운로드] 및 심층 컨설팅 요청이 필요합니다. 예상 최소 벌금은 {evidence_details[0]['Base Fine Reference']} 이상입니다." if evidence_details else "현재 리스크는 낮으나 지속적인 감사가 필수적입니다."
            },
            "detailed_evidence": evidence_details
        }
        return json.dumps(report, indent=4)

    except Exception as e:
        # 최종 방어 로직 (Root Cause를 잡아내기 위해 try-catch 사용)
        error_report = {
            "status": "FAILURE",
            "message": f"Diagnostic report generation failed due to a critical error: {str(e)}",
            "action": "개발자에게 문의하십시오."
        }
        return json.dumps(error_report, indent=4)


# ============================================================
# 🧪 DUMMY DATA EXECUTION (테스트 코드)
# 이 부분이 실제 API 호출을 시뮬레이션하는 테스트 영역입니다.
# ============================================================

if __name__ == "__main__":
    print("="*60)
    print("🚀 [TEST MODE] Lmax 진단 보고서 생성 및 검증 시작")
    print("="*60)

    # --- Case 1: Critical Failure (PII 유출 + 규정 드리프트) - 높은 점수 예상
    critical_input = {
        "PII_LEAK": 2,          # 개인정보 유출 2건
        "COMPLIANCE_DRIFT": 1   # 컴플라이언스 프로세스 공백 1개
    }
    print("\n\n>>> [Test Case 1: Critical Failure Simulation] <<<")
    report_json = generate_diagnostic_report(critical_input)
    print("--- Generated Diagnostic Report (JSON Format) ---")
    print(report_json)

    # --- Case 2: Low Risk / Clean State (가장 적은 리스크 예상)
    low_risk_input = {
        "SYSTEM_VULNERABILITY": 0 # 실제로는 카운트가 1 이상이어야 함을 테스트하기 위해 0으로 설정
    }
    print("\n\n>>> [Test Case 2: Low Risk Simulation] <<<")
    report_json_low = generate_diagnostic_report(low_risk_input)
    print("--- Generated Diagnostic Report (JSON Format) ---")
    print(report_json_low)

    # --- Case 3: Invalid Input Handling (Defensive Test)
    invalid_input = "Not a dictionary"
    print("\n\n>>> [Test Case 3: Defensive Failure Simulation] <<<")
    report_json_fail = generate_diagnostic_report(invalid_input)
    print("--- Generated Diagnostic Report (JSON Format) ---")
    print(report_json_fail)

# End of lmax_calculator.py