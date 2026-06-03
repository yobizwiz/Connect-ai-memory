"""
core/data/regulatory_fines.py — 실제 규제 벌금 사례 데이터베이스
================================================================

Primary market: United States

출처:
- FTC Enforcement Actions (ftc.gov/enforcement)
- HHS Office for Civil Rights Breach Portal (hhs.gov/hipaa)
- California Attorney General CCPA Enforcement
- SEC Cybersecurity Enforcement Actions
- State Attorney General Actions
- GDPR Enforcement Tracker (EU operations affecting US companies)

모든 금액은 USD 기준.
"""

from typing import List, Dict, Optional
from dataclasses import dataclass


@dataclass
class EnforcementCase:
    """실제 규제 벌금/합의금 사례."""
    company: str
    year: int
    industry: str
    regulation: str         # FTC, CCPA, HIPAA, SEC, GDPR, State AG, etc.
    violation_type: str     # PII_LEAK, COMPLIANCE_DRIFT, SYSTEM_VULNERABILITY
    fine_usd: float
    employee_range: str     # "1-50", "51-500", "500+"
    country: str
    legal_article: str
    description: str


# ============================================================
# FTC Enforcement Actions (미국 연방거래위원회)
# ============================================================

FTC_CASES = [
    EnforcementCase(
        company="Equifax",
        year=2019,
        industry="Financial",
        regulation="FTC",
        violation_type="PII_LEAK",
        fine_usd=575_000_000,
        employee_range="500+",
        country="USA",
        legal_article="FTC Act §5: Unfair or Deceptive Practices",
        description="147 million consumers' SSN, DOB, addresses exposed. Failed to patch known Apache Struts vulnerability for 2 months.",
    ),
    EnforcementCase(
        company="T-Mobile",
        year=2022,
        industry="Technology",
        regulation="FTC",
        violation_type="PII_LEAK",
        fine_usd=350_000_000,
        employee_range="500+",
        country="USA",
        legal_article="FTC Act §5 + State AG Settlement",
        description="76.6 million customers' data breached. Class action settlement for inadequate cybersecurity practices.",
    ),
    EnforcementCase(
        company="Epic Games (Fortnite)",
        year=2022,
        industry="Technology",
        regulation="FTC",
        violation_type="COMPLIANCE_DRIFT",
        fine_usd=520_000_000,
        employee_range="500+",
        country="USA",
        legal_article="FTC Act §5 + COPPA Rule 16 CFR §312",
        description="$275M COPPA violation (children's data) + $245M dark patterns refunds. Collected children's data without parental consent.",
    ),
    EnforcementCase(
        company="Capital One",
        year=2021,
        industry="Financial",
        regulation="FTC",
        violation_type="SYSTEM_VULNERABILITY",
        fine_usd=190_000_000,
        employee_range="500+",
        country="USA",
        legal_article="FTC Act §5 + OCC Consent Order",
        description="100 million customer records exposed via misconfigured AWS WAF. OCC $80M + class settlement $190M.",
    ),
    EnforcementCase(
        company="Uber Technologies",
        year=2018,
        industry="Technology",
        regulation="FTC",
        violation_type="PII_LEAK",
        fine_usd=148_000_000,
        employee_range="500+",
        country="USA",
        legal_article="FTC Act §5 + State AG Settlement (50 states)",
        description="57 million riders/drivers data breach concealed for over a year. Paid hackers $100K to delete data and hide incident.",
    ),
    EnforcementCase(
        company="Home Depot",
        year=2020,
        industry="Retail",
        regulation="FTC",
        violation_type="PII_LEAK",
        fine_usd=200_000_000,
        employee_range="500+",
        country="USA",
        legal_article="FTC Act §5 + State AG + Class Action",
        description="56 million credit card numbers stolen via POS malware. Total settlements including banks and consumers.",
    ),
    EnforcementCase(
        company="Marriott International",
        year=2020,
        industry="Hospitality",
        regulation="FTC",
        violation_type="PII_LEAK",
        fine_usd=52_000_000,
        employee_range="500+",
        country="USA",
        legal_article="FTC Act §5 + State AG Settlement (49 states + DC)",
        description="339 million Starwood guests' records breached. Passport numbers, payment cards exposed for 4 years undetected.",
    ),
    EnforcementCase(
        company="Zoom Video Communications",
        year=2021,
        industry="Technology",
        regulation="FTC",
        violation_type="COMPLIANCE_DRIFT",
        fine_usd=85_000_000,
        employee_range="500+",
        country="USA",
        legal_article="FTC Act §5: Deceptive security claims",
        description="Falsely claimed end-to-end encryption. Shared user data with Facebook without disclosure. $85M class settlement.",
    ),
    EnforcementCase(
        company="Morgan Stanley",
        year=2022,
        industry="Financial",
        regulation="FTC",
        violation_type="SYSTEM_VULNERABILITY",
        fine_usd=155_000_000,
        employee_range="500+",
        country="USA",
        legal_article="OCC Consent Order + SEC Settlement + Class Action",
        description="Failed to properly decommission data center hardware. Unencrypted customer data on decommissioned servers sold at auction.",
    ),
    EnforcementCase(
        company="CafePress",
        year=2022,
        industry="Retail",
        regulation="FTC",
        violation_type="PII_LEAK",
        fine_usd=500_000,
        employee_range="51-500",
        country="USA",
        legal_article="FTC Act §5: Failure to secure data",
        description="Covered up 2019 breach of 23 million accounts. Used outdated encryption (SHA-1), stored SSNs in plain text.",
    ),
    EnforcementCase(
        company="Chegg Inc.",
        year=2022,
        industry="Education",
        regulation="FTC",
        violation_type="PII_LEAK",
        fine_usd=0,  # Consent order, no monetary fine but strict compliance requirements
        employee_range="500+",
        country="USA",
        legal_article="FTC Act §5: Inadequate security (4 breaches 2017-2020)",
        description="Four data breaches in 3 years exposing 40M users. Required to implement comprehensive security program.",
    ),
    EnforcementCase(
        company="Drizly (Uber subsidiary)",
        year=2022,
        industry="Retail",
        regulation="FTC",
        violation_type="PII_LEAK",
        fine_usd=0,
        employee_range="51-500",
        country="USA",
        legal_article="FTC Act §5: CEO personal accountability order",
        description="2.5 million consumers' data exposed. FTC issued first-ever order holding CEO personally responsible for security.",
    ),
    EnforcementCase(
        company="BetterHelp",
        year=2023,
        industry="Healthcare",
        regulation="FTC",
        violation_type="PII_LEAK",
        fine_usd=7_800_000,
        employee_range="51-500",
        country="USA",
        legal_article="FTC Act §5 + Health Breach Notification Rule",
        description="Online therapy platform shared users' mental health data with Facebook, Snapchat, and Pinterest for advertising.",
    ),
    EnforcementCase(
        company="GoodRx",
        year=2023,
        industry="Healthcare",
        regulation="FTC",
        violation_type="PII_LEAK",
        fine_usd=1_500_000,
        employee_range="51-500",
        country="USA",
        legal_article="FTC Health Breach Notification Rule (first enforcement)",
        description="First-ever FTC enforcement of Health Breach Notification Rule. Shared prescription data with advertising platforms.",
    ),
]


