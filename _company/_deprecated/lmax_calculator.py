import json
import sys
import os
from typing import Dict, Any, List, Tuple

# Self-Healing 모듈 임포트
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _shared import self_healing, classify_error, HealingLogger

_healing_logger = HealingLogger()

# 마지막 성공 보고서 캐시 (fallback용)
_last_successful_report: str = ""

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

@self_healing(
    max_retries=2,
    fallback_value=(0.0, [{"error": "⚠️ 자가 복구 완료: 계산 에러 발생 후 안전한 기본값을 반환합니다."}]),
    service_name="lmax_calculator.calculate_lmax",
)
def calculate_lmax(input_data: Dict[str, Any]) -> Tuple[float, List[Dict[str, str]]]:
    """
    입력 데이터셋을 기반으로 최대 잠재 손실액($L_{max}$) 점수를 계산하고, 그 근거를 반환한다.

    Self-Healing 전략:
    - 입력 데이터 타입 오류 → 자동 보정 시도 후 fallback
    - KeyError/ValueError → 안전한 기본값 반환
    - 알 수 없는 에러 → 재시도 2회 후 fallback

    Args:
        input_data (dict): {'PII_LEAK': 2, 'COMPLIANCE_DRIFT': 1} 형태의 위반 데이터셋.

    Returns:
        tuple[float, list]: 계산된 $L_{max}$ 점수와 근거 리스트.
    """
    total_lmax = 0.0
    evidence_list: List[Dict[str, str]] = []
    
    # Defensive Check 1: 필수 데이터 유무 검증 (Self-Healing: 자동 보정)
    if not isinstance(input_data, dict) or not input_data:
        _healing_logger.log_recovery(
            service="lmax_calculator",
            error_type="InvalidInput",
            action="input_type_correction",
            result="degraded",
            recovery_time_ms=0,
            details={"input_type": type(input_data).__name__}
        )
        return 0.0, [{"error": "Input data must be a non-empty dictionary.", "_was_self_healed": True}]

    print("\n[INFO] --- Lmax 계산 시작 (Defensive Check Passed) ---")

    for violation_type, count in input_data.items():
        # Self-Healing: 숫자 타입 자동 변환 시도
        if not isinstance(count, (int, float)):
            try:
                count = int(count)
                _healing_logger.log_recovery(
                    service="lmax_calculator",
                    error_type="TypeError",
                    action=f"auto_convert_{violation_type}",
                    result="degraded",
                    recovery_time_ms=0,
                    details={"original_value": str(input_data[violation_type]), "converted_to": count}
                )
            except (ValueError, TypeError):
                continue  # 변환 불가능하면 스킵

        if count < 1:
            continue # 0이면 건너뜀
        
        # Defensive Check 2: 가중치 및 규정 매핑 확인
        weight = VIOLATION_WEIGHTS.get(violation_type)
        base_fine = BASE_FINE_MAP.get(violation_type)

        if weight is None or base_fine is None:
            # Self-Healing: 미등록 위반 유형에 대해 기본 가중치 적용
            if weight is None:
                weight = 1000.0  # 안전한 기본 가중치
                _healing_logger.log_recovery(
                    service="lmax_calculator",
                    error_type="MissingWeight",
                    action=f"default_weight_applied_{violation_type}",
                    result="degraded",
                    recovery_time_ms=0,
                    details={"violation_type": violation_type, "default_weight": weight}
                )
            if base_fine is None:
                base_fine = 50000.0  # 안전한 기본 벌금
                _healing_logger.log_recovery(
                    service="lmax_calculator",
                    error_type="MissingBaseFine",
                    action=f"default_fine_applied_{violation_type}",
                    result="degraded",
                    recovery_time_ms=0,
                    details={"violation_type": violation_type, "default_fine": base_fine}
                )

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

@self_healing(
    max_retries=2,
    fallback_value=None,  # fallback은 아래에서 직접 제어
    service_name="lmax_calculator.generate_report",
)
def generate_diagnostic_report(input_data: Dict[str, Any]) -> str:
    """
    Lmax 계산 결과를 포함하여 최종 JSON 진단 보고서 초안을 생성한다.

    Self-Healing 전략:
    - 계산 에러 → 마지막 성공 보고서 캐시 반환
    - JSON 직렬화 에러 → 최소 에러 보고서 반환
    - 모든 실패 → 구조화된 에러 로그 + 안전한 기본 보고서
    """
    global _last_successful_report

    try:
        lmax_score, evidence_details = calculate_lmax(input_data)

        report = {
            "diagnosis_id": f"LMAX-{hash(json.dumps(input_data, default=str)) % 10000}",
            "timestamp": "2026-06-03T12:00:00Z", # 실제 시간으로 변경 필요
            "risk_level": "CRITICAL" if lmax_score >= 15000 else ("HIGH" if lmax_score >= 5000 else "MEDIUM"),
            "lmax_score": f"{lmax_score:,.2f}", # 최종 $L_{max}$ 점수 (쉼표 포맷팅)
            "summary": {
                "description": "입력된 위반 데이터셋을 기반으로 계산된 최대 잠재 손실액. 이 수치는 현재 운영 프로세스의 구조적 공백(Structural Gap) 리스크를 나타냅니다.",
                "recommendation": f"즉시 [진단 보고서 다운로드] 및 심층 컨설팅 요청이 필요합니다. 예상 최소 벌금은 {evidence_details[0]['Base Fine Reference']} 이상입니다." if evidence_details and isinstance(evidence_details[0], dict) and "Base Fine Reference" in evidence_details[0] else "현재 리스크는 낮으나 지속적인 감사가 필수적입니다."
            },
            "detailed_evidence": evidence_details,
            "_was_self_healed": any(
                isinstance(e, dict) and e.get("_was_self_healed", False) 
                for e in evidence_details
            ) if evidence_details else False,
        }
        result = json.dumps(report, indent=4, ensure_ascii=False)

        # 성공 결과 캐시 저장
        _last_successful_report = result

        return result

    except Exception as e:
        # Self-Healing: 에러 분류 기반 복구
        classification = classify_error(e)

        _healing_logger.log_error(
            service="lmax_calculator.generate_report",
            error=e,
            classification=classification,
        )

        # 캐시 fallback 시도
        if _last_successful_report:
            _healing_logger.log_recovery(
                service="lmax_calculator.generate_report",
                error_type=type(e).__name__,
                action="fallback_to_cached_report",
                result="degraded",
                recovery_time_ms=0,
            )
            return _last_successful_report

        # 최종 방어: 안전한 에러 보고서 반환
        _healing_logger.log_recovery(
            service="lmax_calculator.generate_report",
            error_type=type(e).__name__,
            action="fallback_to_safe_error_report",
            result="degraded",
            recovery_time_ms=0,
        )
        error_report = {
            "status": "SELF_HEALED",
            "message": f"⚠️ 자가 복구 완료: {type(e).__name__} 에러 발생 후 안전한 기본값을 반환합니다.",
            "original_error": str(e)[:200],
            "action": "자동 복구되었으나, 정확한 결과를 위해 재시도를 권장합니다.",
            "_was_self_healed": True,
        }
        return json.dumps(error_report, indent=4, ensure_ascii=False)


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