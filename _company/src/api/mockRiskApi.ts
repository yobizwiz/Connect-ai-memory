/**
 * @fileoverview Mock API Service Layer for Risk Dashboard data fetching.
 * This layer simulates network latency, successful data retrieval, and failure states 
 * to ensure robust client-side state management and error handling.
 */

export type RiskData = {
    timestamp: number;
    treScore: number; // Time Risk Exposure Score (0 to 100)
    isCritical: boolean;
    regulatoryViolations: Array<{
        id: string;
        name: string;
        riskFactor: string;
        impactLmax: number; // Maximum financial loss impact
        violationDate: Date;
    }>;
};

export type ABEvents = {
    userId: string;
    experimentId: 'A' | 'B';
    action: string; // e.g., 'scroll_to_paywall', 'click_cta', 'hover_tre_score'
    timestamp: number;
}

// Mock API Call Simulation (Async)
/**
 * Simulates fetching the current risk data from a backend endpoint.
 * @param userId The ID of the user for potential personalized risk scoring.
 * @returns Promise<RiskData>
 */
export const fetchRiskDashboardData = async (userId: string): Promise<RiskData> => {
    console.log(`[Mock API] Fetching risk data for user ${userId}...`);

    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock Data Logic: Simulate a high-risk state after some time passing (e.g., 15 seconds)
    const currentTime = Date.now();
    let treScore;
    let isCritical;
    
    if (currentTime > window.__MOCK_START_TIME__ + 15000) { // After 15s, simulate critical risk
        treScore = Math.floor(Math.random() * 30) + 75; // High score: 75-104 (capped at 100)
        isCritical = true;
    } else if (currentTime > window.__MOCK_START_TIME__ + 8000) { // After 8s, simulate moderate risk
        treScore = Math.floor(Math.random() * 30) + 40; // Moderate score: 40-69
        isCritical = false;
    } else { // Initial state (low risk)
        treScore = Math.floor(Math.random() * 20) + 10; // Low score: 10-29
        isCritical = false;
    }

    return {
        timestamp: Date.now(),
        treScore: Math.min(100, treScore),
        isCritical: isCritical,
        regulatoryViolations: [
            { id: 'g_dpr', name: 'GDPR Non-Consent', riskFactor: 'PII Mismanagement', impactLmax: 50000, violationDate: new Date() },
            // Add more mock violations here...
        ]
    };
};

/**
 * Simulates logging a user interaction event to the A/B testing backend.
 * @param event The structured event data.
 */
export const logUserInteractionEvent = async (event: ABEvents): Promise<boolean> => {
    console.log(`[Mock API] Logging interaction event: ${JSON.stringify(event)}`);
    await new Promise(resolve => setTimeout(resolve, 100)); // Quick mock write
    return true;
};

// Global setup for mock timing (for testing state change)
window.__MOCK_START_TIME__ = Date.now();