# Knowledge Guide: Regulatory Compliance Standards & Risk Weighting

This guide establishes the mathematical models, compliance categories, and legal penalty structures for GDPR, CCPA, HIPAA, and the EU AI Act. It serves as the primary specification for the `risk_calculator_service.py` to ensure all risk assessments reflect actual legal exposures.

---

## ⚖️ 1. GDPR (General Data Protection Regulation)

Under GDPR Article 83, administrative fines are split into two tiers based on severity:
- **Tier 1 (Lower):** Up to €10,000,000 or 2% of the global annual turnover (whichever is higher) for breaches of controller/processor obligations.
- **Tier 2 (Higher):** Up to €20,000,000 or 4% of the global annual turnover (whichever is higher) for breaches of core principles, data subjects' rights, and cross-border transfer requirements.

### Mathematical Risk Weighting Formula
$$QLoss_{GDPR} = \max\left(20\,000\,000, \, Turnover \times 0.04\right) \times R_{GDPR}$$

Where the risk exposure coefficient $R_{GDPR}$ is defined as:
$$R_{GDPR} = 0.45 \times \text{Defect\_Index} + 0.35 \times \text{Data\_Sensitivity} + 0.20 \times \text{Lack\_of\_DPO}$$

- **Defect_Index (0 to 1.0):** Degree of security measures absent (e.g., lack of encryption, audit trail missing).
- **Data_Sensitivity (0 to 1.0):** Categories of data handled (0.2 for regular PII, 1.0 for biometrics/criminal/political opinions).
- **Lack_of_DPO (0 or 1):** Binary indicator representing lack of registered Data Protection Officer/representative.

---

## 🇺🇸 2. CCPA (California Consumer Privacy Act)

CCPA Section 1798.155 outlines statutory penalties enforced by the California Attorney General:
- **Unintentional Violations:** Up to $2,500 per violation.
- **Intentional Violations / Failure to Cure:** Up to $7,500 per violation.
- **Private Right of Action (Section 1798.150):** Statutory damages between $100 and $750 per consumer per incident, or actual damages, whichever is greater, in the event of a negligent data breach.

### Mathematical Risk Weighting Formula
$$QLoss_{CCPA} = N_{CA\_Consumers} \times \left( P_{Statutory} \times I_{Intentional} + P_{Breach} \times (1 - S_{Security}) \right)$$

- **$N_{CA\_Consumers}$:** Estimated number of unique California data subjects in database.
- **$P_{Statutory}$:** Baseline statutory multiplier ($2,500).
- **$I_{Intentional}$:** Intentional factor scale ($1.0$ for negligent, $3.0$ for willfully ignoring opt-out).
- **$P_{Breach}$:** Average class-action statutory settlement cost per head ($750).
- **$S_{Security}$ (0 to 1.0):** Cryptographic protection and access control rating.

---

## 🏥 3. HIPAA (Health Insurance Portability and Accountability Act)

HIPAA civil money penalties (CMP) are structured across four tiers of culpability:
1. **Tier 1 (No Knowledge):** $137 to $68,928 per violation (Annual Cap: $2,067,813).
2. **Tier 2 (Reasonable Cause):** $1,379 to $68,928 per violation (Annual Cap: $2,067,813).
3. **Tier 3 (Willful Neglect - Corrected):** $13,785 to $68,928 per violation (Annual Cap: $2,067,813).
4. **Tier 4 (Willful Neglect - Uncorrected):** Minimum $68,928 per violation (Annual Cap: $2,067,813).

### Mathematical Risk Weighting Formula
$$QLoss_{HIPAA} = C_{Culpability\_Tier} \times V_{Records} \times (1 - F_{BAA})$$

- **$C_{Culpability\_Tier}$:** Tier coefficient based on security policy audits:
  - Tier 1: $100
  - Tier 2: $1,000
  - Tier 3: $10,000
  - Tier 4: $50,000
- **$V_{Records}$:** Total volume of Protected Health Information (PHI) logs exposed.
- **$F_{BAA}$ (0 or 1):** Binary indicator representing presence of verified Business Associate Agreement (BAA) with third-party vendors.

---

## 🤖 4. EU AI Act (Artificial Intelligence Act)

Penalties under the EU AI Act are grouped strictly by system risk classifications:
- **Prohibited AI Practices (Article 5):** Administrative fines up to €35,000,000 or 7% of annual global turnover.
- **High-Risk AI Non-Compliance (Articles 6-15):** Fines up to €15,000,000 or 3% of annual global turnover for failing to implement quality/risk management, data governance, logs, human oversight.
- **Inaccurate/Misleading Information:** Fines up to €7,500,000 or 1.5% of annual global turnover for supplying false information to notified bodies.

### Mathematical Risk Weighting Formula
$$QLoss_{AI} = \text{System\_Class\_Limit} \times \left( 1 - \frac{\text{Data\_Governance\_Score} + \text{Human\_Oversight\_Score}}{2} \right)$$

- **System_Class_Limit:**
  - Prohibited Practice: €35,000,000
  - High-Risk AI System: €15,000,000
  - General Purpose AI (GPAI): €7,500,000
- **Data_Governance_Score (0 to 1.0):** Quality of training data sanitization, bias reduction, and documentation.
- **Human_Oversight_Score (0 to 1.0):** Presence of fail-safes, real-time kill-switches, and audit trail dashboarding.
