/**
 * @fileoverview 메인 Paywall 프로토타입 엔진 컴포넌트입니다. 
 * 사용자의 입력을 받고, 비동기 시뮬레이션 및 동적 계산 로직을 처리합니다.
 * (SPA 형태의 핵심 인터랙티브 경험 제공)
 */

import React, { useState, useCallback } from 'react';
import { RiskInput, RiskReport, calculateTotalRiskExposure, calculateMinimumInsurancePremium } from '../utils/riskCalculator';

// 🚨 컴포넌트 Props 정의 및 상태 관리 타입 명확화 (TypeScript Strict)
interface PaywallProps {}

const initialState: Partial<RiskInput> = {
    userIndustry: 'FinTech',
    employeeCount: 50,
    complianceScore: 65, // 초기값 설정
};

// Red Zone 색상 결정 로직 함수
const getRedZoneStyles = (riskLevel: RiskReport['riskLevel']): React.CSSProperties => {
    switch (riskLevel) {
        case 'CRITICAL':
            return { backgroundColor: '#990000', boxShadow: '0 0 30px rgba(255, 0, 0, 0.8)' }; // 강력한 경고
        case 'HIGH':
            return { backgroundColor: '#cc6600', boxShadow: '0 0 15px rgba(255, 165, 0, 0.6)' };
        case 'MEDIUM':
            return { backgroundColor: '#ffaa00', boxShadow: '0 0 10px rgba(255, 165, 0, 0.4)' };
        default:
            return { backgroundColor: '#00cc00', boxShadow: 'none' }; // 안전함
    }
};

/**
 * [핵심 로직] 리스크 분석을 시뮬레이션하는 비동기 함수입니다. (API 호출 대체)
 * 실제 API 호출이라면 axios.get('/api/risk-assessment') 등을 사용해야 합니다.
 */
const simulateRiskAssessment = async (input: RiskInput): Promise<RiskReport> => {
    // 3초 지연을 주어 로딩 상태와 시간적 압박(Time Pressure)을 체감하게 만듭니다.
    await new Promise(resolve => setTimeout(resolve, 2500));

    // 순수 계산 로직 호출 (이것이 핵심 데이터 흐름임)
    const report = calculateTotalRiskExposure(input);
    return report;
};


/**
 * 메인 Paywall 엔진 컴포넌트.
 */
