"""다양한 산업별 유사 사례 매칭 테스트."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.schemas import DiagnosisInput
from core.engine import RiskDiagnosisEngine
from core.data.regulatory_fines import ENFORCEMENT_CASES

engine = RiskDiagnosisEngine()

print(f"총 사례 데이터: {len(ENFORCEMENT_CASES)}건")
print(f"미국 사례: {len([c for c in ENFORCEMENT_CASES if c.country == 'USA'])}건")
print()

# 여러 산업 테스트
test_cases = [
    ("Healthcare", 200, False, 5.0, 500000, {"PII_LEAK": 1}),
    ("Financial", 100, True, 2.0, 100000, None),
    ("Retail", 50, False, 1.0, 20000, None),
    ("Technology", 300, False, 10.0, 2000000, {"PII_LEAK": 2, "COMPLIANCE_DRIFT": 1}),
    ("Education", 30, True, 0.5, None, None),
]

for industry, emp, audit, tb, pii, violations in test_cases:
    report = engine.diagnose(DiagnosisInput(
        industry=industry,
        employee_count=emp,
        has_compliance_audit=audit,
        data_storage_size_tb=tb,
        pii_record_count=pii,
        violation_history=violations,
    ))

    print(f"{'='*60}")
    print(f"  {industry} | {emp} employees | Audit: {audit}")
    print(f"  TRE: {report.tre_score} | Level: {report.risk_level.value} | Lmax: ${report.estimated_lmax_usd:,.0f}")
    print(f"  IBM Breach Cost: ${report.breach_cost_estimate.avg_total_cost_usd:,.0f}")
    print(f"  Similar cases ({len(report.similar_cases)}):")
    for c in report.similar_cases:
        print(f"    → {c.company} ({c.regulation}, {c.year}) ${c.fine_usd:,.0f}")
    print()

print("✅ 모든 산업별 테스트 완료")
