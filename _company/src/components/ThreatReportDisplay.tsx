import React from 'react';
import { DiagnosisResult } from '../api/types'; // API 응답 타입 정의 가정

// 재사용 가능한 Red Zone 스타일 컴포넌트 (디자이너 Mockup 기반)
const DangerCard: React.FC<{ title: string; description: string }> = ({ title, description }) => (
    <div className="p-6 border-l-4 border-red-700 bg-gray-900/5 backdrop-blur-sm shadow-2xl">
        <h3 className="text-xl font-bold text-red-400 mb-2">{title}</h3>
        <p className="text-gray-300">{description}</p>
    </div>
);

interface ThreatReportDisplayProps {
    result: DiagnosisResult;
    onUpgradeClick: () => void; // 업그레이드 CTA를 처리하는 함수
}

/**
 * 진단 결과를 시각화하고, Paywall을 강제하는 핵심 컴포넌트.
 */
const ThreatReportDisplay: React.FC<ThreatReportDisplayProps> = ({ result, onUpgradeClick }) => {
    // 1. 결과 점수에 따른 UI 변화 (디자이너 Mockup 반영)
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'bg-red-700 text-white'; // CRITICAL
        if (score >= 60) return 'bg-yellow-600 text-black'; // HIGH
        return 'bg-green-500 text-gray-900'; // LOW/MEDIUM
    };

    // 2. Paywall 강제 로직
    const isPaywalled = result.is_premium_required;

    return (
        <div className="mt-16 p-8 bg-[#1A1A1A] border-t-4 border-red-900 shadow-inner">
            <h2 className="text-3xl font-extrabold text-red-500 mb-6 tracking-wider uppercase">
                System Integrity Diagnostic Report
            </h2>

            {/* 🚨 위협 점수 게이지 (The Hook) */}
            <div className="mb-10 p-6 bg-gray-900 rounded-lg border border-red-800/50">
                <p className="text-sm text-red-400 uppercase mb-2 tracking-widest">Threat Score Detected</p>
                <div className="flex items-end space-x-4">
                    <div 
                        className={`h-16 rounded-full transition-all duration-1000 ${getScoreColor(result.threat_score)}`}
                        style={{ width: `${result.threat_score}%` }}
                    ></div>
                    <span className="text-7xl font-mono text-white">{result.threat_score}%</span>
                </div>
            </div>

            {/* 📰 핵심 요약 및 경고 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                <DangerCard title={`Risk Level`} description={result.risk_level} />
                <DangerCard title={`Suggested Mitigation`} description={result.suggested_tier} />
                <div className="p-6 bg-gray-800 border-l-4 border-yellow-500 shadow-lg">
                    <h3 className="text-xl font-bold text-yellow-400 mb-2">Diagnosis Summary</h3>
                    <p className="text-gray-300">{result.summary}</p>
                </div>
            </div>

            {/* 💰 Paywall 영역 (Conversion Gate) */}
            {isPaywalled ? (
                <div className="mt-16 p-10 bg-[#2980B9]/10 border-4 border-blue-700/50 shadow-[0_0_30px_rgba(41,128,185,0.3)]">
                    <h2 className="text-4xl font-extrabold text-[#2980B9] mb-4 tracking-wider uppercase">
                        Full Report Access Required
                    </h2>
                    <p className="text-lg text-gray-300 mb-6">
                        현재 진단은 표면적인 리스크만 보여줍니다. 근본적이고 구조적인 공백(Structural Gap)을 파악하려면, <span className="font-bold text-red-400">Gold (Enterprise Immunity)</span> 플랜 수준의 통합 분석이 필수입니다.
                    </p>

                    <button 
                        onClick={onUpgradeClick}
                        className="w-full py-4 text-xl font-semibold rounded-lg transition duration-300 bg-red-600 hover:bg-red-700 shadow-lg transform hover:scale-[1.02] active:scale-95"
                    >
                        ⚠️ $X,XXX /월 구독 및 전체 리포트 열람하기 (Paid Access)
                    </button>

                    <p className="text-xs text-gray-500 mt-4">
                        이 기능은 결제 시스템(Stripe/Braintree)과 연동되어 있으며, 인증 토큰 검증 후에만 활성화됩니다. [근거: 💻 코다리 개인 메모리]
                    </p>
                </div>
            ) : (
                <div className="text-center p-10 bg-green-900/20 border border-green-700 rounded-lg">
                    <h3 className="text-2xl text-green-400">✅ 전체 리포트 접근 완료</h3>
                    <p className="text-gray-300 mt-2">모든 시스템적 위험 요소를 분석했습니다. 안전하게 운영하십시오.</p>
                </div>
            )}
        </div>
    );
};

export default ThreatReportDisplay;