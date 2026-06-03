"""
core/checklist.py — 컴플라이언스 자가진단 체크리스트 엔진
=========================================================

20문항 체크리스트 + 채점 + 갭 분석 + 무료/유료 콘텐츠 분리.

각 문항은 실제 규제 요구사항에 매핑되어 있습니다.
사용자가 Yes/No로 답하면, 미충족 항목(Gap)을 식별하고
개선 가이드를 생성합니다.

무료: 진단 결과 + 상위 1개 개선 가이드
유료: 전체 개선 가이드 + 상세 보고서
"""

from typing import List, Dict, Optional
from dataclasses import dataclass, field
from enum import Enum


# ============================================================
# 체크리스트 문항 정의
# ============================================================

class ComplianceCategory(str, Enum):
    """컴플라이언스 카테고리."""
    DATA_PROTECTION = "Data Protection & Privacy"
    ACCESS_CONTROL = "Access Controls"
    INCIDENT_RESPONSE = "Incident Response"
    EMPLOYEE_TRAINING = "Employee Training"
    DATA_MINIMIZATION = "Data Minimization"
    THIRD_PARTY = "Third-Party Risk"
    ENCRYPTION = "Encryption & Security"
    AUDIT = "Audit & Monitoring"
    CONSENT = "Consent Management"
    BUSINESS_CONTINUITY = "Business Continuity"


class Severity(str, Enum):
    """미충족 시 위험도."""
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


@dataclass
class ChecklistQuestion:
    """개별 체크리스트 문항."""
    id: str
    category: ComplianceCategory
    question: str                     # 사용자에게 보여줄 질문
    severity: Severity                # 미충족 시 위험도
    regulations: List[str]            # 관련 규제 목록
    weight: float                     # 채점 가중치 (1.0~5.0)
    remediation_summary: str          # 무료 — 간단한 개선 방향
    remediation_detail: str           # 유료 — 상세 개선 가이드
    estimated_fix_days: int           # 예상 수정 소요 일수
    estimated_fix_cost_usd: float     # 예상 수정 비용


# ============================================================
# 20문항 체크리스트
# ============================================================

