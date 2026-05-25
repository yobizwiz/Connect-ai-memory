// src/pages/diagnosis-tool.tsx
import React, { useState, useCallback } from 'react';
import { calculateThreatIndex, getChecklistQuestions, getThreatDisplay } from '../services/threatIndexCalculator';

/**
 * 체크리스트 항목의 타입 정의 (구조적 안정성 확보)
 */
interface Question {
    id: string; // 고유 ID (예: q1_1)
    text: string;
}

// -------------------------
// UI Components
// -------------------------

/**
 * 개별 체크리스트 질문을 렌더링하는 컴포넌트.
 */
const DiagnosticQuestion: React.FC<{ question: Question, onAnswerChange: (id: string, answer: 'yes' | 'no') => void, currentAnswer: 'yes' | 'no' }> = ({ question, onAnswerChange, currentAnswer }) => {
    return (
        <div className="py-4 border-b last:border-b-0">
            <p className="text-lg font-semibold text-gray-800 mb-3">{question.text}</p>
            <div className="flex space-x-6">
                {/* Yes (위험) 옵션 */}
                <button
                    onClick={() => onAnswerChange(question.id, 'yes')}
                    className={`py-2 px-6 rounded-lg transition duration-150 border ${currentAnswer === 'yes' ? 'bg-red-50 border-red-700 text-red-800 shadow-md scale-[1.02]' : 'bg-white border-gray-300 hover:bg-gray-50'} flex items-center`}
                >
                    <span className="mr-2">✅ Yes (예)</span>
                </button>
                {/* No (안전) 옵션 */}
                <button
                    onClick={() => onAnswerChange(question.id, 'no')}
                    className={`py-2 px-6 rounded-lg transition duration-150 border ${currentAnswer === 'no' ? 'bg-green-50 border-green-700 text-green-800 shadow-md scale-[1.02]' : 'bg-white border-gray-300 hover:bg-gray-50'} flex items-center`}
                >
                    <span className="mr-2">❌ No (아니오)</span>
                </button>
            </div>
        </div>
    );
};

/**
 * 메인 진단 툴 페이지 컴포넌트.
 */
