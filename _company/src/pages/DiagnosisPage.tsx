import React, { useState, useEffect, useCallback } from 'react';
import { AuditResult, riskLevelStyles, RiskLevel } from '../types/DiagnosisTypes';

/**
 * @component PaywallGate
 * @description 리스크가 임계치를 초과했을 때 강제 진입시키는 시스템 공황 게이트.
 * 이 컴포넌트는 사용자 상호작용을 막고 오직 결제를 유도하는 단일 목적의 인터페이스여야 합니다.
 */
const PaywallGate: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-red-900/80 p-8">
            <div className={`p-12 rounded-xl shadow-2xl text-center ${riskLevelStyles.Critical.bgColor} border-[3px] ${riskLevelStyles.Critical.color}`}>
                <h1 className="text-6xl font-extrabold tracking-tight mb-4 animate-pulse">
                    🚨 시스템 접근 거부: 방어벽(Barrier) 활성화 🚨
                </h1>
                <p className="text-3xl text-red-200 mb-8 max-w-xl mx-auto">
                    당신의 조직은 현재 심각한 구조적 리스크에 노출되어 있습니다. <br />
                    이 진단 보고서를 보는 것만으로도 잠재적 손실액($L_{max}$)이 확인되었습니다.
                </p>
                <div className="text-xl mb-10">
                    <span className="font-bold text-red-300">✅ 해결책:</span> <br />
                    시스템 감사 및 즉시 방어벽 구축 서비스를 통해서만 접근 가능합니다.
                </div>
                {/* Mock API 연동 지점 */}
                <button 
                    className="px-12 py-4 bg-yellow-500 hover:bg-yellow-600 text-red-900 font-bold text-lg rounded-full transition duration-300 cursor-pointer shadow-lg transform hover:scale-105"
                    onClick={() => alert("Stripe Payment Intent API 호출 시도... (Mock)")}
                >
                    지금, 시스템 방어벽을 구축하고 리스크를 해소하세요.
                </button>
            </div>
        </div>
    );
};

/**
 * @component DiagnosisPage
 * @description 진단 감사 보고서의 메인 페이지. 리스크 점수(TRE)에 따라 렌더링 흐름이 결정되는 핵심 게이트 역할 수행.
 */
