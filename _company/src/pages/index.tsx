// src/pages/index.tsx (메인 랜딩 페이지 컴포넌트)
import React, { useState } from 'react';
import LossMeter from '../components/LossMeter'; // 🚨 새로 만든 LossMeter 불러옴

/**
 * 타입 정의: 사용자 입력 필드와 리스크 계산에 사용될 데이터 구조
 */
interface DiagnosisInput {
    industry: string; // 산업군 (예: 금융, 공공)
    complianceLevel: 'High' | 'Medium' | 'Low'; // 현재 규정 준수 수준
    systemIntegrationStatus: number; // 시스템 통합 점수 (0-10)
}

/**
 * 🚨 리스크 스코어 계산 로직 (핵심 비즈니스 로직)
 * 이 함수는 사용자의 입력값을 받아서, yobizwiz의 '구조적 생존 위협' 논리를 적용하여 최종 위험 점수를 산출합니다.
 * @param inputs - 사용자 진단 데이터 객체
 * @returns 0.0 ~ 100.0 사이의 리스크 점수 (높을수록 위험)
 */
const calculateRiskScore = (inputs: DiagnosisInput): number => {
    let score = 0;

    // 1. 산업군 기반 가중치 (Financial/Public sector는 기본적으로 리스크 높음)
    if (inputs.industry === '금융' || inputs.industry === '공공') {
        score += 25; // 기본 위험 점수 부여
    } else {
        score += 10;
    }

    // 2. 규정 준수 레벨에 따른 가중치 (가장 중요)
    if (inputs.complianceLevel === 'Low') {
        score += 45; // 가장 높은 위험 요소
    } else if (inputs.complianceLevel === 'Medium') {
        score += 20;
    } else {
        // High Compliance는 오히려 낮은 점수로 시작할 수 있음 (하지만 시스템은 항상 의심함)
        score += 10;
    }

    // 3. 시스템 통합 상태에 따른 변동성 (최소/최대값으로 조정하여 현실감 부여)
    const integrationModifier = inputs.systemIntegrationStatus * 5; // 최대 50점 기여
    score += integrationModifier;

    // 점수 범위 제한 및 최종 반올림
    return Math.min(100, Math.max(0, score)).toFixed(1) * 1;
};


/**
 * Main Landing Page Funnel Component (src/pages/index.tsx)
 */
