import React, { useState, useEffect, useCallback } from 'react';
import { fetchRiskDashboardData, logUserInteractionEvent, RiskData, ABEvents } from '../api/mockRiskApi';
import './RedZoneDashboard.css'; // Assume CSS for glitch/paywall styles

// --- 1. Paywall Component (The Barrier) ---
interface PaywallProps {}

const PaywallBarrier: React.FC<PaywallProps> = () => {
    return (
        <div className="paywall-overlay">
            <div className="paywall-content">
                <h1>🚨 시스템 강제 진입 지점: 위험 경고!</h1>
                <p className="warning-text">
                    현재 귀하의 리스크 점수(TRE)는 임계치 $T_{crit}$를 초과했습니다. 
                    이 상태로는 서비스 이용이 불가능하며, 재정적 손실을 막기 위해 즉시 구독해야 합니다.
                </p>
                <div className="lmax-display">
                    최대 예상 손실액: <span style={{ color: '#FF0000' }}>$L_{max} (미확인)</span>
                </div>
                <button 
                    className="cta-button" 
                    onClick={() => {
                        console.log("Attempting to redirect to payment gateway...");
                        // TODO: Actual Redirect Logic Here
                    }}
                >
                    ✅ 즉시 구독하고 리스크 회피하기 (Pay Now)
                </button>
            </div>
        </div>
    );
};

// --- 2. TRE Score Display Component (The Visual Alert) ---
interface TREDisplayProps {
    score: number;
}

const TREScoreDisplay: React.FC<TREDisplayProps> = ({ score }) => {
    const [isGlitching, setIsGlitching] = useState(false);

    // Simulate Glitch Effect on initial load or major change
    useEffect(() => {
        if (score > 60) {
            setIsGlitching(true);
            const timer = setTimeout(() => setIsGlitching(false), 500);
            return () => clearTimeout(timer);
        }
    }, [score]);

    // This component is responsible for triggering the A/B log event on hover.
    return (
        <div className={`tre-display ${isGlitching ? 'glitch-effect' : ''}`}>
            <h2>📈 Time Risk Exposure Score (TRE)</h2>
            <p className="score">{score}%</p>
            {/* Event logging hook simulation */}
            <div 
                onMouseEnter={() => console.log("A/B Log: User hovered over TRE score")}
                onMouseLeave={() => console.log("A/B Log: User left TRE score area")}
            >
                 (Hover to log interaction)
            </div>
        </div>
    );
};

// --- 3. Main Dashboard Component (The Orchestrator) ---
const RedZoneDashboard: React.FC = () => {
    const [riskData, setRiskData] = useState<RiskData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Use useCallback for stable function reference in useEffect dependency array
    const loadDashboardData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchRiskDashboardData("user-123");
            setRiskData(data);
        } catch (e) {
            console.error("Failed to load risk data:", e);
            setError("데이터 로딩에 실패했습니다. 네트워크 연결을 확인하세요.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData();
        // Polling effect: Periodically check for updated risk data (simulates real-time stream)
        const intervalId = setInterval(loadDashboardData, 10000); // Check every 10 seconds
        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [loadDashboardData]);


    // --- State Transition Logic Core (The Business Rule Engine) ---
    useEffect(() => {
        if (!riskData) return;

        const TRE_CRIT = 70; // Define the critical threshold
        let currentState: 'SAFE' | 'ALERTING' | 'PAYWALLED' = 'SAFE';

        if (riskData.treScore >= TRE_CRIT && riskData.isCritical) {
            currentState = 'ALERTING';
            // Simulate immediate transition to Paywall after a brief alert period
            const paywallTimer = setTimeout(() => {
                console.log("State Transition: ALERTING -> PAYWALLED");
                // In a real system, this state change would trigger the UI component render logic
            }, 3000); // Give user 3 seconds to read the alert before Paywall hits

            return () => clearTimeout(paywallTimer);
        } else if (riskData.treScore >= TRE_CRIT * 0.8) {
             currentState = 'ALERTING';
        } else {
             currentState = 'SAFE';
        }


        // --- A/B Testing Log Trigger ---
        logUserInteractionEvent({
            userId: "user-123",
            experimentId: "A", // Assume we are testing Variant A initially
            action: `Dashboard_State_Check:${currentState}`,
            timestamp: Date.now()
        });

    }, [riskData]);


    // --- Rendering Logic based on State ---
    if (isLoading) {
        return <div className="dashboard-container">⚙️ 로딩 중... 시스템 무결성 점검을 수행합니다.</div>;
    }
    
    if (error) {
        return <div className="dashboard-container error">{error}</div>;
    }

    // Determine the current state and render accordingly
    const showPaywall = riskData?.treScore >= 70 && riskData.isCritical;
    
    return (
        <div className={`dashboard-container ${showPaywall ? 'red-zone' : ''}`}>
            <h1>🛡️ Red Zone Alert Dashboard</h1>
            <p>실시간 시스템 무결성 감사 보고서 (Mock Data)</p>

            {/* 1. TRE Score Component */}
            <TREScoreDisplay score={riskData?.treScore || 0} />

            {/* 2. Violation Summary (Always visible) */}
            <div className="violation-summary">
                <h3>⚠️ 핵심 규제 위반 항목</h3>
                <ul>
                    {riskData?.regulatoryViolations.map(v => (
                        <li key={v.id} style={{ color: v.impactLmax > 10000 ? '#d9534f' : '#5cb85c' }}>
                            [{v.name}] 위험 요소: {v.riskFactor} | 최대 손실액: ${v.impactLmax.toLocaleString()}
                        </li>
                    ))}
                </ul>
            </div>

            {/* 3. Paywall Barrier (The forced transition) */}
            {showPaywall && <PaywallBarrier />}
        </div>
    );
};


export default RedZoneDashboard;