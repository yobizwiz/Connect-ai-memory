import React, { useState, useCallback } from 'react';
import { PaywallState, RiskScoreResult, PaywallEventLog } from '../../types/paywall-state';
// Assume StatusGauge is imported and ready to display current risk score
import StatusGauge from '../StatusGauge/StatusGauge'; 
import { fetchRiskScore } from '../../api/risk-api';

interface PaywallGatekeeperProps {
    userId: string;
}

const PaywallGatekeeper: React.FC<PaywallGatekeeperProps> = ({ userId }) => {
    // State Machine 정의 및 초기값 설정
    const [currentState, setCurrentState] = useState<PaywallState>('INITIAL');
    const [riskResult, setRiskResult] = useState<RiskScoreResult | null>(null);

    // 🎯 핵심 플로우: 진단 요청 처리 핸들러 (The Entry Point)
    const handleDiagnosticRequestClick = useCallback(async () => {
        if (currentState !== 'INITIAL') return; // 이미 시작된 상태면 재진입 방지 (Guard)
        
        setCurrentState('LOADING_RISK_SCORE');
        console.log(`[${userId}] Event Log: DIAGNOSTIC_REQUEST`);

        try {
            // 1. 백엔드 API 호출 시뮬레이션 (Mock API Call)
            const result = await fetchRiskScore(userId); 
            setRiskResult(result);

            if (!result || !result.isHighRisk) {
                alert("🚨 시스템 경고: 데이터 불일치 발생. 진단을 다시 요청해주세요.");
                setCurrentState('INITIAL'); // 실패 시 초기 상태로 복귀
                return;
            }
            
            // 2. High Risk 판정 -> Gateway Active 상태 전환
            setCurrentState('GATEWAY_ACTIVE');
            console.log(`[${userId}] Event Log: GATEWAY_TRIGGERED`);

        } catch (error) {
            console.error("🚨 Paywall 로직 실행 중 치명적 에러:", error);
            // 실패 시 Fallback 메시지 제공 및 상태 초기화
            alert("시스템 연결 오류. 잠시 후 다시 시도해주세요.");
            setCurrentState('INITIAL'); 
        }
    }, [currentState, userId]);

    // 🎯 Paywall 활성화 로직 (The Mandate Gate)
    const handleActivatePaywall = useCallback(() => {
        if (!riskResult || !riskResult.isHighRisk) return;

        setCurrentState('PAYMENT_REQUESTED');
        console.log(`[${userId}] Event Log: PAYMENT_INITIATED`);

        // 3. 결제 모달 활성화 및 API 호출 준비
        // 실제로는 Stripe/Braintree SDK를 초기화하고, PaymentForm 컴포넌트를 보여줘야 함.
        alert(`✅ 시스템 권위 경고! $${riskResult.estimatedLossLMax}의 재정적 위험을 막기 위해 결제가 필요합니다.`);
    }, [riskResult]);


    // 🖥️ 상태에 따른 렌더링 로직 (The View Layer)
    const renderContent = () => {
        switch (currentState) {
            case 'INITIAL':
                return <button onClick={handleDiagnosticRequestClick}>위험 진단 요청 시작</button>;
            case 'LOADING_RISK_SCORE':
                return <div><p>⚙️ 시스템 점검 중... 컴플라이언스 리스크 스코어 분석을 진행합니다. (3초 지연)</p><div className="loader"></div></div>;
            case 'GATEWAY_ACTIVE':
                // 핵심 Paywall 컴포넌트가 활성화되는 부분
                return (
                    <div className="paywall-barrier">
                        <h2>🚨 시스템적 위험 경고: 행동 강제 섹션</h2>
                        <p>{"현재 데이터 무결성 점검 결과, $M_{Complexity}$ 임계치를 초과했습니다."}</p>
                        <StatusGauge />
                        <button onClick={handleActivatePaywall}>🛡️ 생존 보험 가입 (Silver Tier)</button>
                    </div>
                );
            case 'PAYMENT_REQUESTED':
                return <div>결제 모달 컴포넌트가 여기에 마운트됩니다. (Stripe/Braintree Integration Point)</div>;
            case 'COMPLETED':
                return <p className="success">✅ 감사 로그 기록 완료. 시스템은 안전합니다.</p>;
            default:
                return null;
        }
    };

    return (
        <div className={`paywall-gatekeeper ${currentState === 'GATEWAY_ACTIVE' ? 'red-glow' : ''}`}>
            <h3>{`[${userId}] Connect AI 시스템 보안 게이트`}</h3>
            {renderContent()}
        </div>
    );
};

export default PaywallGatekeeper;