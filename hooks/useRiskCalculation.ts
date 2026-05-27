import { useState, useCallback } from 'react';

interface CalculationState {
    dataVolume: number; // TB
    violationType: string; // GDPR, HIPAA, CCPA
}

/**
 * 위험 분석 로직을 처리하는 커스텀 훅 (useRiskCalculation)
 * 이 훅은 상태 관리와 비동기 API 호출 시뮬레이션을 담당합니다.
 */
const useRiskCalculation = () => {
    const [yValue, setYValue] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 위험 수준에 따른 스타일 및 텍스트 결정 로직 (Designer 스펙 반영)
    const getRiskLevel = useCallback((value: number): string => {
        if (value > 50000) return 'CRITICAL';
        if (value > 10000) return 'HIGH';
        return 'MEDIUM';
    }, []);

    // Y 값에 따른 경고 스타일 결정 함수
    const getRedZoneStyles = useCallback((value: number): string => {
        let baseStyle = "p-6 rounded-md transition-all duration-700";
        if (value > 50000) {
            return `${baseStyle} bg-[#C0392B] text-white shadow-[0_0_15px_rgba(192,57,43,0.8)]`; // Critical Red
        } else if (value > 10000) {
            return `${baseStyle} bg-[#E67E22] text-white shadow-[0_0_15px_rgba(230,126,34,0.8)]`; // High Orange/Red
        } else if (value > 0) {
            return `${baseStyle} bg-[#F39C12] text-black shadow-[0_0_15px_rgba(243,156,18,0.8)]`; // Medium Yellow/Orange
        } else {
            return `${baseStyle} bg-gray-700 text-white`; // Default Gray
        }
    }, []);

    /**
     * 핵심 위험 계산 로직 시뮬레이션 함수 (API 호출 대체)
     * @param volume - 데이터 볼륨 (TB)
     * @param violationType - 위반 유형
     */
    const calculateRisk = useCallback(async (volume: number, violationType: string): Promise<void> => {
        setIsLoading(true);
        setError(null);

        // 1. 시스템적 로딩 지연 시뮬레이션 (3초)
        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
            let baseRisk = volume * 500; // 기본 데이터 볼륨 리스크 계산

            // 2. 위반 유형별 가중치 적용 로직 (비즈니스 로직)
            switch (violationType) {
                case 'GDPR':
                    baseRisk *= (1 + volume * 0.05); // GDPR은 규모에 민감
                    break;
                case 'HIPAA':
                    baseRisk = Math.pow(volume, 2) * 1000; // HIPAA는 비선형적 위험 증가 가정
                    break;
                case 'CCPA':
                    baseRisk *= (1 + volume * 0.03);
                    break;
                default:
                    throw new Error("알 수 없는 위반 유형입니다.");
            }

            // 최종 Y 값 산출 및 상태 업데이트
            const finalY = Math.max(100, baseRisk); // 최소 100달러 리스크 보장
            setYValue(finalY);

        } catch (e) {
            setError(`위험 계산 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`);
            setYValue(0);
        } finally {
            setIsLoading(false);
        }
    }, []);


    return { 
        calculateRisk, 
        currentYValue: yValue, 
        isLoading, 
        error,
        getRedZoneStyles, // 외부 컴포넌트에서 사용하도록 노출
        getRiskLevel
    };
};

export default useRiskCalculation;