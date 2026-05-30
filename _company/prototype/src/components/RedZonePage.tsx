import React, { useState } from 'react';
import { useRiskState } from '../hooks/useRiskState';
import DiagnosisModal from './DiagnosisModal';
import * as RiskLevels from '../constants/RiskLevels';

/**
 * @description 메인 Red Zone 페이지 컴포넌트. 
 * 상태 머신을 이용해 사용자를 강제적으로 위협 구간에 노출시키는 것이 핵심입니다.
 */
const RedZonePage: React.FC = () => {
    // 훅을 통해 현재 시스템의 위험 상태와 전환 로직을 가져옵니다.
    const { riskLevel, isAlertActive, handleDiagnosisRequest } = useRiskState();
    
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 리스크 레벨에 따른 스타일 동적 적용 (BluePrint 반영)
    const style = RiskLevels.riskLevelDetails[riskLevel];

    useEffect(() => {
        if (!isAlertActive && riskLevel !== 'LOW') {
             setIsModalOpen(true); // 경고가 활성화되면 모달을 띄웁니다.
        } else if (riskLevel === 'CRITICAL' && !isModalOpen) {
            // 크리티컬 상태에 도달하면 사용자가 행동할 수 없도록 강제합니다.
             setIsModalOpen(true);
        }
    }, [isAlertActive, riskLevel]);


    return (
        <div className="relative min-h-screen bg-[#1a1a1a] text-white font-mono overflow-hidden">
            {/* 1. Global Overlay & Noise Filter (BluePrint ①) */}
            <div className="absolute inset-0 opacity-[0.2] pointer-events-none z-10" style={{ 
                backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,.05), transparent 1px, transparent 2px)',
                animation: 'noise 10s linear infinite' // CSS Animation Hook
            }}></div>

            {/* Main Content */}
            <div className="relative z-20 max-w-4xl mx-auto p-8 pt-[15vh]">
                
                {/* Header & Risk Display (핵심 주의점) */}
                <header className={`p-6 mb-12 rounded-lg shadow-2xl border-4 ${style.colorPrimary} bg-opacity-90 transition-all duration-1000`}>
                    <h1 className="text-3xl font-bold tracking-wider uppercase text-white">
                        yobizwiz System Integrity Report
                    </h1>
                    <p className={`mt-2 text-lg ${style.colorPrimary} font-semibold`}>
                        Current Status: {style.title} (Risk Level: {riskLevel})
                    </p>
                </header>

                {/* Core Content Section */}
                <section className="mb-16">
                    <h2 className="text-xl mb-4 border-b border-gray-700 pb-2 uppercase tracking-widest text-[#999]">
                        Systemic Gap Analysis (Lorem Ipsum)
                    </h2>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        (사용자에게 전문 지식으로 인한 혼란과 위협을 심어주는 내용이 들어갑니다. 이 섹션은 스크롤 압박을 유발해야 합니다.) 
                        ... [더 많은 가상의 데이터와 복잡한 구조적 취약점 그래프가 여기에 배치됩니다.] ...
                    </p>
                </section>

                {/* The Conversion Gate (Lmax Widget - BluePrint ②) */}
                <div className={`p-12 text-center rounded-xl shadow-[0_0_30px_rgba(192,57,43,0.8)] ${riskLevel === 'CRITICAL' ? 'bg-[#3d1c1a]' : 'bg-gray-800'} transition-all duration-1000`}>
                    <p className="text-xl mb-4 uppercase text-red-400">
                        ⚠️ IMMEDIATE ACTION REQUIRED ⚠️
                    </p>
                    <h3 className="text-sm tracking-widest text-gray-400 mb-6">
                        Analysis indicates a critical structural flaw that cannot be rectified with current data.
                    </h3>
                    
                    {/* Lmax 카운터업 효과를 시뮬레이션 */}
                    <div className={`text-[3em] font-extrabold tracking-widest ${riskLevel === 'CRITICAL' ? 'text-[#f56c5e]' : 'text-yellow-400'} animate-pulse`}>
                        ${isAlertActive && riskLevel === 'CRITICAL' ? "32,500,000+" : "N/A"} USD+
                    </div>
                    <p className="mt-4 text-sm text-gray-500">
                        Maximum Potential Loss ($L_{max}$) based on current systemic exposure.
                    </p>

                    {/* Call to Action Button */}
                    <button 
                        onClick={handleDiagnosisRequest} 
                        disabled={!isAlertActive || riskLevel !== 'CRITICAL'}
                        className={`mt-10 px-12 py-4 text-lg uppercase font-bold transition duration-300 ${
                            (isAlertActive && riskLevel === 'CRITICAL') 
                                ? `bg-[${style.colorPrimary}] hover:bg-[#9c3025] text-white shadow-xl cursor-pointer` 
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {isAlertActive && riskLevel === 'CRITICAL' ? "Request Full Diagnosis Report" : "Wait for System Analysis"}
                    </button>
                </div>
            </div>

            {/* Modal Gate */}
            {isModalOpen && <DiagnosisModal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default RedZonePage;