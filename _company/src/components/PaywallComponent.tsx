import React from 'react';

// @typedef {Object} ReportData
interface ReportData {
    riskLevel: 'RED' | 'YELLOW' | 'GREEN';
    totalRiskScore: number;
    isCompliant: boolean;
    suggestedAction: string[];
    requiredInsurancePremiumMillions: number;
}

/**
 * 진단 보고서 결과를 바탕으로 결제를 강제하는 게이트키퍼 모달/컴포넌트.
 * 핵심 가치: '지금 돈을 안 내면 당신의 회사는 위험합니다.' 라는 공포감을 심어주는 것.
 */
const PaywallComponent = ({ reportData }: { reportData: ReportData }) => {

    // 보험료가 0인 경우 (Green Zone)는 결제 강제를 하지 않습니다.
    if (reportData.requiredInsurancePremiumMillions === 0 && reportData.riskLevel !== 'RED') {
        return null; // 가짜 컴포넌트이므로, 조건에 맞지 않으면 아무것도 표시하지 않음.
    }

    const premium = reportData.requiredInsurancePremiumMillions;
    const isHighRisk = reportData.riskLevel === 'RED';

    // 결제 핸들러 시뮬레이션
    const handlePayment = () => {
        alert(`[결제 성공] ${premium * 100}만 원이 정상적으로 납부되었습니다.\n이제 전체 상세 보고서 접근 권한을 얻으셨습니다. (다음 단계: 회원가입 및 결제 완료 페이지로 이동)`);
        // 실제로는 이 지점에서 사용자 경험 흐름을 '성공'으로 전환해야 합니다.
    };

    return (
        <div className="p-8 bg-red-900/95 border-4 border-[#C0392B] shadow-[0_0_30px_rgba(192,57,43,0.8)] animate-pulse">
            <h2 className="text-3xl font-extrabold text-white mb-4 uppercase tracking-wider border-b pb-2 border-[#C0392B]">
                🚨 Critical System Alert: Mandatory Action Required 🚨
            </h2>
            <p className="text-xl text-yellow-300 mb-6">
                진단 결과, 귀사의 시스템적 생존 가능성(Structural Integrity)에 치명적인 위협이 감지되었습니다. <br />
                **필수 보험료 납부 없이는 상세 리스크 보고서 접근 및 해결책 제시가 불가능합니다.** [근거: 🏢 회사 정체성]
            </p>

            <div className="bg-black p-6 rounded-lg mb-8 border-l-4 border-[#C0392B]">
                <p className="text-sm uppercase text-gray-400">Total Estimated Risk Exposure (QLoss)</p>
                <h3 className={`text-5xl font-black tracking-tighter ${isHighRisk ? 'text-red-600 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]' : 'text-yellow-400'} animate-glitch`}>
                    ${reportData.totalRiskScore} Million USD
                </h3>
            </div>

            <p className="text-lg text-white mb-6">
                ✅ **필수 보험료 납부액:** <span className="text-3xl font-bold text-[#2980B9]">{premium * 100}만 원</span>
                (이 금액은 시스템적 결함 보완을 위한 최소한의 필수 자본금입니다.)
            </p>

            <button
                onClick={handlePayment}
                className="w-full py-4 text-xl font-bold bg-[#2980B9] hover:bg-[#3498DB] transition duration-300 uppercase tracking-widest shadow-lg transform hover:scale-[1.01]"
            >
                [Mandatory Payment] {premium * 100}만 원 납부 및 보고서 잠금 해제
            </button>

             <p className="text-xs text-gray-400 mt-6">* 이 프로세스는 외부 법규 준수(Compliance) 의무와 연동되어 있습니다. 반드시 진행해야 합니다.</p>
        </div>
    );
};

export default PaywallComponent;