# ============================================================
# CCPA / CPRA Enforcement (California)
# ============================================================

CCPA_CASES = [
    EnforcementCase(
        company="Sephora",
        year=2022,
        industry="Retail",
        regulation="CCPA",
        violation_type="COMPLIANCE_DRIFT",
        fine_usd=1_200_000,
        employee_range="500+",
        country="USA",
        legal_article="CCPA §1798.120: Right to Opt-Out of Sale",
        description="First major CCPA enforcement. Failed to honor opt-out requests, did not disclose sale of personal information to third parties.",
    ),
    EnforcementCase(
        company="DoorDash",
        year=2023,
        industry="Technology",
        regulation="CCPA",
        violation_type="PII_LEAK",
        fine_usd=375_000,
        employee_range="500+",
        country="USA",
        legal_article="CCPA §1798.100: Right to Know",
        description="Sold consumer data to marketing companies without providing required opt-out mechanism.",
    ),
    EnforcementCase(
        company="Tilting Point Media",
        year=2023,
        industry="Technology",
        regulation="CCPA",
        violation_type="COMPLIANCE_DRIFT",
        fine_usd=500_000,
        employee_range="51-500",
        country="USA",
        legal_article="CCPA §1798.120 + COPPA",
        description="Mobile gaming company collected and sold children's data without parental consent under CCPA and COPPA.",
    ),
]


