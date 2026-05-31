import React, { useState, useEffect, useRef } from 'react';
import './styles/InteractiveDashboard.module.css';
// 가상의 서비스 및 데이터 임포트 (실제 프로젝트 환경에 맞게 수정 필요)
import { useFunnelContext } from '../context/FunnelContext';
import { calculateRiskExposure } from '../lib/riskCalculator';

interface RiskData {
    lmax: number; // $L_{max}$ 값
    sloss: number; // 시스템 신뢰성 공백 점수
}

// 임계값 정의 (코다리 검증 포인트)
const MAX_RISK_THRESHOLD = 500000; // 예시: 50만 달러 이상 시 경고
const RAPID_CHANGE_THRESHOLD = 10000; // $L_{max}$가 한 번에 이 값 이상 변하면 위험

/**
 * 인터랙티브 리스크 진단 대시보드 컴포넌트 (MVP)
 * Lmax 변화 감지 및 Glitch/Jittering 애니메이션 로직 포함.
 */
const InteractiveDashboard: React.FC = () => {
    // 1. 상태 정의: 이전 $L_{max}$ 값과 현재 리스크 데이터를 관리합니다.
    const [currentRisk, setCurrentRisk] = useState<RiskData>({ lmax: 0, sloss: 0 });
    const [previousLmax, setPreviousLmax] = useState<number>(0);
    // 2. Glitch 상태 정의: 위험 감지 여부를 담는 Boolean 플래그입니다.
    const [isGlitching, setIsGlitching] = useState(false);
    
    // useRef를 사용해 최신 lmax값을 추적하여 클로저 문제를 방지합니다.
    const currentLmaxRef = useRef(0);
    currentLmaxRef.current = currentRisk.lmax;

    // Funnel Context 사용: 버튼 클릭 시 Paywall 진입을 관리합니다.
    const { triggerPaywallFunnel } = useFunnelContext();

    // 🚨 핵심 로직: 리스크 변화 감지 및 Glitch 상태 업데이트 (useEffect)
    useEffect(() => {
        if (!currentRisk) return;

        const currentLmax = currentRisk.lmax;
        const previousLmaxVal = previousLmax;
        let glitchTriggered = false;

        // 1. 임계값 초과 검사 (Static Danger Zone)
        if (currentLmax > MAX_RISK_THRESHOLD * 0.8) {
            glitchTriggered = true;
        }

        // 2. 급격한 변화 감지 (Dynamic Instability Check) - 이게 가장 중요함!
        const absoluteChange = Math.abs(currentLmax - previousLmaxVal);
        if (previousLmaxVal > 0 && absoluteChange > RAPID_CHANGE_THRESHOLD) {
            glitchTriggered = true; // 갑자기 값이 오르내리면 불안정하다고 간주
        }

        // Glitch 상태 업데이트 후, 다음 렌더링 사이클에서 애니메이션 클래스 적용 준비
        setIsGlitching(glitchTriggered);
    }, [currentRisk.lmax, previousLmax]);

    // 🚨 실제 리스크 계산 엔진 연동 루프 함수
    const handleRiskUpdate = (inputs: Array<{ id: string; score: number }>) => {
        // 실제 계산 엔진 호출
        const result = calculateRiskExposure(inputs);

        // Lmax 값이 변경되면 이전 값을 저장하고 상태를 업데이트합니다.
        setPreviousLmax(currentLmaxRef.current);
        setCurrentRisk({ 
            lmax: result.lMax, 
            sloss: result.riskScore / 10 // 0~100 점수를 10분율 점수로 스케일링
        });

        // 3초 후에 다시 점수를 변동시켜 리스크를 업데이트합니다.
        setTimeout(() => {
            const nextInputs = inputs.map(input => {
                // 점수를 -15 ~ +15 사이로 변동하여 다이내믹한 갱신 시뮬레이션
                const fluctuation = (Math.random() * 30) - 15;
                const nextScore = Math.min(100, Math.max(0, input.score + fluctuation));
                return { id: input.id, score: nextScore };
            });
            handleRiskUpdate(nextInputs);
        }, 3000);
    };

    // 최초 렌더링 시 리스크 업데이트 엔진 가동
    useEffect(() => {
        const initialInputs = [
            { id: 'GDPR-2019-A', score: 85 },
            { id: 'CCPA-2020-B', score: 75 },
            { id: 'HIPAA-2016-C', score: 95 }
        ];
        handleRiskUpdate(initialInputs);
    }, []);

    // 🚨 Funnel State Transition 핸들러: 다운로드 버튼 클릭 이벤트 처리
    const handleDownloadClick = () => {
        console.log("✅ [Action] 보고서 다운로드를 시도했습니다. Paywall 진입 로직 실행.");
        // 실제 다운로드 대신, Funnel Context를 통해 상태를 변경하여 다음 화면으로 강제 이동합니다.
        triggerPaywallFunnel();
    };


    return (
        <div className={`dashboard-container ${isGlitching ? 'glitchActive' : ''}`}>
            <h1 className="dashboardTitle">시스템 무결성 진단 대시보드 (Live Analysis)</h1>
            <p className={`statusMessage ${isGlitching ? 'danger-alert' : 'stable'}`}>
                {isGlitching ? "⚠️ 경고: 데이터 흐름의 심각한 불안정 감지. 즉각적인 감사 로그 구축이 필요합니다." : "✅ 시스템 상태 정상. 지속적 모니터링 중입니다."}
            </p>

            <div className={`risk-card ${isGlitching ? 'jittering' : ''}`}>
                <h2>{'재무적 최대 손실액 ($L_{max}$)'}</h2>
                {/* Lmax 수치 표시 시, Glitch 효과가 발생하여 불안정함을 시각적으로 표현 */}
                <p className="lmax-value">${currentRisk.lmax.toLocaleString()}</p>
            </div>

             <div className={`risk-card ${isGlitching ? 'jittering' : ''}`}>
                <h2>{'시스템 신뢰성 공백 점수 ($S_{loss}$)'}</h2>
                <p className="sloss-value">{currentRisk.sloss.toFixed(2)} / 10</p>
            </div>

            {/* CTA 버튼: Funnel 진입의 트리거 역할 */}
            <button 
                className={`cta-download ${isGlitching ? 'urgent' : ''}`} 
                onClick={handleDownloadClick}
                disabled={!currentRisk.lmax || currentRisk.lmax === 0} // 초기 로딩 방지
            >
                {isGlitching ? "🚨 리스크 보고서 즉시 감사 (Paywall 진입)" : "🔒 상세 리스크 보고서 다운로드"}
            </button>

             <div className="simulation-controls">
                 <p>{'*(데모용: 3초마다 $L_{max}$ 값이 무작위로 변화하며 Glitch 애니메이션을 테스트합니다.)*'}</p>
                 <button 
                      onClick={() => handleRiskUpdate([
                          { id: 'GDPR-2019-A', score: 85 },
                          { id: 'CCPA-2020-B', score: 75 },
                          { id: 'HIPAA-2016-C', score: 95 }
                      ])} 
                      disabled={isGlitching}
                  >
                      Reset Simulation
                  </button>
             </div>

        </div>
    );
};

export default InteractiveDashboard;