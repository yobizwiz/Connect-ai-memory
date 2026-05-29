import { useState, useCallback } from 'react';
import { RiskMetrics, calculateTRE } from '../types/riskTypes';

/**
 * @description 규제 리스크 측정 엔진의 Mock API 호출 로직을 담는 커스텀 훅입니다.
 * 실제로는 FastAPI 백엔드 엔드포인트와 연동됩니다.
 * 핵심은 비동기 지연(Time Delay)과 임계치(Threshold) 기반 상태 변화를 구현하는 것입니다.
 */
export const useRiskCalculator = () => {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * @description 가상의 사용자 입력 데이터로 TRE를 계산하고 리스크 결과를 반환합니다.
   * @param userData - 진단을 원하는 사용자의 비정형 데이터 (예: API 로그, 프로세스 흐름도).
   * @returns Promise<RiskMetrics> 계산된 리스크 지표 객체.
   */
  const calculateAndSetRisk = useCallback(async (userData: any) => {
    setIsLoading(true);
    setError(null);
    setRiskMetrics(null);

    // [Self-RAG] 시간적 압박 생성을 위한 강제적인 비동기 지연 (3초)
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      // 실제 API 호출을 시뮬레이션합니다.
      const calculatedMetrics = calculateTRE(userData);
      setRiskMetrics(calculatedMetrics);
      return calculatedMetrics;
    } catch (e) {
      console.error("RISK CALCULATION FAILED:", e);
      setError("🚨 시스템 데이터 파싱 오류: 제공된 비정형 데이터를 분석할 수 없습니다. 근본적인 프로세스 진단이 필요합니다.");
      setRiskMetrics(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { riskMetrics, isLoading, error, calculateAndSetRisk };
};