/**
 * @module useRiskChecker
 * @description 리스크 스코어를 기반으로 시스템적 위협 상태(Gatekeeper Alert)가 필요한지 검사하는 커스텀 훅.
 */
import { useState, useCallback, useEffect } from 'react';

// 임계값 설정: 구조적 위험이 감지되는 최소 스코어 (70%)
const CRITICAL_THRESHOLD = 70;

/**
 * 외부 API로부터 리스크 데이터를 가져오는 모의 함수.
 * 실제 구현 시에는 FastAPI 엔드포인트 호출로 대체되어야 합니다.
 * @param sessionId - 사용자의 세션 ID
 * @returns {Promise<{score: number, details: string}>} - 분석 결과
 */
const fetchRiskDataFromAPI = async (sessionId: string): Promise<{ score: number; details: string }> => {
    console.log("⚡️ [API Call] Calling Risk Engine API for session:", sessionId);
    // 3초 지연을 주어 로딩 상태를 체감하게 합니다.
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock Data: 테스트 목적으로 가변적인 리스크 스코어를 반환합니다.
    const mockScore = Math.floor(Math.random() * (100 - 50 + 1)) + 50; // 50~100 사이 랜덤
    let details = '';

    if (mockScore >= 85) {
        details = "Critical: 법적 규제 및 시스템 무결성 측면에서 즉각적인 구조 조정이 필요합니다. 자가 점검 필수.";
    } else if (mockScore >= 70) {
        details = "Warning: 현재 데이터 흐름에 심각한 취약점이 감지되었습니다. 전문 진단 없이는 진행 불가합니다.";
    } else {
        details = "Normal: 기본적인 구조적 무결성 점검은 통과했습니다. 하지만 잠재적 리스크는 존재합니다.";
    }

    return { score: mockScore, details: details };
};

/**
 * 게이트키퍼 Alert가 활성화되어야 하는지 검사하는 커스텀 훅.
 * @param sessionId - 현재 사용자의 세션 ID (또는 사용자 ID)
 * @returns {{ isCritical: boolean, riskData: { score: number; details: string } | null }}
 */
export const useRiskChecker = (sessionId: string) => {
    const [riskState, setRiskState] = useState<{ score: number; details: string }>({ score: 0, details: "분석 대기 중..." });
    const [isLoading, setIsLoading] = useState(true);

    const checkRiskStatus = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchRiskDataFromAPI(sessionId);
            setRiskState(data);
        } catch (error) {
            console.error("Error fetching risk status:", error);
            setRiskState({ score: 0, details: "데이터 로드 실패. 나중에 다시 시도해 주세요." });
        } finally {
            setIsLoading(false);
        }
    }, [sessionId]);

    // 컴포넌트가 마운트될 때 리스크 체크를 실행합니다.
    useEffect(() => {
        checkRiskStatus();
    }, [checkRiskStatus]);


    const isCritical = riskState && riskState.score >= CRITICAL_THRESHOLD;

    return {
        isCritical,
        riskData: riskState,
        isLoading,
        triggerCheck: checkRiskStatus // 수동으로 재검사를 트리거할 필요가 있을 때 사용
    };
};