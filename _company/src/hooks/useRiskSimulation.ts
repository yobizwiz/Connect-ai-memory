import { useSystemContext } from '../context/SystemContext';

// API 호출 시뮬레이션 및 로직 실행 훅 (가장 중요한 비즈니스 로직)
export const useRiskSimulation = () => {
  const { setSystemState, isLoading } = useSystemContext();

  /**
   * @description 사용자 입력 데이터를 받아서 백엔드 API를 호출하고 QLoss 점수를 업데이트합니다.
   * 이 함수는 시스템의 핵심 '공포 유발' 메커니즘입니다.
   * @param userInput - 사용자가 시뮬레이션한 데이터나 질문 목록.
   */
  const runSimulation = async (userInput: string[]): Promise<void> => {
    if (isLoading) {
      console.warn("이미 분석이 진행 중입니다. 잠시만 기다려 주세요.");
      return;
    }

    // 1. 전처리 및 유효성 검사 (Guard Clause)
    if (!userInput || userInput.length < 3) {
        alert("분석을 위해 최소 3가지 이상의 핵심 질문/데이터를 입력해주세요.");
        return;
    }
    console.log(`[SIMULATION] Starting analysis with ${userInput.length} data points...`);

    // **************************************************************
    // *** 중요: 실제 프로젝트에서는 여기에 fetch('/api/v1/simulate-risk', { ... })를 구현해야 합니다. ***
    // **************************************************************

    try {
      // API 호출 시뮬레이션 및 성공적인 값 반환 가정
      const simulatedScore = Math.min(0.95, 0.3 + (Math.random() * 0.6)); // 최소 0.3에서 최대 0.95 사이의 위험 점수
      const simulatedDetails: Record<string, string> = {
        critical_gap: `[자동 분석 결과] ${userInput[1]} 항목에 대한 법적 근거가 사각지대에 있습니다.`,
        mitigation_required: ["구조적 면책권 계약 (Structural Immunity)"],
        suggested_action: "Gold Tier Consultation",
      };

      // 2. Context 업데이트 호출 (전체 UI의 변화를 유발함)
      await setSystemState(simulatedScore, simulatedDetails);
    } catch (error) {
      console.error("Risk Simulation Failed:", error);
      alert("시스템 분석 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return { runSimulation };
};