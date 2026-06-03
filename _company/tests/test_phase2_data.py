"""Phase 2 실제 데이터 연동 검증 스크립트."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.schemas import DiagnosisInput
from core.engine import RiskDiagnosisEngine

engine = RiskDiagnosisEngine()

report = engine.diagnose(DiagnosisInput(
    industry="금융",
    employee_count=500,
    has_compliance_audit=False,
    data_storage_size_tb=15.0,
    annual_revenue_usd=500_000_000,
    pii_record_count=1_000_000,
    violation_history={"PII_LEAK": 3, "COMPLIANCE_DRIFT": 2},
))

print("=" * 60)
print("  Phase 2: 실제 데이터 연동 검증")
print("=" * 60)

# 유사 사례 확인
print(f"\n📋 유사 벌금 사례 {len(report.similar_cases)}건:")
for c in report.similar_cases:
    print(f"   - {c.company} ({c.industry}, {c.year})")
    print(f"     벌금: ${c.fine_usd:,.0f} [{c.regulation}]")
    print(f"     내용: {c.description[:70]}...")
    print(f"     유사도: {c.similarity_score}")
    print()

# IBM 유출 비용
bce = report.breach_cost_estimate
print(f"📊 IBM Data Breach 비용 추정:")
print(f"   산업 평균 유출 비용: ${bce.avg_total_cost_usd:,.0f}")
print(f"   PII 기반 추정 비용: ${bce.estimated_pii_cost_usd:,.0f}")
print(f"   레코드당 비용:      ${bce.cost_per_record_usd}")
print(f"   출처: {bce.source}")

# 요약 메시지
print(f"\n📝 요약:")
print(f"   {report.summary}")

# 검증
assert len(report.similar_cases) > 0, "유사 사례 없음"
assert bce.avg_total_cost_usd > 0, "유출 비용 0"
assert bce.estimated_pii_cost_usd > 0, "PII 비용 0"
assert "참고:" in report.summary, "유사 사례 인용 없음"

print(f"\n✅ Phase 2 검증 통과!")
