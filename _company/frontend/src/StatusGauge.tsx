import React, { useState, useCallback } from 'react';

// --- 1. Types Definition (Type Safety First) ---
interface RiskResult {
    status_gauge_value: number; // 0-100
    lmax_calculated: number;   // USD
    risk_level_message: string;
    is_paywall_triggered: boolean;
}

type GaugeState = 'IDLE' | 'LOADING' | 'WARNING' | 'CRITICAL';

const StatusGauge: React.FC = () => {
    // State Management for the entire user journey
    const [gaugeValue, setGaugeValue] = useState<number>(0);
    const [currentState, setCurrentState] = useState<GaugeState>('IDLE');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Hardcoded API Endpoint (환경변수에서 로드하는 것이 원칙)
    const API_ENDPOINT = 'http://localhost:8000/api/v1/diagnose-risk';

    /**
     * 🚀 Core Function: 리스크 진단 및 상태 전이 처리
     * @param initialScore 사용자가 입력한 초기 리스크 점수 (0.0 - 10.0)
     */
    const handleDiagnosis = useCallback(async (initialScore: number) => {
        if (isLoading) return;

        // State Transition Start: IDLE -> LOADING
        setCurrentState('LOADING');
        setIsLoading(true);
        setError(null);
        setGaugeValue(0); // 게이지 초기화

        try {
            console.log(`[System] Initiating diagnosis with score: ${initialScore}`);
            
            // Mock API Call (실제로는 axios/fetch 사용)
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: "temp_user_123",
                    data_source: "Client Input Form Submission",
                    input_risk_score: initialScore,
                })
            });

            // Defensive Check 1: HTTP Status Code 검증
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'API 호출 실패');
            }

            // Defensive Check 2: JSON Parsing 및 타입 안전성 확보
            const data: RiskResult = await response.json();

            // State Transition Success: LOADING -> WARNING/CRITICAL
            setGaugeValue(data.status_gauge_value);
            setCurrentState(data.is_paywall_triggered ? 'CRITICAL' : (data.status_gauge_value > 50 ? 'WARNING' : 'IDLE'));

            // 결과 로깅 및 Paywall 연동 호출
            console.log(`✅ Diagnosis Complete. Lmax: ${data.lmax_calculated} USD. Paywall Triggered: ${data.is_paywall_triggered}`);
            if (data.is_paywall_triggered) {
                alert('🚨 [Paywall] 재무적 위험 경고! 결제가 필요합니다.');
                // 실제 구현 시, 이 지점에서 Paywall Modal을 강제 띄웁니다.
            }

        } catch (err: any) {
            // State Transition Error: Catching network or parsing errors
            setError(err.message || "진단 과정에서 알 수 없는 오류가 발생했습니다.");
            setCurrentState('WARNING'); // 에러 시에도 경고 상태 유지
        } finally {
            setIsLoading(false);
        }
    }, [API_ENDPOINT]);

    // --- UI Rendering Logic (Visual Anchor Point) ---
    const getGaugeColor = () => {
        if (currentState === 'CRITICAL') return '#ff0000'; // Neon Red
        if (currentState === 'WARNING' || isLoading) return '#ffa500'; // Amber/Orange
        return '#2980B9'; // Authority Blue
    };

    const getStatusText = () => {
        switch (currentState) {
            case 'IDLE': return "시스템 초기 진단 대기 중...";
            case 'LOADING': return "데이터 분석 중... 시스템 Hum(공명음) 작동";
            case 'WARNING': 
                return gaugeValue > 75 ? "경고 레벨: 전문적 검토가 필요합니다." : "안정화되는 추세입니다.";
            case 'CRITICAL':
                return `💥 치명적 리스크 감지! $L_{max}: ${gaugeValue.toFixed(2)} USD 초과 위험.`;
        }
    };

    // --- Render Structure ---
    return (
        <div className="status-gauge-container" style={{ fontFamily: 'monospace', color: '#00ff99' }}>
            <h1>📊 StatusGauge v1.0 - System Risk Monitor</h1>
            
            {/* 🎨 Visual Component Area */}
            <div className={`glassmorphism-box ${currentState === 'CRITICAL' ? 'neon-red-glow' : ''}`} style={{ opacity: currentState === 'LOADING' ? 0.8 : 1 }}>
                <h2>Status Gauge Value: <span style={{ color: getGaugeColor() }}>{gaugeValue.toFixed(2)}</span> / 100</h2>
                <div className="gauge-bar" style={{ width: `${Math.min(100, gaugeValue)}%`, backgroundColor: getGaugeColor(), transition: 'width 1s ease' }}></div>
            </div>

            {/* 📜 Status Message & Controls */}
            <p className="system-message">[{currentState}] {getStatusText()}</p>

            <div>
                <h3>진단 실행</h3>
                <button 
                    onClick={() => handleDiagnosis(Math.random() * 10)} // 랜덤 값으로 테스트 유도
                    disabled={isLoading}
                    style={{ backgroundColor: isLoading ? '#555' : '#2980B9', color: 'white', padding: '10px 20px', cursor: isLoading ? 'default' : 'pointer' }}
                >
                    {isLoading ? '진단 분석 중...' : '🚨 리스크 진단 실행 (Start Diagnosis)'}
                </button>
            </div>

            {/* 🐛 Error Display */}
            {error && <p style={{ color: '#ff4444' }}>[ERROR] {error}</p>}
        </div>
    );
};

export default StatusGauge;