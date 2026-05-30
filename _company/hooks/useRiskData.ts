import { useState, useEffect, useCallback } from 'react';
import { SystemRiskData, RiskStateContext, AlertDetail, RiskAPIResponse } from '../types';
import { calculateRiskState, getAlertDetail, mockFetchRiskData } from '../services/riskService';

// -------------------------------------------------
// API Mockup Endpoint 정의 (Client Side Simulation)
// 실제 환경에서는 axios/fetch를 사용하여 백엔드 /api/v1/risk/current 엔드포인트를 호출합니다.
// -------------------------------------------------
/**
 * @function fetchRiskDataFromApiMock
 * @description 백엔드 API를 호출하여 원시 위험 데이터를 가져오는 비동기 함수 (Mockup).
 * @param {string} endpoint - 사용할 가상의 API 엔드포인트 이름.
 * @returns {Promise<SystemRiskData>} 성공 시 가짜 데이터, 실패 시 에러 발생.
 */
const fetchRiskDataFromApiMock = async <T>(endpoint: string): Promise<T> => {
    console.log(`[API Mockup] Fetching data from ${endpoint}...`);

    // 🚨 방어 코드 테스트용 로직 삽입 (Critical/Warning 상태 유도)
    let mockScore;
    if (endpoint === '/api/v1/risk/critical') {
        mockScore = 20000; // Critical 강제 발생
    } else if (endpoint === '/api/v1/risk/warning') {
        mockScore = 8000; // Warning 강제 발생
    } else {
        mockScore = Math.floor(Math.random() * 3000); // IDLE 상태 유도
    }

    await new Promise(resolve => setTimeout(resolve, 500)); // 네트워크 지연 시간 시뮬레이션

    if (endpoint === '/api/v1/risk/error') {
        throw new Error("API Gateway Timeout: Service Unavailable"); // API 실패 케이스 시뮬레이션
    }

    // 실제 데이터 구조와 일치하는 Mock Data 반환
    return mockFetchRiskData(mockScore as unknown as number, 'FSS'); as T;
};


/**
 * @hook useRiskData
 * @description RVS의 상태를 관리하고 API 통신 및 비즈니스 로직을 캡슐화한 커스텀 Hook.
 * 데이터 무결성, 상태 전이, 에러 처리를 모두 책임집니다.
 */
export const useRiskData = (initialEndpoint: string) => {
    const [riskState, setRiskState] = useState<RiskStateContext | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 데이터를 로드하고 상태를 업데이트하는 핵심 함수
    const loadRiskData = useCallback(async (endpoint: string) => {
        setIsLoading(true);
        setError(null);
        try {
            // 1. API 호출 및 원시 데이터 수신 (Defensive Data Fetching)
            const rawData = await fetchRiskDataFromApiMock<SystemRiskData>(endpoint);

            // 2. 비즈니스 로직 실행 및 상태 계산 (Pure State Calculation)
            try {
                const newState = calculateRiskState(rawData); // 여기서 타입 에러가 나면 catch 블록으로 이동
                setRiskState(newState);
            } catch (e) {
                setError(`[Logic Error] 데이터를 처리하는 과정에서 오류 발생: ${e instanceof Error ? e.message : '알 수 없는 오류'}`);
                console.error("Failed to calculate risk state:", e);
            }

        } catch (e) {
            // 3. API 통신 실패 시 에러 핸들링 (Defensive Error Handling)
            setError(`[Connection Error] 데이터를 불러올 수 없습니다. Endpoint를 확인하거나 잠시 후 다시 시도해주세요. (${e instanceof Error ? e.message : '알 수 없는 네트워크 오류'})`);
            setRiskState(null); // 상태 초기화
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 컴포넌트 마운트 시 초기 데이터 로드 (기본 엔드포인트 사용)
    useEffect(() => {
        loadRiskData(initialEndpoint);
    }, [loadRiskData, initialEndpoint]);

    /** @returns {{state: RiskStateContext | null, alertDetail: AlertDetail | null, isLoading: boolean, error: string | null}} */
    return { 
        state: riskState, 
        alertDetail: riskState ? getAlertDetail(riskState) : null, // 상태가 로드되었을 때만 상세 정보 계산
        isLoading, 
        error, 
        loadRiskData 
    };
};

export { useRiskData };