/**
 * @fileoverview Paywall의 핵심 게이트 역할을 수행하는 컴포넌트입니다.
 * 상태 전이(State Machine)와 애니메이션 Hook을 코드 레벨에서 정의합니다.
 */
import React, { useEffect } from 'react';
import { usePaywallStore, PaywallState } from '../store/usePaywallStore';

// 💡 UI/UX Hook: 각 단계별로 컴포넌트가 마운트되거나 업데이트될 때 애니메이션을 트리거합니다.
const AnimatedStage = ({ children, stageName }: { children: React.ReactNode, stageName: string }) => (
    <div className={`stage-container ${stageName} fade-in`}>
        {children}
    </div>
);

/** 
 * PaywallGateComponent: 상태에 따라 UI와 비동기 로직을 제어하는 핵심 컴포넌트.
 */
const PaywallGateComponent: React.FC = () => {
    // Zustand 스토어 사용 및 현재 상태 구독
    const state = usePaywallStore(s => s.state);
    const isLoading = usePaywallStore(s => s.isLoading);
    const riskData = usePaywallStore(s => s.riskData);
    const error = usePaywallStore(s => s.error);

    // 🚀 useEffect를 사용하여 상태 변화에 따른 사이드 이펙트 (예: 애니메이션 클래스 추가) 정의
    useEffect(() => {
        if (state === 'RED_ZONE_ALERT') {
            document.body.classList.add('red-zone-active'); // 전역 Red Zone 배경 강제 적용
        } else if (state !== 'RED_ZONE_ALERT' && state !== 'SUCCESS') {
             document.body.classList.remove('red-zone-active');
        }
    }, [state]);

    // 🚨 상태별 렌더링 로직: State Machine의 핵심 구현입니다.
    const renderContent = () => {
        switch (state) {
            case 'IDLE':
                return <AnimatedStage stageName="initial-stage">
                    <p>현재 위험 점수 진단이 필요합니다. 분석을 시작하시겠습니까?</p>
                    {/* 버튼 클릭 시 startDiagnosisFlow를 호출하여 상태 전이를 강제 */}
                    <button onClick={() => usePaywallStore.getState().startDiagnosisFlow()}>진단 요청 (Start Diagnosis)</button>
                </AnimatedStage>;

            case 'LOADING_INITIAL_RISK':
                return <AnimatedStage stageName="loading-stage">
                    {/* 3초 동안 로딩 스피너와 함께 "데이터 분석 중..." 메시지 표시 */}
                    <p className="loader-message">시스템이 귀하의 데이터를 암호학적으로 분석하고 있습니다... (진행률: {isLoading ? '█' : ''})</p>
                </AnimatedStage>;

            case 'RED_ZONE_ALERT':
                // 이 단계에 도달하면, 리스크 데이터가 반드시 존재해야 합니다. 
                if (!riskData) return <div className="error">데이터 누락: Red Zone 진입 실패</div>;
                
                return (
                    <AnimatedStage stageName="alert-stage critical-bg">
                        <h2>🚨 [경고] 구조적 위험 노출 임계치 초과!</h2>
                        <p>최대 잠재 손실액 ($L_{max}$): <strong className="red-text">{riskData.maxPotentialLoss} USD</strong></p>
                        <p>진단 보고서: {riskData.structuralDeficiencyReport}</p>
                        {/* 구매 버튼 클릭 시 completePurchase를 호출하여 성공 상태로 전이 */}
                        <button onClick={() => usePaywallStore.getState().completePurchase()}>솔루션 즉시 확보 (Buy Now)</button>
                    </AnimatedStage>
                );

            case 'SUCCESS':
                return <div className="success-message">✅ 진단 및 솔루션 구매가 완료되었습니다. 시스템이 안전하게 보호됩니다.</div>;

            case 'ERROR':
                return <div className="error-message">❌ 오류 발생: {error}</div>;

            default:
                return null;
        }
    };

    return (
        <div className={`paywall-gate ${state === 'RED_ZONE_ALERT' ? 'red-zone-active' : ''}`}>
            <h1>yobizwiz Structural Integrity Check</h1>
            {renderContent()}
        </div>
    );
};

export default PaywallGateComponent;