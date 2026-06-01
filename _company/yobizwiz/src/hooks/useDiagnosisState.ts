/**
 * @module useDiagnosisState
 * @description 진단 리스크 점수 계산 및 UI 플로우 상태를 관리하는 커스텀 훅.
 * 이 훅은 '진단 버튼 클릭'부터 'Paywall 노출까지'의 시스템적 흐름을 보장합니다.
 */

import { useState, useCallback } from 'react';

// --- 타입 정의 (Defensive Typing) ---
export type DiagnosisStatus = 'IDLE' | 'CALCULATING' | 'PAIDWALL_ACTIVE';

interface DiagnosisState {
    status: DiagnosisStatus;
    riskScoreTRE: number | null; // 핵심 리스크 점수
    error?: string;
}

/**
 * Mockup 함수: 실제 TRE(Total Risk Exposure) 계산 로직이 들어갈 곳.
 * @param inputs 사용자가 입력한 진단 데이터 (현재는 미사용, 구조만 유지)
 * @returns 가상의 최종 리스크 점수
 */
const calculateTRE = (inputs: any): number => {
    // 실제로는 복잡한 API 호출 또는 계산 로직이 들어갑니다.
    console.log("🚨 [SYSTEM] TRE Calculation Engine Activated...");
    // 강제적으로 높은 수치를 반환하여 Paywall 활성화를 유도합니다.
    return Math.floor(Math.random() * 300) + 75; // 75~374 사이의 리스크 점수
};

/**
 * 진단 플로우 상태를 관리하는 커스텀 훅.
 * @returns DiagnosisState
 */
export const useDiagnosisState = () => {
    const [state, setState] = useState<DiagnosisState>({
        status: 'IDLE',
        riskScoreTRE: null,
    });

    /**
     * 진단 요청을 트리거하고 상태를 업데이트합니다.
     * 이 함수는 비동기 API 호출 및 복잡한 계산 로직을 감싸야 합니다.
     */
    const initiateDiagnosis = useCallback(async (inputData?: any) => {
        if (state.status === 'CALCULATING') return; // 이미 실행 중이면 무시

        setState({ status: 'CALCULATING', riskScoreTRE: null });

        try {
            // 1. 로딩 지연 및 시뮬레이션 API 호출 대기 (5초)
            await new Promise(resolve => setTimeout(resolve, 2000)); // 짧게 설정하여 테스트 용이성 확보

            // 2. 핵심 비즈니스 로직 실행: 리스크 점수 계산
            const tre = calculateTRE(inputData);

            // 3. 상태 업데이트 및 성공 처리 (Paywall 활성화 준비)
            setState({
                status: 'PAIDWALL_ACTIVE',
                riskScoreTRE: Math.round(tre), // 반올림하여 저장
            });

        } catch (e) {
            console.error("Diagnosis failed:", e);
            setState({ status: 'IDLE', riskScoreTRE: null, error: "시스템 오류로 진단에 실패했습니다." });
        }
    }, [state.status]);

    /**
     * 상태를 초기화하고 버튼을 다시 클릭 가능하게 만듭니다.
     */
    const resetDiagnosis = useCallback(() => {
        setState({ status: 'IDLE', riskScoreTRE: null });
    }, []);


    return {
        ...state,
        initiateDiagnosis,
        resetDiagnosis
    };
};