// 개별 질문 카드 컴포넌트 (상태 업데이트 로직 포함)
import React, { useState } from 'react';
import { DiagnosticQuestion } from '../types/diagnostic-types';
import { useDiagnosisContext } from '../context/DiagnosisContext';

interface QuestionCardProps {
    question: DiagnosticQuestion;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
    const context = useDiagnosisContext();
    const [scoreInput, setScoreInput] = useState<number | ''>(null);

    // 로직 1: 점수 변경 핸들러 (유효성 검사 및 Context 업데이트)
    const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        let score: number | null = null;

        if (!isNaN(parseFloat(value))) {
            score = parseFloat(value);
        } else if (value === '') {
            score = null; // 빈 값 처리
        }

        // 방어 로직: 점수가 0과 Question의 최대 가중치 범위 내에 있는지 검사
        if (score !== null && score >= 0) {
             setScoreInput(score);
             context.updateAnswer(question.id, score); // Context 업데이트 및 재계산 트리거
        } else if (value === '') {
            setScoreInput(null);
            context.updateAnswer(question.id, null);
        }
    };

    // 초기 스코어를 Context에서 가져와 반영
    React.useEffect(() => {
        const initialScore = context.formData[question.id] || null;
        if (initialScore !== undefined && !isNaN(initialScore)) {
            setScoreInput(initialScore);
        } else {
             setScoreInput(null);
        }
    }, [question.id, context.formData]);

    return (
        <div style={{ 
            border: '1px solid #333', 
            padding: '20px', 
            margin: '20px 0', 
            background: '#252525' 
        }}>
            <h4>{question.title}</h4>
            <p style={{ color: '#A0A0FF', fontSize: '0.9em' }}>* 진단 포인트: {question.description}</p>
            <div style={{ marginTop: '15px' }}>
                <label htmlFor={`score-${question.id}`}>리스크 점수 (0~{Math.round(question.riskWeight * 100)}): </label>
                <input
                    type="number"
                    id={`score-${question.id}`}
                    value={scoreInput === null ? '' : scoreInput}
                    onChange={handleScoreChange}
                    style={{ width: '80px', padding: '5px', background: '#1A1A1A', border: '1px solid #444' }}
                />
            </div>
        </div>
    );
};

export default QuestionCard;