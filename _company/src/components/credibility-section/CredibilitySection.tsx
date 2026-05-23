import React, { useState, useEffect } from 'react';
import { fetchCredibilityReport } from '@/services/api/credibilityService';
import { RiskData } from '@/types/data'; // Assume this type exists

// A/B 테스트 변형 정의 (Variant A: 그래프 중심, Variant B: 케이스 스터디 중심)
type CredibilityVariant = 'A' | 'B';

interface CredibilitySectionProps {
    variant: CredibilityVariant;
}

/**
 * 메인 신뢰도 섹션 컴포넌트. 결제 망설임 방지 및 권위 증명 역할 수행.
 * @param variant - 테스트할 변형 (A 또는 B)
 */
const CredibilitySection: React.FC<CredibilitySectionProps> = ({ variant }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [riskData, setRiskData] = useState<RiskData | null>(null);

    // 컴포넌트 마운트 시 리스크 데이터 분석 시작 (핵심 비동기 흐름)
    useEffect(() => {
        setIsLoading(true);
        fetchCredibilityReport({ source: 'Checkout Flow' }) // API Stub 호출
            .then((data) => {
                setRiskData(data);
            })
            .catch(error => {
                console.error("Failed to fetch credibility report:", error);
                // 에러 발생 시에도 시스템이 멈추지 않도록 대체 콘텐츠 제공 필요
                setRiskData(null); 
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return <div className="py-20 text-center text-xl font-mono">🚨 시스템 분석 중... 구조적 취약점을 감지하는 데 시간이 필요합니다.</div>;
    }

    if (!riskData) {
        // API 실패 또는 데이터 없음 처리 (Fail-safe mechanism)
        return <div className="py-20 bg-red-900/10 border border-red-600 text-red-400">⚠️ 리스크 분석에 실패했습니다. 고객 지원팀에 문의해 주십시오.</div>;
    }

    // A/B 테스트 로직 분기 처리
    return (
        <div className="bg-[#1A1A1A] py-24 text-white animate-fadeIn" data-testid={`credibility-section-${variant}`}>
            <header className="text-center mb-16">
                <h2 className="text-5xl font-extrabold tracking-tighter uppercase">
                    {/* Core Message: Fear to Authority */}
                    시스템적 생존 위협을 직시하십시오. 
                </h2>
                <p className="mt-4 text-lg text-red-300/70">당신의 프로세스는 이 위험을 막지 못합니다.</p>
            </header>

            {variant === 'A' ? (
                // Variant A: 그래프 기반의 충격적인 데이터 시각화 강조 (Designer Spec 1순위)
                <section className="max-w-6xl mx-auto">
                    <h3 className="text-4xl font-bold mb-12 text-red-500/90 border-b border-red-800 pb-4">📉 위협 지수 시뮬레이션 (Threat Index Simulation)</h3>
                    {/* Graph Component Placeholder - Red Zone / Glitch Effect 필수 */}
                    <div className="h-[400px] bg-gradient-to-b from-[#1A1A1A] to-[#222222] p-8 border border-red-700/50">
                        {/* 여기에 실제 그래프 라이브러리 (e.g., Recharts)를 사용하여, 
                           riskData.overallScore에 기반한 급격하고 비정상적인 파동 애니메이션 구현 */}
                        <p className="text-xl text-gray-400 mt-20 animate-pulse">
                            [Visualization Area] - {riskData.overallScore * 100}% 위험 지수 (Glitch/Red Zone 필수 적용)
                        </p>
                    </div>

                    {/* 리스크 상세 목록 */}
                    <div className="mt-16 grid md:grid-cols-3 gap-8">
                        {riskData.riskDetails.map((detail, index) => (
                            <div key={index} className={`p-6 rounded-lg ${detail.level === 'CRITICAL' ? 'bg-red-900/20 border-l-4 border-red-500 shadow-lg animate-pulse-slow' : 'bg-[#2c2c2c] border-l-4 border-gray-700'} transition transform hover:scale-[1.02]`}>
                                <p className="text-sm uppercase text-red-400">{detail.level} 리스크</p>
                                <h4 className="text-2xl font-bold mt-1 mb-2">{detail.name}</h4>
                                <p className="text-gray-300">{detail.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            ) : (
                // Variant B: Case Study 기반의 구조적 결함 강조 (Writer/ 현빈 Blueprint 활용)
                <section className="max-w-4xl mx-auto">
                    <h3 className="text-4xl font-bold mb-12 text-red-500/90 border-b border-red-800 pb-4">📚 실제 사례 분석: 시스템적 구조 사각지대</h3>
                    
                    {/* Case Study Card 1 */}
                    <div className="mb-10 p-8 bg-[#2c2c2c] rounded-xl shadow-2xl border border-gray-700 hover:border-red-500 transition">
                        <p className="text-xs uppercase text-yellow-400 mb-2">[사례 No. 1]</p>
                        <h4 className="text-3xl font-extrabold mb-3">데이터 무결성 실패로 인한 법적 리스크</h4>
                        <p className="text-gray-300 mb-4">{`[Client X]: 수작업 검토 과정에서 발생한 단일 데이터 누락이, 최종적으로 규제 위반으로 이어지는 시나리오.`}</p>
                        <button className="bg-red-600 px-6 py-2 rounded font-semibold hover:bg-red-700 transition">사례 전체 보고서 열람 (로그인 필요)</button>
                    </div>

                     {/* Case Study Card 2 */}
                    <div className="p-8 bg-[#2c2c2c] rounded-xl shadow-2xl border border-gray-700 hover:border-red-500 transition">
                        <p className="text-xs uppercase text-yellow-400 mb-2">[사례 No. 2]</p>
                        <h4 className="text-3xl font-extrabold mb-3">비정형 데이터 저장으로 인한 잠재적 유출 위협</h4>
                        <p className="text-gray-300 mb-4">{`[Client Y]: 시스템 경계를 벗어난 비표준 데이터가 '미검증 영역'에 남아, 해킹 공격의 쉬운 목표물이 됨.`}</p>
                         <button className="bg-red-600 px-6 py-2 rounded font-semibold hover:bg-red-700 transition">사례 전체 보고서 열람 (로그인 필요)</button>
                    </div>
                </section>
            )}
        </div>
    );
};

export default CredibilitySection;