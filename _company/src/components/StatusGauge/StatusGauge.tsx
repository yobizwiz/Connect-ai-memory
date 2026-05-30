// src/components/StatusGauge/StatusGauge.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { StatusGaugeProps, RiskStatus, DiagnosisReport } from './types';

/**
 * [CORE LOGIC] 리스크 점수에 따라 시각적 상태와 애니메이션을 결정합니다.
 * @param score 현재 리스크 스코어 (0-100)
 * @returns GaugeStatus 및 CSS 클래스 조합
 */
const getRiskState = (score: number): { status: RiskStatus; colorClass: string; decayIntervalMs: number } => {
    if (score >= 75) {
        // Red Zone: Critical. Glitch 효과 강도 최고조. Decay 주기 짧음(빨리 위험함).
        return { status: RiskStatus.CRITICAL, colorClass: 'bg-red-800/90 ring-4 ring-red-600 shadow-[0_0_30px_rgba(192,57,43,0.8)]', decayIntervalMs: 100 };
    } else if (score >= 30) {
        // Yellow Zone: Warning. 경고 단계.
        return { status: RiskStatus.WARNING, colorClass: 'bg-yellow-800/90 ring-4 ring-yellow-600 shadow-[0_0_25px_rgba(245,158,11,0.7)]', decayIntervalMs: 300 };
    } else {
        // Normal Zone: Normal. 초기 진입.
        return { status: RiskStatus.NORMAL, colorClass: 'bg-blue-800/90 ring-4 ring-blue-600 shadow-[0_0_20px_rgba(41,128,185,0.5)]', decayIntervalMs: 800 };
    }
};

/**
 * A/B 테스트 로깅을 시뮬레이션하는 API 호출 함수입니다. (Defensive Wrapper)
 * @param group 사용자 그룹 ID
 * @param action 수행 액션명
 */
const logABTestEvent = async (group: string, action: string): Promise<boolean> => {
    console.log(`[API LOG] Logging A/B Test Event: Group=${group}, Action=${action}`);
    try {
        // 실제로는 fetch('/api/ab-test/log', { method: 'POST', body: JSON.stringify(...) })가 들어갑니다.
        await new Promise(resolve => setTimeout(resolve, 50)); // Network delay simulation
        return true; // 성공 가정
    } catch (error) {
        console.error("[ERROR] Failed to log A/B Test event:", error);
        return false; // 실패 시에도 UI는 진행되어야 함 (Fallback)
    }
};

/**
 * Paywall 모달 컴포넌트 (Placeholder). 실제 결제 로직과 연결되어야 합니다.
 */
const PaywallModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#1A1A1A] p-10 border border-[#C0392B]/50 max-w-lg w-full text-center shadow-2xl animate-pulse">
                <h2 className="text-4xl font-mono text-[#FFD700]">🚨 시스템 경고: 데이터 접근 차단 🚨</h2>
                <p className="mt-4 text-lg text-gray-300">현재 리스크 점수($L_{max}$)가 임계치를 초과하여, 상세 진단 보고서 열람은 유료 서비스에 국한됩니다.</p>
                <div className="mt-8 space-y-4">
                    <button 
                        onClick={() => { alert("결제 모달 호출: Stripe API 연동 필요"); onClose(); }}
                        className="w-full py-3 bg-[#C0392B] hover:bg-[#9A3125] text-white font-bold uppercase transition duration-300 shadow-lg">
                        진단 보고서 요청 (지금 바로 $L_{max}$ 차단)
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-full py-2 border border-gray-600 hover:bg-gray-800 text-gray-300 font-semibold">
                        닫기 (임시 접근만 허용)
                    </button>
                </div>
            </div>
        </div>
    );
}


/**
 * 메인 리스크 점수 게이지 컴포넌트. 상태 전이 로직과 A/B 테스트 통합을 담당합니다.
 */
