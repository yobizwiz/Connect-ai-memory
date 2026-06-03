"""
core/data/industry_benchmarks.py — 산업별 규제 기준치 매핑
==========================================================

각 산업에 적용되는 주요 규제, 벌금 상한선, 필수 컴플라이언스 항목을 정의합니다.
"""

from typing import Dict, List
from dataclasses import dataclass, field


@dataclass
class IndustryBenchmark:
    """산업별 규제 벤치마크."""
    industry: str
    applicable_regulations: List[str]           # 적용 규제 목록
    max_fine_formula: str                        # 벌금 상한 공식
    max_fine_estimate_usd: float                 # 추정 최대 벌금 (중간 규모 기업 기준)
    required_controls: List[str]                 # 필수 보안/컴플라이언스 항목
    avg_compliance_cost_annual_usd: float        # 연간 평균 컴플라이언스 비용
    risk_multiplier: float                       # 산업 고유 리스크 승수 (1.0 = 평균)


INDUSTRY_REGULATIONS: Dict[str, IndustryBenchmark] = {
    "금융": IndustryBenchmark(
        industry="금융",
        applicable_regulations=[
            "GDPR (EU)", "CCPA (US)", "PCI-DSS",
            "금융위원회 전자금융감독규정", "개인정보보호법 (한국)",
            "SOX Act (US)", "Basel III",
        ],
        max_fine_formula="GDPR: 전 세계 매출의 4% 또는 €20M 중 큰 값",
        max_fine_estimate_usd=20_000_000,
        required_controls=[
            "데이터 암호화 (전송/저장)",
            "접근 통제 (RBAC/MFA)",
            "감사 로그 보관 (최소 5년)",
            "사고 대응 계획 (72시간 내 보고)",
            "정기 침투 테스트",
            "비즈니스 연속성 계획 (BCP/DR)",
        ],
        avg_compliance_cost_annual_usd=5_500_000,
        risk_multiplier=1.8,
    ),

    "Fintech": IndustryBenchmark(
        industry="Fintech",
        applicable_regulations=[
            "GDPR (EU)", "PSD2 (EU)", "PCI-DSS",
            "전자금융거래법 (한국)", "CCPA (US)",
        ],
        max_fine_formula="GDPR: 전 세계 매출의 4% 또는 €20M 중 큰 값",
        max_fine_estimate_usd=20_000_000,
        required_controls=[
            "PCI-DSS Level 1 인증",
            "강력한 인증 (SCA)",
            "실시간 트랜잭션 모니터링",
            "데이터 지역화 (Data Residency)",
            "정기 보안 감사",
        ],
        avg_compliance_cost_annual_usd=3_200_000,
        risk_multiplier=1.8,
    ),

    "의료": IndustryBenchmark(
        industry="의료",
        applicable_regulations=[
            "HIPAA (US)", "GDPR (EU)",
            "의료법 (한국)", "개인정보보호법 (한국)",
            "HITECH Act (US)",
        ],
        max_fine_formula="HIPAA: 위반 건당 $100~$50,000, 연간 최대 $1.5M per category",
        max_fine_estimate_usd=16_000_000,
        required_controls=[
            "PHI 데이터 암호화",
            "최소 권한 원칙 (PoLP)",
            "직원 보안 인식 교육 (연 1회 이상)",
            "BAA (Business Associate Agreement)",
            "사고 보고 (60일 이내)",
            "물리적 접근 통제",
        ],
        avg_compliance_cost_annual_usd=2_800_000,
        risk_multiplier=1.5,
    ),

    "Healthcare": IndustryBenchmark(
        industry="Healthcare",
        applicable_regulations=["HIPAA", "GDPR", "HITECH Act"],
        max_fine_formula="HIPAA: 위반 건당 최대 $50,000, 연간 $1.5M",
        max_fine_estimate_usd=16_000_000,
        required_controls=[
            "PHI encryption", "Access controls", "Employee training",
            "BAA agreements", "Incident response plan",
        ],
        avg_compliance_cost_annual_usd=2_800_000,
        risk_multiplier=1.5,
    ),

    "제조": IndustryBenchmark(
        industry="제조",
        applicable_regulations=[
            "GDPR (EU)", "산업안전보건법 (한국)",
            "개인정보보호법 (한국)", "NIST Framework",
        ],
        max_fine_formula="GDPR: 전 세계 매출의 2% 또는 €10M 중 큰 값 (일반 위반)",
        max_fine_estimate_usd=10_000_000,
        required_controls=[
            "OT/IT 네트워크 분리",
            "직원 개인정보 보호 정책",
            "공급망 보안 평가",
            "물리적 보안 통제",
        ],
        avg_compliance_cost_annual_usd=1_500_000,
        risk_multiplier=1.0,
    ),

    "Manufacturing": IndustryBenchmark(
        industry="Manufacturing",
        applicable_regulations=["GDPR", "NIST", "IEC 62443"],
        max_fine_formula="GDPR: 매출의 2% 또는 €10M",
        max_fine_estimate_usd=10_000_000,
        required_controls=[
            "OT/IT separation", "Supply chain security", "Employee data protection",
        ],
        avg_compliance_cost_annual_usd=1_500_000,
        risk_multiplier=1.0,
    ),

    "Retail": IndustryBenchmark(
        industry="Retail",
        applicable_regulations=[
            "GDPR (EU)", "CCPA (US)", "PCI-DSS",
            "개인정보보호법 (한국)",
        ],
        max_fine_formula="CCPA: 의도적 위반 건당 $7,500, GDPR: 매출의 4%",
        max_fine_estimate_usd=5_000_000,
        required_controls=[
            "결제 데이터 보호 (PCI-DSS)",
            "고객 동의 관리 (Consent Management)",
            "쿠키 및 추적 정책",
            "정기 보안 스캔",
        ],
        avg_compliance_cost_annual_usd=1_200_000,
        risk_multiplier=0.8,
    ),

    "소매": IndustryBenchmark(
        industry="소매",
        applicable_regulations=["GDPR", "CCPA", "PCI-DSS", "개인정보보호법"],
        max_fine_formula="CCPA: 건당 $7,500, GDPR: 매출의 4%",
        max_fine_estimate_usd=5_000_000,
        required_controls=[
            "결제 데이터 보호", "동의 관리", "쿠키 정책",
        ],
        avg_compliance_cost_annual_usd=1_200_000,
        risk_multiplier=0.8,
    ),

    "Education": IndustryBenchmark(
        industry="Education",
        applicable_regulations=["GDPR", "FERPA (US)", "COPPA (US)"],
        max_fine_formula="GDPR: 매출의 2% 또는 €10M",
        max_fine_estimate_usd=3_000_000,
        required_controls=[
            "학생 데이터 보호 (FERPA)", "미성년자 데이터 (COPPA)",
            "교육 기관 접근 통제",
        ],
        avg_compliance_cost_annual_usd=800_000,
        risk_multiplier=0.7,
    ),

    "교육": IndustryBenchmark(
        industry="교육",
        applicable_regulations=["GDPR", "FERPA", "개인정보보호법"],
        max_fine_formula="GDPR: 매출의 2% 또는 €10M",
        max_fine_estimate_usd=3_000_000,
        required_controls=[
            "학생 데이터 보호", "미성년자 데이터 보호", "접근 통제",
        ],
        avg_compliance_cost_annual_usd=800_000,
        risk_multiplier=0.7,
    ),
}

# 기본값
_DEFAULT_BENCHMARK = IndustryBenchmark(
    industry="General",
    applicable_regulations=["GDPR (EU)", "개인정보보호법 (한국)"],
    max_fine_formula="GDPR: 전 세계 매출의 2% 또는 €10M 중 큰 값",
    max_fine_estimate_usd=5_000_000,
    required_controls=[
        "데이터 암호화", "접근 통제", "사고 대응 계획", "정기 보안 감사",
    ],
    avg_compliance_cost_annual_usd=1_000_000,
    risk_multiplier=1.0,
)


def get_industry_benchmark(industry: str) -> Dict:
    """산업별 규제 벤치마크를 조회합니다."""
    benchmark = INDUSTRY_REGULATIONS.get(industry, _DEFAULT_BENCHMARK)
    return {
        "industry": benchmark.industry,
        "applicable_regulations": benchmark.applicable_regulations,
        "max_fine_formula": benchmark.max_fine_formula,
        "max_fine_estimate_usd": benchmark.max_fine_estimate_usd,
        "required_controls": benchmark.required_controls,
        "avg_compliance_cost_annual_usd": benchmark.avg_compliance_cost_annual_usd,
        "risk_multiplier": benchmark.risk_multiplier,
    }
