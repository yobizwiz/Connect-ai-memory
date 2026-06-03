"""
core/data/breach_costs.py — 산업별 데이터 유출 비용 데이터
==========================================================

출처: IBM Cost of Data Breach Report 2024
URL: https://www.ibm.com/reports/data-breach

IBM은 매년 전 세계 604개 조직의 데이터 유출 사고를 분석하여
산업별, 지역별, 원인별 평균 비용을 발표합니다.

아래 데이터는 2024년 보고서의 주요 수치를 구조화한 것입니다.
"""

from typing import Dict, Optional
from dataclasses import dataclass


@dataclass
class BreachCostProfile:
    """산업별 데이터 유출 비용 프로필."""
    industry: str
    avg_total_cost_usd: float       # 평균 총 유출 비용 (USD)
    avg_cost_per_record_usd: float  # 레코드당 평균 비용 (USD)
    avg_detection_days: int         # 평균 탐지 소요 일수
    avg_containment_days: int       # 평균 억제 소요 일수


# ============================================================
# IBM Data Breach Report 2024 — 산업별 평균 비용
# ============================================================

INDUSTRY_BREACH_COSTS: Dict[str, BreachCostProfile] = {
    # --- 최고 비용 산업 ---
    "Healthcare": BreachCostProfile(
        industry="Healthcare",
        avg_total_cost_usd=9_770_000,
        avg_cost_per_record_usd=408,
        avg_detection_days=231,
        avg_containment_days=92,
    ),
    "의료": BreachCostProfile(
        industry="의료",
        avg_total_cost_usd=9_770_000,
        avg_cost_per_record_usd=408,
        avg_detection_days=231,
        avg_containment_days=92,
    ),

    # --- 금융 ---
    "Financial": BreachCostProfile(
        industry="Financial",
        avg_total_cost_usd=6_080_000,
        avg_cost_per_record_usd=181,
        avg_detection_days=177,
        avg_containment_days=56,
    ),
    "금융": BreachCostProfile(
        industry="금융",
        avg_total_cost_usd=6_080_000,
        avg_cost_per_record_usd=181,
        avg_detection_days=177,
        avg_containment_days=56,
    ),
    "Fintech": BreachCostProfile(
        industry="Fintech",
        avg_total_cost_usd=6_080_000,
        avg_cost_per_record_usd=181,
        avg_detection_days=177,
        avg_containment_days=56,
    ),

    # --- 기술 ---
    "Technology": BreachCostProfile(
        industry="Technology",
        avg_total_cost_usd=5_450_000,
        avg_cost_per_record_usd=175,
        avg_detection_days=185,
        avg_containment_days=63,
    ),

    # --- 제조 ---
    "Manufacturing": BreachCostProfile(
        industry="Manufacturing",
        avg_total_cost_usd=5_560_000,
        avg_cost_per_record_usd=172,
        avg_detection_days=199,
        avg_containment_days=73,
    ),
    "제조": BreachCostProfile(
        industry="제조",
        avg_total_cost_usd=5_560_000,
        avg_cost_per_record_usd=172,
        avg_detection_days=199,
        avg_containment_days=73,
    ),

    # --- 교육 ---
    "Education": BreachCostProfile(
        industry="Education",
        avg_total_cost_usd=3_650_000,
        avg_cost_per_record_usd=154,
        avg_detection_days=207,
        avg_containment_days=77,
    ),
    "교육": BreachCostProfile(
        industry="교육",
        avg_total_cost_usd=3_650_000,
        avg_cost_per_record_usd=154,
        avg_detection_days=207,
        avg_containment_days=77,
    ),

    # --- 소매 ---
    "Retail": BreachCostProfile(
        industry="Retail",
        avg_total_cost_usd=3_480_000,
        avg_cost_per_record_usd=152,
        avg_detection_days=189,
        avg_containment_days=69,
    ),
    "소매": BreachCostProfile(
        industry="소매",
        avg_total_cost_usd=3_480_000,
        avg_cost_per_record_usd=152,
        avg_detection_days=189,
        avg_containment_days=69,
    ),
}

# 기본값 (산업이 매핑되지 않을 때)
_DEFAULT_BREACH_COST = BreachCostProfile(
    industry="Global Average",
    avg_total_cost_usd=4_880_000,  # IBM 2024 글로벌 평균
    avg_cost_per_record_usd=165,
    avg_detection_days=194,
    avg_containment_days=64,
)


# ============================================================
# 지역별 평균 비용 승수 (글로벌 평균 대비)
# ============================================================

REGION_COST_MULTIPLIERS: Dict[str, float] = {
    "USA": 1.93,            # $9.36M — 가장 높음
    "Middle East": 1.62,    # $7.90M
    "Canada": 1.20,         # $5.87M
    "Germany": 1.10,        # $5.35M
    "Japan": 1.07,          # $5.24M
    "UK": 1.03,             # $5.05M
    "South Korea": 0.83,    # $4.05M
    "France": 0.89,         # $4.34M
    "Italy": 0.86,          # $4.19M
    "Global Average": 1.00, # $4.88M
}


# ============================================================
# 유출 원인별 비용 차이
# ============================================================

ATTACK_VECTOR_COSTS: Dict[str, float] = {
    "phishing": 4_760_000,
    "stolen_credentials": 4_810_000,
    "business_email_compromise": 4_880_000,
    "cloud_misconfiguration": 4_140_000,
    "insider_threat": 4_990_000,
    "system_vulnerability": 4_330_000,
}


# ============================================================
# 조회 함수
# ============================================================

def get_breach_cost(
    industry: str,
    pii_record_count: int = 0,
    region: str = "Global Average",
) -> Dict:
    """
    산업, PII 규모, 지역에 따른 예상 유출 비용을 계산합니다.
    
    Returns:
        {
            "avg_total_cost_usd": float,
            "estimated_pii_cost_usd": float,  # PII 규모 기반 추정
            "cost_per_record_usd": float,
            "avg_detection_days": int,
            "source": str,
        }
    """
    profile = INDUSTRY_BREACH_COSTS.get(industry, _DEFAULT_BREACH_COST)
    region_multiplier = REGION_COST_MULTIPLIERS.get(region, 1.0)

    # 기본 비용 (산업 + 지역 보정)
    adjusted_total = profile.avg_total_cost_usd * region_multiplier

    # PII 규모 기반 추정 비용
    if pii_record_count > 0:
        pii_cost = pii_record_count * profile.avg_cost_per_record_usd * region_multiplier
    else:
        pii_cost = 0.0

    return {
        "avg_total_cost_usd": round(adjusted_total, 2),
        "estimated_pii_cost_usd": round(pii_cost, 2),
        "cost_per_record_usd": round(profile.avg_cost_per_record_usd * region_multiplier, 2),
        "avg_detection_days": profile.avg_detection_days,
        "avg_containment_days": profile.avg_containment_days,
        "industry_profile": profile.industry,
        "region": region,
        "source": "IBM Cost of Data Breach Report 2024",
    }
