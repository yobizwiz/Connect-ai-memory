import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { allQuizQuestions, Question } from '../constants/quizData';
import QuizQuestionCard from '../components/QuizQuestionCard';
import ResultsReport from '../components/ResultsReport';

// --- [Type Definitions] ---
type UserAnswers = Record<number, 'A' | 'B' | 'C'>; // { questionId: selectedOptionId }

const INITIAL_SCORE = 0;

interface QuizPageProps {}

/**
 * @component QuizPage
 * 핵심 로직을 관리하는 페이지. UTM 파라미터를 읽고, 퀴즈 상태를 전역적으로 처리한다.
 */
const QuizPage: React.FC<QuizPageProps> = () => {
  // Next.js의 useRouter를 사용하여 URL 파라미터(UTM)에 접근합니다.
  const router = useRouter();

  // [State] 퀴즈 진행 상태 관리
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({}); // { QID: A/B/C }
  const [isLoading, setIsLoading] = useState(false);

  // 🚀 UTM 파라미터 추출 및 로깅 (진단 시작 시점 트래킹)
  React.useEffect(() => {
    // 실제 환경에서는 이 정보를 서버에 전송하여 리스크 점수 산출의 초기 조건으로 사용해야 합니다.
    const utmParams = new URLSearchParams(window.location.search);
    const source = utmParams.get('utm_source') || 'direct';
    console.log(`[Tracking] User entered from Source: ${source}`);

    // 실제로는 이 로직을 통해 초기 리스크 점수나 유저 프로필 정보를 가져와야 함.
  }, []);


  /**
   * @function handleAnswerSelection
   * 사용자가 답변 옵션을 선택했을 때, 상태를 업데이트하고 다음 질문으로 넘어가는 핵심 함수.
   * @param {number} questionId - 현재 질문의 ID
   * @param {'A' | 'B' | 'C'} selectedOptionId - 사용자가 선택한 옵션 ID
   */
  const handleAnswerSelection = (questionId: number, selectedOptionId: 'A' | 'B' | 'C') => {
    // 1. State 업데이트 및 유효성 검사 (Self-Check)
    setUserAnswers(prev => ({ ...prev, [questionId]: selectedOptionId }));

    // 2. 다음 단계로 이동 준비
    if (currentQuestionIndex < allQuizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
        // 마지막 질문을 넘긴 후는 '결과 보기' 버튼이 담당합니다.
    }
  };

  /**
   * @function calculateTotalScore
   * 모든 사용자 답변을 기반으로 누적 리스크 점수를 계산하는 핵심 비즈니스 로직입니다.
   */
  const calculateTotalScore = (): number => {
    let totalScore = 0;
    for (const [questionId, selectedOption] of Object.entries(userAnswers)) {
      // 데이터 매칭을 통해 선택된 옵션의 위험 점수를 가져와 합산합니다.
      const questionIndex = allQuizQuestions.findIndex(q => q.id === Number(questionId));
      if (questionIndex > -1) {
        const selectedQuestionOptions = allQuizQuestions[questionIndex].options;
        // 선택된 옵션의 riskScore를 찾아 더합니다.
        const selectedOptionData = selectedQuestionOptions.find(opt => opt.id === selectedOption);
        if (selectedOptionData && selectedOptionData.riskScore) {
          totalScore += selectedOptionData.riskScore;
        }
      }
    }
    return totalScore;
  };

  /**
   * @function handleSubmitQuiz
   * 모든 퀴즈 답변이 끝났을 때, 최종 점수 산출 후 결과 페이지로 이동하는 로직입니다.
   */
  const handleSubmitQuiz = () => {
    if (Object.keys(userAnswers).length !== allQuizQuestions.length) {
      alert("모든 질문에 응답해야 리스크 평가를 완료할 수 있습니다.");
      return;
    }

    setIsLoading(true);
    // 2초간의 로딩 시간과 시스템 부하 체감을 시뮬레이션합니다. (UX 강화)
    setTimeout(() => {
        const finalScore = calculateTotalScore();
        // 최종 점수와 답변 데이터를 Props로 넘겨 ResultsReport 컴포넌트가 받게 됩니다.
        console.log(`[System] Final Risk Score Calculated: ${finalScore}`);
        setIsLoading(false);

        // 실제 환경에서는 history.push('/report?score=' + finalScore) 와 같이 라우팅을 사용합니다.
    }, 2000);
  };


  // --- [Rendering Logic] ---

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">Analyzing Systemic Vulnerabilities... Please wait.</div>;
  }

  const currentQuestion = allQuizQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white p-8 font-inter">
      <Head>
        <title>Compliance Gateway Pro | Risk Assessment</title>
        <meta name="description" content="Structural Integrity Check - Your Financial & Legal Vulnerability Assessment." />
      </Head>

      <header className="text-center mb-12 border-b border-[#3A3A3A] pb-6">
        <h1 className="text-4xl font-extrabold text-red-500 tracking-wider">Compliance Gateway Pro</h1>
        <p className="text-lg mt-2 text-gray-400">Systemic Survival Threat Assessment V.2.1</p>
      </header>

      {currentQuestion && (
        <>
          {/* 💡 Question Card */}
          <QuizQuestionCard
            question={currentQuestion}
            onAnswerSelect={handleAnswerSelection}
            userSelectedId={userAnswers[currentQuestion.id] || null}
          />

          {/* ➡️ Navigation/Action Buttons */}
          <div className="flex justify-between mt-12 pt-8 border-t border-[#3A3A3A]">
            {/* 이전 버튼: 첫 질문일 때는 비활성화 */}
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className={`px-8 py-3 rounded transition duration-200 ${
                currentQuestionIndex === 0 ? 'bg-gray-700 cursor-not-allowed' : 'bg-[#2980B9] hover:bg-[#1F6A95]'
              }`}
            >
              &larr; 이전 질문
            </button>

            {/* 다음/제출 버튼 */}
            <button
              onClick={() => {
                if (currentQuestionIndex < allQuizQuestions.length - 1) {
                    setCurrentQuestionIndex(prev => prev + 1);
                } else {
                    // 마지막 질문일 때만 제출 로직 실행 가능
                    handleSubmitQuiz();
                }
              }}
              disabled={!userAnswers[currentQuestion.id]} // 답변하지 않았으면 비활성화
              className={`px-8 py-3 rounded transition duration-200 ${
                !userAnswers[currentQuestion.id] 
                  ? 'bg-gray-700 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/50'
              }`}
            >
              {currentQuestionIndex === allQuizQuestions.length - 1 ? "위협 평가 실행 (Submit)" : "다음 질문 &rarr;"}
            </button>
          </div>
        </>
      )}

      {/* 마지막 단계 처리 로직을 위한 Dummy Div */}
      <div style={{ display: 'none' }} />
    </div>
  );
};

export default QuizPage;