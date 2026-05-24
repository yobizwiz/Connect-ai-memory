// GatekeepingSection.tsx
import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaClock } from 'react-icons/fa';

/**
 * @typedef {Object} RiskState
 * @property {number} riskLevel - 현재 리스크 레벨 (0~100). 0이 가장 안전.
 * @property {number} timeLeft - 남은 시간 (초 단위).
 */

// 초기 상태 정의: 시스템적으로 취약하다는 전제를 깔고 시작합니다.
const INITIAL_TIME = 30 * 60; // 30분 (초)
const INITIAL_RISK = 15;     // 낮은 수준에서 출발하지만, 즉시 위협을 느끼게 함

/**
 * 리스크 레벨에 따라 경고 스타일과 메시지를 결정하는 유틸리티 함수.
 * @param {number} risk - 현재 리스크 값 (0-100)
 * @returns {{colorClass: string, warningText: string}}
 */
const getRiskVisuals = (risk) => {
    let colorClass;
    let warningText;

    if (risk >= 75) {
        // Red Zone - 시스템 경고 최고 단계. 생존 위협 체감.
        colorClass = 'bg-red-600/90 ring-red-400';
        warningText = "🚨 CRITICAL: 당신의 시스템은 현재 즉각적인 붕괴 위험에 처해 있습니다.";
    } else if (risk >= 35) {
        // Orange Zone - 주의 단계. 행동 강제 필요.
        colorClass = 'bg-yellow-600/90 ring-yellow-400';
        warningText = "⚠️ WARNING: 시스템적 취약점이 감지되었습니다. 즉시 검토가 필요합니다.";
    } else {
        // Green Zone - 상대적으로 안정. 하지만 경고 메시지로 긴장감 유지.
        colorClass = 'bg-blue-600/90 ring-blue-400';
        warningText = "❗ ALERT: 초기 리스크는 낮으나, 시간적 누적 위험이 가속화되고 있습니다.";
    }

    return { colorClass, warningText };
};


/**
 * 게이트키핑 섹션 MVP 컴포넌트. 시간 경과에 따른 시스템 리스크 시뮬레이션을 담당합니다.
 */
const GatekeepingSection = () => {
    const [riskState, setRiskState] = useState({ riskLevel: INITIAL_RISK, timeLeft: INITIAL_TIME });
    const [message, setMessage] = useState("시스템 분석 대기 중...");

    // 1. 타이머 및 리스크 Decay 로직 (Core Logic)
    useEffect(() => {
        const timerId = setInterval(() => {
            setRiskState(prev => {
                let newTimeLeft = Math.max(0, prev.timeLeft - 1);
                let riskIncreaseRate = 0;

                // 시간이 지날수록 리스크가 증가합니다. (시간적 압박 부여)
                if (newTimeLeft > 0) {
                    riskIncreaseRate = 2 + Math.floor((INITIAL_TIME - newTimeLeft) / 60); // 시간 경과에 따라 증폭
                }

                let newRiskLevel = Math.min(100, prev.riskLevel + riskIncreaseRate);

                // 시간이 완전히 소진되면 리스크를 최대치로 고정합니다.
                if (newTimeLeft === 0) {
                    newRiskLevel = 100;
                }
                
                setMessage("시스템적 생존 위협 임계점에 도달했습니다. 지금 당장 전문가의 검토가 필수입니다.");

                return { riskLevel: newRiskLevel, timeLeft: newTimeLeft };
            });
        }, 1000); // 1초마다 업데이트

        // 컴포넌트 언마운트 시 인터벌 정리 (Cleanup)
        return () => clearInterval(timerId);
    }, []);


    const { riskLevel, timeLeft } = riskState;
    const { colorClass, warningText } = getRiskVisuals(riskLevel);
    
    // 리스크 게이지의 퍼센티지 계산 및 색상 결정
    const gaugePercent = Math.min(100, riskLevel);

    // 2. UI 렌더링 (Visualization)
    return (
        <div className="p-8 bg-gray-900 text-white shadow-2xl border-t-4 border-red-700">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight" 
                style={{ textShadow: '0 0 8px rgba(255, 0, 0, 0.5)' }}>
                {/* 글리치 효과를 모방한 경고 문구 */}
                <span className="animate-pulse">⚠️</span> <span className='text-red-400'>시스템 무결성 검사</span>가 진행 중입니다.
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mt-12 bg-gray-800 p-6 rounded-lg shadow-inner">
                
                {/* Col 1: QLoss Gauge (리스크 게이지) */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-3 text-red-400 flex items-center">
                        <FaExclamationTriangle className="mr-2" /> 시스템 리스크 레벨 (QLoss)
                    </h2>
                    <div className="w-full bg-gray-700 h-12 rounded-lg overflow-hidden mb-3 relative">
                        {/* 게이지 바: 리스크 수준에 따라 너비와 색상이 동적으로 변함 */}
                        <div 
                            className={`h-full transition-all duration-500 ease-linear ${colorClass} flex items-center justify-end`}
                            style={{ width: `${gaugePercent}%` }}
                        >
                            <span className="text-white text-sm px-3 transform -translate-y-1/2">
                                {Math.round(gaugePercent)}%
                            </span>
                        </div>
                    </div>
                    {/* 리스크 상세 정보 */}
                    <p className={`text-lg font-bold ${riskLevel >= 75 ? 'text-red-300' : 'text-yellow-200'}`}>
                        현재 위험도: {Math.round(gaugePercent)}% (경고 임계치 초과)
                    </p>
                </div>

                {/* Col 2: Timer & CTA (강제 행동 유도) */}
                <div className="lg:col-span-1 border-l border-gray-700 lg:pl-8">
                    <h2 className="text-xl font-semibold mb-3 text-blue-400 flex items-center">
                        <FaClock className="mr-2" /> 남은 분석 시간
                    </h2>
                    {/* 타이머 시각화 */}
                    <div className="text-6xl md:text-7xl font-mono tracking-wider mb-8 text-red-500">
                        {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
                    </div>

                    {/* 최종 CTA 블록 (최후 통첩) */}
                    <button className="w-full py-4 text-xl font-bold rounded-lg transition duration-300"
                        style={{ backgroundColor: '#CC0000', border: '2px solid #FF0000' }}
                        onClick={() => alert("✅ Setup Consulting 요청 로직 실행 (Next Step) ✅")}
                    >
                        지금 바로 전문가에게 문의하여 시스템적 무결성을 확보하십시오.
                    </button>

                    <p className="text-xs text-gray-400 mt-3">※ 이 분석은 시간 경과에 따라 리스크가 누적되는 과정을 시뮬레이션합니다.</p>
                </div>
            </div>

             {/* 최종 경고 메시지 */}
            <div className={`mt-8 p-4 rounded-lg text-center ${riskLevel >= 75 ? 'bg-red-900/30 border-l-4 border-red-500' : 'bg-yellow-900/30 border-l-4 border-yellow-500'}`}>
                <p className="text-lg font-medium text-white">{warningText}</p>
            </div>
        </div>
    );
};

export default GatekeepingSection;