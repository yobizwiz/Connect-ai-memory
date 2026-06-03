import React from 'react';

interface Option {
  key: 'A' | 'B' | 'C';
  label: string;
}

interface QuizProps {
  question: { id: string; title: string; options: Option[] };
  onAnswer: (answerKey: 'A' | 'B' | 'C') => void;
}

const QuizStep: React.FC<QuizProps> = ({ question, onAnswer }) => {
  // 실제 구현에서는 onClick 핸들러를 사용해 답변을 기록하고 다음 단계로 넘어갑니다.
  // 여기서는 Mockup이므로 버튼 클릭 시 단순히 임시 답변(A)을 가정합니다.

  return (
    <div className="space-y-8">
      {/* 질문 제목과 경고 */}
      <div className={`p-4 rounded-lg ${question.id === 'Q1' ? 'bg-yellow-900/50 border-l-4 border-yellow-500' : 'bg-gray-700'} shadow-md`}>
        <h2 className="text-xl font-bold text-red-300 mb-2">⚠️ {question.id}</h2>
        <p className="text-lg text-white">{question.title}</p>
        <p className="mt-2 text-sm text-gray-400 italic">
          [진단 목적]: 이 질문은 귀사의 '운영 중단 및 법적 책임'에 대한 취약점을 측정합니다. 답변을 신중히 선택하세요.
        </p>
      </div>

      {/* 옵션 선택 */}
      <div className="space-y-4">
        {question.options.map((option) => (
          <button
            key={option.key}
            onClick={() => onAnswer(option.key)} // 실제로는 답변을 state에 저장해야 함
            className="w-full py-3 px-4 bg-gray-700 hover:bg-red-600 transition duration-200 rounded-lg text-left border-b-4 border-transparent hover:border-yellow-500 flex justify-between items-center"
          >
            <span className="text-xl font-semibold">{option.key}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      {/* 네비게이션 버튼 */}
      <div>
        <button
          onClick={() => onAnswer('A')} // Mockup: 다음으로 강제 이동
          className="w-full py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg transition duration-200 shadow-lg mt-6"
        >
          다음 질문으로 진행 (Mockup) ➡️
        </button>
      </div>
    </div>
  );
};

export default QuizStep;