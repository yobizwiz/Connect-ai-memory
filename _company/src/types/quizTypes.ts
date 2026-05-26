/**
 * src/types/quizTypes.ts
 * Mini Self-Diagnosis Test의 타입 정의 파일. 모든 로직과 UI는 이 타입을 따릅니다.
 */

export type RiskCategory = 'A' | 'B' | 'C'; // 법적 무효화, 통제 실패, 총 위험 노출액
export type QuestionId = string;

/**
 * 각 질문의 구조를 정의합니다.
 * pointValue는 해당 답변을 선택했을 때 누적되는 점수입니다 (높을수록 리스크 높음).
 */
export interface QuizQuestion {
  id: QuestionId;
  category: RiskCategory;
  questionText: string;
  options: Array<{
    optionKey: string; // 사용자에게 보여지는 선택지 Key (e.g., "A")
    text: string;      // 사용자가 읽는 텍스트 설명
    pointValue: number;// 이 답변을 고르면 추가되는 점수
  }>;
}

/**
 * 최종 진단 결과의 구조를 정의합니다.
 */
export interface DiagnosisResult {
  totalScore: number;          // 총 누적 리스크 점수 (0 ~ 21점)
  riskLevel: 'Low' | 'Medium' | 'High'; // 최종 리스크 레벨
  reportTitle: string;        // 보고서 제목
  detailedFindings: Array<{
    category: RiskCategory;
    description: string;      // 이 카테고리에서 취약점을 발견한 이유 설명
    severity: number;        // 해당 카테고리의 심각도 점수 (0~3)
  }>;
}

/**
 * 전역 상태 관리를 위한 Quiz State
 */
export interface QuizState {
  currentQuestionIndex: number;
  accumulatedScore: number;
  selectedAnswers: Record<QuestionId, string>; // 어떤 질문에 어떤 답변을 했는지 추적
}

export type DiagnosisError = 'API_FAILURE' | 'NETWORK_ERROR';