CHECKLIST_QUESTIONS: List[ChecklistQuestion] = [

    # --- DATA PROTECTION (3문항) ---
    ChecklistQuestion(
        id="DP-01",
        category=ComplianceCategory.DATA_PROTECTION,
        question="Do you maintain a documented inventory of all personal data you collect, process, and store?",
        severity=Severity.CRITICAL,
        regulations=["GDPR Article 30", "CCPA §1798.100", "HIPAA §164.310"],
        weight=5.0,
        remediation_summary="Create a data mapping document listing all personal data flows.",
        remediation_detail="""## Data Inventory & Mapping Guide

### Step 1: Identify Data Sources (Week 1)
- List every system that collects personal data (CRM, email, analytics, payment, HR)
- Document: what data, why collected, where stored, who has access, retention period

### Step 2: Create Data Flow Diagram (Week 2)
- Map data from collection → processing → storage → deletion
- Identify all third parties who receive data
- Tools: OneTrust DataDiscovery, BigID, or a simple spreadsheet template

### Step 3: Classify Data by Sensitivity (Week 3)
- PII (name, email, phone) → Standard protection
- Sensitive PII (SSN, financial, health) → Enhanced protection
- Children's data → COPPA requirements

### Step 4: Maintain & Review (Ongoing)
- Review quarterly or when new systems are added
- Assign a data steward per department

**Estimated Cost**: $2,000-$15,000 (tool-dependent)
**Estimated Time**: 3-4 weeks
**Regulatory Impact**: Required by GDPR Art.30, CCPA, and most state privacy laws""",
        estimated_fix_days=21,
        estimated_fix_cost_usd=5000,
    ),

    ChecklistQuestion(
        id="DP-02",
        category=ComplianceCategory.DATA_PROTECTION,
        question="Do you have a written privacy policy that is publicly accessible and updated within the last 12 months?",
        severity=Severity.HIGH,
        regulations=["GDPR Article 13-14", "CCPA §1798.100(b)", "FTC Act §5"],
        weight=4.0,
        remediation_summary="Draft or update your privacy policy to include all required disclosures.",
        remediation_detail="""## Privacy Policy Update Guide

### Required Elements (US Market):
1. **What data you collect** — Be specific (not "we may collect")
2. **How you use it** — Each purpose listed separately
3. **Who you share it with** — Name categories of third parties
4. **Consumer rights** — Opt-out, deletion, access requests
5. **Contact information** — Dedicated privacy contact or DPO
6. **Data retention periods** — How long you keep each type
7. **Security measures** — General description of protections

### CCPA-Specific Requirements:
- "Do Not Sell My Personal Information" link on homepage
- 12-month lookback disclosure of data categories sold
- Two methods for consumers to submit requests

### Tools:
- Termly, Iubenda, or OneTrust for automated policy generation
- Legal review recommended ($500-$2,000)

**Estimated Cost**: $500-$3,000
**Estimated Time**: 1-2 weeks""",
        estimated_fix_days=10,
        estimated_fix_cost_usd=1500,
    ),

    ChecklistQuestion(
        id="DP-03",
        category=ComplianceCategory.DATA_PROTECTION,
        question="Can you fulfill a consumer data deletion request within 30 days?",
        severity=Severity.HIGH,
        regulations=["GDPR Article 17", "CCPA §1798.105", "CPRA"],
        weight=4.0,
        remediation_summary="Implement a data subject request (DSR) process with a 30-day SLA.",
        remediation_detail="""## Data Subject Request (DSR) Process Guide

### Build a DSR Workflow:
1. **Intake**: Create a web form or email (privacy@company.com) for requests
2. **Verification**: Verify requester identity (2-step process)
3. **Search**: Locate all data across systems (why DP-01 matters first)
4. **Execute**: Delete from primary systems AND backups
5. **Confirm**: Notify requester within 30 days (CCPA) / 45 days (GDPR)

### Common Pitfalls:
- Forgetting data in backups, logs, and third-party systems
- No process for verifying the requester's identity
- Missing the deadline (automatic violation)

### Tools:
- DataGrail, OneTrust, or custom workflow in your ticketing system

**Estimated Cost**: $1,000-$5,000
**Estimated Time**: 2-3 weeks""",
        estimated_fix_days=15,
        estimated_fix_cost_usd=3000,
    ),

    # --- ACCESS CONTROL (2문항) ---
    ChecklistQuestion(
        id="AC-01",
        category=ComplianceCategory.ACCESS_CONTROL,
        question="Do you enforce multi-factor authentication (MFA) for all employees accessing sensitive data?",
        severity=Severity.CRITICAL,
        regulations=["HIPAA §164.312(d)", "PCI-DSS 8.3", "NIST 800-63B", "CCPA Reasonable Security"],
        weight=5.0,
        remediation_summary="Enable MFA on all systems handling sensitive data, starting with admin accounts.",
        remediation_detail="""## MFA Implementation Guide

### Priority Order:
1. **Immediate** (Day 1): Admin/root accounts, cloud consoles (AWS, GCP, Azure)
2. **Week 1**: Email, VPN, remote access
3. **Week 2**: Internal apps with customer data, HR systems
4. **Week 3**: All remaining employee accounts

### Recommended Solutions:
- Google Workspace / Microsoft 365 → Built-in MFA (free)
- Okta, Duo Security → Enterprise MFA ($3-6/user/month)
- Hardware keys (YubiKey) for highest-risk roles ($50/key)

### Critical Note:
SMS-based 2FA is better than nothing but NOT considered secure.
Use app-based (TOTP) or hardware keys for compliance.

**Estimated Cost**: $0-$5,000/year (depends on provider)
**Estimated Time**: 1-3 weeks""",
        estimated_fix_days=14,
        estimated_fix_cost_usd=2000,
    ),

    ChecklistQuestion(
        id="AC-02",
        category=ComplianceCategory.ACCESS_CONTROL,
        question="Do you follow the principle of least privilege — employees only access data necessary for their role?",
        severity=Severity.HIGH,
        regulations=["HIPAA §164.312(a)(1)", "NIST 800-53 AC-6", "SOC 2 CC6.1"],
        weight=4.0,
        remediation_summary="Review and restrict access permissions using role-based access control (RBAC).",
        remediation_detail="""## Least Privilege & RBAC Guide

### Step 1: Access Audit
- Export all user permissions from each system
- Identify over-provisioned accounts (who has access they don't need?)
- Flag inactive accounts (not logged in 90+ days)

### Step 2: Define Roles
- Create role templates per department (Engineering, Sales, HR, Finance)
- Map each role to minimum required permissions
- Document and get manager sign-off

### Step 3: Implement
- Remove excess permissions
- Set up automated provisioning/deprovisioning (when employee joins/leaves)
- Quarterly access reviews

**Estimated Cost**: $2,000-$8,000
**Estimated Time**: 3-4 weeks""",
        estimated_fix_days=21,
        estimated_fix_cost_usd=4000,
    ),

    # --- INCIDENT RESPONSE (2문항) ---
    ChecklistQuestion(
        id="IR-01",
        category=ComplianceCategory.INCIDENT_RESPONSE,
        question="Do you have a documented incident response plan that has been tested in the last 12 months?",
        severity=Severity.CRITICAL,
        regulations=["HIPAA §164.308(a)(6)", "GDPR Article 33-34", "CCPA §1798.150", "SEC Cyber Rules"],
        weight=5.0,
        remediation_summary="Create and test an incident response plan covering detection, containment, notification, and recovery.",
        remediation_detail="""## Incident Response Plan Template

### Required Components:
1. **Roles & Contacts**: Who does what during an incident (IR lead, legal, PR, CEO)
2. **Detection**: How are incidents identified? (monitoring, employee reports, vendor alerts)
3. **Classification**: Severity levels (P1-Critical to P4-Low)
4. **Containment**: Immediate steps to stop the breach
5. **Investigation**: Root cause analysis process
6. **Notification**: 
   - GDPR: 72 hours to supervisory authority
   - HIPAA: 60 days to HHS + affected individuals
   - SEC: Material incident disclosure in 8-K (4 business days)
   - State laws: Varying (some as short as 30 days)
7. **Recovery**: System restoration and monitoring
8. **Post-Incident**: Lessons learned, plan updates

### Testing:
- Run a tabletop exercise annually (simulated breach scenario)
- Document results and improvements

**Estimated Cost**: $3,000-$10,000 (with external consultant)
**Estimated Time**: 2-4 weeks""",
        estimated_fix_days=21,
        estimated_fix_cost_usd=5000,
    ),

    ChecklistQuestion(
        id="IR-02",
        category=ComplianceCategory.INCIDENT_RESPONSE,
        question="Can you detect a data breach within 72 hours of occurrence?",
        severity=Severity.HIGH,
        regulations=["GDPR Article 33", "HIPAA §164.308(a)(1)(ii)(D)", "NIST CSF DE.CM"],
        weight=4.0,
        remediation_summary="Implement security monitoring and alerting (SIEM or equivalent) for critical systems.",
        remediation_detail="""## Breach Detection Guide

### For Small Companies (< 50 employees):
- Enable cloud provider alerts (AWS GuardDuty, Azure Defender)
- Set up login anomaly detection (unusual locations, times)
- Monitor data export/download volumes
- Cost: $100-500/month

### For Mid-Size (50-500):
- SIEM solution (Splunk, Datadog Security, Elastic SIEM)
- Endpoint Detection & Response (CrowdStrike, SentinelOne)
- 24/7 alert monitoring (or MDR service)
- Cost: $2,000-10,000/month

### Key Metrics:
- MTTD (Mean Time to Detect): Industry avg is 194 days (IBM 2024)
- Target: < 72 hours for GDPR compliance

**Estimated Cost**: $1,200-$120,000/year
**Estimated Time**: 2-6 weeks""",
        estimated_fix_days=30,
        estimated_fix_cost_usd=15000,
    ),

    # --- EMPLOYEE TRAINING (2문항) ---
    ChecklistQuestion(
        id="ET-01",
        category=ComplianceCategory.EMPLOYEE_TRAINING,
        question="Do all employees complete security awareness training at least once per year?",
        severity=Severity.HIGH,
        regulations=["HIPAA §164.308(a)(5)", "PCI-DSS 12.6", "NIST 800-53 AT-2", "FTC Safeguards Rule"],
        weight=4.0,
        remediation_summary="Implement annual security training with phishing simulations.",
        remediation_detail="""## Security Training Program Guide

### Required Topics:
- Phishing & social engineering recognition
- Password hygiene and MFA usage
- Data handling and classification
- Incident reporting procedures
- Clean desk / screen lock policies
- Acceptable use of company systems

### Recommended Platforms:
- KnowBe4 ($10-25/user/year) — Market leader
- Proofpoint Security Awareness ($8-20/user/year)
- Free: Google's Phishing Quiz, SANS Ouch! newsletter

### Best Practice:
- Annual comprehensive training + quarterly micro-training
- Monthly phishing simulations
- Track completion rates (must be documented for compliance)

**Estimated Cost**: $500-$5,000/year
**Estimated Time**: 1 week to set up, ongoing""",
        estimated_fix_days=7,
        estimated_fix_cost_usd=2000,
    ),

    ChecklistQuestion(
        id="ET-02",
        category=ComplianceCategory.EMPLOYEE_TRAINING,
        question="Do you have a clear, written acceptable use policy that employees sign upon hiring?",
        severity=Severity.MEDIUM,
        regulations=["FTC Safeguards Rule", "SOC 2 CC1.4", "NIST 800-53 PL-4"],
        weight=3.0,
        remediation_summary="Create an acceptable use policy covering devices, data handling, and approved software.",
        remediation_detail="""## Acceptable Use Policy Guide

### Key Sections:
1. Scope (who it applies to — employees, contractors, vendors)
2. Acceptable use of company devices and network
3. Personal device policy (BYOD rules)
4. Approved software list
5. Data handling rules (no personal email for work data)
6. Social media guidelines
7. Consequences of violation

### Implementation:
- Include in employee onboarding packet
- Require annual re-acknowledgment
- Store signed copies in HR system

**Estimated Cost**: $500-$1,500 (legal review)
**Estimated Time**: 1 week""",
        estimated_fix_days=5,
        estimated_fix_cost_usd=800,
    ),

    # --- DATA MINIMIZATION (2문항) ---
    ChecklistQuestion(
        id="DM-01",
        category=ComplianceCategory.DATA_MINIMIZATION,
        question="Do you have a data retention policy that automatically deletes data after its purpose is fulfilled?",
        severity=Severity.HIGH,
        regulations=["GDPR Article 5(1)(e)", "CCPA §1798.100", "HIPAA §164.530(j)"],
        weight=4.0,
        remediation_summary="Define retention periods for each data type and implement automated deletion.",
        remediation_detail="""## Data Retention Policy Guide

### Recommended Retention Periods:
| Data Type | Retention | Regulation |
|---|---|---|
| Customer transactions | 7 years | IRS/Tax requirements |
| Employee records | 3 years post-employment | EEOC, DOL |
| Health records (HIPAA) | 6 years from last action | HIPAA |
| Marketing consent logs | Duration of consent | GDPR/CCPA |
| Application logs | 90 days | Best practice |
| Backups | 30-90 days | Best practice |

### Automation:
- Set up database TTL (Time-to-Live) for auto-deletion
- Cloud storage lifecycle policies (S3, GCS)
- Regular purge jobs for legacy data

**Estimated Cost**: $1,000-$5,000
**Estimated Time**: 2-3 weeks""",
        estimated_fix_days=15,
        estimated_fix_cost_usd=3000,
    ),

    ChecklistQuestion(
        id="DM-02",
        category=ComplianceCategory.DATA_MINIMIZATION,
        question="Do you collect only the minimum personal data necessary for each business purpose?",
        severity=Severity.MEDIUM,
        regulations=["GDPR Article 5(1)(c)", "CCPA", "FTC Act §5"],
        weight=3.0,
        remediation_summary="Audit data collection forms and remove unnecessary fields.",
        remediation_detail="""## Data Minimization Audit

### Action Items:
1. Review every form, signup flow, and data collection point
2. For each field, ask: "Do we NEED this to provide the service?"
3. Remove optional fields that aren't used
4. Stop collecting SSN unless legally required
5. Replace exact DOB with age range where possible

### Common Over-Collection:
- Asking for DOB on signup when not needed
- Collecting physical address for digital-only services
- Requesting SSN for non-financial services
- Storing full credit card numbers instead of tokens

**Estimated Cost**: $500-$2,000
**Estimated Time**: 1-2 weeks""",
        estimated_fix_days=10,
        estimated_fix_cost_usd=1000,
    ),

    # --- THIRD PARTY RISK (2문항) ---
    ChecklistQuestion(
        id="TP-01",
        category=ComplianceCategory.THIRD_PARTY,
        question="Do you have Data Processing Agreements (DPAs) with all vendors who handle your customers' personal data?",
        severity=Severity.CRITICAL,
        regulations=["GDPR Article 28", "CCPA §1798.140(w)", "HIPAA BAA Requirements"],
        weight=5.0,
        remediation_summary="Identify all vendors processing personal data and execute DPAs/BAAs.",
        remediation_detail="""## Vendor DPA/BAA Guide

### Step 1: Vendor Inventory
List every vendor who touches personal data:
- Cloud providers (AWS, GCP, Azure)
- Analytics (Google Analytics, Mixpanel)
- Marketing (Mailchimp, HubSpot)
- Payment (Stripe, Square)
- HR/Payroll (Gusto, ADP)
- Support (Zendesk, Intercom)

### Step 2: DPA Requirements
Each agreement must include:
- Purpose and scope of data processing
- Data security obligations
- Subprocessor notification rights
- Data breach notification timeline
- Data deletion obligations upon termination
- Audit rights

### Step 3: Execute
- Most major vendors have standard DPAs (request theirs)
- For smaller vendors: use your template
- Healthcare: Must be a BAA (Business Associate Agreement)

**Estimated Cost**: $2,000-$10,000 (legal review)
**Estimated Time**: 3-6 weeks""",
        estimated_fix_days=30,
        estimated_fix_cost_usd=5000,
    ),

    ChecklistQuestion(
        id="TP-02",
        category=ComplianceCategory.THIRD_PARTY,
        question="Do you conduct security assessments of critical vendors before onboarding and annually thereafter?",
        severity=Severity.MEDIUM,
        regulations=["SOC 2 CC9.2", "NIST 800-53 SA-9", "FTC Safeguards Rule"],
        weight=3.0,
        remediation_summary="Create a vendor risk assessment questionnaire and review process.",
        remediation_detail="""## Vendor Risk Assessment Guide

### Assessment Questionnaire (Key Questions):
1. Do you have SOC 2 Type II or ISO 27001 certification?
2. Where is data stored geographically?
3. How do you handle data breach notifications?
4. What encryption standards do you use?
5. Do you have cyber insurance?

### Risk Tiers:
- **Critical**: Processes sensitive data → Full assessment + annual review
- **High**: Has system access → SOC 2 report review
- **Low**: No data access → Simplified questionnaire

**Estimated Cost**: $1,000-$3,000
**Estimated Time**: 2-3 weeks per cycle""",
        estimated_fix_days=14,
        estimated_fix_cost_usd=2000,
    ),

    # --- ENCRYPTION (2문항) ---
    ChecklistQuestion(
        id="EN-01",
        category=ComplianceCategory.ENCRYPTION,
        question="Is all sensitive personal data encrypted both at rest (stored) and in transit (transmitted)?",
        severity=Severity.CRITICAL,
        regulations=["HIPAA §164.312(a)(2)(iv)", "PCI-DSS 3.4/4.1", "CCPA Reasonable Security", "GDPR Article 32"],
        weight=5.0,
        remediation_summary="Enable encryption for all databases, file storage, and data transmissions (TLS 1.2+).",
        remediation_detail="""## Encryption Implementation Guide

### At Rest:
- **Databases**: Enable Transparent Data Encryption (TDE) — AWS RDS, Azure SQL
- **File Storage**: Enable server-side encryption (SSE-S3, SSE-KMS)
- **Laptops**: Enable BitLocker (Windows) or FileVault (Mac)
- **Backups**: Encrypt all backup files

### In Transit:
- **Web**: TLS 1.2+ on all endpoints (HTTPS only, disable HTTP)
- **API**: Require TLS for all API calls
- **Email**: Enable TLS for email transport
- **Internal**: VPN or encrypted tunnels for internal traffic

### Key Management:
- Use cloud KMS (AWS KMS, GCP KMS) — don't manage keys yourself
- Rotate keys annually
- Never hardcode keys in source code

**Estimated Cost**: $0-$5,000 (most cloud providers include it)
**Estimated Time**: 1-3 weeks""",
        estimated_fix_days=14,
        estimated_fix_cost_usd=2000,
    ),

    ChecklistQuestion(
        id="EN-02",
        category=ComplianceCategory.ENCRYPTION,
        question="Do you use strong, unique passwords and prohibit password sharing across the organization?",
        severity=Severity.HIGH,
        regulations=["NIST 800-63B", "PCI-DSS 8.2", "HIPAA §164.312(d)"],
        weight=3.0,
        remediation_summary="Deploy a password manager and enforce minimum password requirements.",
        remediation_detail="""## Password Policy Guide

### NIST 800-63B (Current Standard):
- Minimum 12 characters (length > complexity)
- No mandatory rotation unless breach suspected
- Screen against breached password lists
- Require MFA (more important than password complexity)

### Implementation:
- Deploy 1Password, Bitwarden, or LastPass for Teams
- Enable SSO where possible (reduces password fatigue)
- Ban password sharing — use shared vaults instead

**Estimated Cost**: $500-$3,000/year
**Estimated Time**: 1 week""",
        estimated_fix_days=5,
        estimated_fix_cost_usd=1500,
    ),

    # --- AUDIT & MONITORING (2문항) ---
    ChecklistQuestion(
        id="AU-01",
        category=ComplianceCategory.AUDIT,
        question="Do you maintain audit logs of who accessed sensitive data, and are they retained for at least 1 year?",
        severity=Severity.HIGH,
        regulations=["HIPAA §164.312(b)", "SOC 2 CC7.2", "PCI-DSS 10.1", "SEC Cyber Rules"],
        weight=4.0,
        remediation_summary="Enable access logging on all systems with sensitive data and set 1-year retention.",
        remediation_detail="""## Audit Logging Guide

### What to Log:
- Authentication events (login, logout, failed attempts)
- Data access (who viewed/exported what)
- Configuration changes (admin actions)
- Privilege escalations
- Data deletion events

### Where to Log:
- Cloud: AWS CloudTrail, GCP Audit Logs, Azure Activity Log
- Database: Enable query logging
- Application: Structured application logs

### Retention:
- Minimum 1 year (HIPAA, SOC 2)
- PCI-DSS: 1 year, 3 months immediately accessible
- SEC: As needed for investigation

**Estimated Cost**: $500-$5,000/year
**Estimated Time**: 1-2 weeks""",
        estimated_fix_days=10,
        estimated_fix_cost_usd=2000,
    ),

    ChecklistQuestion(
        id="AU-02",
        category=ComplianceCategory.AUDIT,
        question="Have you conducted a formal risk assessment within the last 12 months?",
        severity=Severity.CRITICAL,
        regulations=["HIPAA §164.308(a)(1)(ii)(A)", "NIST 800-53 RA-3", "GDPR Article 35", "FTC Safeguards Rule"],
        weight=5.0,
        remediation_summary="Conduct a formal risk assessment identifying threats, vulnerabilities, and mitigation plans.",
        remediation_detail="""## Risk Assessment Guide

### Framework: NIST CSF (Recommended for US companies)
1. **Identify**: List all assets, data flows, and systems
2. **Protect**: Evaluate current safeguards
3. **Detect**: Assess monitoring capabilities
4. **Respond**: Review incident response readiness
5. **Recover**: Evaluate backup and recovery procedures

### Assessment Process:
1. Threat identification (what could go wrong?)
2. Vulnerability scan (what weaknesses exist?)
3. Impact analysis (how bad would it be?)
4. Likelihood rating (how probable?)
5. Risk score = Impact × Likelihood
6. Mitigation plan for High/Critical risks

### Options:
- DIY: Use NIST CSF spreadsheet template (free)
- Automated: Vanta, Drata, Secureframe ($5K-50K/year)
- Consultant: $10K-$50K for comprehensive assessment

**Estimated Cost**: $5,000-$50,000
**Estimated Time**: 4-8 weeks""",
        estimated_fix_days=42,
        estimated_fix_cost_usd=15000,
    ),

    # --- CONSENT MANAGEMENT (2문항) ---
    ChecklistQuestion(
        id="CM-01",
        category=ComplianceCategory.CONSENT,
        question="Do you obtain explicit, documented consent before collecting personal data for each specific purpose?",
        severity=Severity.HIGH,
        regulations=["GDPR Article 6-7", "CCPA §1798.120", "COPPA", "TCPA"],
        weight=4.0,
        remediation_summary="Implement granular consent collection with purpose-specific opt-ins.",
        remediation_detail="""## Consent Management Guide

### Requirements:
- Separate consent for each purpose (marketing ≠ analytics ≠ sharing)
- Pre-checked boxes are NOT valid consent (GDPR)
- Must be as easy to withdraw as to give
- Keep timestamped records of all consent

### Implementation:
- Cookie consent banner (OneTrust, Cookiebot, Osano)
- Email marketing opt-in (double opt-in recommended)
- Data sharing consent separate from ToS
- Consent preference center for users

### CCPA-Specific:
- "Do Not Sell or Share My Personal Information" link required
- Honor Global Privacy Control (GPC) browser signals

**Estimated Cost**: $1,000-$10,000/year
**Estimated Time**: 2-3 weeks""",
        estimated_fix_days=15,
        estimated_fix_cost_usd=3000,
    ),

    ChecklistQuestion(
        id="CM-02",
        category=ComplianceCategory.CONSENT,
        question="If you process children's data (under 13), do you have COPPA-compliant parental consent mechanisms?",
        severity=Severity.CRITICAL,
        regulations=["COPPA Rule 16 CFR §312", "FTC Act §5", "CCPA (under 16)"],
        weight=5.0,
        remediation_summary="If applicable: implement age-gating and verifiable parental consent. If not applicable: document that your service is not directed at children.",
        remediation_detail="""## COPPA Compliance Guide

### If Your Service May Reach Children:
1. **Age Gate**: Ask age before data collection
2. **Parental Consent**: Verifiable methods include:
   - Signed consent form (mail/fax/email scan)
   - Credit card verification (small charge)
   - Video call with parent
   - Government ID verification
3. **Parental Rights**: Allow parents to review/delete child's data
4. **Data Minimization**: Collect ONLY what's necessary
5. **Retention Limits**: Delete when no longer needed

### If NOT Directed at Children:
- Document in your privacy policy: "Our service is not intended for users under 13"
- Include age verification in signup flow
- Have a process if you discover underage users

### Warning: Epic Games paid $275M for COPPA violations (FTC 2022)

**Estimated Cost**: $2,000-$15,000
**Estimated Time**: 3-4 weeks""",
        estimated_fix_days=21,
        estimated_fix_cost_usd=5000,
    ),

    # --- BUSINESS CONTINUITY (1문항) ---
    ChecklistQuestion(
        id="BC-01",
        category=ComplianceCategory.BUSINESS_CONTINUITY,
        question="Do you have automated backups with a tested disaster recovery plan?",
        severity=Severity.HIGH,
        regulations=["HIPAA §164.308(a)(7)", "SOC 2 A1.2", "NIST 800-53 CP-9"],
        weight=4.0,
        remediation_summary="Implement automated daily backups with offsite storage and test recovery quarterly.",
        remediation_detail="""## Backup & Disaster Recovery Guide

### 3-2-1 Backup Rule:
- **3** copies of data
- **2** different media types
- **1** offsite (different region/cloud)

### Implementation:
- Database: Automated daily snapshots (RDS, Cloud SQL)
- File storage: Cross-region replication
- Configuration: Infrastructure as Code (Terraform, CloudFormation)
- Test: Restore from backup quarterly and document results

### RTO/RPO Targets:
- RPO (data loss tolerance): < 24 hours
- RTO (recovery time): < 4 hours for critical systems

**Estimated Cost**: $500-$5,000/month
**Estimated Time**: 2-4 weeks""",
        estimated_fix_days=21,
        estimated_fix_cost_usd=5000,
    ),
]


