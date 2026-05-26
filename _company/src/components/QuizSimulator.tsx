/**
 * src/components/QuizSimulator.tsx
 * 메인 퀴즈 시뮬레이터 컴포넌트. QuizState를 관리하고, API 연동과 UI 전환을 처리합니다.
 */

import React, { useState } from 'react';
import { QuizQuestion, QuizState, DiagnosisResult, DiagnosisError } from '../types/quizTypes';
import { submitQuizData } from '../services/mockApi';

// ⚠️ 실제 개발 시에는 모든 Question 목록이 여기에 로드되어야 합니다. 여기서는 예시로 사용합니다.
const MOCK_QUIZ_QUESTIONS: Array<QuizQuestion> = [
  { id: 'Q1', category: 'A', questionText: "회사 프로세스 중 가장 신뢰하는 리스크 검증 방법은 무엇입니까?", options: [{ optionKey: 'a', text: "경험적 판단에 의존한다.", pointValue: 2 }, { optionKey: 'b', text: "표준 가이드라인 기반 점검", pointValue: 5 }, { optionKey: 'c', text: "구조적으로 선제 대응한다.", pointValue: 18 }] },
  { id: 'Q2', category: 'B', questionText: "새로운 기능 출시 전, 가장 먼저 검토해야 할 것은 무엇입니까?", options: [{ optionKey: 'a', text: "개발팀의 만족도 높은 구현 여부.", pointValue: 3 }, { optionKey: 'b', text: "핵심 비즈니스 흐름에 대한 영향 범위 분석.", pointValue: 8 }, { optionKey: 'c', text: "예상치 못한 외부 규제 변화가 없는지 법률적 검토.", pointValue: 15 }] },
];

// --- 컴포넌트 정의 시작 ---

const QuizSimulator: React.FC = () => {
  const [state, setState] = useState<QuizState>({
    currentQuestionIndex: 0,
    accumulatedScore: 0,
    selectedAnswers: {} as Record<string, string>,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<DiagnosisError | null>(null);

  // 1. 답변 처리 핸들러 (핵심 로직)
  const handleAnswerClick = (option: { optionKey: string; pointValue: number }) => {
    if (state.currentQuestionIndex >= MOCK_QUIZ_QUESTIONS.length || isLoading) return;

    const currentQId = MOCK_QUIZ_QUESTIONS[state.currentQuestionIndex].id;
    
    // 상태 업데이트: 점수 누적 및 답변 기록
    setState(prev => ({
      ...prev,
      selectedAnswers: { ...prev.selectedAnswers, [currentQId]: option.optionKey },
      accumulatedScore: prev.accumulatedScore + option.pointValue, // 🟢 리스크 점수 누적 로직 구현 (핵심)
    }));

    // 다음 질문으로 이동하거나, 마지막이면 제출 준비 상태로 전환
    if (state.currentQuestionIndex < MOCK_QUIZ_QUESTIONS.length - 1) {
      setState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 }));
    } else {
      // 마지막 질문 후 버튼 비활성화 및 제출 유도
      console.log("Quiz completed. Ready for submission.");
    }
  };

  // 2. 결과 보고서 생성 핸들러 (Mock API 연동)
  const handleSubmit = async () => {
    if (state.currentQuestionIndex < MOCK_QUIZ_QUESTIONS.length - 1 || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Mock API 호출: 데이터 수집 및 리스크 보고서 생성 시뮬레이션 (핵심)
      const resultData = await submitQuizData(state); 
      setResult(resultData);

    } catch (e) {
      console.error("API Submission Failed:", e);
      setError('API_FAILURE'); // 에러 상태 설정
    } finally {
      setIsLoading(false);
    }
  };


  // --- UI 렌더링 로직 ---

  if (result) {
    return <DiagnosisReport result={result} onReset={() => setResult(null)} />;
  }

  if (error) {
    return <div className="p-8 bg-red-900/70 text-white rounded-lg">
      <h2 className="text-xl font-bold mb-4">❌ 시스템 오류 발생 (Error Code: API_FAILURE)</h2>
      <p>데이터 전송 과정에서 구조적인 문제가 감지되었습니다. 잠시 후 다시 시도하거나, 전문가에게 직접 문의하십시오.</p>
    </div>;
  }

  if (!MOCK_QUIZ_QUESTIONS[state.currentQuestionIndex]) {
     return <div className="p-8">퀴즈 콘텐츠를 로드할 수 없습니다. 관리자에게 문의해주세요.</div>
  }


  const currentQuestion = MOCK_QUIZ_QUESTIONS[state.currentQuestionIndex];

  return (
    <div className="max-w-3xl mx-auto p-8 bg-gray-900/70 rounded-xl shadow-2xl text-white">
      {/* 🔴 글리치/경고 오버레이 시뮬레이션 */}
      <div className={`absolute inset-0 opacity-${isLoading ? '50' : '0'} transition-opacity pointer-events-none ${isLoading ? 'animate-glitch' : ''}`}></div>

      <h1 className="text-3xl font-bold text-red-400 mb-6 border-b border-red-700 pb-2">
        🚨 리스크 진단 시스템 🔴 (총 {MOCK_QUIZ_QUESTIONS.length} / ${state.currentQuestionIndex + 1})
      </h1>

      <div className="space-y-8">
        {/* 질문 카드 */}
        <div className="p-6 bg-gray-800 rounded-lg shadow-inner border-l-4 border-red-500">
          <h2 className="text-xl font-semibold mb-4">{currentQuestion.questionText}</h2>
          <p className="text-sm text-red-300 mb-6">💡 팁: 답변은 법적, 구조적 취약점을 중심으로 생각해야 합니다.</p>

          {/* 옵션 선택 */}
          <div className="space-y-4">
            {currentQuestion.options.map((option) => (
              <button
                key={option.optionKey}
                onClick={() => handleAnswerClick(option)}
                disabled={isLoading}
                className={`w-full p-4 text-left rounded-lg transition duration-200 border ${
                  state.selectedAnswers[currentQuestion.id] === option.optionKey
                    ? 'bg-red-800/70 border-red-500 shadow-lg' // 선택된 옵션
                    : isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-700 border-gray-600'
                } ${!isLoading && state.selectedAnswers[currentQuestion.id] === option.optionKey ? 'ring-2 ring-red-400' : ''}`}
              >
                <span className="font-mono mr-3 text-red-400">[{option.optionKey.toUpperCase()}]</span>
                {option.text} ({option.pointValue}점 리스크 가중)
              </button>
            ))}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-between pt-4 border-t border-gray-700">
          <button
            onClick={() => { /* 이전 질문으로 돌아가는 로직 */ }}
            disabled={state.currentQuestionIndex === 0 || isLoading}
            className="px-6 py-3 bg-gray-600 text-white rounded disabled:opacity-50 cursor-not-allowed"
          >
            &larr; 이전 질문
          </button>

          <button
            onClick={handleSubmit}
            disabled={!state.selectedAnswers[currentQuestion.id] || isLoading} // ⚠️ 답변이 있어야만 제출 가능
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded disabled:opacity-50 transition duration-150 shadow-md"
          >
            {isLoading ? '분석 중... 잠시 대기하십시오...' : '진단 보고서 요청 (API 호출)'}
          </button>
        </div>
      </div>

    </div>
  );
};


// --- 보조 컴포넌트: 진단 리포트 ---

interface DiagnosisReportProps {
  result: DiagnosisResult;
  onReset: () => void;
}

const DiagnosisReport: React.FC<DiagnosisReportProps> = ({ result, onReset }) => {
    const { totalScore, riskLevel, reportTitle, detailedFindings } = result;

    // 레벨별 색상 및 설명 정의 (강한 위기감 유도)
    const getRiskStyles = (level: 'Low' | 'Medium' | 'High') => {
        switch(level) {
            case 'High': return { bg: 'bg-red-900', text: 'text-red-300', border: 'border-red-700', emoji: '🚨' };
            case 'Medium': return { bg: 'bg-yellow-900/70', text: 'text-yellow-200', border: 'border-yellow-500', emoji: '⚠️' };
            case 'Low': return { bg: 'bg-green-900/70', text: 'text-green-300', border: 'border-green-500', emoji: '✅' };
        }
    };

    const styles = getRiskStyles(riskLevel);

    return (
        <div className="max-w-4xl mx-auto p-10 bg-gray-900 rounded-xl shadow-2xl text-white">
            {/* 헤더: 충격적이고 권위적인 보고서 시작 */}
            <header className={`p-6 mb-8 border-l-8 ${styles.border} ${styles.bg}`}>
                <h1 className="text-4xl font-extrabold tracking-wider mb-2">{styles.emoji} {reportTitle}</h1>
                <p className="text-lg mt-2">진단 분석 리포트 | 최종 취약점 레벨: <span className={`font-bold uppercase ${styles.text}`}>{riskLevel}</span></p>
            </header>

            {/* 1. 요약 및 점수 */}
            <div className="mb-8 p-6 bg-gray-800 rounded-lg border-b-4 border-red-500">
                <h2 className="text-2xl font-bold text-red-400 mb-3">📊 분석 요약</h2>
                <p className="text-xl">측정된 총 리스크 점수: <span className="font-mono text-2xl ml-2">{totalScore}</span> / 60점</p>
                <p className="mt-3 text-gray-400">이 점수는 고객님의 조직 시스템에 존재하는 잠재적, 구조적 취약점을 정량적으로 측정합니다.</p>
            </div>

            {/* 2. 상세 발견 사항 (핵심) */}
            <div>
                <h2 className="text-2xl font-bold text-red-400 mb-5 border-b border-gray-700 pb-2">🔍 핵심 취약점 분석</h2>
                <div className="space-y-6">
                    {detailedFindings.map((finding, index) => (
                        <div key={index} className={`p-4 rounded-lg shadow-md ${finding.severity > 1 ? 'bg-red-900/30 border-l-4 border-red-500' : 'bg-gray-800 border-l-4 border-yellow-500'}`}>
                            <h3 className="text-xl font-bold mb-2 flex items-center">
                                {finding.severity > 1 ? `${styles.emoji} ${riskLevel === 'High' && finding.category === 'A' ? '법적 무효화' : ''}` : `ℹ️ ${finding.category} 카테고리 취약점`}
                            </h3>
                            <p className="text-gray-300">{finding.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. CTA 버튼 */}
             <div className="mt-12 text-center">
                 <button 
                     onClick={onReset}
                     className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition duration-200"
                 >
                    다른 진단 테스트 실행하기 (재검증)
                 </button>
            </div>
        </div>
    );
};

export default QuizSimulator;