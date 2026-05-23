import React, { useState } from 'react';
import { getStructuralRiskLevel, getReportDetails, RiskLevel } from '../api/riskEngine';
import { AB_CONFIG } from '../config/abTestingConfig';

// --- 타입 정의 및 초기 상태 설정 ---
interface InputData {
    revenueAnnual: number;
    employeeCount: number;
    industryCode: string;
}

type RiskReport = {
    level: RiskLevel;
    title: string;
    description: string;
    financialLossEstimate: number; // 백만원 USD 단위
};

const INITIAL_STATE: InputData = {
    revenueAnnual: 10,
    employeeCount: 50,
    industryCode: 'TECH'
};

// --- 메인 컴포넌트 ---
export default function IndexPage() {
    const [inputData, setInputData] = useState<InputData>(INITIAL_STATE);
    const [report, setReport] = useState<RiskReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ---------------------------------------------------
    // [핵심 로직] 위험 데이터 처리 및 API 시뮬레이션 함수
    // ---------------------------------------------------
    const handleAnalyzeRisk = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setReport(null);

        try {
            // 1. 입력 데이터 검증 및 정리
            const dataToSubmit: InputData = {
                revenueAnnual: parseFloat(inputData.revenueAnnual.toString().replace(/,/g, '')),
                employeeCount: parseInt(inputData.employeeCount.toString()),
                industryCode: inputData.industryCode || 'UNKNOWN'
            };

            // 2. 비동기 API 호출 시뮬레이션 (가장 중요)
            const level = await getStructuralRiskLevel(dataToSubmit);
            
            // 3. 보고서 상세 정보 가져오기
            const reportDetails = getReportDetails(level);
            
            setReport({
                level: level,
                title: reportDetails.title,
                description: reportDetails.description,
                financialLossEstimate: reportDetails.financialLossEstimate,
            });

        } catch (err) {
            console.error("Risk analysis failed:", err);
            setError("데이터 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            // 4. 로딩 상태 해제 및 최종 UI 업데이트 유도
            setIsLoading(false);
        }
    };

    // ---------------------------------------------------
    // [UI 컴포넌트] Red Zone 스타일링 함수 (재사용성 확보)
    // ---------------------------------------------------
    const getRedZoneStyles = (level: RiskLevel): React.CSSProperties => {
        switch(level) {
            case 'CRITICAL': return { backgroundColor: '#C0392B', color: '#FFDDDD' }; // Red Zone
            case 'HIGH': return { backgroundColor: '#F1C40F', color: '#333' };       // Warning Yellow
            case 'MEDIUM': return { backgroundColor: '#E67E22', color: '#FFF' };     // Caution Orange
            default: return { backgroundColor: '#2ecc71', color: '#FFF' };       // Green/Safe
        }
    };

    // ---------------------------------------------------
    // [렌더링 로직] 페이지의 핵심 구조를 정의합니다.
    // ---------------------------------------------------
    return (
        <div className="min-h-screen bg-[#1A1A1A] text-[#EAEAEA] p-4 sm:p-8">
            <header className="text-center mb-12 pt-4">
                <h1 className={`text-5xl font-extrabold ${isLoading ? 'text-gray-400' : 'text-white'}`}>
                    yobizwiz | <span className='text-[#2980B9]'>구조적 생존 위협</span> 진단 시스템
                </h1>
                <p className="mt-3 text-xl text-gray-400">
                    단순한 재무 분석을 넘어, 당신의 비즈니스가 직면할 '시스템적 무지'를 파헤칩니다.
                </p>
            </header>

            {/* Section 1: 입력 폼 및 위험 경고 배너 (A/B 테스트 변수 사용) */}
            <section className="bg-[#222] p-6 rounded-xl shadow-2xl mb-10 border-t-4 border-[#C0392B]">
                <div className={`p-4 text-center font-bold rounded-lg ${AB_CONFIG.activeGroup === 'A' ? 'bg-[var(--red)] text-white animate-pulse' : 'bg-yellow-800/50 border border-yellow-600'}`}>
                    {/* A/B 테스트 변수 사용 */}
                    <p>{AB_CONFIG.initialWarningBanner[AB_CONFIG.activeGroup]}</p>
                </div>

                <h2 className="text-3xl font-semibold mt-8 mb-6 text-[#EAEAEA]">위험 데이터 입력</h2>
                <form onSubmit={handleAnalyzeRisk} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    {/* Input Field 1 */}
                    <div>
                        <label htmlFor="revenue" className="block text-sm font-medium text-gray-400 mb-2">연간 매출 (백만 USD)</label>
                        <input type="number" id="revenue" value={inputData.revenueAnnual} onChange={(e) => setInputData({...inputData, revenueAnnual: e.target.value})} required className="w-full p-3 bg-[#333] border border-[#444] rounded focus:ring-[#2980B9] focus:border-[#2980B9]" />
                    </div>
                    {/* Input Field 2 */}
                    <div>
                        <label htmlFor="employees" className="block text-sm font-medium text-gray-400 mb-2">직원 수</label>
                        <input type="number" id="employees" value={inputData.employeeCount} onChange={(e) => setInputData({...inputData, employeeCount: e.target.value})} required className="w-full p-3 bg-[#333] border border-[#444] rounded focus:ring-[#2980B9] focus:border-[#2980B9]" />
                    </div>
                     {/* Input Field 3 */}
                    <div>
                        <label htmlFor="industry" className="block text-sm font-medium text-gray-400 mb-2">산업 코드</label>
                        <select id="industry" value={inputData.industryCode} onChange={(e) => setInputData({...inputData, industryCode: e.target.value})} required className="w-full p-3 bg-[#333] border border-[#444] rounded focus:ring-[#2980B9] focus:border-[#2980B9]">
                            <option value="" disabled>선택</option>
                            <option value="TECH">기술 (Tech)</option>
                            <option value="FIN">금융 (Finance)</option>
                            <option value="MFG">제조 (Manufacturing)</option>
                        </select>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        className={`w-full p-3 rounded text-lg font-bold transition duration-300 ${isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#C0392B] hover:bg-[#A53122]'}`}
                    >
                        {isLoading ? '⚙️ 구조 분석 중... (지연 시간 시뮬레이션)' : '📊 리스크 진단 시작'}
                    </button>
                </form>
            </section>

            {/* Section 2: 결과 보고서 출력 영역 */}
            <section className={`p-8 rounded-xl shadow-2xl ${report ? (r) => `border-t-4 border-[${getRedZoneStyles(r.level).backgroundColor}] bg-[#1F1F1F]` : 'bg-gray-800/50'} transition duration-500`}>
                {error && <div className="text-center text-red-400 p-4 bg-red-900/30 rounded">{error}</div>}

                {!isLoading && !report && (
                    <div className="text-center py-16">
                        <h2 className="text-2xl text-gray-500">분석을 진행하여 보고서를 받아보세요.</h2>
                        <p className="mt-2 text-gray-400">위의 데이터를 입력하고 '리스크 진단 시작' 버튼을 눌러, 고객에게 공포와 긴급성을 주입하는 경험을 완성하세요.</p>
                    </div>
                )}

                {report && (
                    <div className="animate-fadeIn"> {/* 가상 애니메이션 */}
                        <h2 className="text-4xl font-extrabold mb-3 text-[#EAEAEA]">{report.title}</h2>
                        <p className="text-lg mb-6 text-gray-400 border-b pb-4 border-dashed">진단 결과: {report.level} 레벨</p>

                        {/* 리스크 경고 배너 (Red Zone 적용) */}
                        <div className={`p-6 rounded-xl shadow-inner ${isLoading ? 'opacity-50' : ''}`} style={getRedZoneStyles(report.level)}>
                            <h3 className="text-2xl font-bold mb-4">🚨 구조적 결함 보고 (Structural Defect Report)</h3>
                            <p className={`text-xl mb-4 ${isLoading ? 'opacity-70' : ''}`}>{report.description}</p>
                            
                            {/* 재무 손실 추정치 - 핵심 마케팅 포인트 */}
                            <div className="mt-6 p-4 bg-black/30 rounded-lg border-l-4" style={{borderColor: getRedZoneStyles(report.level).backgroundColor}}>
                                <p className="text-sm uppercase text-gray-400">예상 재무 손실 규모 (Minimum Financial Loss Estimate)</p>
                                <h4 className={`text-5xl font-black mt-1`}>${report.financialLossEstimate.toLocaleString()}</h4>
                            </div>
                        </div>

                        {/* 최종 CTA 버튼 (A/B 테스트 변수 사용) */}
                        <button 
                            className="mt-10 w-full p-4 text-2xl font-bold rounded-lg transition duration-300 hover:opacity-90"
                            style={{ backgroundColor: getRedZoneStyles(report.level).backgroundColor }}
                        >
                           {AB_CONFIG.ctaButtonCopy[AB_CONFIG.activeGroup]} 🚀
                        </button>
                    </div>
                )}
            </section>

        </div>
    );
}