# ============================================================
# HIPAA Enforcement (HHS Office for Civil Rights)
# ============================================================

HIPAA_CASES = [
    EnforcementCase(
        company="Anthem Inc.",
        year=2020,
        industry="Healthcare",
        regulation="HIPAA",
        violation_type="PII_LEAK",
        fine_usd=16_000_000,
        employee_range="500+",
        country="USA",
        legal_article="HIPAA Security Rule §164.308(a)(1): Security Management Process",
        description="78.8 million records breached — largest healthcare breach in US history. Failed to conduct enterprise-wide risk analysis.",
    ),
    EnforcementCase(
        company="Premera Blue Cross",
        year=2020,
        industry="Healthcare",
        regulation="HIPAA",
        violation_type="PII_LEAK",
        fine_usd=6_850_000,
        employee_range="500+",
        country="USA",
        legal_article="HIPAA Security Rule §164.312(a)(1): Access Control",
        description="10.4 million records breached. Hackers had access for 9 months before detection. Inadequate access controls and audit logs.",
    ),
    EnforcementCase(
        company="Advocate Health Care",
        year=2016,
        industry="Healthcare",
        regulation="HIPAA",
        violation_type="PII_LEAK",
        fine_usd=5_550_000,
        employee_range="500+",
        country="USA",
        legal_article="HIPAA Security Rule §164.312(d): Person or Entity Authentication",
        description="4 million patients' ePHI exposed. Unencrypted laptops stolen, failed to perform risk assessments at all locations.",
    ),
    EnforcementCase(
        company="Memorial Healthcare System",
        year=2017,
        industry="Healthcare",
        regulation="HIPAA",
        violation_type="SYSTEM_VULNERABILITY",
        fine_usd=5_500_000,
        employee_range="500+",
        country="USA",
        legal_article="HIPAA Security Rule §164.312(a)(1): Access Control",
        description="115,143 patients' PHI accessed by unauthorized employees. Failed to review login records and implement proper access controls.",
    ),
    EnforcementCase(
        company="Excellus Health Plan",
        year=2021,
        industry="Healthcare",
        regulation="HIPAA",
        violation_type="PII_LEAK",
        fine_usd=5_100_000,
        employee_range="500+",
        country="USA",
        legal_article="HIPAA Security Rule §164.308(a)(1)(ii)(A): Risk Analysis",
        description="9.3 million records breached. Hackers had access for 2+ years before discovery. Failed to conduct thorough risk analysis.",
    ),
    EnforcementCase(
        company="UCLA Health",
        year=2023,
        industry="Healthcare",
        regulation="HIPAA",
        violation_type="SYSTEM_VULNERABILITY",
        fine_usd=7_500_000,
        employee_range="500+",
        country="USA",
        legal_article="HIPAA Security Rule §164.308(a)(5): Security Awareness Training",
        description="Internal employees snooped on patient records including celebrities. Inadequate security awareness training program.",
    ),
    EnforcementCase(
        company="Banner Health",
        year=2023,
        industry="Healthcare",
        regulation="HIPAA",
        violation_type="PII_LEAK",
        fine_usd=1_250_000,
        employee_range="500+",
        country="USA",
        legal_article="HIPAA Security Rule §164.312(e)(1): Transmission Security",
        description="2.81 million patients' records exposed via hacker intrusion. Failed to implement adequate transmission security.",
    ),
    EnforcementCase(
        company="CHSPSC (Community Health Systems)",
        year=2020,
        industry="Healthcare",
        regulation="HIPAA",
        violation_type="PII_LEAK",
        fine_usd=2_300_000,
        employee_range="500+",
        country="USA",
        legal_article="HIPAA Security Rule §164.308(a)(1): Security Management",
        description="6.1 million patients' data exfiltrated by Chinese APT group. Failed to implement adequate security management process.",
    ),
    EnforcementCase(
        company="University of Rochester Medical Center",
        year=2019,
        industry="Healthcare",
        regulation="HIPAA",
        violation_type="SYSTEM_VULNERABILITY",
        fine_usd=3_000_000,
        employee_range="500+",
        country="USA",
        legal_article="HIPAA Security Rule §164.312(a)(2)(iv): Encryption",
        description="Lost unencrypted flash drive and stolen unencrypted laptop containing 3,403 patients' ePHI. No encryption despite known risk.",
    ),
    EnforcementCase(
        company="Cottage Health",
        year=2019,
        industry="Healthcare",
        regulation="HIPAA",
        violation_type="SYSTEM_VULNERABILITY",
        fine_usd=3_000_000,
        employee_range="500+",
        country="USA",
        legal_article="HIPAA Security Rule §164.308(a)(8): Evaluation",
        description="Exposed 62,500 patients' records on public internet due to server misconfiguration. Second violation after 2013 incident.",
    ),
    EnforcementCase(
        company="L.A. Care Health Plan",
        year=2019,
        industry="Healthcare",
        regulation="HIPAA",
        violation_type="COMPLIANCE_DRIFT",
        fine_usd=1_300_000,
        employee_range="500+",
        country="USA",
        legal_article="HIPAA Security Rule §164.308(a)(1)(ii)(B): Risk Management",
        description="Largest publicly-funded health plan in US. Failed to implement security measures sufficient to reduce risks to ePHI.",
    ),
    EnforcementCase(
        company="Solo Practitioner (Dental Office)",
        year=2022,
        industry="Healthcare",
        regulation="HIPAA",
        violation_type="COMPLIANCE_DRIFT",
        fine_usd=30_000,
        employee_range="1-50",
        country="USA",
        legal_article="HIPAA Privacy Rule §164.530(c): Policies and Procedures",
        description="Small dental practice with no written HIPAA policies. No employee training. No risk assessment ever conducted.",
    ),
    EnforcementCase(
        company="Physician Practice (Right of Access)",
        year=2023,
        industry="Healthcare",
        regulation="HIPAA",
        violation_type="COMPLIANCE_DRIFT",
        fine_usd=40_000,
        employee_range="1-50",
        country="USA",
        legal_article="HIPAA Privacy Rule §164.524: Right of Access",
        description="Failed to provide patient medical records within 30 days. Part of HHS Right of Access Initiative enforcement wave.",
    ),
]


