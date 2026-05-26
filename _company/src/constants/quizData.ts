/**
 * @description 🚨 Compliance Gateway Pro: Interactive Risk Assessment Module Data Store
 * 이 파일은 퀴즈 질문, 옵션, 그리고 각 선택지에 따른 위험 점수 및 피드백을 정의합니다.
 * [근거: Writer가 작성한 플로우 재구조화]
 */

export type QuizOption = {
  id: 'A' | 'B' | 'C';
  text: string;
  riskScore: number; // 0 (안전) ~ 3 (매우 위험/시스템적 결함)
  isWarning?: boolean; // 경고 메시지 출력이 필요한 옵션
};

export type Question = {
  id: number;
  title: string;
  sectionTitle: string; // 섹션 제목 (예: Process Flaws)
  questionText: string;
  options: QuizOption[];
};


// --- 💡 [섹션 1: 운영의 허점 - Process Flaws] ---
export const sectionOneQuestions: Question[] = [
  {
    id: 1,
    title: "Q1. 핵심 비즈니스 플로우에서 법적 준수 여부를 최종 검토하는 책임은 누가 맡습니까?",
    sectionTitle: "🚨 섹션 1: 운영의 허점 (Process Flaws)",
    questionText: "핵심 비즈니스 프로세스의 컴플라이언스 게이트키퍼는 누구입니까?",
    options: [
      { id: 'A', text: "전담 컴플라이언스 팀: 매뉴얼에 따라 점검합니다.", riskScore: 1 },
      // B가 가장 위험도가 높게 설계됨 (Writer의 의도)
      { id: 'B', text: "프로젝트 리드/시니어 담당자: 실무 경험과 판단으로 체크합니다.", riskScore: 3, isWarning: true },
      { id: 'C', text: "시스템 자동화 로직: 정해진 체크리스트를 기반으로 진행됩니다.", riskScore: 2 },
    ],
  },
];

// --- 🧱 [섹션 2: 구조적 리스크 - Structural Flaws] ---
export const sectionTwoQuestions: Question[] = [
  {
    id: 2,
    title: "Q2. 규제 변경 사항이 발생했을 때, 이를 업무 프로세스에 적용하는 주기는 어떻게 됩니까?",
    sectionTitle: "🚧 섹션 2: 구조적 리스크 (Structural Flaws)",
    questionText: "규제 변화가 사업 모델의 근본을 위협할 경우, 대응책은 무엇입니까?",
    options: [
      { id: 'A', text: "외부 자문사 및 법무법인에 의존하여 매뉴얼을 업데이트합니다.", riskScore: 1 },
      { id: 'B', text: "당장의 매출 확보를 위해 임시적인 로비 활동에 집중합니다.", riskScore: 3, isWarning: true }, // Highest Risk Choice
      { id: 'C', text: "내부 팀의 자체 분석과 판단으로 빠른 대응을 시도합니다.", riskScore: 2 },
    ],
  },
];

// --- 👻 [섹션 3: 존재론적 위협 - Existential Threat] ---
export const sectionThreeQuestions: Question[] = [
  {
    id: 3,
    title: "Q3. 서비스의 '존재 자체'가 법적으로 부정당할 수 있는 근본 원인은 무엇입니까?",
    sectionTitle: "👻 섹션 3: 존재론적 위협 (Existential Threat)",
    questionText: "우리 비즈니스 모델이 장기적으로 생존하기 위한 가장 취약한 지점은 어디라고 생각하십니까?",
    options: [
      { id: 'A', text: "특정 시장의 경기 침체 주기(Cycle)에 의해 영향을 받습니다.", riskScore: 2 },
      // 낮은 위험도의 답변 (비교적 안전함)
      { id: 'B', text: "경쟁사 대비 마케팅 예산 부족이 가장 큰 문제입니다.", riskScore: 1 },
      // 존재론적 위협을 주는 최악의 선택지
      { id: 'C', text: "핵심 기술이나 비즈니스 로직 자체가 법적 근거를 상실할 위험에 놓여 있습니다.", riskScore: 3, isWarning: true },
    ],
  },
];

// 모든 질문을 합친 전체 배열 (순차 진행용)
export const allQuizQuestions: Question[] = [
  ...sectionOneQuestions,
  ...sectionTwoQuestions,
  ...sectionThreeQuestions,
];