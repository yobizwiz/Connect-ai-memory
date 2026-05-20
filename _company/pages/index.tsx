import React, { useState } from 'react';
import Head from 'next/head';
import axios from 'axios'; // API 호출용 라이브러리 가정

// 1. 필수 컴포넌트 임포트 (최근 생성된 파일들 활용)
import PaywallComponent from '../src/components/PaywallComponent';

/**
 * @typedef {object} DiagnosticResult
 * @property {'LOW'|'MEDIUM'|'HIGH'} riskLevel - 진단 결과 리스크 레벨.
 * @property {number} score - 점수 (0-100).
 * @property {string[]} suggestedImprovements - 개선 필요 항목 목록.
 */

// 2. 게이트키퍼 로직 임계치 설정: 이 값 이하일 때 '필수 구매' 유도
const CRITICAL_THRESHOLD = 50; 

/**
 * Loss Meter 랜딩 페이지 프로토타입을 구현합니다.
 * 진단 -> 경고 -> Paywall로 이어지는 E2E 흐름에 초점을 맞춥니다.
 */
const HomePage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    // 사용자가 입력할 가상 리스크 데이터 상태 (실제로는 폼에서 온다 가정)
    const [inputData, setInputData] = useState({
        compliance_status: 'Pending', // 예시 값
        data_silo_count: 3,         // 예시 값
        market_risk_exposure: 0.6   // 예시 값 (0~1)
    });

    /**
     * API를 호출하여 리스크 진단을 수행하고 결과를 상태에 저장합니다.
     */
    const handleDiagnosis = async () => {
        if (isLoading) return;

        setIsLoading(true);
        setResult(null); // 로딩 시작 시 결과 초기화

        // 3초 지연을 주어 로딩 상태를 체감하게 만듭니다. [근거: Self-RAG, sessions/2026-05-19T03-38]
        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
            // 실제 API 호출 (c:\Users\jinoh\OneDrive\Desktop\Connect AI\_company\pages\api\diagnose.ts 에 정의된 로직 사용 가정)
            const apiResponse = await axios.post('/api/diagnose', { 
                data: inputData 
            });

            // API 응답을 구조화된 결과로 간주하고 상태 업데이트
            setResult(apiResponse.data); 
        } catch (error) {
            console.error("진단 실패:", error);
            alert("시스템 오류 발생. 나중에 다시 시도해주세요.");
            setResult({ riskLevel: 'LOW', score: 100, suggestedImprovements: [] }); // 안전한 기본값 설정
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * 리스크 레벨에 따른 Tailwind CSS 스타일을 동적으로 반환하는 함수.
     */
    const getRedZoneStyles = (level) => {
        switch (level) {
            case 'HIGH': // 위험 경고색: Dark Crimson (#C0392B)
                return "bg-red-800/90 border-red-700 text-white animate-pulse";
            case 'MEDIUM': // 경고색: Orange-Red
                return "bg-yellow-900/90 border-yellow-600 text-yellow-300";
            case 'LOW': // 안정색: Authority Blue (#2980B9)
            default:
                return "bg-blue-900/90 border-blue-700 text-white";
        }
    };

    // 4. 게이트키퍼 로직 실행 지점
    const isGatekeeperActive = result && result.score < CRITICAL_THRESHOLD;

    return (
        <div className="min-h-screen bg-gray-900 font-mono text-white p-8">
            <Head>
                <title>Loss Meter - 시스템적 생존 위협 진단</title>
            </Head>
            
            {/* Hero Section: 공포와 권위 주입 */}
            <header className="text-center py-12 border-b border-red-900 mb-8">
                <h1 className="text-5xl font-bold text-[#C0392B] tracking-widest animate-glitch">
                    SYSTEMIC LOSS METER <span className="text-4xl block mt-1 text-blue-400">[v. 1.0]</span>
                </h1>
                <p className="mt-4 text-lg max-w-2xl mx-auto text-gray-300">
                    귀하의 비즈니스가 인지하지 못하는 '구조적 결함'에 기반한 잠재적 손실액(QLoss)을 실시간으로 측정합니다.
                </p>
            </header>

            {/* 진단 섹션 */}
            <section className="max-w-4xl mx-auto py-12 bg-gray-800/50 border-l-4 border-[#C0392B] mb-16">
                <h2 className="text-3xl font-bold mb-8 text-center tracking-wider">
                    [ STEP 1: 리스크 진단 요청 ] - 무료 체험 (Diagnostic Simulation)
                </h2>

                {/* 입력 폼 시뮬레이션 */}
                <div className="bg-gray-900 p-6 rounded border border-red-900/50">
                    <p className='mb-4 text-sm text-red-400'>*진단을 위해 가상 데이터를 사용합니다. 실제 환경에서는 OAuth 및 데이터 연동이 필요합니다.</p>
                    {/* 여기에 폼 필드가 들어갈 자리 */}
                </div>

                <button
                    onClick={handleDiagnosis}
                    disabled={isLoading}
                    className={`w-full py-3 px-6 text-xl font-bold transition duration-300 ${
                        isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#C0392B] hover:bg-red-700 shadow-lg animate-pulse'
                    }`}
                >
                    {isLoading ? '⚙️ 시스템 분석 중... (시간 압박감 조성)' : '🚨 잠재적 손실액(QLoss) 진단 시작'}
                </button>
            </section>

            {/* 결과 및 게이트키퍼 섹션 */}
            <main className="max-w-4xl mx-auto">
                {!isLoading && result && (
                    <div className={`p-8 rounded-lg border-4 ${getRedZoneStyles(result.riskLevel)} mb-16 shadow-[0_0_30px_rgba(192,57,43,0.5)]`}>
                        <h2 className="text-4xl font-bold mb-4 tracking-wider">
                            [ 진단 완료 ] 시스템적 리스크 보고서 (Report ID: {Date.now().toString().slice(-6)})
                        </h2>
                        <div className="flex items-center justify-between text-2xl mt-4 border-b pb-3 border-red-700">
                            <span>최종 위험 등급(Risk Level):</span> 
                            <span className={`font-extrabold text-3xl ${result.riskLevel === 'HIGH' ? 'text-yellow-400 animate-ping' : 'text-white'}`}>{result.riskLevel}</span>
                        </div>
                        <div className="mt-6">
                            <p className="text-xl mb-2">📊 종합 리스크 점수(Score): <span class='font-mono text-3xl'>{(result.score).toFixed(1)}/100</span></p>
                            {/* 핵심 공포 자극 문구 */}
                            <p className={`mt-4 p-4 rounded border-2 ${result.riskLevel === 'HIGH' ? 'border-red-500 bg-red-900/30' : 'border-blue-500 bg-blue-900/30'} text-lg`}>
                                **⚠️ 경고:** 귀하의 시스템은 현재 Critical Threshold({CRITICAL_THRESHOLD}) 근접 상태입니다. 
                                만약 이 리스크가 방치될 경우, 최소 ${Math.round(100 * (100 - result.score) / 100)} 이상의 운영적 손실이 예상됩니다. [근거: 🏢 회사 정체성]
                            </p>
                        </div>

                        {/* 개선 항목 */}
                        <div className="mt-8 pt-6 border-t border-red-700">
                            <h3 className="text-2xl font-bold mb-3 text-yellow-400">필수 개선 영역 (Required Interventions)</h3>
                            <ul className="list-disc list-inside space-y-1 text-gray-200">
                                {result.suggestedImprovements.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* 5. 게이트키퍼 컴포넌트 (조건부 렌더링) */}
                {(isGatekeeperActive && result) ? (
                    <>
                        <h2 className="text-4xl font-extrabold text-center tracking-widest mb-8 animate-glitch">
                            [ GATEKEEPER TRIGGERED ] 필수 대응 시스템 작동
                        </h2>
                        <div className="bg-red-900/70 border-4 border-[#C0392B] p-10 rounded-xl text-center shadow-[0_0_50px_rgba(192,57,43,0.8)]">
                            <p className="text-2xl mb-6 text-yellow-300 animate-pulse">
                                현재 진단 결과로는 공포를 느끼는 것만으로는 부족합니다. 
                                구조적 생존을 위한 **'실질적인 시스템 수정 계획'**이 필요합니다. [근거: 🏢 회사 정체성]
                            </p>
                            <p className="text-xl mb-8 text-gray-200">
                                이 문제를 해결할 수 있는 유일하고 필수적인 다음 단계는 'Loss Meter 전문 워크숍'입니다.
                            </p>
                            {/* PaywallComponent 호출 및 props 전달 */}
                            <PaywallComponent 
                                title={`🚨 ${result.riskLevel} 리스크 대응: 심층 진단 워크숍`}
                                description="잠재적 손실액을 확정적으로 줄이기 위한 전문가의 맞춤형 로드맵이 제공됩니다."
                                apiEndpoint="/api/workshop-purchase" // 새로운 구매 API 엔드포인트 지정
                            />
                        </div>
                    </>
                ) : (
                     // 게이트키퍼가 발동되지 않았을 때의 CTA
                    !isLoading && result && (
                         <div className="text-center p-8 bg-green-900/50 border-2 border-green-700 rounded-lg">
                            <h3 className="text-3xl font-bold text-green-400 mb-4">[ 안심 ] 기본적인 리스크는 통제 가능합니다.</h3>
                            <p className='mb-6'>하지만, 완벽한 안정성은 없습니다. 주기적인 모니터링과 시스템 점검이 필수입니다.</p>
                            {/* 다음 단계의 무료 유인 장치 */}
                             <button 
                                onClick={() => alert("다음 진단 요청 API 엔드포인트로 이동합니다.")}
                                className="py-3 px-6 text-lg font-bold bg-blue-700 hover:bg-blue-600 rounded transition duration-200"
                            >
                                🛡️ 다음 분기 리스크 예측 진단 요청하기 (무료)
                            </button>
                        </div>
                    )
                )}
            </main>

        </div>
    );
};

export default HomePage;