# ============================================================
# SEC Cybersecurity Enforcement (Securities & Exchange Commission)
# ============================================================

SEC_CASES = [
    EnforcementCase(
        company="SolarWinds / Orion",
        year=2023,
        industry="Technology",
        regulation="SEC",
        violation_type="COMPLIANCE_DRIFT",
        fine_usd=0,  # Ongoing litigation
        employee_range="500+",
        country="USA",
        legal_article="Securities Act §17(a), Exchange Act §10(b): Fraud",
        description="SEC sued SolarWinds and CISO for misleading investors about cybersecurity practices. Landmark case for CISO personal liability.",
    ),
    EnforcementCase(
        company="First American Financial",
        year=2021,
        industry="Financial",
        regulation="SEC",
        violation_type="SYSTEM_VULNERABILITY",
        fine_usd=487_616,
        employee_range="500+",
        country="USA",
        legal_article="Exchange Act Rule 13a-15(a): Internal Controls",
        description="Exposed 800 million title/escrow documents. SEC charged for disclosure controls failure — knew about vuln but didn't escalate.",
    ),
    EnforcementCase(
        company="Pearson PLC",
        year=2021,
        industry="Education",
        regulation="SEC",
        violation_type="COMPLIANCE_DRIFT",
        fine_usd=1_000_000,
        employee_range="500+",
        country="USA",
        legal_article="Securities Act §17(a): Misleading statements",
        description="Misled investors about 2018 data breach affecting 13,000 school/university accounts. Described breach as 'hypothetical risk.'",
    ),
    EnforcementCase(
        company="Blackbaud",
        year=2023,
        industry="Technology",
        regulation="SEC",
        violation_type="COMPLIANCE_DRIFT",
        fine_usd=3_000_000,
        employee_range="500+",
        country="USA",
        legal_article="Exchange Act §13(a): Reporting Requirements",
        description="Failed to disclose full scope of ransomware attack to investors. Told investors SSNs were not accessed when they were.",
    ),
]


