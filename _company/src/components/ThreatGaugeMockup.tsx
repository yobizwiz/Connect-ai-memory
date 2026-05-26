// src/components/ThreatGaugeMockup.tsx

import React, { useState, useEffect } from 'react';

// --- Type Definitions ---
/**
 * 리스크 레벨에 따른 공통 스타일 및 텍스트 정의
 */
interface RiskLevelConfig {
    scoreThreshold: number; // 예: 0 - 25
    level: 'Low' | 'Medium' | 'High';
    colorClass: string; // Tailwind CSS class for background/text
    warningMessage: string; // 사용자에게 공포감을 줄 카피
}

/**
 * ThreatGaugeMockup 컴포넌트의 Props 정의
 * @param initialScore - 초기 리스크 점수 (0-100)
 */
interface ThreatGaugeProps {
    initialScore: number;
    isLoading?: boolean;
}

// --- Utility Functions (코드 원칙: Pure Logic 분리) ---

/**
 * 스코어를 기반으로 리스크 레벨과 스타일을 결정합니다.
 * @param score - 0부터 100 사이의 값.
 * @returns RiskLevelConfig 객체
 */
const getRiskLevel = (score: number): RiskLevelConfig => {
    let level: 'Low' | 'Medium' | 'High';
    let colorClass: string;
    let warningMessage: string;

    if (score < 30) { // 0 - 29%
        level = 'Low';
        colorClass = 'bg-green-600 ring-green-500/70';
        warningMessage = "현재는 관리 가능한 수준입니다. 하지만 방심은 금물합니다.";
    } else if (score < 70) { // 30 - 69%
        level = 'Medium';
        colorClass = 'bg-yellow-500 ring-yellow-400/70';
        warningMessage = "주의 필요. 규제 변경 리스크가 감지되었습니다. 즉각적인 검토가 필요합니다.";
    } else { // 70 - 100%
        level = 'High';
        colorClass = 'bg-red-600 ring-red-500/70 animate-pulse';
        warningMessage = "🚨 CRITICAL FAILURE IMMINENT. 존재론적 생존 위협 감지. 즉시 대응책을 마련하십시오.";
    }

    return {
        scoreThreshold: score,
        level: level,
        colorClass: colorClass,
        warningMessage: warningMessage,
    };
};


/**
 * ThreatGaugeMockup Component
 */
const ThreatGaugeMockup: React.FC<ThreatGaugeProps> = ({ initialScore, isLoading }) => {
    // 1. 상태 관리 (Loading 상태 시뮬레이션)
    const [score, setScore] = useState(initialScore);
    const [isProcessing, setIsProcessing] = useState<boolean>(isLoading !== undefined ? isLoading : true);

    // 2. 데이터 처리 및 애니메이션 효과 적용
    useEffect(() => {
        if (!initialScore) return;

        // API 호출을 시뮬레이션하는 비동기 로직
        setIsProcessing(true);
        const timer = setTimeout(() => {
            // 실제로는 여기서 백엔드 API를 호출하여 점수를 받아와야 합니다.
            setScore(Math.min(100, Math.max(0, initialScore))); // 스코어 클리핑
            setIsProcessing(false);
        }, 2500); // 2.5초 지연 (시간적 압박감 조성)

        return () => clearTimeout(timer);
    }, [initialScore]);


    // 3. 리스크 레벨 계산 및 상태 업데이트
    const { level, colorClass, warningMessage } = getRiskLevel(score);

    // 게이지의 너비는 스코어에 비례합니다. (0% ~ 100%)
    const gaugeWidthStyle: React.CSSProperties = {
        width: `${score}%`,
        transition: 'width 2s cubic-bezier(0, 0, 0.3, 1)', // 부드러운 변화 효과
        backgroundColor: level === 'High' ? '#b91c1c' : (level === 'Medium' ? '#d97706' : '#10b981'),
    };

    // 글리치/경고 메시지 효과를 위한 스타일링 클래스 조합
    const alertContainerClasses = `p-4 rounded-lg shadow-2xl transition-all duration-500 ${colorClass} bg-opacity-10 border-l-8 ${level === 'High' ? 'border-red-700 animate-pulse' : level === 'Medium' ? 'border-yellow-600' : 'border-green-600'}`;


    return (
        <div className="p-8 bg-gray-900 rounded-xl shadow-inner max-w-4xl mx-auto border border-red-900/50">
            <h2 className={`text-3xl font-extrabold mb-6 ${level === 'High' ? 'text-red-400 tracking-widest animate-glitch' : 'text-white'}`}>
                [🚨] System Warning Report - Threat Assessment
            </h2>

            {/* 1. 게이지 모듈 */}
            <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-red-700/50">
                <p className="text-sm uppercase text-gray-400 mb-2 tracking-widest">Overall Risk Score (Systemic Survival Threat)</p>
                <div className="flex justify-between items-end mb-1 text-xl font-mono">
                    <span className={`text-${level === 'High' ? 'red' : level === 'Medium' ? 'yellow' : 'green'} ${colorClass.replace('bg-', 'text-')}`}>{score}%</span>
                    <span className="text-gray-400 text-lg">100%</span>
                </div>

                {/* The Gauge Visualization */}
                <div className="w-full h-6 bg-gray-700 rounded-full overflow-hidden shadow-inner mb-2">
                    <div 
                        className={`h-full transition-all duration-1000 ease-out ${colorClass} flex items-center justify-end`} 
                        style={gaugeWidthStyle}
                        aria-label={`${score}% risk level`}
                    >
                         {/* 모의 글리치 효과 (시각적 강조) */}
                    </div>
                </div>
            </div>

            {/* 2. 경고 및 결과 출력 영역 */}
            <div className={alertContainerClasses}>
                <h3 className="text-xl font-bold mb-2 text-white flex justify-between items-center">
                     진단 결과: <span className={`uppercase ${level === 'High' ? 'text-red-400' : level === 'Medium' ? 'text-yellow-400' : 'text-green-400'} font-extrabold`}>{level} 리스크 레벨</span>
                </h3>
                <p className="text-lg text-gray-100">
                    {warningMessage} <br/> 
                    (다음 단계에서 해결책을 제시하여 긴급성을 해소해야 합니다.)
                </p>
            </div>

             {/* 로딩 표시 */}
            {isProcessing && (
                 <div className="mt-6 text-center p-4 border-2 border-dashed border-gray-700 rounded-lg">
                    <div className="flex justify-center items-center space-x-3">
                        <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-80" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.833 3 7.938l3-2.647z"></path></svg>
                        <p className="text-red-400 font-mono">API 호출 중... 시스템 무결성 검사 진행 (잠시만 기다려주십시오)</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThreatGaugeMockup;