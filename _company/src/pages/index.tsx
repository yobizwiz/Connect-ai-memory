// src/pages/index.tsx
import React, { useState } from 'react';
import LossMeterDisplay from '../components/LossMeterDisplay';
import RiskCalculatorForm from '../components/RiskCalculatorForm';
import { useRiskAnalysis } from '../hooks/useRiskAnalysis';

/**
 * @description yobizwiz의 핵심 MVP 랜딩 페이지 컴포넌트. 
 * 구조적 무결성을 담보하기 위해 모든 데이터 흐름을 통합함.
 */
const HomePage: React.FC = () => {
    // Step 1: 상태 관리 및 로직 호출 (useRiskAnalysis를 통해 비동기 로직 처리)
    const [initialData, setInitialData] = useState<InputData | null>({
        revenueLoss: 20, // 초기 테스트 값 설정
        complianceGapCount: 4,
        marketSentimentScore: -15
    });

    // useRiskAnalysis 훅을 통해 리스크 분석 상태와 함수를 얻습니다.
    const { result, isLoading, analyzeRisk } = useRiskAnalysis(initialData);


    // Step 2: 전역 데이터 처리 핸들러 (폼 제출 시 호출)
    const handleFormSubmit = async (data: InputData) => {
        setInitialData(data); // 상태 업데이트
        await analyzeRisk(data); // 비동기 분석 실행
    };

    return (
        <div className="min-h-screen bg-[#0A141E] text-white font-sans p-8">
            <header className="text-center mb-12 pt-6">
                <h1 className="text-6xl font-extrabold tracking-tight gradient-text text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-400">
                    yobizwiz - 구조적 무결성 진단 시스템 🛡️
                </h1>
                <p className="mt-3 text-xl text-gray-400 max-w-2xl mx-auto">
                    당신의 비즈니스가 직면한 '시스템적 생존 위협'을 데이터 기반으로 시각화하고 경고합니다.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
                {/* 왼쪽: 입력 폼 (사용자 액션 영역) */}
                <div>
                    <RiskCalculatorForm 
                        onSubmit={handleFormSubmit} 
                        isLoading={isLoading} 
                    />
                </div>

                {/* 오른쪽: 결과 표시 (시스템 출력 영역) */}
                <div>
                    <LossMeterDisplay result={result} />
                </div>
            </div>

            {/* CTA Footer - 최종 권위 부여 및 유도 */}
            <div className="mt-20 pt-10 border-t border-red-900/50 text-center">
                 <p className="text-xl font-mono mb-4 text-gray-300">[System Alert]: 현재 분석 결과는 가상의 데이터 흐름을 시뮬레이션했습니다. 실제 진단이 필요합니다.</p>
                <button 
                    onClick={() => alert("📞 전문가 컨설팅 요청 프로세스 시작... (실제 API 호출 지점)")}
                    className="py-4 px-12 text-xl font-bold rounded-full bg-[#C0392B] hover:bg-red-700 transition duration-300 shadow-xl shadow-red-900/80 transform hover:scale-[1.02]"
                >
                    지금 바로 전문가에게 구조적 진단 요청하기
                </button>
            </div>
        </div>
    );
};

export default HomePage;