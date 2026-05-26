"use client"; // Next.js 클라이언트 컴포넌트임을 명시

import React, { useState, useEffect } from 'react';

/**
 * 리스크 등급에 따른 시각적 경고 텍스트를 반환합니다.
 * @param riskScore - 계산된 위험 점수 (0-100)
 */
const getRiskLevel = (riskScore: number): 'Low' | 'Medium' | 'High' => {
    if (riskScore < 30) return 'Low';
    if (riskScore < 75) return 'Medium';
    return 'High'; // 75점 이상은 High 리스크로 간주하고 공포감 극대화
};

/**
 * Red Zone 경고 로그를 무작위 패턴으로 생성하는 함수입니다.
 * @returns CSS 클래스와 메시지 배열
 */
const generateRandomErrorLog = (): { patternClass: string; messages: string[] } => {
    const patterns = [
        { class: 'error-data-mismatch', msg: `[ERROR: DATA_MISMATCH] Source ID ${Math.random().toString(36).substring(2, 10)} not found.` },
        { class: 'error-auth-fail', msg: `[CRIT: AUTH_FAIL] Protocol Violation detected. Retry limit exceeded at sector ${Math.floor(Math.random() * 99)}. ` },
        { class: 'error-memory-leak', msg: `[WARNING: MEMORY_LEAK] Heap allocation failure at address 0x${'0'.repeat(10)}${Math.random().toString(16).substring(2)}.` }
    ];
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];

    return { patternClass: randomPattern.class, messages: [randomPattern.msg] };
};


/**
 * 🔴 핵심 상태 머신 컴포넌트: DiagnosticEngine
 * 진단 결과 수신 시 '원인 불명 공포'를 유발하고 CTA로 전환하는 로직을 담당합니다.
 */
export const DiagnosticEngine: React.FC<{ initialRiskScore: number }> = ({ initialRiskScore }) => {
    const [state, setState] = useState<'loading' | 'fear_display' | 'solution'>('loading');
    const [errorLog, setErrorLog] = useState<string[]>([]);

    useEffect(() => {
        // 1. 로딩 상태 시작 (시간적 압박)
        setState('loading');
        
        // 2. 가상 API 처리 시간 시뮬레이션 (3초 지연)
        const timer = setTimeout(async () => {
            console.log("System: Initial processing complete. Entering Diagnostic Phase.");
            
            const riskLevel = getRiskLevel(initialRiskScore);
            let messages: string[] = [];

            if (riskLevel === 'Low') {
                // 리스크가 낮을 경우, 경고를 최소화하고 빠르게 결과를 보여줍니다.
                setState('solution'); 
                return;
            } else {
                 // High/Medium 리스크일 경우, 공포 유발 시퀀스 시작
                setErrorLog([`[SYSTEM ALERT]: Critical Risk detected. Level: ${riskLevel}. Analysis required.`]);
                setState('fear_display');

                // 3. '원인 불명 공포' 루프 (Red Zone Display)
                let logMessages = [];
                for(let i = 0; i < 5; i++) { // 총 5번의 에러 로그 출력 시도
                    await new Promise(resolve => setTimeout(resolve, 700)); // 로그 간 지연
                    const { patternClass, messages: singleMessage } = generateRandomErrorLog();
                    logMessages.push(`<span class="${patternClass}">${singleMessage}</span>`);
                }
                // 최종적으로 위협 메시지를 강하게 출력합니다.
                setTimeout(() => {
                   setErrorLog(logMessages);
                   setState('solution'); // 공포 유발 후, 해결책 제시 (CTA)로 전환
                }, 1000);

            }

        }, 3000); // 3초 로딩 시뮬레이션

        return () => clearTimeout(timer);
    }, [initialRiskScore]);


    // ======================= State Render Logic =======================

    if (state === 'loading') {
        return (
            <div className="text-center py-10">
                <h2 className="text-xl text-gray-600 mb-4">진단 엔진 가동 중...</h2>
                <div className="w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className="bg-red-600 h-full transition-all duration-1000 ease-out" 
                        style={{ width: '75%' }} // 로딩 시뮬레이션 진행률
                    ></div>
                </div>
                <p className='mt-2 text-sm text-gray-500'>데이터 전송 및 구조적 무결성 검증 중입니다. 잠시만 기다려주세요.</p>
            </div>
        );
    }

    if (state === 'fear_display') {
        return (
            <div className="py-8 bg-red-950/20 border border-red-700 p-6 rounded-lg shadow-xl">
                <h3 className="text-2xl text-red-400 mb-4 animate-pulse">🚨 경고: 시스템적 무결성 위협 감지 🚨</h3>
                <p className='mb-4 text-gray-300'>현재 데이터 흐름에 심각한 오류가 발생했습니다. 근본적인 원인을 파악하려면 전문가의 도움이 필수입니다.</p>
                
                {/* Designer님이 제공한 에러 로그 영역 */}
                <div className="error-log mt-6 max-h-80 overflow-y-auto text-sm">
                    {errorLog.map((msg, index) => (
                        <p key={index} className='mb-1'>{msg}</p>
                    ))}
                </div>

                 <div className="mt-6 p-4 bg-red-900/50 border border-red-700 rounded text-center">
                     <p className='text-lg font-bold text-red-300'>‼️ 원인 불명 (Unknown Source) ‼️</p>
                     <p className='text-sm text-red-400 mt-1'>-> 시스템 내부 프로세스에서 외부로의 데이터 유출이 감지되었습니다. 즉각적인 개입이 필요합니다.</p>
                 </div>
            </div>
        );
    }

    // 최종 결과 및 CTA 노출 상태 (State: solution)
    return (
        <div className="mt-8 p-8 bg-white shadow-2xl border border-gray-100 rounded-xl transition duration-500 transform scale-100">
            {/* 1. 진단 결과 요약 */}
            <h3 className={`text-4xl font-bold ${initialRiskScore >= 75 ? 'text-red-600' : 'text-yellow-600'}`}>
                진단 결과: {Math.round(initialRiskScore)}% 리스크 (⚠️ {getRiskLevel(initialRiskScore)})
            </h3>
            <p className='mt-3 text-lg text-gray-700'>당신의 현재 시스템적 상태는 임계점을 넘었습니다. 이대로 방치하면 예상 손실액 $Y$에 도달할 수 있습니다.</p>

            {/* 2. CTA - 해결책 제시 (가장 중요한 목적) */}
            <div className="mt-8 text-center">
                <h4 className="text-3xl font-extrabold text-blue-700 mb-6">
                    [해결책] 구조적 무결성 확보, 지금 바로 시작하십시오.
                </h4>
                <button 
                    className="w-full max-w-md py-3 px-8 text-lg bg-red-600 hover:bg-red-700 transition duration-200 shadow-lg text-white font-bold rounded"
                    onClick={() => alert("진단 요청 페이지로 이동합니다. (CTA 성공) ✅")}
                >
                    무료 리스크 진단 및 해결책 컨설팅 받기
                </button>
            </div>
        </div>
    );
};

export default DiagnosticEngine;