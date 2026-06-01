export type RiskLevel = 'Normal' | 'Warning' | 'Danger';

export interface RiskData {
  timestamp: string;
  treScore: number; // Total Risk Exposure Score
  lMaxValue: number; // Max Expected Loss (L_max)
  isComplianceBreach: boolean;
}

/**
 * Determines the risk level based on the calculated score.
 * @param treScore The total risk exposure score.
 */
export const getRiskLevel = (treScore: number): RiskLevel => {
    if (treScore >= 80) return 'Danger'; // Red Zone Alert!
    if (treScore >= 40) return 'Warning'; // Cautionary State
    return 'Normal'; // Safe State
};

/**
 * Defines the required state transition logic.
 */
export type AlertState = {
  level: RiskLevel;
  message: string;
  showPaywall: boolean;
  isCritical: boolean;
};