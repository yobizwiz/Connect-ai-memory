import React, { useState, useEffect } from 'react';

// Red Zone 배경 및 애니메이션 스타일 정의 (Tailwind + Custom CSS Logic)
const RedZoneErrorOverlay: React.FC<{ onAcknowledge: () => void }> = ({ onAcknowledge }) => {
    const [logCount, setLogCount] = useState(0);
    const [showLogs, setShowLogs] = useState(false);

    useEffect(() => {
        // 3초 후 로그 스트리밍 시작 (위기감 고조)
        const timer = setTimeout(() => {
            setShowLogs(true);
        }, 1500); 
        return () => clearTimeout(timer);
    }, []);

    // 전문적인 가짜 에러 로그 생성 및 업데이트 로직
    useEffect(() => {
        if (!showLogs) return;

        const interval = setInterval(() => {
            setLogCount(prevCount => prevCount + 1);
        }, 100); // 빠른 속도로 로그가 찍히는 효과

        return () => clearInterval(interval);
    }, [showLogs]);


    // 가상의 에러 메시지 목록
    const errorMessages = [
        "SYSTEM_CRITICAL: DATA FLOW INTERRUPTED",
        "[WARN] Compliance Check Failed for Schema ID 7B2-X:",
        "ERROR CODE: 503 - Structural Integrity Breach Detected.",
        "RESOURCE UNRECOVERABLE. Potential Data Corruption at Layer 4.",
        "AUTH_SCOPE MISMATCH: Required Scope 'financial.read' not granted.",
        `[ALERT][${logCount % 10}] System Warning: ${Math.random().toString(36).substring(2, 8).toUpperCase()}...`,
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0000]/95 backdrop-blur-sm p-4">
            <div className={`w-full max-w-3xl bg-black border-4 border-red-700 shadow-[0_0_40px_rgba(255,0,0,0.8)] p-8 animate-pulse`}>
                
                {/* 헤더: Red Zone 경고 */}
                <div className="text-center mb-6">
                    <h1 className="text-xl uppercase text-red-500 tracking-widest font-mono">[!! RED ZONE ACTIVATED !!]</h1>
                    <p className="mt-2 text-sm text-gray-400">Critical System Alert: Structural Integrity Breach Detected</p>
                </div>

                {/* 로그 스트리밍 컨테이너 */}
                <div className="bg-[#1a0505]/80 border border-red-900 p-3 h-64 overflow-y-scroll font-mono text-xs mb-8 relative">
                    {showLogs ? (
                        <>
                            {/* 초기 메시지 */}
                            <p className="text-green-400">[INIT] Starting Compliance Validator Engine...</p>
                            <p className="text-yellow-500">[INFO] Analyzing user input parameters. Potential deviation detected.</p>
                            <hr className="border-red-800 my-2" />
                            {/* 스트리밍 로그 */}
                            {[...Array(10)].map((_, i) => (
                                <p key={i} className={`text-${Math.floor(Math.random() * 5)}-[color] ${Math.random() > 0.7 ? 'text-red-400' : 'text-gray-300'}`}>
                                    {errorMessages[i % errorMessages.length]}
                                </p>
                            ))}
                        </>
                    ) : (
                         <p className="text-gray-500 italic">System preparing diagnostic report...</p>
                    )}
                </div>

                {/* 최종 CTA 영역: Y 리스크 진단 */}
                <div className="mt-auto pt-6 border-t border-red-800 flex justify-between items-center">
                    <p className="text-sm text-gray-300">⚠️ **경고**: 현재 시스템의 구조적 결함으로 인해 정확한 진단이 불가능합니다.</p>
                    
                    {/* Y 리스크 진단 버튼 (핵심 컨버전스) */}
                    <button 
                        onClick={() => { onAcknowledge(); }}
                        className="px-8 py-3 text-lg font-bold uppercase bg-red-600 hover:bg-red-700 transition duration-200 shadow-[0_0_15px_rgba(255,0,0,0.9)]"
                    >
                        즉시 $Y$ 리스크 진단 요청하기 🛠️
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RedZoneErrorOverlay;