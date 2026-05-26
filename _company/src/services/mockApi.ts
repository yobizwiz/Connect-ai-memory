/**
 * src/services/mockApi.ts
 * 백엔드 데이터 수집 및 리스크 보고서 생성을 시뮬레이션하는 모킹 API 레이어입니다.
 * 실제로는 GraphQL 또는 REST API 호출이 이루어질 것입니다.
 */

import { QuizState, DiagnosisResult, DiagnosisError } from '../types/quizTypes';

// ⚠️ 이 배열은 Writer가 정의한 21개 문항의 일부만 예시로 넣습니다.
const MOCK_QUIZ_QUESTIONS: Array<QuizQuestion> = [
  {
    id: 'Q1', category: 'A', questionText: "회사 프로세스 중 가장 신뢰하는 리스크 검증 방법은 무엇입니까?",
    options: [
      { optionKey: 'a', text: "경험이 많은 선배의 경험적 판단과 직관에 의존한다.", pointValue: 2 },
      { optionKey: 'b', text: "업계 표준 가이드라인 및 체크리스트를 기반으로 점검합니다.", pointValue: 5 },
      { optionKey: 'c', text: "규정/법규 변경 시 발생하는 잠재적 위협을 예측하고 구조적으로 선제 대응한다.", pointValue: 18 } // 최고 리스크
    ]
  },
  // ... (나머지 20개 질문은 실제 구현에서 여기에 추가됩니다)
];

/**
 * @description 비동기적인 API 호출 지연 및 상태 업데이트를 시뮬레이션합니다.
 * @param state - 현재까지의 퀴즈 응답 상태
 * @returns {Promise<DiagnosisResult>} 최종 진단 보고서 객체
 */
export const submitQuizData = async (state: QuizState): Promise<DiagnosisResult> => {
  console.log(`[Mock API] Received data submission for score ${state.accumulatedScore}. Simulating network delay...`);

  // 네트워크 지연 시뮬레이션 (2초)
  await new Promise(resolve => setTimeout(resolve, 2000));

  if (Math.random() < 0.05) { // 5% 확률로 API 실패 시뮬레이션
    throw new Error("API_FAILURE: 데이터 전송 중 서버 오류가 발생했습니다.");
  }

  // --- 핵심 로직: 리스크 보고서 생성 ---
  let totalScore = state.accumulatedScore;
  let riskLevel: 'Low' | 'Medium' | 'High';
  let reportTitle: string;
  let findings: Array<{ category: 'A' | 'B' | 'C', description: string, severity: number}> = [];

  // 점수 기반으로 리스크 레벨 및 제목 결정 (Writer의 가중치 적용)
  if (totalScore >= 25) {
    riskLevel = 'High';
    reportTitle = "🚨 시스템적 생존 위협 경고: 즉각적인 전면 재점검이 필수입니다.";
    findings.push({ category: 'A', description: "법규 변경을 예측하지 못하고 사후 대응에 의존하는 구조적 허점이 발견되었습니다.", severity: 3 });
  } else if (totalScore >= 10) {
    riskLevel = 'Medium';
    reportTitle = "⚠️ 주의 단계: 일부 핵심 프로세스의 통제 메커니즘을 강화해야 합니다.";
    findings.push({ category: 'B', description: "내부 프로세스가 특정 팀이나 시스템에만 의존하는 사각지대가 존재합니다.", severity: 2 });
  } else {
    riskLevel = 'Low';
    reportTitle = "✅ 안정 단계: 현재의 리스크 관리 체계는 기본적으로 건전합니다.";
    findings.push({ category: 'C', description: "리스크를 비용 관점만으로 바라보는 경향이 있습니다. 장기적 가치와 연결하는 사고가 필요합니다.", severity: 1 });
  }

  // 최종 결과 객체 반환
  const result: DiagnosisResult = {
    totalScore: totalScore,
    riskLevel: riskLevel,
    reportTitle: reportTitle,
    detailedFindings: findings,
  };

  console.log("[Mock API] Report successfully generated.");
  return result;
};