# ============================================================
# State Attorney General Actions (주정부 집행)
# ============================================================

STATE_AG_CASES = [
    EnforcementCase(
        company="Google (Location Tracking)",
        year=2022,
        industry="Technology",
        regulation="State AG",
        violation_type="COMPLIANCE_DRIFT",
        fine_usd=391_500_000,
        employee_range="500+",
        country="USA",
        legal_article="Consumer Protection Acts (40 states)",
        description="Settled with 40 state AGs for misleading users about location tracking. Continued tracking even when users disabled Location History.",
    ),
    EnforcementCase(
        company="Meta (Cambridge Analytica)",
        year=2022,
        industry="Technology",
        regulation="State AG",
        violation_type="PII_LEAK",
        fine_usd=725_000_000,
        employee_range="500+",
        country="USA",
        legal_article="Consumer Protection Statutes (multiple states)",
        description="Class action settlement over Cambridge Analytica. 87 million users' data shared without consent for political profiling.",
    ),
    EnforcementCase(
        company="Amazon (Ring / Alexa)",
        year=2023,
        industry="Technology",
        regulation="FTC",
        violation_type="PII_LEAK",
        fine_usd=30_800_000,
        employee_range="500+",
        country="USA",
        legal_article="FTC Act §5 + COPPA",
        description="$25M for Ring employee surveillance of customers + $5.8M for Alexa retaining children's data. Employees watched private video feeds.",
    ),
    EnforcementCase(
        company="Anthem (State AG Settlement)",
        year=2020,
        industry="Healthcare",
        regulation="State AG",
        violation_type="PII_LEAK",
        fine_usd=39_500_000,
        employee_range="500+",
        country="USA",
        legal_article="State Consumer Protection Acts (43 states + DC)",
        description="43-state settlement for 2015 breach (separate from HIPAA fine). 78.8M records. Total Anthem breach costs exceeded $400M.",
    ),
    EnforcementCase(
        company="Premom App (Easy Healthcare)",
        year=2023,
        industry="Healthcare",
        regulation="FTC",
        violation_type="PII_LEAK",
        fine_usd=100_000,
        employee_range="1-50",
        country="USA",
        legal_article="FTC Health Breach Notification Rule",
        description="Fertility tracking app shared sensitive health data with Google, AppsFlyer, and Chinese analytics firms without consent.",
    ),
    EnforcementCase(
        company="Residual Pumpkin / CafePress (CEO)",
        year=2022,
        industry="Retail",
        regulation="FTC",
        violation_type="PII_LEAK",
        fine_usd=500_000,
        employee_range="51-500",
        country="USA",
        legal_article="FTC Act §5",
        description="Former CEO personally fined. Company stored SSNs in plain text, used SHA-1, failed to investigate security incidents.",
    ),
]


# ============================================================
# GDPR Cases Affecting US Companies (EU operations)
# ============================================================

GDPR_US_COMPANY_CASES = [
    EnforcementCase(
        company="Meta Platforms (US)",
        year=2023,
        industry="Technology",
        regulation="GDPR",
        violation_type="PII_LEAK",
        fine_usd=1_296_000_000,
        employee_range="500+",
        country="USA",
        legal_article="GDPR Article 46(1): Cross-border data transfer",
        description="EU-US personal data transfer without adequate safeguards. Largest GDPR fine ever. Affects any US company processing EU data.",
    ),
    EnforcementCase(
        company="Amazon (US)",
        year=2021,
        industry="Retail",
        regulation="GDPR",
        violation_type="PII_LEAK",
        fine_usd=805_680_000,
        employee_range="500+",
        country="USA",
        legal_article="GDPR Article 6: Lawfulness of processing",
        description="€746M fine for ad-targeting without proper legal basis. Any US company with EU customers faces same risk.",
    ),
    EnforcementCase(
        company="Clearview AI (US)",
        year=2022,
        industry="Technology",
        regulation="GDPR",
        violation_type="PII_LEAK",
        fine_usd=21_600_000,
        employee_range="1-50",
        country="USA",
        legal_article="GDPR Article 6, 15, 17: Unlawful processing",
        description="US startup fined by France, Italy, Greece, UK for scraping billions of facial images without consent. Small company, huge fine.",
    ),
    EnforcementCase(
        company="WhatsApp (US parent)",
        year=2021,
        industry="Technology",
        regulation="GDPR",
        violation_type="COMPLIANCE_DRIFT",
        fine_usd=247_320_000,
        employee_range="500+",
        country="USA",
        legal_article="GDPR Article 13-14: Transparency obligations",
        description="Failed to clearly inform users about data processing. Privacy policy transparency requirements violated.",
    ),
]


