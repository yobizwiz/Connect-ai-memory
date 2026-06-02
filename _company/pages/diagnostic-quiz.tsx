import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import QuizStep from '../components/QuizStep';
import ResultDisplay from '../components/ResultDisplay';

const DiagnosticQuizPage: React.FC = () => {
  // 퀴즈의 전체 상태를 관리합니다.
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // 사용자가 답변한 모든 기록을 저장합니다.
  const [userAnswers, setUserAnswers] = useState<{ questionId: string; answerKey: 'A' | 'B' | 'C' }[]>([]);
  // 점수 계산 결과를 임시로 저장합니다. (최종 결과 화면에서 사용)
  const [totalRiskScore, setTotalRiskScore] = useState<number | null>(null);
  // 퀴즈가 완료되었는지 상태를 관리합니다.
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  /**
   * 다음 질문으로 넘어갈 때 호출됩니다.
   */
  const handleNext = useCallback((answer: 'A' | 'B' | 'C') => {
    // 현재 답변을 기록합니다. (이것이 백엔드 API로 전송될 데이터입니다.)
    const currentQuestionId = `Q${currentQuestionIndex + 1}`;
    setUserAnswers(prev => [...prev, { questionId: currentQuestionId, answerKey: answer }]);

    if (currentQuestionIndex < 9) { // 총 10개 질문 가정 (실제 데이터에 맞게 조정 필요)
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // 마지막 단계 도달 시, 점수 계산을 트리거합니다.
      setIsQuizComplete(true);
      // 실제 환경에서는 여기서 API를 호출하여 점수를 받아와야 합니다.
      // 현재 Mockup에서는 임의로 최고 위험도 점수 23점을 할당합니다.
      setTimeout(() => {
        setTotalRiskScore(23); // 임시 값: 최대 리스크 노출 가정
      }, 1000);
    }
  }, [currentQuestionIndex]);

  /**
   * QuizStep 컴포넌트에 전달할 질문 데이터를 정의합니다. (실제 데이터 기반)
   */
  const questions = [
    // Q1: PII 흐름 추적성 (Writer/Researcher의 체크리스트 활용)
    { id: 'Q1', title: "PII 흐름 추적성을 문서화하고 추적이 가능한가?", options: [{ key: 'A', label: '완벽히 추적 가능' }, { key: 'B', label: '일부 경로만 기록됨' }, { key: 'C', label: '흐름 자체가 파악되지 않음 (최대 리스크)' }] },
    // Q2: 비식별화 처리 표준 (Writer/Researcher의 체크리스트 활용)
    { id: 'Q2', title: "민감 데이터에 전용의 마스킹/비식별화 파이프라인을 사용하는가?", options: [{ key: 'A', label: '전체 자동 시스템 도입' }, { key: 'B', label: '수동 검토 프로세스가 존재함' }, { key: 'C', label: '단순 삭제 후 사용 (리스크 높음)' }] },
    // Q3: 국가 간 데이터 전송 통제 (Writer/Researcher의 체크리스트 활용)
    { id: 'Q3', title: "국경을 넘는 데이터 저장에 대한 법적 검토 및 계약이 완료되었는가?", options: [{ key: 'A', label: '모든 지역별 규정 준수' }, { key: 'B', label: '주요 국가 위주로 처리됨' }, { key: 'C', label: '규제 변화를 고려하지 않음 (공백 리스크)' }] },
    // ... 나머지 7개 질문을 추가하여 총 10개를 맞춥니다. (구조적 안정성 확보)
    { id: 'Q4', title: "API 호출 시 입력값 유효성 검증은 어떻게 진행되는가?", options: [{ key: 'A', label: '엄격한 스키마 기반의 전처리' }, { key: 'B', label: '주로 백엔드에서 처리함' }, { key: 'C', label: '클라이언트 측에만 의존하고 있음' }] },
    { id: 'Q5', title: "시스템 변경 시 영향도 분석(Impact Analysis)을 거치는가?", options: [{ key: 'A', label: '자동화된 테스트 커버리지로 확인' }, { key: 'B', label: '수동으로 일부 확인함' }, { key: 'C', label: '변경되면 일단 배포하는 경향이 있음 (매우 위험)' }] },
    { id: 'Q6', title: "규제 변화 모니터링에 전담 팀 또는 시스템을 보유하고 있는가?", options: [{ key: 'A', label: '전문 리스크 컨설팅과 연동' }, { key: 'B', label: '주요 매체 뉴스 검색 수준' }, { key: 'C', label: '규제 변화를 간과하는 것이 일반적임' }] },
    { id: 'Q7', title: "데이터 백업/복구(BCP) 계획에 대한 정기적인 모의 훈련을 수행하는가?", options: [{ key: 'A', label: '연 2회 이상 전사적 훈련 완료' }, { key: 'B', label: '문서로만 준비되어 있음' }, { key: 'C', label: '실제 상황을 가정하지 않음 (최악의 시나리오 대비 X)' }] },
    { id: 'Q8', title: "핵심 시스템 장애 발생 시 운영 중단 시간(Downtime) 목표치가 명확한가?", options: [{ key: 'A', label: 'RTO/RPO 목표를 수치로 정의' }, { key: 'B', label: '최대한 빠르게 복구할 것이라는 기대만 있음' }, { key: 'C', label: '어느 정도 시간이 걸릴 거라고 예상함 (방치)' }] },
    { id: 'Q9', title: "외부 API 의존성 변화에 대한 폴백(Fallback) 메커니즘이 갖춰져 있는가?", options: [{ key: 'A', label: '다중 API 스택 및 대체 로직 구현' }, { key: 'B', label: '주요 서비스만 대체 가능하게 코딩됨' }, { key: 'C', label: '외부 API 오류 시 전체 시스템이 멈춤 (Single Point of Failure)' }] },
    { id: 'Q10', title: "내부 개발 프로세스에 대한 코드 리뷰와 감사(Audit) 과정이 의무화되어 있는가?", options: [{ key: 'A', label: '필수적인 다중 검토 프로세스가 확립' }, { key: 'B', label: '주니어 레벨에서 주로 확인됨' }, { key: 'C', label: '결과물을 빠르게 내는 것이 우선시되어 리뷰가 생략되곤 함 (가장 위험)' }] }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-12">
      <Head>
        <title>🚨 yobizwiz 리스크 진단 퀴즈</title>
      </Head>

      {/* 헤더 및 경고 메시지 */}
      <div className="max-w-4xl mx-auto mb-8 p-6 bg-red-900/30 border-l-4 border-red-500 shadow-2xl rounded-lg">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-red-400 mb-2">
          🚨 핵심 리스크 진단 퀴즈 (Structural Gap Assessment)
        </h1>
        <p className="text-gray-200 text-lg">
          이 퀴즈는 단순한 점검표가 아닙니다. 귀사가 현재 인지하지 못하고 있는 **'미인지 손실액($L_{gap}$)'**을 측정합니다. 답변에 따라 잠재적 재정 리스크를 진단받으세요.
        </p>
      </div>

      {/* 퀴즈 단계별 컴포넌트 */}
      <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-inner">
        {!isQuizComplete ? (
          <QuizStep
            question={questions[currentQuestionIndex]}
            onAnswer={() => handleNext('A')} // 실제로는 선택된 값을 받아와야 함
            // onAnswer={(answer) => handleNext(answer)}
          />
        ) : (
          <ResultDisplay totalScore={totalRiskScore!} />
        )}

      </div>
    </div>
  );
};

export default DiagnosticQuizPage;