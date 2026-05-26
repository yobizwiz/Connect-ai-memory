/**
 * @fileoverview Threat Risk Index (TRE) Calculation Schemas.
 * Defines the contract for data input and output, ensuring type safety across FE/BE.
 */

import { z } from 'zod'; // Use Zod for robust schema validation

// ==============================================
// 1. INPUT SCHEMA: Researcher Data Variables
// ==============================================
/**
 * @description 데이터 변수를 수집하는 입력 객체 스키마.
 * 이 모든 필드는 필수적이지 않을 수 있지만, 계산 엔진에서 활용 가능해야 합니다.
 */
export const InputSchema = z.object({
    // 1. PII Risk Data (Researcher Metric 1)
    pii_exposure_count: z.number().min(0).describe("Detected instances of PII in the provided documents."),
    compliance_violation_likelihood: z.number().min(0).max(1).describe("Estimated likelihood (0-1) of a major compliance breach."),

    // 2. Audit/Process Risk Data (Researcher Metric 2)
    critical_workflow_gap_count: z.number().int().min(0).describe("Number of critical manual steps or missing sign-offs identified."),
    process_failure_cost_estimate: z.number().nonnegative().describe("Estimated minimum cost ($) if a process failure occurs (e.g., contract delay)."),

    // 3. Knowledge/AI Risk Data (Researcher Metric 3 - Hallucination)
    ai_hallucination_dependency_score: z.number().min(0).max(1).describe("How much the current decision relies on unverified AI output (0-1)."),

    // 4. Contextual Input (Optional but useful for weighting)
    company_annual_revenue_usd: z.number().nonnegative().optional().describe("Annual revenue of the client company for base calculation."),
});

export type ThreatInput = z.infer<typeof InputSchema>;


// ==============================================
// 2. OUTPUT SCHEMA: The Final Report Structure
// ==============================================
/**
 * @description TRE 계산 엔진의 최종 출력 스키마.
 */
export const OutputSchema = z.object({
    threat_risk_index: z.number().describe("Calculated composite score (0 to 100)."),
    risk_level: z.enum(['Green', 'Yellow', 'Red']).default('Green').describe("Categorical risk level based on the calculated score."),
    systemic_warning_message: z.string().describe("The high-impact message delivered to the user (e.g., 'Immediate Action Required')."),
    suggested_tier: z.enum(['Tier 0 - None', 'Tier 1 - Detection', 'Tier 2 - Prevention']).default('Tier 0 - None'),
});

export type ThreatOutput = z.infer<typeof OutputSchema>;