const DiagnosisTool: React.FC = () => {
    // [근거: Researcher의 체크리스트 내용을 기반으로 초기 상태 설정]
    const questionsData = getChecklistQuestions().questions;
    const initialState: Record<string, 'yes' | 'no'> = {};

    const [answers, setAnswers] = useState<Record<string, 'yes' | 'no'>>(initialState);
    const [isLoading, setIsLoading] = useState(false);
    const [diagnosisResult, setDiagnosisResult] = useState<{ threatLevel: string; score: number; maxScore: number } | null>(null);

    /**
     * 사용자가 답변을 변경할 때 상태를 업데이트합니다.
     */
    const handleAnswerChange = useCallback((id: string, answer: 'yes' | 'no') => {
        setAnswers(prev => ({ ...prev, [id]: answer }));
        // 답변 즉시 진단 결과를 리셋하여 사용자가 재점검하도록 유도
        setDiagnosisResult(null); 
    }, []);

    /**
     * 최종적으로 위협 지수를 계산하고 UI를 업데이트합니다.
     */
    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }
        if (Object.keys(answers).length === 0) {
            alert("진단에 응답할 항목을 선택해 주세요.");
            return;
        }
        setIsLoading(true);

        try {
            // [근거: src/services/threatIndexCalculator.ts의 calculateThreatIndex 함수 호출]
            const result = await calculateThreatIndex(answers);
            setDiagnosisResult(result);
        } catch (error) {
            console.error("진단 계산 오류:", error);
            alert("시스템 분석 중 오류가 발생했습니다. 관리자에게 문의해 주세요.");
        } finally {
            setIsLoading(false);
        }
    }, [answers]);

    /**
     * Red Zone 경고 배너를 렌더링하는 컴포넌트 (핵심 시각적 피드백)
     */
    const ThreatAlertBanner = ({ level, message }: { level: string; message: string }) => (
        <div className={`p-6 rounded-xl shadow-2xl transition duration-500 ${level === 'High' ? 'bg-red-900/80 border-4 border-red-700 animate-pulse' : level === 'Medium' ? 'bg-yellow-900/80 border-4 border-yellow-600' : 'bg-green-100 border-4 border-green-500'} flex items-center space-x-3`}>
            <div className="text-3xl">🔥</div> {/* Red Zone 시각화 요소 */}
            <div>
                <h2 className={`text-2xl font-extrabold ${level === 'High' ? 'text-red-400' : level === 'Medium' ? 'text-yellow-400' : 'text-green-600'}`}>
                    {`[${level} 위협 등급]`}
                </h2>
                <p className="text-lg font-medium">{message}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white shadow-2xl rounded-xl">
            <header className="mb-10 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-gray-900">🚨 시스템적 리스크 자가진단 툴</h1>
                <p className="text-lg mt-2 text-gray-600">당신의 프로세스에 숨겨진 '법적 사각지대'를 점검하십시오. (MVP)</p>
            </header>

            {/* 1. 진단 결과 섹션 (가장 먼저, 가장 크게 보여야 함) */}
            <div className="mb-12 p-6 bg-gray-50 rounded-lg shadow-inner">
                {!diagnosisResult && !isLoading ? (
                    <div className='p-4 border border-dashed text-center text-gray-500'>
                        진단 결과는 아래 체크리스트에 응답하신 후 '분석 시작' 버튼을 눌러주세요.
                    </div>
                ) : diagnosisResult ? (
                    <ThreatAlertBanner 
                        level={diagnosisResult.threatLevel} 
                        message={getThreatDisplay(diagnosisResult.threatLevel).message} 
                    />
                ) : null}

                {/* 점수 상세 정보 표시 */}
                {(diagnosisResult || isLoading) && diagnosisResult && (
                    <div className="mt-4 text-sm space-y-1">
                        <p>📊 **총 위협 지수:** <span className={`text-xl font-bold ${diagnosisResult.threatLevel === 'High' ? 'text-red-600' : diagnosisResult.threatLevel === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>{diagnosisResult.score} / {diagnosisResult.maxScore}</span></p>
                        <p className='text-gray-500'>(*점수가 높을수록 시스템적 리스크가 크며, 전문적인 진단이 시급합니다.)</p>
                    </div>
                )}
            </div>

            {/* 2. 질문 체크리스트 섹션 */}
            <form className="space-y-8">
                <h2 className="text-xl font-bold border-b pb-2 text-gray-700">체크리스트 응답</h2>
                
                {/* Researcher의 첫 번째 리스크 영역을 구현합니다. */}
                <div className='p-5 bg-red-50 rounded-lg'>
                    <h3 className="text-xl font-bold text-red-800 mb-4">I. 데이터 처리 및 보안 리스크 (PII 유출)</h3>
                    {questionsData.map(q => (
                        <DiagnosticQuestion 
                            key={q.id} 
                            question={q} 
                            onAnswerChange={handleAnswerChange} 
                            currentAnswer={answers[q.id] || 'no'} // 기본값 설정
                        />
                    ))}
                </div>

                {/* Placeholder for other sections (구조적 확장성 확보) */}
                <div className="p-5 border-2 border-dashed border-gray-300 text-center bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-bold text-gray-700">II. 프로세스 및 시스템 리스크</h3>
                    <p className='mt-2 text-sm text-gray-500'>여기에 추가 섹션이 확장될 예정입니다. (예: q2_1, q2_2)</p>
                </div>

                {/* 3. 제출 버튼 */}
                <div className="pt-8 border-t mt-10 flex justify-center">
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e)}
                        disabled={isLoading}
                        className={`px-12 py-3 text-lg font-bold rounded-full transition duration-300 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-700 hover:bg-red-800 shadow-xl transform hover:scale-[1.02]'} text-white`}
                    >
                        {isLoading ? '⚙️ 시스템 분석 중...' : '✨ 위협 지수 계산 및 진단 시작'}
                    </button>
                </div>
            </form>

            <div className="mt-10 pt-6 border-t text-center">
                 <p className='text-sm text-gray-500'>*이 진단은 전문적인 컨설팅을 대체할 수 없으며, 최종 결정 전 반드시 전문가와 상의해야 합니다.</p>
            </div>
        </div>
    );
};

export default DiagnosisTool;