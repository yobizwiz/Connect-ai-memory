import React, { useState, useEffect } from 'react';
import { fetchRiskDashboardData } from '../services/RiskCalculatorService';
// import './GlitchNoise.css'; // CSS 모듈 임포트 가정

interface RiskGaugeProps {}

const InteractiveRiskGauge: React.FC<RiskGaugeProps> = () => {
    const [riskState, setRiskState] = useState<{ lTotalMax: number; isCritical: boolean; details: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 🚀 API 호출을 통해 리스크 데이터를 가져오고 상태를 업데이트합니다.
        async function loadRiskData() {
            try {
                const data = await fetchRiskDashboardData();
                setRiskState(data);
            } catch (error) {
                console.error("Failed to fetch risk data:", error);
                setRiskState({ lTotalMax: 0, isCritical: false, details: "데이터 로드에 실패했습니다." });
            } finally {
                setIsLoading(false);
            }
        }
        loadRiskData();
    }, []);

    // 리스크 상태가 변경될 때마다 Funneling/Paywall UI 상태를 업데이트하는 효과 처리 (핵심!)
    useEffect(() => {
        if (riskState && riskState.isCritical) {
             console.warn("🚨 CRITICAL ALERT: Paywall Funnel Activated!");
             // 💡 실제 구현에서는 전역 Context나 Redux Store에 'FunnelingState.CRITICAL'을 발행합니다.
        } else if (riskState) {
             console.log("✅ System Check OK: 정상적인 대시보드 상태 유지.");
        }
    }, [riskState]);


    if (isLoading) {
        return <div className="gauge-container loading">⚡️ 리스크 데이터 분석 중... (데이터 무결성 검증 필요)</div>;
    }

    if (!riskState) {
         return <div className="gauge-container error">❌ 리스크 데이터를 가져올 수 없습니다. 시스템을 확인해주세요.</div>;
    }

    const { lTotalMax, isCritical, details } = riskState;
    const criticalClass = isCritical ? 'critical' : '';
    const gaugeColor = isCritical ? 'bg-red-700/80 shadow-[0_0_30px_rgba(255,0,0,0.9)]' : 'bg-blue-600/80';

    return (
        <div className={`gauge-container ${criticalClass}`}>
            {/* 📈 메인 리스크 게이지 시각화 영역 */}
            <div className="risk-gauge-visual">
                <div className={`gauge-fill ${gaugeColor}`} style={{ width: `${Math.min(lTotalMax / 300000, 100)}%` }}></div> {/* 임의의 최대값으로 비율 모킹 */}
            </div>

            {/* 💰 $L_{totalMax}$ 값 표시 */}
            <div className="gauge-value">
                <h1>${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(lTotalMax)}</h1>
                <p className={`text-xl ${criticalClass ? 'text-red-400' : 'text-blue-200'}`}>
                    $L_{totalMax}$ 추정치 (최대 재무적 손실)
                </p>
            </div>

            {/* 📜 상태 메시지 및 Funneling 유도 */}
            <div className="status-message">
                <p>{details}</p>
                <button className={`cta-btn ${criticalClass ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-500 hover:bg-blue-600'}`}>
                    {isCritical ? "🚨 즉시 법률 진단 보고서 다운로드 (Paywall)" : "👉 리스크 점검 상세 보기"}
                </button>
            </div>

             {/* Glitch Noise 애니메이션이 적용되는 가상 영역 */}
             <div className="glitch-overlay"></div> 
        </div>
    );
};

export default InteractiveRiskGauge;