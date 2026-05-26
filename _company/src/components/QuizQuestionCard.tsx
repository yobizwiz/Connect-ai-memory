import React from 'react';
import { Question, QuizOption } from '../constants/quizData';

interface QuizQuestionCardProps {
  question: Question;
  onAnswerSelect: (id: number, optionId: 'A' | 'B' | 'C') => void;
  userSelectedId: 'A' | 'B' | 'C' | null;
}

/**
 * @component QuizQuestionCard
 * 현재 질문과 답변 옵션들을 렌더링하고 선택 이벤트를 처리합니다.
 */
const QuizQuestionCard: React.FC<QuizQuestionCardProps> = ({ question, onAnswerSelect, userSelectedId }) => {
  return (
    <div className="bg-[#252525] p-10 rounded-xl shadow-2xl border-t-4 border-red-600/80 mb-12">
      {/* 섹션 헤더 */}
      <div className="mb-8 pb-4 border-b border-gray-700">
        <p className="text-sm uppercase tracking-widest text-red-500 font-mono">{question.sectionTitle}</p>
        <h2 className="text-3xl font-bold mt-1 mb-3">{question.title}</h2>
        <div className='bg-[#3A3A3A] p-4 rounded text-sm'>
            {/* 🚨 경고 문구 스타일링 */}
            <span className="inline-block mr-2">⚠️</span>
            <p>{question.questionText}</p>
        </div>
      </div>

      {/* 옵션 목록 */}
      <div className="space-y-6">
        {question.options.map((option) => {
          const isSelected = userSelectedId === option.id;
          const isWarning = option.isWarning;

          return (
            <div 
              key={option.id} 
              onClick={() => onAnswerSelect(question.id, option.id)}
              className={`cursor-pointer p-5 rounded-lg border transition duration-200 ${
                isSelected ? 'border-[#C0392B] bg-[#3A1D1F] shadow-inner' : 'border-gray-700 hover:bg-[#2E2E2E]'
              }`}
            >
              <div className="flex items-start">
                {/* 옵션 라벨 */}
                <span className={`font-mono text-xl mr-4 pt-1 ${isSelected ? 'text-red-500' : 'text-gray-400'}`}>{option.id}.</span>
                
                <div>
                    <p className="text-lg font-semibold">{option.text}</p>
                    {/* 위험 감지 경고 메시지 (Writer의 내용 활용) */}
                    {isWarning && (
                        <div className="mt-2 p-3 bg-[#4a1b1f] border-l-4 border-red-600 text-sm text-yellow-200 shadow-md">
                            🚨 경고: {option.text.includes('담당자') ? "인적 오류 위험 감지 (Human Error Risk Detected)" : "시스템적 결함 가능성 높음."}
                        </div>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizQuestionCard;