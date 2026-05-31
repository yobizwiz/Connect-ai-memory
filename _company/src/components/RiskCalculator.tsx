"use client"; // Next.js Client Component 설정
import React, { useState, useMemo } from 'react';
// src/services/RiskGatewayService에서 정의한 로직을 가져옵니다.
import { calculateTREScore } from '@/services/RiskGatewayService'; 

/**
 * 리스크 계산기의 개별 컴플라이언스 입력 필드입니다.
 */
interface RiskInputProps {
    riskId: string;
    name: string; // JSON 데이터셋의 risk_id와 일치해야 함
    description: string;
    onGapChange: (riskId: string, score: number) => void;
    currentScore: number;
}

const RiskInputComponent: React.FC<RiskInputProps> = ({ 
    riskId, description, onGapChange, currentScore 
}) => {
    const [gapScore, setGapScore] = useState(Math.min(100, Math.max(0, currentScore)));

    // 사용자 입력 변경 핸들러 (Defensive Input Handling)
    const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let score: number;
        try {
            score = parseFloat(value);
            if (isNaN(score)) throw new Error("Invalid");
        } catch (error) {
            return; // 유효하지 않은 입력은 무시
        }
        setGapScore(score);
        onGapChange(riskId, score); // 부모 컴포넌트의 상태를 업데이트합니다.
    };

    return (
        <div className="p-4 border border-gray-700 bg-gray-900/50 rounded-lg shadow-xl mb-6 transition duration-300 hover:bg-gray-800">
            <h3 className="text-xl font-bold text-red-400 mb-2">{riskId}</h3>
            <p className="text-sm text-gray-400 mb-4">{description}</p>
            
            {/* Gap Score 입력 필드 */}
            <div>
                <label htmlFor={`gap-${riskId}`} className="block text-sm font-medium text-white mb-1">
                    현행 컴플라이언스 격차 점수 (Gap Score, 0-100):
                </label>
                <input
                    type="number"
                    id={`gap-${riskId}`}
                    min="0"
                    max="100"
                    value={gapScore}
                    onChange={handleScoreChange}
                    className="w-full p-3 bg-gray-700 border border-red-600 text-white rounded focus:ring-red-500 focus:border-red-500 transition duration-150"
                />
            </div>
        </div>
    );
};

/**
 * 핵심 리스크 점수 계산기 컴포넌트 (MVP 시뮬레이션).
 * @description 규제 위반 사례별 입력값에 따라 시스템적 위험 레벨을 실시간으로 경고합니다.
 */
