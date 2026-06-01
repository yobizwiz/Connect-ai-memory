import React, { useState, useEffect } from 'react';
import { fetchRiskData } from '../services/riskApiService';
import { RiskLevel, getRiskLevel, AlertState } from './types/riskTypes';

// ⚠️ Dummy Components for visualization (Actual CSS implementation required)
const GlitchEffect: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="glitch-wrapper">{children}</div>
);
const PaywallBarrier: React.FC<{ lMax: number, treScore: number }> = ({ lMax, treScore }) => (
    <div className="paywall-barrier">
        <h1>🚨 CRITICAL SYSTEM FAILURE DETECTED 🚨</h1>
        <p>Your current risk score is {treScore} (TRE). Immediate action required.</p>
        <h2>Estimated Loss Exposure: ${lMax.toLocaleString()}</h2>
        <button className="cta-premium">Activate Solution Tier Now</button>
    </div>
);

/**
 * Main component handling the state transition and displaying the risk alert.
 */
const RedZoneAlert: React.FC = () => {
    // State management for the current display status
    const [riskData, setRiskData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadRiskScore = async () => {
            try {
                setLoading(true);
                // 1. API 호출 및 데이터 수신 (Defensive Layer)
                const data = await fetchRiskData();
                setRiskData(data);
            } catch (e: any) {
                // 2. 에러 핸들링 (Robustness Check)
                setError(`Connection Error: ${e.message}. Cannot calculate risk.`);
                console.error("❌ Failed to load risk data:", e.message);
            } finally {
                setLoading(false);
            }
        };

        loadRiskScore();
    }, []); // Component mounts, fetch initial data

    // 3. 상태 전이 로직 (State Transition Flow) 계산
    const currentState: AlertState = React.useMemo(() => {
        if (!riskData) {
            return { level: 'Normal', message: 'Initializing System...', showPaywall: false, isCritical: false };
        }

        const level = getRiskLevel(riskData.treScore);
        let message = '';
        let showPaywall = false;

        if (level === 'Danger') {
            message = `CRITICAL ALERT: System Integrity Failure. TRE Score (${riskData.treScore}) exceeded threshold!`;
            showPaywall = true;
        } else if (level === 'Warning') {
            message = `WARNING: Potential compliance drift detected. Immediate review recommended.`;
        } else {
            message = 'System Status: Nominal. Monitoring for structural gaps.';
        }

        return { level, message, showPaywall, isCritical: level === 'Danger' };
    }, [riskData]);


    // 4. 렌더링 로직 (Visualization & Paywall Gate)
    if (loading) {
        return <div className="status-box">Loading System Integrity Data...</div>;
    }

    if (error) {
        return <div className="status-box error">{error}</div>;
    }


    return (
        <div className={`red-zone-alert ${currentState.level === 'Danger' ? 'danger-bg' : ''}`}>
            <GlitchEffect>
                <header>
                    <h1>YOBIZWIZ SYSTEM AUDIT REPORT</h1>
                    <p>{`Last Updated: ${new Date(riskData?.timestamp).toLocaleTimeString()}`}</p>
                </header>

                {/* 🌟 핵심 상태 전이 메시지 영역 */}
                <section className={`alert-message level-${currentState.level.toLowerCase}`}>
                    <h2>[🚨 {currentState.level.toUpperCase()} ALERT]</h2>
                    <p>{currentState.message}</p>
                    <div className="score-display">
                        <strong>TRE Score:</strong> <span style={{ color: currentState.level === 'Danger' ? '#FF0055' : 'inherit' }}>{riskData?.treScore}</span> / 100
                    </div>
                </section>

                {/* 💸 Paywall Barrier 활성화 (Conditional Rendering) */}
                {currentState.showPaywall && <PaywallBarrier lMax={riskData.lMaxValue} treScore={riskData.treScore}/>}

            </GlitchEffect>
        </div>
    );
};

export default RedZoneAlert;