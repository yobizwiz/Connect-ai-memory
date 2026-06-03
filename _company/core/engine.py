"""
core/engine.py — 통합 리스크 진단 엔진
=======================================

기존 6개 파일의 계산 로직을 하나의 클래스로 통합합니다.
random()을 전부 제거하고, 결정론적(deterministic) 공식만 사용합니다.

통합 출처:
- threat_calculator.py  → 가중치 기반 TRE 공식 (W_PII, W_AUDIT, W_AI, W_REVENUE)
- lmax_calculator.py    → 법률 근거 매핑 + 위반 유형별 벌금 가중치
- services/risk_engine.py → 산업별/규모별 위험 계산 + 메시지 생성
"""

import math
import sys
import os
from typing import Dict, List, Optional

# Self-Healing 모듈 임포트
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from _shared import self_healing, classify_error, HealingLogger

from .schemas import (
    DiagnosisInput,
    DiagnosisReport,
    ThreatMessage,
    RiskLevel,
)

_healing_logger = HealingLogger()


# ============================================================
# 상수 정의 (기존 파일들에서 추출한 최선의 값)
# ============================================================

# [출처: threat_calculator.py] TRE 가중치 (합계 = 1.0)
TRE_WEIGHTS = {
    "compliance": 0.35,       # 규정 준수 상태 (가장 중요)
    "data_governance": 0.25,  # 데이터 관리 리스크
    "industry_risk": 0.20,    # 산업군 고유 리스크
    "operational": 0.20,      # 운영 규모/복잡성
}

# [출처: services/risk_engine.py] 산업별 리스크 계수
INDUSTRY_RISK_FACTORS: Dict[str, float] = {
    # 한국어 키
    "금융": 0.90,
    "의료": 0.75,
    "제조": 0.50,
    "교육": 0.40,
    "소매": 0.35,
    # 영어 키
    "Fintech": 0.90,
    "Healthcare": 0.75,
    "Manufacturing": 0.50,
    "Education": 0.40,
    "Retail": 0.35,
}
DEFAULT_INDUSTRY_RISK = 0.45

# [출처: lmax_calculator.py] 위반 유형별 벌금 가중치 (USD)
VIOLATION_WEIGHTS: Dict[str, float] = {
    "PII_LEAK": 3500.0,
    "COMPLIANCE_DRIFT": 2000.0,
    "SYSTEM_VULNERABILITY": 1500.0,
}

# [출처: lmax_calculator.py] 위반 유형별 기본 벌금 (USD)
BASE_FINE_MAP: Dict[str, float] = {
    "PII_LEAK": 800_000.0,           # GDPR Article 32 기준
    "COMPLIANCE_DRIFT": 45_000.0,    # CCPA 기준
    "SYSTEM_VULNERABILITY": 150_000.0,  # HIPAA 기준
}

# [출처: lmax_calculator.py] 법률 근거 매핑
LEGAL_STATUTES: Dict[str, str] = {
    "PII_LEAK": "GDPR Article 5(1)(f): Integrity and Confidentiality",
    "COMPLIANCE_DRIFT": "CCPA Section 1798.100: Right to Know / Process Gap",
    "SYSTEM_VULNERABILITY": "HIPAA Security Rule §164.308: Technical Safeguards",
}

# [출처: services/risk_engine.py] Red Zone 임계값
RED_ZONE_THRESHOLD = 70.0
YELLOW_ZONE_THRESHOLD = 40.0


# ============================================================
# 통합 엔진 클래스
# ============================================================

