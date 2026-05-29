import React, { useState, useReducer, useCallback } from 'react';
// API 호출은 Mocking을 전제로 합니다. 실제로는 백엔드와 연동됩니다.
// import { calculateTotalRisk } from '../services/riskService'; 

/**
 * @typedef {'IDLE' | 'LOADING_RISK' | 'WARNING_STATE' | 'CRITICAL_STATE' | 'PAYWALL'} AssessmentState
 */

/**
 * RiskAssessmentFlow 컴포넌트는 사용자가 리스크 진단부터 결제까지의 전 과정을 경험하도록 상태를 관리합니다.
 * @param {object} props - 필요한 입력 데이터 (예: 사용자 데이터)
 * @returns {JSX.Element}
 */
const RiskAssessmentFlow = ({ initialData }) => {
    // State Machine 정의: 사용자의 여정(Journey)을 엄격하게 제어합니다.
    const [state, dispatch] = useReducer((prevState, action) => {
        switch (action.type) {
            case 'START_ASSESSMENT':
                return 'LOADING_RISK'; // 1. 진단 시작 -> 로딩 상태로 전환
            case 'RISK_CALCULATED':
                // 백엔드 API 호출 성공 후 리스크 등급에 따라 분기합니다.
                const riskLevel = action.payload.riskLevel;
                if (riskLevel === 'CRITICAL') return 'CRITICAL_STATE'; 
                if (riskLevel === 'WARNING') return 'WARNING_STATE';
                return 'IDLE'; // Normal 상태는 보고서 요청으로 바로 이동 가능하게 처리
            case 'REPORT_REQUESTED':
                 // 로딩 애니메이션을 통한 시간적 압박 조성 (Time Pressure)
                setTimeout(() => {
                    dispatch({ type: 'PAYWALL' });
                }, 3000); // 3초 지연 후 Paywall 진입
                return 'LOADING_REPORT'; // 임시 상태
            case 'ERROR':
                 return 'IDLE'; // 에러 발생 시 기본 상태로 복귀 (Fallback)
            default:
                return prevState;
        }
    }, 'IDLE');

    // API 호출 및 로직 핸들링 (실제 백엔드와 연동될 함수)
    const handleStartAssessment = useCallback(async () => {
        dispatch({ type: 'START_ASSESSMENT' });
        try {
            // 🚨 Mocking the actual API call to calculate total risk.
            await new Promise(resolve => setTimeout(resolve, 1500)); // 로딩 시뮬레이션
            const mockResult = { riskLevel: Math.random() > 0.8 ? 'CRITICAL' : (Math.random() > 0.3 ? 'WARNING' : 'NORMAL') };
            dispatch({ type: 'RISK_CALCULATED', payload: mockResult });

        } catch (error) {
            console.error("Risk calculation failed:", error);
            dispatch({ type: 'ERROR' });
        }
    }, []);


    // 🎨 UI Rendering Logic (상태에 따라 다른 컴포넌트가 보여야 함)
    const renderContent = () => {
        switch (state) {
            case 'IDLE':
                return <button onClick={handleStartAssessment}>진단 시작하기</button>;

            case 'LOADING_RISK':
                // 🚨 강제적인 시간 지연과 긴장감 조성 시각화 요소가 필요합니다.
                return <div className="loading-spinner">위험 점수 계산 중...</div>;

            case 'WARNING_STATE':
                return <div className="red-zone" style={{ border: "3px solid red", padding: "20px" }}>⚠️ 경고: 당신의 위험 노출도가 임계치를 초과했습니다. 보고서가 필요합니다!</div>;

            case 'CRITICAL_STATE':
                // 🚨 시각적 공포 극대화 (Red Zone Rendering)
                return <div className="red-zone critical" style={{ border: "5px solid darkred", padding: "30px" }}>🔥 심각: 즉각적인 조치가 필요합니다. 전문가의 진단이 필수입니다!</div>;

            case 'LOADING_REPORT':
                 // 🚨 Paywall로 넘어가기 전, 반드시 시간을 지연시키고 경고 메시지를 노출해야 합니다. (Forced Acknowledgment)
                return <div className="loading-spinner">보고서 생성 중... 잠시만 기다려 주십시오.</div>;

            case 'PAYWALL':
                // 🚨 최종 목적지: Paywall Barrier
                return <button disabled>프리미엄 보고서 받기 (유료)</button>;
        }
    };

    return (
        <div className="assessment-container">
             <h1>yobizwiz 리스크 진단 시스템</h1>
            {renderContent()}
        </div>
    );
};

export default RiskAssessmentFlow;