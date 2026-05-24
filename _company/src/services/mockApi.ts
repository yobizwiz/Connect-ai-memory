import { SystemStatusContext } from '../context/SystemStatusContext';

// 5가지 에러 시나리오 정의 (테스트 커버리지 확보)
export type ApiErrorType = 'INVALID_CREDENTIALS' | 'RATE_LIMIT_EXCEEDED' | 'STRUCTURAL_DEGRADATION' | 'EXTERNAL_API_FAILURE' | 'DATA_CORRUPTION';

interface AnalysisResult {
  riskScore: number; // 0-100
  reportData: string;
  status: 'SUCCESS' | 'WARNING' | 'FAIL';
}

/**
 * @description 가상의 QLoss 분석 API 호출을 모의합니다.
 * 이 함수는 내부적으로 시스템 상태에 영향을 주는 오류를 발생시킬 수 있습니다.
 * @param input - 사용자 입력 데이터 (예: 고객 ID)
 * @returns Promise<AnalysisResult>
 */
export const analyzeRiskData = async (input: string): Promise<AnalysisResult> => {
  // 전역 상태 컨텍스트 사용을 가정하여, 실제 구현에서는 Context Provider가 필요합니다.
  const context = SystemStatusContext; // Mocking for structure definition

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 1. 입력 검증 실패 (INVALID_CREDENTIALS) - 가장 낮은 레벨의 실패
      if (!input || input.length < 5) {
        reject({ type: 'API_ERROR', errorType: 'INVALID_CREDENTIALS', message: "유효한 데이터 세트가 아닙니다." });
        return;
      }

      // 2. 임의의 확률적 실패 시뮬레이션 (75% 이상에서 발동)
      const failureChance = Math.random();
      if (failureChance > 0.8 && !context?.state.isSystemCompromised) { // 성공 시에도 가끔 오류를 유발하도록 설계
        // 클라이맥스 실패 상태 발생! 전역 시스템 마비 트리거.
        const failureError = "시스템적 무결성 손상(Structural Degradation): 핵심 로직이 비정상적으로 작동합니다.";
        context?.triggerFailure(failureError); 
        reject({ type: 'SYSTEM_ERROR', errorType: 'STRUCTURAL_DEGRADATION', message: failureError });
        return;
      }

      // 3. 고위험 에러 시나리오 (구조적 결함) - QLoss가 급상승하는 지점
      if (failureChance > 0.6 && context?.state.threatLevel === 'RED') {
         const failureError = "외부 API 호출 실패: 규제 데이터 흐름이 차단되었습니다.";
         context?.triggerFailure(failureError); 
         reject({ type: 'API_ERROR', errorType: 'EXTERNAL_API_FAILURE', message: failureError });
         return;
      }

      // 성공 케이스 또는 경고 케이스 (Mock Success)
      const riskScore = Math.floor(Math.random() * 100);
      let status: AnalysisResult['status'] = 'SUCCESS';
      if (riskScore > 70) {
        status = 'WARNING';
      } else if (riskScore > 90) {
        status = 'FAIL'; // 최대 위험 상태
      }

      resolve({
        riskScore: riskScore,
        reportData: `분석 성공. 당신의 데이터는 ${riskScore}%의 구조적 결함 잠재성을 보입니다.`,
        status: status,
      });
    }, 1500); // 1.5초 지연 (시간적 압박)
  });
};

export const getErrorDescriptions = () => ({
    'INVALID_CREDENTIALS': '입력 데이터 자체의 오류로 분석이 불가능합니다.',
    'RATE_LIMIT_EXCEEDED': 'API 호출 제한에 걸렸습니다. 잠시 후 다시 시도해주세요.',
    'STRUCTURAL_DEGRADATION': '시스템 핵심 로직에 구조적 결함이 발생했습니다. 즉각적인 조치가 필요합니다.',
    'EXTERNAL_API_FAILURE': '외부 규제 데이터 소스와의 연결이 끊겼습니다. 법적 무효화 위험이 높습니다.',
    'DATA_CORRUPTION': '데이터 패킷이 손상되었습니다. 신뢰할 수 없습니다.'
});