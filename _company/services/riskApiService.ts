import { RiskData } from '../components/types/riskTypes';

/**
 * 🚨 [API Simulation] External API call to fetch real-time risk data (TRE Score).
 * In a real scenario, this would be an axios/fetch call to the backend /api/v1/risk.
 * @returns A promise that resolves with fresh RiskData or rejects on failure.
 */
export const fetchRiskData = async (): Promise<RiskData> => {
    console.log("⚙️ [Service] Calling external risk API for real-time TRE score...");

    // Simulate network latency and potential failure (10% chance of failure)
    await new Promise(resolve => setTimeout(resolve, 500));

    if (Math.random() < 0.1) {
        throw new Error("API_CONNECTION_FAILURE: External risk service is currently unavailable or rate-limited.");
    }

    // Simulate fetching data based on a high-risk scenario for demonstration purposes
    const simulatedTreScore = Math.floor(Math.random() * (100 - 60 + 1)) + 60; // Ensure it's usually in the Warning/Danger zone for testing
    const simulatedLMax = (simulatedTreScore * 5) + Math.floor(Math.random() * 100);

    return {
        timestamp: new Date().toISOString(),
        treScore: simulatedTreScore,
        lMaxValue: simulatedLMax,
        isComplianceBreach: simulatedTreScore >= 80 // Red Zone criteria
    };
};