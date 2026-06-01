import React, { useState, useCallback, useEffect } from 'react';
// Mock API Client (실제로는 Axios 등 라이브러리를 사용)
const mockApiCall = async (data: any): Promise<{ success: boolean; data: any }> => {
    console.log("API Call triggered with:", JSON.stringify(data));
    await new Promise(resolve => setTimeout(resolve, 2000)); // Mock Loading Time
    
    // 백엔드 호출 시뮬레이션 (실제로는 /api/v1/calculate-risk 로 요청)
    const mockLTotalMax = Math.random() > 0.5 ? "$320M+" : "$180M";
    return {
        success: true,
        data: {
            l_total_max: mockLTotalMax,
            gold_tier_cost: 199.99,
            compliance_gap_detail: "Severe Provenance Gap (DORA/GDPR)",
            api_version: "v1.0"
        }
    };
};

// --- State Definitions ---
type PaywallState = 'IDLE' | 'REQUESTING' | 'LOADING' | 'ACTIVE';

interface RiskData {
    l_total_max: string;
    gold_tier_cost: number;
    compliance_gap_detail: string;
}

/**
 * @description Paywall의 상태 전이(State Machine)와 전체 흐름을 관리하는 핵심 컴포넌트.
 * 이 컴포넌트는 모든 비즈니스 로직과 API 연동을 담당합니다.
 */
const PaywallManager: React.FC = () => {
    const [state, setState] = useState<PaywallState>('IDLE');
    const [riskData, setRiskData] = useState<RiskData | null>(null);

    // 🚨 API 호출 및 상태 전이 핸들러 (핵심 Funneling 로직)
    const handleDiagnosisRequest = useCallback(async () => {
        if (state !== 'IDLE') return; // 이미 요청 중이면 무시
        
        setState('REQUESTING');
        console.log("--- [STEP 1] Diagnosis Request Triggered ---");

        try {
            // 1. API 호출 및 데이터 로딩 시뮬레이션
            const result = await mockApiCall({ user_context: {} });
            if (!result.success) throw new Error("API Failed.");

            setState('LOADING'); // 로딩 인디케이터 진입
            console.log("--- [STEP 2] Loading Indicator Active ---");
            
            // 가상의 데이터 추출 및 상태 업데이트
            const receivedData: RiskData = {
                l_total_max: result.data.l_total_max,
                gold_tier_cost: result.data.gold_tier_cost,
                compliance_gap_detail: result.data.compliance_gap_detail,
            };

            setRiskData(receivedData);
            setState('ACTIVE'); // Paywall 모달 진입 (최종 게이트)
            console.log("--- [STEP 3] Paywall Barrier Modal Active ---");

        } catch (error: any) {
            console.error("Paywall Flow Failed:", error);
            alert(`System Error: ${error.message}. 잠시 후 다시 시도해주세요.`);
            setState('IDLE'); // 에러 발생 시 원점으로 복구
        }
    }, [state]);

    // 🚨 결제 의무화 유도 로직 (CTA)
    const handlePurchaseCommit = () => {
        if (!riskData) return;
        alert(`✅ 결제 진행: ${riskData.gold_tier_cost} 달러를 지불하여 무결성 체인을 확보합니다.`);
        // 실제로는 Stripe/Payment Gateway API 호출 및 성공 시 State Reset 로직 필요
    };

    const renderContent = () => {
        switch (state) {
            case 'IDLE':
                return (
                    <div className="p-8 text-center">
                        <h2 className="text-xl font-bold mb-4">진단이 필요한가요?</h2>
                        <p className="mb-6 text-gray-600">현재 시스템의 '미개방 책임'을 진단하고, $L_{totalMax}$를 확인하려면 전문 진단을 요청하십시오.</p>
                        <button 
                            onClick={handleDiagnosisRequest} 
                            className="bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-8 rounded transition duration-150"
                        >
                            🚨 진단 요청 (Start Funneling)
                        </button>
                    </div>
                );
            case 'REQUESTING':
            case 'LOADING':
                return (
                    <div className="p-12 text-center">
                        {/* 로딩 인디케이터 및 스피너 */}
                        <div className="animate-spin inline-block w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                        <p>{state === 'REQUESTING' ? "시스템 연결 중... 리스크 데이터를 분석합니다." : "데이터 처리 및 Paywall을 생성하는 중입니다..."}</p>
                    </div>
                );
            case 'ACTIVE':
                return (
                    <div className="p-12 bg-[#1A1A1A] text-white border-l-4 border-red-700">
                        {/* Paywall Barrier Modal Mockup */}
                        <h3 className="text-3xl font-bold mb-2 text-red-500">🚨 경고: 구조적 공백 (Structural Gap) 감지</h3>
                        <p className="mb-6 text-lg">당신의 시스템은 최소 **{riskData?.l_total_max}** 의 재정적 위험에 노출되어 있습니다.</p>
                        <div className="bg-red-900 p-4 rounded mb-8 border-l-4 border-yellow-500">
                            <p className="text-sm text-gray-300">미개방 책임 상세: {riskData?.compliance_gap_detail}</p>
                        </div>
                        <button 
                            onClick={handlePurchaseCommit} 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-12 rounded transition duration-150"
                        >
                            🛡️ 골드 티어로 방어권 확보 ({riskData?.gold_tier_cost} USD)
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-gray-800 p-6 rounded shadow-2xl">
            {renderContent()}
        </div>
    );
};

export default PaywallManager;