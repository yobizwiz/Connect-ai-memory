import React, { useState, useEffect } from 'react';
// API 호출 함수를 가정합니다. 실제로는 e2e_simulator_api.py에 연결됩니다.
import { runE2ESimulation } from '@/utils/apiService'; 

interface ReportData {
    riskScore: number; // $TRE$ 점수
    diagnosisSummary: string[];
    isCritical: boolean; // 임계점 초과 여부 (API에서 계산되어 와야 함)
}

// Designer가 정의한 고권위적 경고 스타일을 위한 유틸 함수 (Tailwind + JS)
const getRedZoneStyles = (criticality: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (criticality) {
        case 'LOW': return "border-green-500 bg-green-900/30";
        case 'MEDIUM': return "border-yellow-500 bg-yellow-900/30";
        case 'HIGH': return "border-[#C0392B] bg-[#C0392B]/20 animate-pulse shadow-red-800/70"; // Red Flash 효과를 위한 기본 애니메이션
    }
};

const PaywallGateway: React.FC<{ initialFormData: any }> = ({ initialFormData }) => {
    // [State Management]
    const [report, setReport] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPaywallActive, setIsPaywallActive] = useState(false);

    useEffect(() => {
        if (initialFormData) {
            handleSimulationRun(initialFormData);
        }
    }, [initialFormData]);

    // 1. 백엔드 API 호출 로직 (핵심)
    const handleSimulationRun = async (formData: any) => {
        setIsLoading(true);
        try {
            // 실제로는 이 함수가 c:\Users\jinoh\OneDrive\Desktop\Connect AI\_company\src\services\e2e_simulator_api.py를 호출합니다.
            const data = await runE2ESimulation(formData); 
            setReport(data);

            // 2. 게이트키핑 로직: $TRE$ 임계점 검사 (가정치: 점수가 높을수록 위협이 크다)
            const isThreatCritical = data.riskScore > 70; // 가상의 임계값 설정
            
            if (isThreatCritical && !data.isPaidFor) {
                // Paywall 활성화 강제
                setIsPaywallActive(true);
            } else {
                // 정상 플로우 또는 이미 구매한 경우
                setIsPaywallActive(false);
            }

        } catch (error) {
            console.error("Simulation failed:", error);
            alert("시스템 오류: 리스크 분석 중 문제가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    // 3. UI/UX 렌더링 로직 분리
    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center p-10 text-xl">🚨 시스템 분석 중... 데이터 무결성을 검증하는 중입니다. 잠시만 기다려 주십시오.</div>;
        }

        if (!report) return null; // 데이터가 없으면 렌더링 안 함

        // A. Paywall이 활성화된 경우 (최우선 표시)
        if (isPaywallActive) {
            return <PaymentGate />;
        }

        // B. 일반 결과 보고서 (Mini-Diagnosis 성공 플로우)
        return (
            <div className="p-8 bg-[#1f2937] rounded-lg border-l-4 border-green-500">
                <h2 className="text-2xl font-bold text-white mb-4">✅ 리스크 분석 완료</h2>
                <p className="text-gray-300 mb-6">현재 귀사의 구조적 위험도는 관리 가능한 수준입니다. 하지만, 최첨단 감사 추적 시스템을 통해 잠재적 위협을 사전에 제거할 것을 강력히 권고합니다.</p>
                {/* ... 나머지 보고서 내용 렌더링 */}
            </div>
        );
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            {renderContent()}
        </div>
    );
};

// Paywall 컴포넌트: 가장 중요한 '결제 유도' 영역
const PaymentGate: React.FC = () => {
    return (
        <div className={`relative p-12 text-center shadow-2xl rounded-xl ${getRedZoneStyles('HIGH')} border-4`}>
            {/* 글리치/노이즈 효과는 CSS 애니메이션으로 구현 */}
            <h1 className="text-6xl font-mono tracking-widest uppercase mb-6 animate-pulse">
                [!!!] WARNING: COMPLIANCE GAP DETECTED [!!!]
            </h1>
            <p className="text-3xl text-[#FFD700] mb-4 font-mono">[STATUS CODE 500]: SYSTEM CRITICAL FAILURE IMMINENT</p>
            <p className="text-xl text-white/90 mb-8">
                현재 귀사의 시스템은 **미확인된 구조적 결함**을 가지고 있습니다. 이대로 방치할 경우, 법규 준수 실패(Compliance Failure)로 인한 재무적 손실이 임계치를 초과할 위험이 있습니다.
            </p>

            <div className="bg-black/70 p-6 rounded-lg inline-block mb-8">
                <h3 className="text-4xl text-[#C0392B] font-bold uppercase tracking-wider">
                    필수 조치: 긴급 컴플라이언스 리스크 스캐닝
                </h3>
                <p className="text-lg mt-2 text-yellow-300">
                    최소 비용으로 $1,999/월의 손실을 방어하는 유일한 방법입니다. (선착순 7일 한정)
                </p>
            </div>

            <button className="px-12 py-4 text-xl font-bold uppercase bg-[#C0392B] hover:bg-[#A03026] transition duration-300 shadow-lg transform hover:scale-105">
                즉시 리스크 스캐닝 및 보호 체계 구축 ($299)
            </button>
        </div>
    );
};

export default PaywallGateway;