const DiagnosisPage: React.FC = () => {
    // [1] 상태 관리 정의: AuditResult를 기반으로 리스크 레벨과 가시적 상태를 추적합니다.
    const [auditData, setAuditData] = useState<AuditResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaywallActive, setIsPaywallActive] = useState(false);

    // [2] Mock API 호출 및 데이터 로딩 (실제 환경에서는 useEffect 내에서 fetch API 사용)
    useEffect(() => {
        // 🚀 Mock Data Simulation: 실제로는 /api/v1/diagnosis를 통해 데이터를 가져와야 합니다.
        const mockApiCall = async (): Promise<AuditResult> => {
            await new Promise(resolve => setTimeout(resolve, 1500)); // API 지연 시뮬레이션

            // --- Mock Data 로직: High Risk Scenario 강제 유도 ---
            return {
                reportTitle: "시스템 무결성 감사 보고서 (2026년)",
                calculatedTRE: 88.5, // 임계치 초과 값 설정 (Funneling Trigger)
                findings: [
                    { category: "I. AI 기반 출처 무효화 위험 점검", isAtRisk: true, details: "근거 추적 가능성 미흡. 법률 근거 페이지 번호 제시 의무 위반." },
                    { category: "II. 양자 컴퓨팅 암호화 무효화 위험 점검", isAtRisk: true, details: "PII 데이터 보존 기간에 대한 PQC 로드맵 부재." },
                    { category: "III. 컴플라이언스 드리프트 위험 점검", isAtRisk: false, details: "예외 처리 매뉴얼은 존재하나, 자동화 게이트가 미흡함." }
                ]
            } as AuditResult;
        };

        mockApiCall().then(data => {
            setAuditData(data);
            // 데이터 로딩 후 리스크 레벨 판단 및 Paywall 상태 결정
            const riskLevel = determineRiskLevel(data.calculatedTRE);
            setIsPaywallActive(riskLevel === 'High' || riskLevel === 'Critical');
        });

        setIsLoading(false);
    }, []);

    // [3] 핵심 로직: 리스크 점수 기반 레벨 결정 (규제적 강압성 반영)
    const determineRiskLevel = useCallback((score: number): RiskLevel => {
        if (score >= 75) return 'Critical'; // 즉시 Paywall 유도
        if (score >= 40) return 'High';   // 결제 유도 경고
        if (score >= 15) return 'Medium';
        return 'Low';
    }, []);

    // [4] UI 렌더링 로직: 가장 먼저 Paywall 상태를 확인합니다.
    if (isPaywallActive && !isLoading) {
        console.log("🚨 Paywall Barrier 활성화됨. 진단 페이지 접근 차단.");
        return <PaywallGate />;
    }

    if (isLoading) {
        return <div className="text-center py-20 text-xl">시스템 감사 보고서 로딩 중...</div>;
    }

    // 데이터가 정상적으로 로드되었고, Paywall이 활성화되지 않은 경우의 렌더링입니다.
    const currentRiskLevel = determineRiskLevel(auditData!.calculatedTRE);
    const style = riskLevelStyles[currentRiskLevel];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <header className={`p-6 mb-10 rounded-lg shadow-md ${style.bgColor}`}>
                <h1 className="text-4xl font-extrabold text-gray-900 border-b pb-2">
                    {auditData?.reportTitle}
                </h1>
                <p className={`mt-2 text-xl font-semibold ${style.color}`}>
                    진단 리스크 점수: <span className="text-3xl">{auditData?.calculatedTRE.toFixed(1)}</span> / 100점
                </p>
            </header>

            {/* [A] 종합 진단 결과 섹션 (가장 먼저 눈에 들어와야 할 핵심 메시지) */}
            <section className={`mb-12 p-8 rounded-xl shadow-lg ${style.bgColor} border-l-8 ${style.color}`}>
                <h2 className="text-3xl font-bold mb-4">총체적 시스템 진단 결과</h2>
                <p className={`text-xl italic ${style.message}`}>{style.message}</p>
                {/* 중요 CTA 버튼: 리스크가 높을 때만 활성화되어야 함 */}
                {(currentRiskLevel === 'High' || currentRiskLevel === 'Critical') && (
                    <button 
                        onClick={() => alert("Paywall로의 강제 전환 시도!")}
                        className="mt-6 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition cursor-pointer"
                    >
                        🚨 리스크 해소 컨설팅 예약 (Paywall 진입)
                    </button>
                )}
            </section>

            {/* [B] 상세 위협 보고서 섹션 */}
            <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 border-b pb-2 text-gray-800">
                    🔍 세부 구조적 취약성 분석 (Finding Details)
                </h2>
                {auditData?.findings.map((finding, index) => (
                    <div key={index} className={`mb-6 p-5 rounded-lg shadow ${finding.isAtRisk ? 'bg-red-50 border-l-4 border-red-500' : 'bg-white border-l-4 border-green-500'}`}>
                        <h3 className="text-xl font-bold mb-2">{finding.category}</h3>
                        <p className={`font-semibold ${finding.isAtRisk ? 'text-red-700' : 'text-green-700'}`}>
                            {finding.isAtRisk ? "❗ 미흡 (Structural Gap Detected)" : "✅ 적합 (Compliant)"}
                        </p>
                        <p className="mt-2 text-gray-600">{finding.details}</p>
                    </div>
                ))}
            </section>

            {/* [C] 최종 액션 유도 섹션 */}
            <section className={`text-center p-8 rounded-xl shadow-lg ${style.bgColor} border-t-4 ${style.color}`}>
                <h2 className="text-3xl font-bold mb-4">다음 단계가 필수적입니다.</h2>
                <p className="text-lg text-gray-700">
                    이 보고서는 잠재적 위험을 진단했을 뿐, 해결책은 아닙니다. <br />
                    실제 시스템 감사 및 방어벽 구축을 통해 $L_{max}$를 줄여야 합니다.
                </p>
                 <button 
                    onClick={() => alert("Paywall로의 강제 전환 시도! (Final CTA)")}
                    className="mt-6 px-10 py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg transition cursor-pointer shadow-md"
                >
                    🛡️ 즉시 시스템 감사 컨설팅 요청하기
                </button>
            </section>
        </div>
    );
};

export default DiagnosisPage;