# ============================================================
# 전체 데이터베이스 통합 (미국 중심)
# ============================================================

ENFORCEMENT_CASES: List[EnforcementCase] = (
    FTC_CASES
    + CCPA_CASES
    + HIPAA_CASES
    + SEC_CASES
    + STATE_AG_CASES
    + GDPR_US_COMPANY_CASES
)


# ============================================================
# 유사 사례 검색 함수
# ============================================================

def _get_employee_range(count: int) -> str:
    """직원 수를 범위 문자열로 변환."""
    if count <= 50:
        return "1-50"
    elif count <= 500:
        return "51-500"
    else:
        return "500+"


def _industry_match_score(case_industry: str, query_industry: str) -> float:
    """산업 매칭 점수 (0.0~1.0)."""
    if case_industry == query_industry:
        return 1.0

    similar_groups = [
        {"Financial", "Fintech", "Finance", "Banking", "금융"},
        {"Healthcare", "Medical", "Pharma", "의료"},
        {"Manufacturing", "Industrial", "제조"},
        {"Retail", "E-commerce", "소매"},
        {"Technology", "Tech", "IT", "SaaS"},
        {"Education", "EdTech", "교육"},
        {"Hospitality", "Travel"},
    ]

    for group in similar_groups:
        if case_industry in group and query_industry in group:
            return 0.8

    return 0.0


def find_similar_cases(
    industry: str,
    employee_count: int,
    has_compliance_audit: bool,
    violation_types: Optional[List[str]] = None,
    top_n: int = 5,
) -> List[Dict]:
    """
    입력 조건과 유사한 실제 벌금 사례를 검색합니다.

    매칭 기준:
    1. 산업 유사도 (가중치 0.35)
    2. 직원 규모 매칭 (가중치 0.25)
    3. 위반 유형 매칭 (가중치 0.25)
    4. US 사례 우선 (가중치 0.15)
    """
    emp_range = _get_employee_range(employee_count)
    scored_cases = []

    for case in ENFORCEMENT_CASES:
        score = 0.0

        # 1. 산업 매칭 (35%)
        score += _industry_match_score(case.industry, industry) * 0.35

        # 2. 규모 매칭 (25%)
        if case.employee_range == emp_range:
            score += 0.25
        elif (emp_range == "51-500" and case.employee_range in ("1-50", "500+")):
            score += 0.08
        elif (emp_range == "500+" and case.employee_range == "51-500"):
            score += 0.08

        # 3. 위반 유형 매칭 (25%)
        if violation_types:
            for vt in violation_types:
                if case.violation_type == vt:
                    score += 0.25 / len(violation_types)
        else:
            if not has_compliance_audit and case.violation_type == "COMPLIANCE_DRIFT":
                score += 0.15

        # 4. US 사례 우선 (15%)
        if case.country == "USA":
            score += 0.15

        # 벌금이 0인 사례는 낮은 우선순위 (중요하지만 수치 비교가 어려움)
        if case.fine_usd == 0:
            score *= 0.5

        if score > 0:
            scored_cases.append({
                "company": case.company,
                "year": case.year,
                "industry": case.industry,
                "regulation": case.regulation,
                "violation_type": case.violation_type,
                "fine_usd": case.fine_usd,
                "employee_range": case.employee_range,
                "country": case.country,
                "legal_article": case.legal_article,
                "description": case.description,
                "similarity_score": round(score, 2),
            })

    scored_cases.sort(key=lambda x: (-x["similarity_score"], -x["fine_usd"]))
    return scored_cases[:top_n]
