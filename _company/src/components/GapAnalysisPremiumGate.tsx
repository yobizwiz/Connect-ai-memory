import React, { useState, useCallback, useEffect } from 'react';
// Assume these components and types are defined elsewhere in the project structure.
// import { useLgapData } from '../hooks/useLgapData'; 

/**
 * @interface LGapResult - $L_{gap}$ 계산 결과를 담는 타입 정의 (Defensive Typing)
 */
interface LGapResult {
    lGapValue: number; // Gap Analysis Premium 가치를 나타내는 핵심 수치
    thresholdBreached: boolean; // 임계치 초과 여부
}

/**
 * @enum GateState - Funneling 상태 머신 (State Machine) 정의
 */
enum GateState {
    IDLE,                  // 초기 대기 상태 (정상적인 L_gap 값)
    TRIGGERED_GLITCH,      // 임계치 초과 감지: 공포 유발 단계
    LOADING_REPORT,        // 보고서 생성 중: 로딩 스피너/Suspense State
    PAYMENT_REQUIRED       // 결제 요청 화면으로 전이 완료
}

/**
 * GapAnalysisPremiumGate Component
 * L_gap 수치 변화에 따라 사용자에게 공포를 유발하고, Funneling을 통해 결제를 유도하는 핵심 컴포넌트.
 * @param lGapData - 외부에서 계산된 $L_{gap}$ 데이터 (Props로 받음)
 */
