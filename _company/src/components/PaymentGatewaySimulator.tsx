/**
 * PaymentGatewaySimulator.tsx: QLoss 기반 인터랙티브 결제 플로우 MVP 컴포넌트
 * @description qlossService에서 정의된 비동기 로직을 소비하여, 
 *              시스템적 공포를 유발하는 고충실도 프로토타입입니다.
 */

import React, { useState } from 'react';
import { simulatePaymentFlow, getRedZoneStyles, QLossResult } from '../services/qlossService';

interface SimulatorProps {}

const PaymentGatewaySimulator: React.FC<SimulatorProps> = () => {
    // 초기 상태 설정 (낮은 리스크)
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<QLossResult | null>(null);
    const [inputData, setInputData] = useState({ 
        complianceCheckPass: false, // 초기에는 통과하지 못한 상태로 시작하여 불안감 유발
        riskToleranceLevel: 3 
    });

    // 핸들러 함수 (상태 업데이트 및 API 호출)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let updatedValue: any;

        if (type === 'range') {
            updatedValue = parseInt(value);
        } else if (name === 'complianceCheckPass') {
            updatedValue = (value === 'yes'); // 체크박스 처리
        } else {
            updatedValue = value;
        }

        setInputData(prev => ({ ...prev, [name]: updatedValue }));
    };

    // 메인 로직: 결제 시뮬레이션 실행
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        setResult(null); // 결과 초기화

        try {
            // 🚀 비동기 백엔드 시뮬레이션 호출
            const resultData = await simulatePaymentFlow({ 
                complianceCheckPass: inputData.complianceCheckPass,
                riskToleranceLevel: inputData.riskToleranceLevel 
            });
            setResult(resultData);

        } catch (error) {
            console.error("Simulation Failed:", error);
            alert("시스템 오류가 발생했습니다. 콘솔을 확인해주세요.");
            setResult({ qloss: 100, status: 'CRITICAL_FAILURE', message: "시스템이 응답하지 않습니다. 즉시 전문가의 도움이 필요합니다.", details: {} });
        } finally {
            setIsLoading(false);
        }
    };

    // --- UI 렌더링 로직 ---
    const renderStatusCard = () => {
        if (!result) {
            return <div className="p-6 bg-gray-700/50 rounded-lg text-white">분석을 위해 위의 정보를 입력하고 '위험성 평가 시작' 버튼을 눌러주세요.</div>;
        }

        const qloss = result.qloss;
        const styles = getRedZoneStyles(qloss);
        
        return (
            <div className={`p-8 rounded-xl border-4 transition-all duration-700 ${styles}`}>
                <h2 className="text-3xl font-bold mb-4 text-white">🚨 시스템 생존 위협 경고</h2>
                <p className="text-lg mb-6 text-red-100 animate-pulse">{result.message}</p>

                <div className="flex items-center space-x-4 mb-8">
                    <span className="text-5xl font-extrabold text-yellow-300">{qloss}%</span>
                    <div>
                        <h3 className="text-sm uppercase tracking-widest text-red-200">Current QLoss</h3>
                        <p className={`text-xl font-mono ${result.status === 'CRITICAL_FAILURE' ? 'text-red-400 animate-bounce' : 'text-yellow-300'}`}>
                            {qloss >= 75 ? "Critical" : qloss >= 40 ? "High Risk" : "Monitor"}
                        </p>
                    </div>
                </div>

                <div className="bg-white/10 p-4 rounded border border-red-400">
                    <h4 className="text-xl font-semibold text-red-200 mb-2">다음 단계:</h4>
                    <p className="text-sm text-red-300">이 수치는 귀사 시스템의 구조적 무결성이 현재 상태에서 얼마나 취약한지를 나타냅니다. 
                        즉시 <span className="font-bold underline">전문가의 법적 리스크 평가 보고서</span>를 받아야 합니다.</p>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-[#1a202c] rounded-lg shadow-2xl text-white">
            <h1 className="text-4xl font-extrabold mb-6 border-b pb-2 text-red-400 tracking-wider">
                🔍 QLoss 기반 리스크 평가 게이트키핑 시스템
            </h1>
            <p className="mb-8 text-gray-300">
                귀사의 현재 운영 데이터를 입력하고, 시스템의 구조적 무결성을 진단해 보십시오. 
                (주의: 이 과정은 시스템의 취약점을 노출시킬 수 있습니다.)
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Compliance Check (불안감 유발 요소) */}
                <div>
                    <label htmlFor="complianceCheckPass" className="block text-sm font-medium text-gray-300 mb-2">
                        1. 필수 규정 준수 항목 검토 완료 여부: 
                    </label>
                    <select
                        id="complianceCheckPass"
                        name="complianceCheckPass"
                        onChange={handleInputChange}
                        className="mt-2 block w-full p-3 border border-gray-600 bg-[#1a202c] rounded-md text-white focus:ring-red-500 focus:border-red-500 transition duration-150"
                    >
                        <option value="no">❌ 미완료 (데이터 부족)</option>
                        <option value="yes">✅ 완료 (규정 준수 확인)</option>
                    </select>
                </div>

                {/* Risk Tolerance Level (슬라이더로 불안감 체감) */}
                <div>
                    <label htmlFor="riskToleranceLevel" className="block text-sm font-medium text-gray-300 mb-2">
                        2. 현재 기업의 위험 허용도 레벨: 
                    </label>
                    <input
                        type="range"
                        id="riskToleranceLevel"
                        name="riskToleranceLevel"
                        min="1"
                        max="10"
                        step="1"
                        value={inputData.riskToleranceLevel}
                        onChange={handleInputChange}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-slider transition duration-150"
                    />
                    <div className="text-center mt-2 text-sm text-red-300">
                        현재 레벨: <span className="font-bold">{inputData.riskToleranceLevel} / 10</span> (낮을수록 보수적)
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-md text-lg font-semibold transition duration-300 
                        ${isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 shadow-lg transform hover:scale-[1.01]'}
                    `}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            시스템 분석 중... (3초 지연)
                        </span>
                    ) : (
                        "⚡️ 위험성 평가 시작 (진단 리포트 요청)"
                    )}
                </button>
            </form>

            {/* 결과 섹션 */}
            <div className="mt-12">
                {renderStatusCard()}
            </div>
        </div>
    );
};

export default PaymentGatewaySimulator;