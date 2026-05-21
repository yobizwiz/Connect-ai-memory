import { useState, useCallback } from 'react';

// --- [1] 구조화된 API 실패 타입 정의 (The Core Asset) ---
/**
 * 시스템의 구조적 무결성(Structural Integrity)을 위협하는 모든 에러 타입을 포괄합니다.
 */
export type ApiFailureType = 
  | { code: 'RATE_LIMIT' } // Rate Limit 초과: 가장 흔한 상업적 실패 시나리오
  | { code: 'NETWORK_FAILURE' } // 네트워크 연결 끊김: 기본적인 시스템 불안정성
  | { code: 'AUTH_ERROR' } // 인증/인가 오류: 권한 구조의 결함 (401, 403)
  | { code: 'API_CONTRACT_VIOLATION' } // API 스펙 불일치: 가장 전문적이고 깊은 위협
  | { code: 'UNKNOWN_SYSTEM_ERROR', details?: string }; // 기타 예측 불가능한 시스템 에러

/**
 * API 호출의 결과 상태를 정의합니다.
 */
export interface ApiState<T> {
    data: T | null;         // 성공 시 데이터 payload
    loading: boolean;       // 로딩 중 여부 (시간적 압박 유도)
    error: ApiFailureType | null; // 실패한 구조화된 에러 객체
}

/**
 * API 호출의 결과를 래핑하고, 실패 시 이를 전문적인 오류 타입으로 변환하는 커스텀 훅.
 * @param apiCall - 실제 비동기 API 호출 함수 (Promise<T>)
 */
export const useApiCall = <T>(apiCall: () => Promise<T>): ApiState<T> => {
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    const execute = useCallback(async (initialFailure?: ApiFailureType) => {
        setState({ data: null, loading: true, error: initialFailure });
        try {
            // 실제 API 호출 실행
            const result = await apiCall();
            setState({ data: result, loading: false, error: null });
            return result;

        } catch (e) {
            console.error("API Call Failed:", e);
            let structuredError: ApiFailureType;

            // --- [2] 에러 타입 매핑 로직 (The Gatekeeper Logic) ---
            // 실제 API 클라이언트 라이브러리에서 나오는 Raw Error를 분석하여 구조화된 위협으로 변환합니다.
            if (e instanceof TypeError && e.message.includes('Quota Exceeded')) {
                structuredError = { code: 'RATE_LIMIT' }; // 예시: Rate Limit 감지
            } else if (e instanceof Error && (e.message.includes('401') || e.message.includes('Unauthorized'))) {
                 structuredError = { code: 'AUTH_ERROR' }; // 인증 문제 감지
            } else if (e instanceof TypeError) {
                // 네트워크 관련 에러 등 기타 타입 에러 처리
                structuredError = { code: 'NETWORK_FAILURE', details: e.message };
            } else {
                // 위에서 잡지 못한 모든 것은 가장 심각한 경고로 포장합니다.
                structuredError = { code: 'UNKNOWN_SYSTEM_ERROR', details: String(e) || "Unknown system failure." };
            }

            setState({ data: null, loading: false, error: structuredError });
            return null; // 에러 발생 시 명시적으로 null 반환하여 클라이언트 코드 통일성 유지
        }
    }, [apiCall]);

    // 외부에서 강제 초기 실패 상태를 주입할 수 있게 함 (예: 폼 제출 전 가짜 오류 노출)
    const reset = useCallback(() => {
         setState({ data: null, loading: false, error: null });
    }, []);


    return { state, execute, reset };
};

export type ApiResponseHook<T> = ReturnType<typeof useApiCall>;