const RiskCalculator: React.FC = () => {
    // 🚨 초기 상태 설정: 모든 리스크 ID를 key로 사용하여 상태를 관리합니다.
    const [riskScores, setRiskScores] = useState<Record<string, number>>({});

    // JSON 데이터셋의 구조를 기반으로 기본 리스크 항목을 불러옵니다. (하드코딩 최소화)
    // 실제로는 API 호출 시 이 데이터가 로드되어야 합니다.
    const initialRisks: { riskId: string; description: string }[] = [
        { riskId: "R-AI-001", description: "LLM 출처 불명확성으로 인한 법률적 배상 리스크 (Source_Attribution_Deficit)." },
        { riskId: "R-DATA-002", description: "데이터 공유 프로세스 부재로 인한 시스템 감사 추적 실패 위험 (Compliance_Drift_Score)." },
        { riskId: "R-GEO-003", description: "국경 간 데이터 주권 위반으로 인한 운영 무효화 리스크." }
    ];

    // Gap Score 변경 핸들러 (State Update & Defensive Guard)
    const handleGapChange = (riskId: string, score: number) => {
        setRiskScores(prev => ({ ...prev, [riskId]: Math.max(0, Math.min(100, score)) }));
    };

    // ⭐️ 핵심 계산 로직 (Memoization을 사용해 불필요한 재계산을 방지합니다.)
    const result = useMemo(() => {
        // 입력값 배열 구성: [{ riskId: 'R-AI-001', gapScore: 85 }, ...]
        const inputs: Array<{ riskId: string; gapScore: number }> = initialRisks.map(risk => ({
            riskId: risk.riskId,
            gapScore: riskScores[risk.riskId] || 0 // score가 없으면 0으로 기본값 설정
        }));

        // Gateway Service 호출 (여기서 실제 API call이 들어갈 자리)
        return calculateTREScore(inputs);
    }, [riskScores]); // riskScores가 변경될 때만 재실행

    // 리스크 레벨에 따른 스타일링 함수 (공포감 극대화)
    const getLevelStyle = (level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
        switch(level) {
            case 'CRITICAL': return "bg-red-900/80 border-red-600 text-red-300 animate-pulse";
            case 'HIGH': return "bg-yellow-900/70 border-yellow-500 text-yellow-200";
            case 'MEDIUM': return "bg-blue-900/70 border-blue-400 text-blue-100";
            default: return "bg-green-900/60 border-green-500 text-green-300";
        }
    };

    return (
        <div className="p-8 bg-[#1a1a2e] rounded-xl shadow-2xl max-w-4xl mx-auto border-4 border-red-700/50">
            {/* Header Section: 시스템 경고 느낌 부여 */}
            <header className="mb-8 pb-4 border-b-2 border-red-600 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-white uppercase tracking-widest">
                        [🚨 시스템 리스크 분석 모듈]
                    </h1>
                    <p className="text-sm text-red-400 mt-1">
                        지정된 규제 데이터 기반, 운영 무결성(Integrity)을 평가합니다.
                    </p>
                </div>
            </header>

            {/* 1. 입력 영역: 리스크 항목별 점수 입력 */}
            <section className="mb-10">
                <h2 className="text-2xl font-bold text-red-500 mb-6 border-l-4 pl-3 border-red-700">
                    ▶︎ 1단계: 개별 리스크 격차 점수 입력 (Manual Input)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {initialRisks.map((risk, index) => (
                        <RiskInputComponent
                            key={risk.riskId}
                            riskId={risk.riskId}
                            description={risk.description}
                            onGapChange={handleGapChange}
                            currentScore={riskScores[risk.riskId] || 0}
                        />
                    ))}
                </div>
            </section>

            {/* 2. 출력 영역: 최종 결과 (TRE Score & Level) */}
            <section className="mt-12 pt-8 border-t-4 border-red-700">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <span className='mr-3'>⚙️</span> 2단계: 종합 리스크 점수 산출 (TRE Score)
                </h2>

                {/* 결과 카드: 경고 레벨에 따른 시각적 차별화 */}
                <div className={`p-6 rounded-xl shadow-inner border-4 ${getLevelStyle(result.riskLevel)} transition duration-500 transform scale-[1.01]`}>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm uppercase tracking-wider opacity-80">최종 리스크 레벨 판단</p>
                            <h3 className={`text-5xl font-extrabold ${result.riskLevel === 'CRITICAL' ? 'scale-110 animate-[pulse_1s_infinite]' : ''}`}>
                                {result.riskLevel}
                            </h3>
                        </div>
                        <div>
                            <p className="text-sm uppercase tracking-wider opacity-80">종합 리스크 점수 (TRE Score)</p>
                            <h3 className="text-6xl font-extrabold">{result.treScore} <span className='text-3xl'>/ 100</span></h3>
                        </div>
                    </div>
                </div>

                {/* 경고 메시지 */}
                <div className="mt-8 p-5 bg-[#2c0e1d] border-l-4 border-red-600 rounded shadow-lg">
                    <p className="text-xl font-semibold text-white mb-2">📢 시스템 보고서: 최종 진단</p>
                    <p className="text-lg text-gray-200">{result.message}</p>
                </div>
            </section>
        </div>
    );
};

export default RiskCalculator;