import React from 'react';

/**
 * 시스템 분석 중임을 시각적으로 알리는 컴포넌트. 
 * 글리치 효과와 네온 느낌을 주는 것이 중요합니다.
 */
const LoadingIndicator: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center p-10 bg-[#1A1A1A] border-t border-l border-[#2980B9]/50">
            <svg className="animate-spin h-16 w-16 text-[#2980B9]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-80" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12h1C4 10.343 6.343 8 8 8V4h8v4c-1.657 0-3.343 2-8 4z"></path>
            </svg>
            <p className="mt-4 text-xl text-[#C0392B] font-mono tracking-widest">
                [ANALYZING] 구조적 리스크 데이터를 매칭 중...
            </p>
            <p className="text-sm text-gray-400 mt-1">
                (시스템 부하: 85% / 위험도 분석 시간: 약 2초)
            </p>
        </div>
    );
};

export default LoadingIndicator;