const GapAnalysisPremiumGate: React.FC<{ lGapData: LGapResult }> = ({ lGapData }) => {
    // [State Management] Funnel State를 관리하는 핵심 로직
    const [gameState, setGameState] = useState<GateState>(GateState.IDLE);

    // 1. $L_{gap}$ 감지 및 Glitch Noise Trigger (Lifecycle Hook)
    useEffect(() => {
        if (lGapData.thresholdBreached && gameState === GateState.IDLE) {
            console.warn("🚨 [SYSTEM ALERT] L_gap 임계치 초과 감지. 경고 상태로 진입합니다.");
            setGameState(GateState.TRIGGERED_GLITCH);
        } else if (!lGapData.thresholdBreached && gameState !== GateState.IDLE) {
             // 리셋 로직 (예: 사용자가 데이터를 수정했을 경우)
             console.log("✅ [SYSTEM INFO] L_gap 수치가 정상 범위로 복귀했습니다.");
             setGameState(GateState.IDLE);
        }
    }, [lGapData, gameState]);


    /**
     * Funneling 핵심 핸들러: '진단 보고서 받기' 버튼 클릭 시 호출됨.
     */
    const handleRequestReport = useCallback(() => {
        if (gameState === GateState.TRIGGERED_GLITCH) {
            // 1단계: Glitch Noise 경고가 활성화된 상태에서만 다음 단계로 진행 가능하게 Guard 처리
            setGameState(GateState.LOADING_REPORT);

            // Simulate API Call Delay (Suspense State)
            setTimeout(() => {
                console.log("⚙️ [API CALL] 보고서 생성 서버 통신 완료.");
                setGameState(GateState.PAYMENT_REQUIRED);
            }, 2000); // 2초 로딩 시뮬레이션

        } else if (gameState === GateState.IDLE) {
             // L_gap이 임계치 미만일 때는 CTA 버튼 비활성화 또는 다른 메시지 표시하는 것이 원칙이나, 여기서는 강제 Funneling을 위해 경고 상태를 유도해야 함.
            alert("⚠️ [ERROR] $L_{gap}$ 수치가 충분히 높지 않습니다. 먼저 위험 진단이 필요합니다.");
        }
    }, [gameState, lGapData]);


    // 3. A/B 테스트 및 분석 로직 통합 (Defensive Analytics)
    const trackFunnelStep = useCallback((stepName: string, variant: string) => {
         console.log(`📈 [ANALYTICS TRACKING] Event: ${stepName}, Variant: ${variant}`);
        // TODO: Integrate Google Analytics/Mixpanel API call here. 
        // 예: window.analytics.track('FunnelStep', { step: stepName, variant: variant });
    }, []);

    /**
     * A/B 테스트 가능한 방식으로 스크롤 정지 지점 및 이탈 경로 추적 로직
     * 실제로 이 컴포넌트가 마운트될 때만 실행되어야 함.
     */
    useEffect(() => {
        // 1. Scroll Stop Detection (사용자가 특정 영역에서 머무르는 시간/이벤트 포착)
        const handleScroll = () => {
            const scrollY = window.scrollY;
            if (scrollY > document.documentElement.clientHeight * 0.8 && gameState === GateState.TRIGGERED_GLITCH) {
                // 스크롤을 아래로 내렸는데도 계속 '경고' 영역에 머무는 경우를 포착
                trackFunnelStep('ScrollDeepEngagement', 'true');
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [gameState, trackFunnelStep]);


    // ----------------------- Rendering Logic ------------------------
    let content;
    let buttonHandler = handleRequestReport;
    let buttonDisabled = true;

    if (gameState === GateState.TRIGGERED_GLITCH) {
        // 1. Glitch Noise 애니메이션 및 경고 UI/UX 트리거 구현
        content = (
            <div className="glitch-warning-box">
                <h1>🚨 SYSTEM CRITICAL ALERT: {"$L_{gap}$"} EXCEEDED 🚨</h1>
                <p>당신의 조직은 현재 파악하지 못한 잠재적 손실액({"$L_{gap}$"})에 심각하게 노출되어 있습니다. 이 수치는 법규 위반을 넘어선 '사업 생존 리스크'를 의미합니다.</p>
                <div className="glitch-value">{lGapData.lGapValue.toFixed(2)} M USD</div>
            </div>
        );
        buttonDisabled = false;

    } else if (gameState === GateState.LOADING_REPORT) {
        // 2. Suspense State - 로딩 화면 구현
        content = (
            <div className="loading-state">
                <h2>⚙️ 진단 보고서 생성 중...</h2>
                <p>데이터 검증 및 리스크 매트릭스 계산을 위해 서버와 통신합니다. 잠시만 기다려 주세요.</p>
                {/* 실제로는 Suspense 컴포넌트를 사용해야 함 */}
            </div>
        );
        buttonDisabled = true; // 로딩 중에는 버튼 비활성화

    } else if (gameState === GateState.PAYMENT_REQUIRED) {
        // 2. 결제 모달로의 최종 전환 시뮬레이션
        content = (
             <div className="payment-modal">
                <h2>💳 Gap Analysis Premium - 즉시 진단 보고서 구매</h2>
                <p>최종 {"$L_{gap}$"} 보고서를 받으려면, 잠재적 손실액({"$L_{gap}$"})을 최소화할 수 있는 선제적 컨설팅이 필요합니다.</p>
                {/* 실제 결제 모달 컴포넌트 호출 */}
                <button onClick={() => console.log("Payment initiated...")}>Stripe로 결제하기</button>
             </div>
        );
        buttonDisabled = false; // 결제가 완료되면 이 영역을 떠나거나, '계정 대시보드'로 리다이렉트 해야 함.

    } else {
         // IDLE 상태 (임계치 미달)
        content = (
            <div className="normal-status">
                <h2>✅ 현재 {"$L_{gap}$"} 수치 분석 결과</h2>
                <p>현재 계산된 잠재적 손실액({"$L_{gap}$"})은 임계치 이내로 보입니다. 추가적인 리스크 진단이 필요합니다.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', border: `2px solid ${lGapData.thresholdBreached ? '#ff0055' : '#1e90ff'}`, borderRadius: '10px', maxWidth: '800px', margin: 'auto' }}>
            <h2 style={{ color: lGapData.thresholdBreached ? 'red' : 'blue' }}>{"[L_{gap} 리스크 진단 모듈]"}</h2>
            {content}

            <button 
                onClick={buttonHandler} 
                disabled={buttonDisabled || gameState === GateState.LOADING_REPORT}
                style={{ marginTop: '30px', padding: '15px 30px', cursor: buttonDisabled ? 'not-allowed' : 'pointer' }}
            >
                {gameState === GateState.TRIGGERED_GLITCH ? "진단 보고서 받기 (Premium 진입)" : "보고서 요청"}
            </button>

             <p style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                * 이 모듈은 A/B 테스트 및 Funneling 최적화를 목표로 설계되었습니다.
            </p>

            <style jsx global>{`
            /* 1. Glitch Noise Animation (CSS Definition) */
            @keyframes glitch {
              0% { transform: translate(0, 0); opacity: 1; }
              20% { transform: translate(-3px, -2px); opacity: 0.9; }
              40% { transform: translate(3px, 2px); opacity: 0.8; }
              60% { transform: translate(-2px, 1px); opacity: 1; }
              80% { transform: translate(2px, -1px); opacity: 0.95; }
              100% { transform: translate(0, 0); opacity: 1; }
            }

            .glitch-warning-box {
                border: 3px solid #ff0055; /* Neon Red */
                padding: 20px;
                background: rgba(40, 0, 0, 0.8); /* Dark background for drama */
                animation: glitch 0.1s infinite steps(2); /* 강한 떨림 애니메이션 적용 */
            }

            .glitch-value {
                font-size: 3rem;
                color: #ff0055;
                margin: 10px 0;
                text-shadow: 0 0 10px rgba(255, 0, 85, 0.7); /* 네온 글로우 효과 */
            }

            /* 2. Payment Modal Styling (Visual Paywall) */
            .payment-modal {
                background: #fff3e0;
                border: 1px solid orange;
                padding: 30px;
                text-align: center;
            }

            /* 3. Loading State */
            .loading-state {
                text-align: center;
                color: #555;
            }
            `}</style>
        </div>
    );
};

export default GapAnalysisPremiumGate;