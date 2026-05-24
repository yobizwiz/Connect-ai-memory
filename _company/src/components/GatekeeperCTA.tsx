import React, { useState } from 'react';
import { initiateRiskCheck, processPaymentGatekeeper } from '../services/gatekeeperService';

type GatekeeperStatus = Awaited<ReturnType<typeof initiateRiskCheck>>['status'];

/**
 * Red Zone 기반 게이트키퍼 CTA 컴포넌트. 3단계 생존 위협 경험을 구현합니다.
 */
const GatekeeperCTA: React.FC = () => {
    // 상태 관리 (State Management)
    const [initialData, setInitialData] = useState<{ industry: string; complianceStatus: boolean }>({
        industry: '',
        complianceStatus: true
    });
    const [isLoading, setIsLoading] = useState(false);
    const [riskResult, setRiskResult] = useState<any>(null); // GatekeeperResponse 또는 최종 결과
    const [error, setError] = useState<string | null>(null);

    // 1. 초기 리스크 진단 요청 핸들러 (Gatekeeper Stage 1)
    const handleInitialCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!initialData.industry) return;

        setIsLoading(true);
        setRiskResult(null);
        setError(null);

        try {
            // 백엔드 시뮬레이션 호출
            const result = await initiateRiskCheck(initialData); 
            setRiskResult(result);
        } catch (err) {
            setError("시스템과 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    // 2. 결제 게이트키퍼 로직 실행 핸들러 (Gatekeeper Stage 3 - Paid)
    const handlePaymentCTA = async () => {
         if (!riskResult || riskResult.actionRequired !== 'PAYMENT_REQUIRED') return;

        setIsLoading(true);
        setError(null);

        try {
            // 백엔드 시뮬레이션 호출 (결제 게이트)
            const result = await processPaymentGatekeeper({ lossEstimateY: riskResult.dataPayload?.lossEstimateY || 0 });
            setRiskResult({ ...riskResult, gatekeeperSuccess: result });
        } catch(e) {
            setError("⚠️ 결제 시스템 오류 발생. 관리자에게 문의하십시오.");
        } finally {
             setIsLoading(false);
        }
    };

    // --- UI 렌더링 로직 (State Machine based) ---

    const getRiskColorClass = (status: GatekeeperStatus) => {
        switch (status) {
            case 'CRITICAL': return "bg-red-900 border-red-600 text-red-300 shadow-[0_0_20px_rgba(255,0,0,0.7)]";
            case 'WARNING': return "bg-yellow-900 border-yellow-600 text-yellow-300 shadow-[0_0_15px_rgba(255,160,0,0.7)]";
            default: return "bg-green-900 border-green-600 text-green-300 shadow-[0_0_10px_rgba(0,255,0,0.7)]";
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center py-16 text-xl animate-pulse">⚙️ 시스템 분석 중... 데이터 흐름을 추적하고 있습니다.</div>;
        }
        if (error) {
             return <div className="p-4 bg-red-800/50 border border-red-700 rounded">{error}</div>;
        }

        // 결제 게이트가 성공한 후 최종 화면 (Conversion Complete)
        if (riskResult?.gatekeeperSuccess) {
             return (
                 <div className="p-8 bg-green-900/50 border-l-4 border-green-600 rounded-lg shadow-xl">
                    <h2 className="text-3xl font-bold mb-4 text-green-300">✅ 시스템 무결성 확보 완료</h2>
                    <p className="text-xl">{riskResult.gatekeeperSuccess.message}</p>
                    <button className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded text-white">
                        서비스 활용 시작하기
                    </button>
                </div>
            );
        }

        // 1차 진단 결과가 있을 경우 (Gatekeeper Stage 2)
        if (riskResult && riskResult.status !== 'SAFE') {
            const colorClass = getRiskColorClass(riskResult.status);
            return (
                <div className={`p-8 border-l-4 ${colorClass} rounded-lg shadow-xl`}>
                    <h2 className="text-3xl font-bold mb-4">🚨 [시스템 경고] {riskResult.status === 'CRITICAL' ? 'CRITICAL' : riskResult.status} 위험 감지</h2>
                    <p className={`text-lg ${riskResult.status === 'CRITICAL' ? 'font-mono text-red-100' : ''}`}>{riskResult.message}</p>
                    <div className="mt-6 p-4 bg-gray-800/50 border border-yellow-700 rounded">
                        <p className="text-sm text-yellow-300 mb-2">🔥 잠재적 손실 추정액 ($Y$):</p>
                        <span className="text-4xl font-extrabold text-red-500">{riskResult.dataPayload?.lossEstimateY ? `$${(riskResult.dataPayload.lossEstimateY / 1000).toFixed(0)}K` : 'N/A'}</span>
                    </div>

                    {/* 액션 버튼 분기 처리 */}
                    <div className="mt-8 flex space-x-4">
                        {riskResult.actionRequired === 'PAYMENT_REQUIRED' && (
                            <button 
                                onClick={handlePaymentCTA} 
                                disabled={isLoading}
                                className="px-10 py-3 bg-red-700 hover:bg-red-800 transition duration-200 text-white font-bold uppercase border-b-4 border-double border-red-900"
                            >
                                {isLoading ? '처리 중...' : '필수 안전장치 구매 (Gatekeeper 3단계)'}
                            </button>
                        )}
                        {riskResult.actionRequired === 'FREE_REPORT' && (
                             <button 
                                onClick={() => alert("✅ 무료 리스크 보고서 요청이 접수되었습니다. 이메일로 전송됩니다.")} 
                                disabled={isLoading}
                                className="px-8 py-3 bg-yellow-600 hover:bg-yellow-700 transition duration-200 text-white font-bold uppercase"
                            >
                                무료 진단 보고서 요청 (Gatekeeper 2단계)
                            </button>
                        )}
                    </div>
                </div>
            );
        }

        // 초기 상태 (Initial State) - 사용자가 데이터를 입력해야 함
        return (
             <div className="p-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                 <h2 className="text-2xl font-semibold mb-4 text-gray-700">🚀 1단계: 리스크 진단 요청</h2>
                 <p className="mb-6 text-gray-600">진단을 위해 회사의 핵심 정보를 입력해 주세요. 이 과정은 고객님에게 '시스템적 생존 위협'을 체감하게 하는 경험입니다.</p>

                <form onSubmit={handleInitialCheck} className="space-y-4">
                    <div>
                        <label htmlFor="industry" className="block text-sm font-medium text-gray-700">산업군 (Industry)</label>
                        <select id="industry" required value={initialData.industry} onChange={(e) => setInitialData(d => ({ ...d, industry: e.target.value }))} 
                                className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500">
                            <option value="">선택...</option>
                            <option value="finance">금융/핀테크 (높은 규제)</option>
                            <option value="healthcare">헬스케어/바이오 (민감 정보)</option>
                            <option value="tech_saas">SaaS/IT 서비스</option>
                        </select>
                    </div>

                     <div>
                        <label htmlFor="compliance" className="block text-sm font-medium text-gray-700 mb-2">법규 준수 상태 (Compliance Status)</label>
                         <div className="flex space-x-4">
                            <label className="inline-flex items-center cursor-pointer">
                                <input type="radio" name="compliance" checked={initialData.complianceStatus === true} onChange={() => setInitialData(d => ({ ...d, complianceStatus: true }))} 
                                       className="form-radio h-5 w-5 text-green-600 border-gray-300 focus:ring-red-500" />
                                <span className="ml-2 text-green-700">완벽 준수 (Ideal State)</span>
                            </label>
                             <label className="inline-flex items-center cursor-pointer">
                                <input type="radio" name="compliance" checked={initialData.complianceStatus === false} onChange={() => setInitialData(d => ({ ...d, complianceStatus: false }))} 
                                       className="form-radio h-5 w-5 text-red-600 border-gray-300 focus:ring-red-500" />
                                <span className="ml-2 text-red-700">위험 감지 (Potential Risk)</span>
                            </label>
                        </div>
                    </div>

                     <button 
                        type="submit" 
                        disabled={!initialData.industry}
                        onClick={handleInitialCheck}
                        className={`w-full py-3 px-6 rounded-md text-lg font-bold uppercase transition duration-200 ${initialData.industry ? 'bg-red-700 hover:bg-red-800' : 'bg-gray-400 cursor-not-allowed'} text-white`}
                    >
                        {isLoading ? '진단 요청 중...' : `🚨 시스템 생존 위협 진단 시작 (${initialData.industry})`}
                    </button>
                </form>
             </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto mt-12 p-6 bg-white shadow-2xl rounded-lg">
            <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-900 border-b pb-3">
                yobizwiz: 통합 시스템 생존 위협 진단기 🛡️
            </h1>
            {/* 실제 로직 실행 */}
            {renderContent()}

             {/* 하단의 추가 CTA를 통해 결제 유도 강제 (Gatekeeper Stage 3 - Paid) */}
             <div className="mt-16 text-center p-8 border-t pt-8">
                <h3 className="text-2xl font-semibold mb-4 text-red-700">🚨 경고: 이 진단 결과는 잠재적 손실을 보여줄 뿐입니다.</h3>
                 {/* 결제 유도 버튼은 1차 진단 후 상태에 따라 활성화되어야 하지만, 예시로 항상 노출 */}
                <button 
                    onClick={handlePaymentCTA} 
                    disabled={!riskResult || riskResult.actionRequired !== 'PAYMENT_REQUIRED' || isLoading}
                    className={`px-12 py-4 text-xl font-extrabold uppercase transition duration-300 ${(!riskResult || riskResult.actionRequired !== 'PAYMENT_REQUIRED') ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-800 hover:bg-red-900'} text-white`}
                >
                    {isLoading ? '결제 게이트 통과 중...' : (riskResult && riskResult.actionRequired === 'PAYMENT_REQUIRED' ? `지금 안전장치 구독하고 $${(riskResult?.dataPayload?.lossEstimateY || 10000) / 1000}K의 손실을 막으세요!` : '진단 결과가 필요합니다.')}
                </button>
             </div>
        </div>
    );
};

export default GatekeeperCTA;