# ============================================================
# 채점 엔진
# ============================================================

@dataclass
class GapItem:
    """미충족 항목 (개선이 필요한 부분)."""
    question_id: str
    category: str
    question: str
    severity: str
    regulations: List[str]
    remediation_summary: str        # 무료 공개
    remediation_detail: str         # 유료 전용
    estimated_fix_days: int
    estimated_fix_cost_usd: float
    is_free_guide: bool             # True면 무료로 공개


@dataclass
class ChecklistResult:
    """체크리스트 채점 결과."""
    total_questions: int
    passed: int
    failed: int
    compliance_score: float         # 0~100
    grade: str                      # A, B, C, D, F
    gaps: List[GapItem]             # 미충족 항목 목록
    total_estimated_fix_cost_usd: float
    total_estimated_fix_days: int
    category_scores: Dict[str, Dict]  # 카테고리별 점수


def score_checklist(answers: Dict[str, bool]) -> ChecklistResult:
    """
    체크리스트 답변을 채점합니다.
    
    Args:
        answers: {question_id: True/False} 형태. True=충족, False=미충족
        
    Returns:
        ChecklistResult with gaps, scores, and remediation guides.
    """
    question_map = {q.id: q for q in CHECKLIST_QUESTIONS}
    
    total_weight = sum(q.weight for q in CHECKLIST_QUESTIONS)
    earned_weight = 0.0
    gaps: List[GapItem] = []
    
    # 카테고리별 집계
    category_stats: Dict[str, Dict] = {}
    for cat in ComplianceCategory:
        category_stats[cat.value] = {"total": 0, "passed": 0, "weight_total": 0.0, "weight_earned": 0.0}
    
    passed = 0
    failed = 0
    
    for q in CHECKLIST_QUESTIONS:
        answer = answers.get(q.id, False)  # 미응답은 False 처리
        cat_key = q.category.value
        category_stats[cat_key]["total"] += 1
        category_stats[cat_key]["weight_total"] += q.weight
        
        if answer:
            passed += 1
            earned_weight += q.weight
            category_stats[cat_key]["passed"] += 1
            category_stats[cat_key]["weight_earned"] += q.weight
        else:
            failed += 1
            gaps.append(GapItem(
                question_id=q.id,
                category=cat_key,
                question=q.question,
                severity=q.severity.value,
                regulations=q.regulations,
                remediation_summary=q.remediation_summary,
                remediation_detail=q.remediation_detail,
                estimated_fix_days=q.estimated_fix_days,
                estimated_fix_cost_usd=q.estimated_fix_cost_usd,
                is_free_guide=False,  # 아래에서 1개만 무료로 전환
            ))
    
    # 점수 계산 (가중 평균)
    compliance_score = (earned_weight / total_weight * 100) if total_weight > 0 else 0.0
    
    # 등급 부여
    if compliance_score >= 90:
        grade = "A"
    elif compliance_score >= 75:
        grade = "B"
    elif compliance_score >= 60:
        grade = "C"
    elif compliance_score >= 40:
        grade = "D"
    else:
        grade = "F"
    
    # 갭을 심각도 순으로 정렬
    severity_order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
    gaps.sort(key=lambda g: severity_order.get(g.severity, 99))
    
    # 무료 가이드: 가장 쉬운 항목 1개를 무료로 전환 (fix_days가 가장 짧은 것)
    if gaps:
        easiest_gap = min(gaps, key=lambda g: g.estimated_fix_days)
        easiest_gap.is_free_guide = True
    
    # 카테고리별 점수 계산
    for cat_key, stats in category_stats.items():
        if stats["weight_total"] > 0:
            stats["score"] = round(stats["weight_earned"] / stats["weight_total"] * 100, 1)
        else:
            stats["score"] = 100.0
    
    return ChecklistResult(
        total_questions=len(CHECKLIST_QUESTIONS),
        passed=passed,
        failed=failed,
        compliance_score=round(compliance_score, 1),
        grade=grade,
        gaps=gaps,
        total_estimated_fix_cost_usd=sum(g.estimated_fix_cost_usd for g in gaps),
        total_estimated_fix_days=max((g.estimated_fix_days for g in gaps), default=0),
        category_scores=category_stats,
    )