const IndexPage: React.FC = () => {
    // --- 상태 관리 ---
    const [formData, setFormData] = useState<DiagnosisInput>({
        industry: '금융',
        complianceLevel: 'Low', // 초기 기본값은 가장 위험한 상태로 설정하여 공포 유발
        systemIntegrationStatus: 5,
    });
    const [riskScore, setRiskScore] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);

    // --- 핸들러 함수 ---
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'systemIntegrationStatus' ? parseFloat(value) : (value as any) }));

        // 폼 변경 시마다 리스크 스코어 실시간 업데이트
        const newScore = calculateRiskScore({
            industry: formData.industry,
            complianceLevel: name === 'complianceLevel' ? value as 'High' | 'Medium' | 'Low' : formData.complianceLevel,
            systemIntegrationStatus: name === 'systemIntegrationStatus' ? parseFloat(value) : formData.systemIntegrationStatus,
        });
        setRiskScore(newScore);
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!formData.industry || !formData.complianceLevel) return;

        setIsSubmitting(true);
        // ⚡️ 시뮬레이션 API 호출 시작: 데이터 처리 시간과 전문성 부여 (3초 지연)
        await new Promise(resolve => setTimeout(resolve, 2500)); 

        // 최종 리스크 스코어 재계산 (혹시 모를 마지막 변동 반영)
        const finalScore = calculateRiskScore(formData);
        setRiskScore(finalScore);
        setIsSubmitting(false);

        // 성공 처리: 다음 단계 가이드 화면으로 전환
        setSubmissionSuccess(true);
    };


    // --- 💡 컴포넌트 렌더링 로직 (Priority 3) ---
    const renderContent = () => {
        if (submissionSuccess && riskScore > 50) {
            return (
                <div className="text-center p-12 bg-[#1A1A1A] border border-red-700 rounded-xl shadow-inner max-w-xl mx-auto">
                    <h2 className="text-3xl font-mono text-[#C0392B] mb-4 animate-pulse">[SYSTEM FAILURE WARNING]</h2>
                    <p className="text-xl text-gray-200 mb-6">
                        🚨 귀사의 현재 구조적 결함 리스크 점수({riskScore}%){' '}는 **심각한 생존 위협** 수준입니다.
                    </p>
                    <div className="bg-[#C0392B]/10 p-4 rounded border-l-4 border-[#C0392B] mb-8">
                        <h3 className="text-2xl font-mono text-[#C0392B]">필수 조치 단계 (Next Steps):</h3>
                        <ul className="list-disc list-inside mt-2 text-gray-300 space-y-1">
                            <li>**1단계: 전문 진단:** yobizwiz 전문가와 1차 화상 상담을 예약하십시오.</li>
                            <li>**2단계: 데이터 제출:** 지난 6개월간의 규제 보고서(Audit Logs)를 준비합니다.</li>
                            <li>**3단계: 구조적 안전장치 확보:** 맞춤형 컨설팅 플랜으로 시스템 무결성을 복구해야 합니다.</li>
                        </ul>
                    </div>
                    <button className="px-12 py-4 bg-[#2980B9] hover:bg-blue-700 text-white font-bold rounded-lg transition duration-300 cursor-pointer">
                        지금, 구조적 안전장치 확보 요청하기 (전환 CTA)
                    </button>
                </div>
            );
        } else if (submissionSuccess && riskScore <= 50) {
             return (
                <div className="text-center p-12 bg-[#2ECC71]/10 border border-[#2ECC71] rounded-xl shadow-inner max-w-xl mx-auto">
                    <h2 className="text-3xl font-mono text-[#2ECC71] mb-4">[STATUS OK] 구조적 안정성 확보 예상</h2>
                    <p className="text-lg text-gray-300 mb-6">
                        현재 진단된 리스크는 관리가 가능한 수준입니다. 하지만, 최고의 안전은 **선제적인 검증**에서 시작됩니다.
                    </p>
                     <button className="px-12 py-4 bg-[#2980B9] hover:bg-blue-700 text-white font-bold rounded-lg transition duration-300 cursor-pointer">
                        최적화 컨설팅 예약하기 (전환 CTA)
                    </button>
                </div>
            );
        }

        // 초기 로딩 상태일 때
        return null; 
    };


    return (
        <div className="min-h-screen bg-[#1A1A1A] text-white p-8 font-[Inter], monospace">
            {/* --- HEADER/HERO SECTION (공포 자극 시작) --- */}
            <header className="text-center py-16 border-b border-red-700 mb-12">
                <h1 className="text-5xl md:text-6xl font-extrabold text-[#C0392B] mb-4 animate-pulse">
                    경고: 귀사의 시스템적 무결성이 위협받고 있습니다.
                </h1>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                    단순한 규정 준수 검토를 넘어, 당신의 비즈니스가 직면할 수 있는 **구조적 생존 리스크**를 진단합니다.
                </p>
            </header>

            {/* 🚀 핵심 Funnel 영역 */}
            <div className="max-w-4xl mx-auto">
                
                {/* 1. Loss Meter (Priority 1) - 가장 먼저 눈에 띄게 배치 */}
                <LossMeter score={riskScore} />
                
                {/* 2. 진단 입력 폼 (Priority 2) */}
                <div className="mt-16 p-8 bg-[#1A1A1A] border border-gray-700 rounded-xl shadow-inner">
                    <h2 className="text-3xl font-mono text-[#2980B9] mb-6 border-b pb-2 border-gray-700">
                        [진단 요청] 구조적 결함 리스크 진단을 위한 정보 입력
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Industry Select */}
                        <div>
                            <label htmlFor="industry" className="block text-sm font-mono text-gray-300 mb-2">1. 주요 산업군 (비즈니스 영역)</label>
                            <select
                                id="industry"
                                name="industry"
                                onChange={handleChange}
                                value={formData.industry}
                                className="w-full p-3 bg-[#222] border border-gray-600 rounded text-white focus:ring-[#C0392B] focus:border-[#C0392B]"
                            >
                                <option value="금융">🏦 금융 (높은 규제 위험)</option>
                                <option value="공공">🏛️ 공공/정부 시스템 (복잡성 위험)</option>
                                <option value="IT">💻 일반 IT/서비스</option>
                            </select>
                        </div>

                        {/* Compliance Level Select */}
                        <div>
                            <label htmlFor="complianceLevel" className="block text-sm font-mono text-gray-300 mb-2">2. 현재 규정 준수 레벨 (가장 중요)</label>
                            <select
                                id="complianceLevel"
                                name="complianceLevel"
                                onChange={handleChange}
                                value={formData.complianceLevel}
                                className="w-full p-3 bg-[#222] border border-gray-600 rounded text-white focus:ring-[#C0392B] focus:border-[#C0392B]"
                            >
                                <option value="High">🟢 High (사전 검토 완료)</option>
                                <option value="Medium">🟡 Medium (일부 지연/개선 필요)</option>
                                <option value="Low">🔴 Low (미흡 또는 미적용 영역 존재)</option> {/* 기본값으로 설정 */}
                            </select>
                        </div>

                        {/* System Integration Slider (가장 전문적인 입력) */}
                        <div>
                            <label htmlFor="systemIntegrationStatus" className="block text-sm font-mono text-gray-300 mb-2">3. 시스템 통합 완성도 지수 (1~10, 10에 가까울수록 완벽)</label>
                            <input
                                type="range"
                                id="systemIntegrationStatus"
                                name="systemIntegrationStatus"
                                min="1"
                                max="10"
                                step="0.5"
                                onChange={handleChange}
                                value={formData.systemIntegrationStatus}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-slider-custom"
                            />
                            <div className="flex justify-between text-sm font-mono mt-1 text-gray-400">
                                <span>1 (최소)</span>
                                <span className="text-[#2980B9] font-bold">{formData.systemIntegrationStatus.toFixed(1)} / 10</span>
                                <span>10 (완벽)</span>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`w-full py-3 text-xl font-bold rounded-lg transition duration-300 ${
                                isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#2980B9] hover:bg-blue-700'
                            } text-white`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-80" d="M7 10a3 3 0 013-3h4a3 3 0 013 3v6a3 3 0 01-3 3H7z"></path></svg>
                                    분석 중... (시스템 무결성 검증)
                                </span>
                            ) : '무료 리스크 진단 요청 및 시스템 분석 시작';}
                        </button>
                    </form>
                </div>

                {/* 3. 결과 화면 (Priority 3 - 조건부 렌더링) */}
                <div className="mt-20">
                    {renderContent()}
                </div>

            </div>
        </div>
    );
};

export default IndexPage;