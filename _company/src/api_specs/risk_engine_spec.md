# Compliance Gateway Pro Risk Engine Technical Specification (v0.1)

## 🎯 Overview & Goal
This document defines the technical contract for the core 'Risk Scoring' engine, transforming user diagnostic inputs into a quantifiable 'Systemic Survival Threat' score. The goal is to provide developers with actionable boilerplate and clear data flow boundaries.

## 🌐 Architecture Flow
User Input (FE) $\rightarrow$ API Gateway $\rightarrow$ Risk Calculation Service (BE) $\rightarrow$ Structured Report Payload (JSON) $\rightarrow$ Red Zone UI Rendering (FE).

## 💻 I. API Contract Definition
### A. Endpoint Details
- **Path:** `/api/v1/diagnose`
- **Method:** `POST`
- **Authentication:** JWT required (User context tracking is critical for compliance logging).

### B. Request Body Schema (DiagnosisInput) - TypeScript Type Reference
```typescript
interface DiagnosisInput {
    coreBusinessProcesses: { 
        isImplemented: boolean; 
        riskNotes?: string; // Developer must handle null/undefined gracefully
    }[];

    regulatoryAdherence: { 
        hasAuditTrail: boolean; 
        globalScope: 'local' | 'regional' | 'global';
    };

    financialRiskMitigation: {
        insuranceCoverageExists: boolean;
        contingencyFundRatio: number; // Range [0.0, 1.0]
    };

    companySector: 'Finance' | 'Tech' | 'Healthcare';
}
```

### C. Response Body Schema (DiagnosisReport) - TypeScript Type Reference
```typescript
interface DiagnosisReport {
    requestId: string; 
    timestamp: string;
    riskLevel: 'GREEN' | 'YELLOW' | 'RED'; // Primary UI driver
    riskScore: number; // Float, range [0.0, 10.0]
    viabilityAssessment: { 
        headline: string; 
        summary: string; 
        recommendation: string[]; // Array of actionable items (Crucial for sales funnel)
    };
    detailedFindings: { 
        componentId: string; 
        issueTitle: string; 
        severity: 'Critical' | 'High' | 'Medium'; 
        description: string; 
    }[];
}
```

## ⚙️ II. Backend Logic Specification (Python/FastAPI Focus)

### A. Core Function Signature
`def calculate_risk_score(input: DiagnosisInput) -> DiagnosisReport:`

### B. Risk Scoring Algorithm Pseudocode
1. **Initialization:** `total_score = 0.0`
2. **Compliance Check Loop:** Iterate through `DiagnosisInput`. Apply weighted scoring rules based on identified structural deficiencies (e.g., missing audit trails in global scope = +3.5 points).
3. **Conflict Scoring:** If a high-risk input exists without corresponding mitigation evidence, apply an exponential penalty factor.
4. **Normalization & Mapping:** Normalize `total_score` to the [0.0, 10.0] range and determine `riskLevel`.

### C. Risk Level Determination Logic (Mapping Table)
| Score Range | riskLevel | UI Visual Mandate | Threat Narrative |
| :---: | :---: | :---: | :--- |
| $9.0 \le S$ | RED | Red Flash, Glitch Noise, Pulsing Border. | Systemic Failure Imminent. Immediate Action Required. |
| $5.0 \le S < 9.0$ | YELLOW | Amber Warning Color, Subtle Flicker. | Structural Weakness Detected. Review Needed. |
| $S < 5.0$ | GREEN | Stable Blue/Green Tone. (But never 'Safe'). | Minimal Risk Observed. Continuous Monitoring Mandatory. |