class RiskDiagnosisEngine:
    """
    Yobizwiz 통합 리스크 진단 엔진.
    
    기존 6개 파일의 계산 로직을 하나의 일관된 인터페이스로 통합합니다.
    모든 계산은 결정론적(deterministic)이며, random()을 사용하지 않습니다.
    동일 입력 → 항상 동일 결과를 보장합니다.
    """

    def __init__(self):
        self._last_successful_report: Optional[DiagnosisReport] = None

    @self_healing(
        max_retries=2,
        fallback_value=None,
        service_name="RiskDiagnosisEngine.diagnose",
    )
    def diagnose(self, input_data: DiagnosisInput) -> DiagnosisReport:
        """
        메인 진단 함수. 입력 데이터를 받아 완전한 진단 보고서를 반환합니다.
        
        계산 흐름:
        1. TRE 점수 계산 (0~100)
        2. Lmax 산출 (법률 근거 기반)
        3. 위험 등급 판정 (Green/Yellow/Red)
        4. 위협 메시지 생성
        5. 보고서 조립
        """
        try:
            # 1. TRE 점수 계산
            tre_score = self._calculate_tre(input_data)

            # 2. Lmax 계산 (법률 근거 기반)
            lmax, legal_evidence = self._calculate_lmax(input_data)

            # 3. 위험 등급 판정
            risk_level = self._determine_risk_level(tre_score)

            # 4. 위협 메시지 생성
            threats = self._generate_threats(input_data, tre_score, lmax)

            # 5. 요약 메시지 생성
            summary, recommendation = self._generate_summary(
                risk_level, tre_score, lmax, input_data
            )

            # 6. 보고서 조립
            report = DiagnosisReport(
                tre_score=round(tre_score, 2),
                risk_level=risk_level,
                estimated_lmax_usd=round(lmax, 2),
                threat_messages=threats,
                legal_evidence=legal_evidence,
                summary=summary,
                recommendation=recommendation,
                is_red_zone=(risk_level == RiskLevel.RED),
                was_self_healed=False,
            )

            # 성공 결과 캐시
            self._last_successful_report = report
            return report

        except Exception as e:
            classification = classify_error(e)
            _healing_logger.log_error(
                service="RiskDiagnosisEngine.diagnose",
                error=e,
                classification=classification,
            )

            # 캐시 fallback
            if self._last_successful_report:
                _healing_logger.log_recovery(
                    service="RiskDiagnosisEngine.diagnose",
                    error_type=type(e).__name__,
                    action="fallback_to_cached_report",
                    result="degraded",
                    recovery_time_ms=0,
                )
                return self._last_successful_report

            # 최종 방어: 안전한 기본 보고서
            _healing_logger.log_recovery(
                service="RiskDiagnosisEngine.diagnose",
                error_type=type(e).__name__,
                action="fallback_to_safe_default",
                result="degraded",
                recovery_time_ms=0,
            )
            return DiagnosisReport(
                tre_score=0.0,
                risk_level=RiskLevel.GREEN,
                estimated_lmax_usd=0.0,
                threat_messages=[],
                legal_evidence=[],
                summary="⚠️ 자가 복구 완료: 진단 중 에러 발생. 안전한 기본값을 반환합니다.",
                recommendation="시스템 관리자에게 문의하거나 잠시 후 다시 시도해 주세요.",
                is_red_zone=False,
                was_self_healed=True,
            )

    # ============================================================
    # TRE 점수 계산 (출처: threat_calculator.py 가중치 공식)
    # ============================================================

    def _calculate_tre(self, data: DiagnosisInput) -> float:
        """
        Total Risk Exposure 점수를 계산합니다 (0~100).
        
        공식: TRE = Σ(카테고리 점수 × 가중치) × 규모 보정 계수
        
        기존 threat_calculator.py의 가중치 공식을 기반으로 하되,
        random()을 제거하고 결정론적 공식으로 교체했습니다.
        """
        # 1. 컴플라이언스 점수 (0~100)
        # 감사 이력 없음 → 높은 점수 (위험), 있음 → 낮은 점수
        compliance_score = 85.0 if not data.has_compliance_audit else 25.0
        
        # PII 레코드가 많을수록 컴플라이언스 리스크 증가
        if data.pii_record_count and data.pii_record_count > 10000:
            compliance_score += min(15.0, data.pii_record_count / 100000 * 15)

        # 2. 데이터 거버넌스 점수 (0~100)
        # 데이터 규모가 클수록 관리 리스크 증가 (비선형)
        data_score = min(100.0, data.data_storage_size_tb / 10.0 * 80.0)
        
        # PII 보유 시 추가 리스크
        if data.pii_record_count and data.pii_record_count > 0:
            pii_factor = min(20.0, math.log10(max(data.pii_record_count, 1)) * 5)
            data_score = min(100.0, data_score + pii_factor)

        # 3. 산업 리스크 점수 (0~100)
        industry_factor = INDUSTRY_RISK_FACTORS.get(
            data.industry, DEFAULT_INDUSTRY_RISK
        )
        industry_score = industry_factor * 100.0

        # 4. 운영 복잡성 점수 (0~100)
        # 직원 수에 따른 비선형 증가 (sqrt 스케일링)
        employee_score = min(100.0, math.sqrt(data.employee_count) * 10.0)

        # 5. 가중 평균
        tre_raw = (
            compliance_score * TRE_WEIGHTS["compliance"]
            + data_score * TRE_WEIGHTS["data_governance"]
            + industry_score * TRE_WEIGHTS["industry_risk"]
            + employee_score * TRE_WEIGHTS["operational"]
        )

        # 6. 매출 규모 보정 (선택 필드가 있을 때만)
        if data.annual_revenue_usd and data.annual_revenue_usd > 0:
            # 매출이 높을수록 벌금 규모와 리스크가 비례하여 증가
            revenue_multiplier = 1.0 + min(0.2, data.annual_revenue_usd / 1_000_000_000 * 0.2)
            tre_raw *= revenue_multiplier

        return min(max(tre_raw, 0.0), 100.0)

    # ============================================================
    # Lmax 계산 (출처: lmax_calculator.py 법률 근거 매핑)
    # ============================================================

    def _calculate_lmax(
        self, data: DiagnosisInput
    ) -> tuple[float, list[dict[str, str]]]:
        """
        최대 잠재 손실액(Lmax)을 계산합니다.
        
        2단계 계산:
        1. 과거 위반 이력 기반 (violation_history가 있을 때)
        2. 현재 상태 기반 추정 (위반 이력이 없을 때)
        
        기존 lmax_calculator.py의 법률 근거 매핑을 사용하되,
        random()을 제거하고 공식 기반으로 교체했습니다.
        """
        total_lmax = 0.0
        evidence_list: list[dict[str, str]] = []

        # --- 1단계: 과거 위반 이력 기반 계산 ---
        if data.violation_history:
            for violation_type, count in data.violation_history.items():
                if not isinstance(count, int) or count < 1:
                    continue

                weight = VIOLATION_WEIGHTS.get(violation_type)
                base_fine = BASE_FINE_MAP.get(violation_type)

                if weight is None or base_fine is None:
                    # 미등록 위반 유형: 기본 가중치 적용
                    weight = weight or 1000.0
                    base_fine = base_fine or 50_000.0

                contribution = count * weight + base_fine
                total_lmax += contribution

                evidence_list.append({
                    "violation_type": violation_type,
                    "incident_count": str(count),
                    "calculated_contribution_usd": f"{contribution:,.2f}",
                    "legal_statute": LEGAL_STATUTES.get(violation_type, "N/A"),
                    "base_fine_usd": f"{base_fine:,.2f}",
                })

        # --- 2단계: 현재 상태 기반 추정 ---
        # 컴플라이언스 감사 미수행 → 규제 벌금 리스크
        if not data.has_compliance_audit:
            # GDPR 기준 최소 벌금 (매출의 2% 또는 €10M 중 큰 값)
            if data.annual_revenue_usd and data.annual_revenue_usd > 0:
                gdpr_fine = max(data.annual_revenue_usd * 0.02, 10_000_000)
            else:
                gdpr_fine = 800_000.0  # 중소기업 기본값

            total_lmax += gdpr_fine
            evidence_list.append({
                "violation_type": "COMPLIANCE_GAP",
                "incident_count": "1 (감사 미수행)",
                "calculated_contribution_usd": f"{gdpr_fine:,.2f}",
                "legal_statute": "GDPR Article 83: 매출 2% 또는 €10M 중 큰 값",
                "base_fine_usd": f"{gdpr_fine:,.2f}",
            })

        # 대용량 PII 보유 → 유출 시 벌금 리스크
        if data.pii_record_count and data.pii_record_count > 1000:
            # IBM Data Breach Report 2024: 레코드당 평균 $165
            pii_exposure_cost = data.pii_record_count * 165.0
            total_lmax += pii_exposure_cost
            evidence_list.append({
                "violation_type": "PII_EXPOSURE_RISK",
                "incident_count": f"{data.pii_record_count:,} records",
                "calculated_contribution_usd": f"{pii_exposure_cost:,.2f}",
                "legal_statute": "IBM Cost of Data Breach Report 2024: 레코드당 $165",
                "base_fine_usd": "165.00/record",
            })

        # 직원 규모에 따른 운영 중단 비용
        if data.employee_count > 100:
            # 대규모 조직의 운영 중단 비용 추정
            operational_cost = data.employee_count * 500.0 * 30  # 30일 중단 가정
            total_lmax += operational_cost
            evidence_list.append({
                "violation_type": "OPERATIONAL_DISRUPTION",
                "incident_count": f"{data.employee_count} employees",
                "calculated_contribution_usd": f"{operational_cost:,.2f}",
                "legal_statute": "BCP/DR 운영 연속성 비용 추정 (직원당 $500/일 × 30일)",
                "base_fine_usd": "500.00/employee/day",
            })

        return total_lmax, evidence_list

    # ============================================================
    # 위험 등급 판정
    # ============================================================

    def _determine_risk_level(self, tre_score: float) -> RiskLevel:
        """TRE 점수를 기반으로 위험 등급을 판정합니다."""
        if tre_score >= RED_ZONE_THRESHOLD:
            return RiskLevel.RED
        elif tre_score >= YELLOW_ZONE_THRESHOLD:
            return RiskLevel.YELLOW
        else:
            return RiskLevel.GREEN

    # ============================================================
    # 위협 메시지 생성 (출처: services/risk_engine.py)
    # ============================================================

    def _generate_threats(
        self, data: DiagnosisInput, tre_score: float, lmax: float
    ) -> list[ThreatMessage]:
        """입력 데이터와 계산 결과를 기반으로 구체적인 위협 메시지를 생성합니다."""
        threats: list[ThreatMessage] = []

        # 1. 컴플라이언스 공백
        if not data.has_compliance_audit:
            threats.append(ThreatMessage(
                threat="규제 사각지대 노출 (Compliance Gap)",
                severity="High",
                action="즉시 전문 감사(Audit)를 통해 전사적 컴플라이언스 gap을 식별하고, Missing Controls 목록화가 필수입니다.",
                legal_basis="GDPR Article 83 / CCPA Section 1798.155",
            ))

        # 2. 대규모 PII 보유 리스크
        if data.pii_record_count and data.pii_record_count > 10000:
            threats.append(ThreatMessage(
                threat=f"대규모 PII 노출 위험 ({data.pii_record_count:,}건 보유)",
                severity="Critical",
                action="PII 데이터 최소화(Data Minimization) 정책을 수립하고, 비식별화(Anonymization) 또는 가명화(Pseudonymization) 즉시 적용이 필요합니다.",
                legal_basis="GDPR Article 5(1)(c): Data Minimisation",
            ))

        # 3. 대용량 데이터 관리
        if data.data_storage_size_tb > 5.0:
            threats.append(ThreatMessage(
                threat="대용량 데이터 취약점 (Data Sovereignty)",
                severity="Medium",
                action="저장된 데이터의 지리적 위치와 접근 권한을 재검토하고, 최소한의 필수 정보만 보존하는 정책 수립이 시급합니다.",
                legal_basis="GDPR Article 44-49: Cross-Border Data Transfer",
            ))

        # 4. 금융권 + 대규모 조직 특별 경고
        if data.industry in ("금융", "Fintech") and data.employee_count > 100:
            threats.append(ThreatMessage(
                threat="시스템 연속성 위협 (BCP Failure)",
                severity="Critical",
                action=f"잠재적 손실액 ${int(lmax):,}을 막기 위해, 백업 및 복구 프로세스(DR/BCP)를 분기별로 테스트하고 최신화해야 합니다.",
                legal_basis="금융위원회 전자금융감독규정 제21조",
            ))

        # 5. TRE Red Zone 경고
        if tre_score >= RED_ZONE_THRESHOLD:
            threats.append(ThreatMessage(
                threat="🚨 시스템적 생존 위협 감지",
                severity="Critical",
                action="즉각적인 구조 개선(Mitigation) 없이는 큰 금전적 손실이 예상됩니다. 전문가의 개입이 필수입니다.",
                legal_basis=None,
            ))

        return threats

    # ============================================================
    # 요약 메시지 생성
    # ============================================================

    def _generate_summary(
        self,
        risk_level: RiskLevel,
        tre_score: float,
        lmax: float,
        data: DiagnosisInput,
    ) -> tuple[str, str]:
        """위험 등급에 따른 요약 메시지와 권장 조치를 생성합니다."""

        if risk_level == RiskLevel.RED:
            summary = (
                f"🚨 위험 등급 RED — TRE 점수 {tre_score:.1f}/100. "
                f"예상 최대 손실액: ${lmax:,.0f} USD. "
                f"즉각적인 조치가 필요합니다."
            )
            recommendation = (
                "1) 즉시 전문 컴플라이언스 감사를 실시하세요. "
                "2) PII 데이터 최소화 정책을 수립하세요. "
                "3) BCP/DR 프로세스를 재검토하세요."
            )

        elif risk_level == RiskLevel.YELLOW:
            summary = (
                f"⚠️ 위험 등급 YELLOW — TRE 점수 {tre_score:.1f}/100. "
                f"일부 구조적 사각지대가 감지되었습니다. "
                f"예상 잠재 손실액: ${lmax:,.0f} USD."
            )
            recommendation = (
                "1) 프로세스 점검을 통해 사각지대를 식별하세요. "
                "2) 분기별 자체 감사 일정을 수립하세요."
            )

        else:  # GREEN
            summary = (
                f"✅ 위험 등급 GREEN — TRE 점수 {tre_score:.1f}/100. "
                f"현재 시스템 구조는 안정적입니다."
            )
            recommendation = (
                "현재 리스크 수준은 관리 가능한 범위입니다. "
                "지속적인 감사와 모니터링을 유지하세요."
            )

        return summary, recommendation