export const PaywallEngine: React.FC<PaywallProps> = () => {
    // 🚨 상태 관리 (State Management) - 현재 입력값, 로딩 여부, 최종 결과 저장
    const [formData, setFormData] = useState<RiskInput>(initialState as RiskInput);
    const [report, setReport] = useState<RiskReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // 핸들러: 입력값 변경 시 상태 업데이트
    const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'employeeCount' ? parseInt(value) : (name === 'complianceScore' ? parseFloat(value) : value) 
        }));
    }, []);

    // 핸들러: 리스크 분석 실행
    const handleAnalyzeRisk = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData || !formData.userIndustry) return;

        setIsLoading(true);
        setReport(null); // 이전 결과 초기화

        try {
            // 1. 비동기 API 호출 시뮬레이션 및 데이터 수신
            const reportData = await simulateRiskAssessment(formData);
            
            // 2. 핵심 계산 로직 실행: 최소 보험료 역산 (비즈니스 가치 창출)
            const minimumPremiumUSD = calculateMinimumInsurancePremium(reportData.totalRiskExposureUSD);

            // 최종 상태 업데이트
            setReport({ ...reportData, finalPremium: minimumPremiumUSD } as any); // 임시로 'finalPremium' 필드 추가 (실제 코드에서는 타입 확장 필요)

        } catch (error) {
            console.error("Risk analysis failed:", error);
            alert("분석 중 오류가 발생했습니다. 데이터를 확인해주세요.");
        } finally {
            setIsLoading(false);
        }
    }, [formData]);


    // UI 렌더링 로직 분리 (Clean Code)
    const renderReportCard = () => {
        if (!report) return null;

        const redZoneStyle = getRedZoneStyles(report.riskLevel);
        const minimumPremiumUSD = calculateMinimumInsurancePremium(report.totalRiskExposureUSD); // 재계산하여 정확성 확보

        return (
            <div style={{ 
                padding: '40px', 
                borderRadius: '12px', 
                color: '#ffffff', 
                transition: 'all 0.5s ease',
                ...redZoneStyle // Red Zone 적용
            }}>
                <h2 className="text-3xl font-bold mb-4 animate-pulse">🚨 시스템 경고: 구조적 위험 감지됨</h2>
                
                {/* 1. 총 위험 노출액 (Total Risk Exposure) */}
                <div className="mb-6 p-4 border-b border-opacity-50" style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}>
                    <p className="text-lg text-gray-100">총 위험 노출액 (Total Risk Exposure):</p>
                    <h3 className="text-6xl font-extrabold">$ {report.totalRiskExposureUSD.toLocaleString()}</h3>
                    <p className="text-sm mt-2 opacity-80">({report.identifiableGapCount}개의 미해결 리스크 구조적 결함 포함)</p>
                </div>

                {/* 2. 최소 보험료 (Minimum Insurance Premium) - 가장 중요한 CTA */}
                <div className="text-center p-6 bg-red-900/80 rounded-lg shadow-2xl">
                    <p className="text-2xl font-semibold text-yellow-300 mb-2 animate-bounce">
                        이 위험을 해결하기 위한 최소 보험료(Minimum Premium):
                    </p>
                    <h1 className="text-8xl font-black tracking-wider">$ {minimumPremiumUSD.toLocaleString()}</h1>
                    <p className="text-xl mt-4 text-gray-200">
                        Gold Tier 컨설팅을 통해 구조적 무결성을 확보하십시오.
                    </p>
                </div>

                {/* 3. CTA 버튼 */}
                <button 
                    className="mt-10 w-full py-4 bg-yellow-500 text-gray-900 font-bold uppercase rounded-lg text-xl hover:bg-yellow-400 transition duration-200"
                    onClick={() => alert('결제 게이트웨이로 이동합니다. (실제 결제 로직 구현 필요)')}
                >
                    지금 바로 시스템적 생존 위협을 막으십시오.
                </button>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-gray-900 rounded-xl shadow-2xl text-white">
            <h1 className="text-5xl font-extrabold mb-4 border-b pb-3 text-red-500">🛡️ Compliance Gatekeeper Pro</h1>
            <p className="mb-8 text-gray-400">귀사의 구조적 무결성을 진단하고, 숨겨진 위험 노출액을 실시간으로 측정합니다.</p>

            {/* ⚙️ 입력 폼 */}
            <form onSubmit={handleAnalyzeRisk} className="space-y-6 p-6 bg-gray-800 rounded-lg">
                <h2 className="text-2xl font-bold text-red-400">1. 회사 데이터 입력 (진단 시작)</h2>

                {/* Industry Select */}
                <div>
                    <label htmlFor="userIndustry" className="block text-sm font-medium mb-1">산업군 선택 (Domain)</label>
                    <select 
                        id="userIndustry" 
                        name="userIndustry" 
                        value={formData.userIndustry} 
                        onChange={handleChange}
                        required
                        className="w-full p-3 bg-gray-700 border border-red-600 rounded text-white focus:ring-red-500 focus:border-red-500"
                    >
                        <option value="" disabled>산업군을 선택해주세요</option>
                        <option value="FinTech">🏦 핀테크 (금융 규제)</option>
                        <option value="Healthcare">⚕️ 의료/헬스케어 (개인정보 보호)</option>
                        <option value="Manufacturing">🏭 제조/제조업 (공급망 리스크)</option>
                        <option value="Retail">🛍️ 이커머스 (물류 및 결제 시스템)</option>
                    </select>
                </div>

                {/* Employee Count Input */}
                <div>
                    <label htmlFor="employeeCount" className="block text-sm font-medium mb-1">직원 수 (Complexity Factor)</label>
                    <input 
                        type="number" 
                        id="employeeCount" 
                        name="employeeCount" 
                        value={formData.employeeCount} 
                        onChange={handleChange} 
                        min="1" max="500" required
                        className="w-full p-3 bg-gray-700 border border-red-600 rounded text-white focus:ring-red-500 focus:border-red-500"
                    />
                </div>

                {/* Compliance Score Input */}
                <div>
                    <label htmlFor="complianceScore" className="block text-sm font-medium mb-1">현재 컴플라이언스 준수 점수 (0~100)</label>
                    <input 
                        type="range" 
                        id="complianceScore" 
                        name="complianceScore" 
                        min="0" max="100" step="5" required
                        value={formData.complianceScore} 
                        onChange={handleChange} 
                        className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg"
                    />
                     <div className="text-right text-sm mt-1 text-red-400">점수: {formData.complianceScore}%</div>
                </div>

                {/* 분석 버튼 */}
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className={`w-full py-3 font-bold uppercase rounded-lg transition duration-200 ${
                        isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 transform hover:scale-[1.01]'
                    }`}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-80" d="M7 10a3 3 0 013 3v3a9 9 0 11-9-9z"></path></svg>
                            위험 데이터 분석 중... (시스템 로딩)
                        </div>
                    ) : '총 위험 노출액 및 최소 보험료 계산 시작'}
                </button>
            </form>

            {/* 결과 표시 영역 */}
            <div className="mt-12">
                {isLoading && <p className="text-center text-yellow-400 animate-pulse">진단 엔진이 작동 중입니다. 잠시만 기다려 주세요...</p>}
                {!isLoading && renderReportCard()}
            </div>
        </div>
    );
};