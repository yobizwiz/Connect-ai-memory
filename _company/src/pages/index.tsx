import React, { useState } from 'react';
import Head from 'next/head';
// Assume the landing-kit provided components are available in '../components'
import FeatureSection from '../components/FeatureSection'; 
import PricingSection from '../components/PricingSection';

// --- [1. 핵심 로직 컴포넌트: Loss Meter] ---
/**
 * 사용자 입력 기반으로 가상 재무적 손실을 계산하고 위험 레벨을 산출합니다.
 * 이 부분이 yobizwiz의 '영업 무기' 역할을 합니다.
 */
const LossMeterComponent = ({ initialRisk = 0 }) => {
    const [riskInput, setRiskInput] = useState('');
    const [lossDetected, setLossDetected] = useState(null); // { amount: number, riskLevel: string }
    const [isLoading, setIsLoading] = useState(false);

    // Mock API Call 시뮬레이션
    const calculateRisk = async () => {
        if (!riskInput) return;

        setIsLoading(true);
        setLossDetected(null);

        // 3초 지연을 주어 로딩 상태를 체감하게 만듭니다. [근거: Self-RAG]
        await new Promise(resolve => setTimeout(resolve, 2000)); 

        const inputAmount = parseFloat(riskInput);
        let calculatedLoss;
        let riskLevel;

        // Mock Logic: 입력 금액에 비례하여 손실액 계산 및 위험 등급 할당
        if (inputAmount > 5000) {
            calculatedLoss = Math.round(inputAmount * 0.1); // 10% 손실 가정
            riskLevel = 'CRITICAL'; // Red Zone
        } else if (inputAmount > 1000) {
            calculatedLoss = Math.round(inputAmount * 0.03);
            riskLevel = 'WARNING'; // Yellow Zone
        } else {
            calculatedLoss = Math.round(inputAmount * 0.005);
            riskLevel = 'SAFE'; // Green Zone
        }

        setLossDetected({ amount: calculatedLoss, riskLevel: riskLevel });
        setIsLoading(false);
    };

    const renderRiskGauge = () => {
        if (!lossDetected) return null;

        let bgColorClass = '';
        let warningText = '';

        switch (lossDetected.riskLevel) {
            case 'CRITICAL':
                bgColorClass = 'bg-red-700'; // Red Zone
                warningText = "시스템적 생존 위협 감지";
                break;
            case 'WARNING':
                bgColorClass = 'bg-yellow-600'; // Yellow Zone
                warningText = "규정 준수 위험 경고";
                break;
            case 'SAFE':
                bgColorClass = 'bg-green-700'; // Green Zone
                warningText = "현재는 안정적이나, 관리 필요";
                break;
        }

        return (
            <div className={`p-6 rounded-lg shadow-2xl ${bgColorClass} transition duration-500`}>
                <h3 className="text-2xl font-bold text-white mb-4">🚨 {warningText}</h3>
                <div className="flex items-end justify-between mt-4 border-b pb-2">
                    <span className="text-lg text-gray-100">예상 손실액:</span>
                    <p className="text-5xl font-extrabold text-white">${lossDetected.amount.toLocaleString()} <span className='text-xl'>USD</span></p>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-900 p-12 rounded-xl shadow-[0_20px_50px_rgba(255,0,0,0.3)] max-w-4xl mx-auto">
            <h2 className="text-4xl font-extrabold text-white mb-8 text-center">
                ⚡️ 실시간 구조적 무결성 진단 ⚡️
            </h2>
            <p className='text-gray-300 text-center mb-10'>
                고객님의 현재 운영 프로세스를 입력하고, 잠재적 재무 손실액을 즉시 확인하세요.
            </p>

            {/* 입력 폼 */}
            <div className="mb-8 flex justify-center">
                <input
                    type="number"
                    placeholder="진단할 연간 매출 또는 프로세스 가치 (USD)"
                    value={riskInput}
                    onChange={(e) => setRiskInput(e.target.value)}
                    className="w-full max-w-sm p-4 text-xl bg-gray-800 border-2 border-red-500 text-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button 
                    onClick={calculateRisk} 
                    disabled={isLoading || !riskInput}
                    className={`px-8 py-4 text-xl font-bold transition duration-300 ${isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white rounded-r-lg`}
                >
                    {isLoading ? '분석 중...' : '무료 리스크 진단 요청'}
                </button>
            </div>

            {/* 결과 표시 */}
            <div className="text-center min-h-[250px] flex items-center justify-center">
                {lossDetected ? renderRiskGauge() : (isLoading ? <p className='text-gray-400'>진단 중...</p> : <p className='text-gray-400'>데이터를 입력해 진단을 시작하세요.</p>)}
            </div>

        </div>
    );
}


// --- [2. 메인 랜딩 페이지 컴포넌트] ---
const HomePage = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <Head>
                <title>yobizwiz | 시스템적 생존 리스크 보험</title>
            </Head>

            {/* =================== 1. Hero Section: 공포 유발 (Red Zone) =================== */}
            <section className="pt-24 pb-32 bg-gray-900 text-center border-b border-red-800/50">
                <div className="max-w-6xl mx-auto px-4">
                    <h1 className="text-7xl font-extrabold leading-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-800">
                        🚨 시스템적 생존 리스크, 지금 통제하고 계십니까?
                    </h1>
                    <p className="text-3xl text-gray-400 mb-12 max-w-3xl mx-auto">
                        단순한 법규 위반 경고를 넘어, 귀사의 운영 시스템 전체가 붕괴할 수 있는 구조적 무결성(Structural Integrity)을 진단합니다.
                    </p>

                    {/* 핵심 요소: Loss Meter 삽입 */}
                    <LossMeterComponent />
                </div>
            </section>

            {/* =================== 2. Problem Deep Dive (Failure Flow) =================== */}
            <section className="py-24 bg-gray-800/50 border-b">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <h2 className="text-5xl font-extrabold mb-6 text-red-400">📉 실패 흐름 (Failure Flow): 시스템적 맹점들</h2>
                    <p className="text-xl text-gray-300 mb-16 max-w-3xl mx-auto">
                        현재의 프로세스는 '이론상'으로는 작동하는 것처럼 보입니다. 하지만, 우리가 놓치고 있는 법규 변화와 데이터 흐름의 단절 지점(Decoupling Points)은 재무적 공포를 유발합니다. [근거: 🏢 회사 정체성]
                    </p>

                    {/* Failure Flow Visualization Placeholder */}
                    <div className="bg-gray-700 p-12 rounded-xl shadow-inner border-l-8 border-red-600/70">
                        <h3 className='text-3xl font-bold text-red-400 mb-4'>⚠️ 위험 예시: 데이터 무결성 단절</h3>
                        <p className='text-gray-200'>[Failure Logic]: 외부 API의 버전 업데이트(v1 $\rightarrow$ v2)가 발생했으나, 내부 트랜잭션 로직이 이를 반영하지 못해 보고서 생성 시점에 치명적인 데이터 불일치가 발생합니다. → **시스템 마비 및 법적 책임.**</p>
                    </div>
                </div>
            </section>

             {/* =================== 3. Solution & Pricing (Blue Zone) =================== */}
            <section className="py-24 bg-gray-900">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <h2 className="text-5xl font-extrabold mb-3 text-blue-400">🛡️ 통제력 확보 (Blue Zone): 구조적 무결성 보험</h2>
                    <p className="text-2xl text-gray-400 mb-16 max-w-2xl mx-auto">
                        yobizwiz는 단순 감시가 아닙니다. 시스템 전체의 'Fail State'를 사전에 예측하고, 강제로 정상 상태로 되돌리는 통제 아키텍처(Control Architecture)입니다. [근거: 🏢 회사 정체성]
                    </p>

                    {/* Pricing Section Integration */}
                    <PricingSection />
                </div>
            </section>

             {/* =================== 4. Final CTA (The Conversion Point) =================== */}
            <section className="py-20 bg-red-900/10 border-t border-b border-red-700">
                 <div className="max-w-4xl mx-auto px-4 text-center p-16 rounded-lg shadow-inner bg-gray-800">
                    <h2 className="text-5xl font-extrabold text-red-400 mb-4">지금, 구조적 무결성을 증명하십시오.</h2>
                    <p className="text-2xl text-gray-300 mb-10">
                        망설이는 1초가 재무적 손실액 $X를 증가시킵니다. 무료 리스크 진단으로 우리의 통제력을 직접 경험하세요.
                    </p>
                     {/* 최종 CTA 버튼 */}
                    <button className="bg-red-600 hover:bg-red-700 text-white font-extrabold py-4 px-12 rounded-full shadow-lg transition duration-300 transform hover:scale-105">
                        ✅ 무료 리스크 진단 요청 및 시스템 검증 시작
                    </button>
                </div>
            </section>

        </div>
    );
}

export default HomePage;