const StatusGauge: React.FC<StatusGaugeProps> = ({ currentRiskScore, abTestGroup }) => {
    // 1. State Management Initialization
    const [riskScore, setRiskScore] = useState(currentRiskScore);
    const [status, setStatus] = useState<RiskStatus>(getRiskState(currentRiskScore).status);
    const [isPaywallVisible, setIsPaywallVisible] = useState(false);

    // 2. Effect Hook: 점수 변화 감지 및 상태 업데이트 (핵심 로직)
    useEffect(() => {
        // 초기 마운트 시점에 최초의 위험 등급을 설정합니다.
        const initialStatus = getRiskState(currentRiskScore).status;
        setStatus(initialStatus);
    }, [currentRiskScore]);


    // 3. 핸들러: 점수 변화 및 상태 전이 로직 (Defensive Transition)
    const handleScoreChangeAndTransition = useCallback(async (newScore: number) => {
        if (newScore < 0 || newScore > 100) {
            console.error("Validation Error: Invalid score received:", newScore);
            return; // 가드 처리
        }

        setRiskScore(prevScore => {
             // 스코어 변화를 시뮬레이션하고, 상태 전환 로직을 실행합니다.
             const newState = getRiskState(newScore);
             setStatus(newState.status);
             console.log(`[STATUS CHANGE] Score ${newScore} -> Status: ${newState.status}`);

             // Critical Zone 진입 시 Paywall 준비 단계로 진입
             if (newState.status === RiskStatus.CRITICAL && !isPaywallVisible) {
                // 5초 후, 만약 사용자가 행동하지 않으면 (즉, 진단 요청 버튼을 누르지 않으면) 강제로 경고를 유지하며 결제 장벽 느낌을 강화합니다.
                setTimeout(() => console.warn("Warning: Critical state maintained. Paywall CTA visible."), 5000);
             }

            return newScore; // 스코어 상태 업데이트 완료
        });
    }, [isPaywallVisible]);


    // 4. 핸들러: 최종 행동 (진단 요청) 및 A/B 테스트 로깅
    const handleDiagnosisRequestClick = async () => {
        if (status !== RiskStatus.CRITICAL) {
            alert("경고: 보고서가 필요한 수준의 리스크 상태가 아닙니다.");
            return;
        }

        // 1차 방어선: A/B 테스트 로깅 (최우선 순위)
        const success = await logABTestEvent(abTestGroup, 'DIAGNOSIS_REQUEST');
        if (!success) {
             console.warn("A/B Test Logging Failed. Proceeding with Paywall Display anyway.");
        }

        // 2차 방어선: Paywall 활성화 및 상태 전환
        setIsPaywallVisible(true);
    };


    // --- 렌더링 로직 (UI) ---
    return (
        <div className="p-6 bg-[#1A1A1A] rounded-xl shadow-2xl border border-gray-700 max-w-3xl mx-auto">
            <h2 className="text-2xl font-mono text-white mb-4 tracking-wider">
                Systemic Risk Monitor | <span className={`uppercase ${status === RiskStatus.CRITICAL ? 'text-[#C0392B]' : status === RiskStatus.WARNING ? 'text-[#F59E0B]' : 'text-[#2980B9]'}`}>{status}</span>
            </h2>

            {/* 게이지 시각화 영역 */}
            <div className={`relative h-16 rounded-full p-[3px] transition-all duration-700 ${getRiskState(riskScore).colorClass}`}>
                {/* 실제 점수 바 (가변 너비) */}
                <div 
                    className="absolute inset-y-0 left-0 rounded-full bg-white/20 transition-all duration-1000 ease-out shadow-inner"
                    style={{ width: `${riskScore}%` }}
                ></div>
                 {/* 글리치 노이즈 효과 시뮬레이션 (CSS Animation 필요) */}
                <div className="absolute inset-y-full left-0 right-0 pointer-events-none opacity-30 [background]repeating-linear-gradient([90deg,rgba(255,0,0,.1)_0%,rgba(255,0,0,.1)_1px,transparent_1px,transparent_2px])"></div>
            </div>

            {/* 텍스트 정보 */}
            <div className="mt-6 flex justify-between items-center text-white/80">
                <p className="text-xl font-mono">현재 리스크 점수:</p>
                <span className="text-5xl font-extrabold tracking-tighter">{riskScore}%</span>
            </div>

            {/* 액션 버튼 */}
            <div className={`mt-10 p-6 rounded-lg transition duration-500 ${status === RiskStatus.CRITICAL ? 'bg-[#C0392B]/10 border-l-4 border-[#C0392B] shadow-red-800/30' : 'bg-gray-800/20 border-l-4 border-blue-600'} text-center`}>
                <h3 className="text-xl font-mono mb-2">다음 조치 권고 (Action Required)</h3>
                
                {/* Paywall 트리거 버튼 */}
                <button 
                    onClick={handleDiagnosisRequestClick}
                    disabled={status !== RiskStatus.CRITICAL}
                    className={`w-full py-3 text-lg font-bold uppercase transition duration-300 ${
                        status === RiskStatus.CRITICAL ? 'bg-[#C0392B] hover:bg-[#9A3125] shadow-md' : 'bg-gray-600 cursor-not-allowed'
                    } text-white disabled:opacity-70`}>
                    {status === RiskStatus.CRITICAL ? "진단 보고서 요청 (결제 장벽 진입)" : "정보 부족: 점수 임계치 미달"}
                </button>

            </div>
            
             {/* A/B 테스트 상태 표시 */}
            <div className="mt-4 text-sm text-right text-white/50">
                A/B Test Group ID: {abTestGroup} | Current State Logged.
            </div>

            {/* Paywall 모달 오버레이 */}
            {isPaywallVisible && <PaywallModal onClose={() => setIsPaywallVisible(false)} />}
        </div>
    );
};

export default StatusGauge;