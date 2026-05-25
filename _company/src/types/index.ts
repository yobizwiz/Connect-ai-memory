/**
 * @module types
 * @description Central type definitions for the Connect AI project.
 */

export interface AnalysisResult {
    riskScore: number;
    isHighRisk: boolean;
    diagnosisMessage: string;
    primaryGap: string | null;
    suggestedSolution: string;
}
