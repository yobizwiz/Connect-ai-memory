import { useState, useEffect } from 'react';

/**
 * @typedef {'IDLE' | 'SCANNING' | 'WARNING' | 'CRITICAL'} RiskLevel
 */

/**
 * 시스템적 리스크 시뮬레이션을 관리하는 훅입니다.
 * 상태 변화에 따라 점진적인 불안정성을 체감하게 만드는 것이 핵심입니다.
 * @param {boolean} startSimulation - 시뮬레이션 시작 여부 (사용자 액션 기반)
 * @returns {{ riskLevel: RiskLevel, currentRiskScore: number, isLoading: boolean }} 현재 리스크 상태와 점수
 */
export const useRiskSimulation = (startSimulation: boolean) => {
    const [riskLevel, setRiskLevel] = useState<RiskLevel>('IDLE');
    const [currentRiskScore, setCurrentRiskScore] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;
        if (!startSimulation) {
            setRiskLevel('IDLE');
            setCurrentRiskScore(0);
            setIsLoading(false);
            return () => clearInterval(intervalId!);
        }

        // 1. 초기 스캔 단계 (SCANNING: 시스템 분석 중 - 공포의 시작)
        setIsLoading(true);
        setRiskLevel('SCANNING');
        setCurrentRiskScore(0);

        const scanInterval = setInterval(() => {
            setCurrentRiskScore(prevScore => Math.min(prevScore + 1, 5)); // 점진적 증가
        }, 300);

        // 2. 임계점 도달 시 경고 단계로 진입 (WARNING)
        intervalId = setTimeout(() => {
            clearInterval(scanInterval);
            setRiskLevel('WARNING');
            setCurrentRiskScore(15); // 초기 충격 점수 부여
        }, 4000); // 4초 후

        // 3. Critical 상태로의 진입 및 지속적 불안정성 유발 (CRITICAL)
        intervalId = setTimeout(() => {
            setRiskLevel('CRITICAL');
            setIsLoading(false);
            
            // 크리티컬 상태에서는 점수가 매 초마다 비선형적으로 증가하는 느낌을 줍니다.
            const spikeInterval = setInterval(() => {
                setCurrentRiskScore(prevScore => Math.min(prevScore + Math.floor(Math.random() * 5) + 3, 100));
            }, 800);

            // 클린업 함수에 간격 제거 로직 추가 (필수)
            return () => clearInterval(spikeInterval);
        }, 8000); // 8초 후 Critical 도달

        // Cleanup function for all intervals
        return () => {
            clearInterval(scanInterval);
            clearTimeout(intervalId!);
            console.log("Risk Simulation Cleaned Up.");
        };
    }, [startSimulation]);

    return { riskLevel, currentRiskScore, isLoading };
};

/**
 * 리스크 레벨에 따른 CSS 클래스 및 경고 메시지를 반환합니다.
 * @param {'IDLE' | 'SCANNING' | 'WARNING' | 'CRITICAL'} level 
 * @returns {{ className: string, message: string }}
 */
export const getRiskStyles = (level: any) => {
    switch (level) {
        case 'IDLE':
            return { className: 'bg-gray-800', message: '시스템 대기 상태. 리스크 진단을 시작하세요.' };
        case 'SCANNING':
            return { className: 'bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-300', message: '데이터를 분석 중입니다... 시스템적 결함 징후가 감지되고 있습니다.' };
        case 'WARNING':
            return { className: 'bg-red-900/60 border-l-8 border-red-500 text-red-300', message: `경고! 위험 등급이 상승했습니다. $TRE$ 수치 ${Math.round(currentRiskScore)} 발생.` };
        case 'CRITICAL':
            return { className: 'bg-[#1A1A1A] border-l-8 border-red-700 text-red-400 animate-pulse', message: `[!!! CRITICAL FAILURE !!!] 시스템적 생존 위협이 임계점에 도달했습니다. 즉각적인 보험료 지불(Premium)이 필요합니다.` };
        default:
            return { className: 'bg-gray-800', message: '알 수 없는 상태입니다.' };
    }
};