import React, { useState } from 'react';
import { useApiCall, ApiFailureType } from '../hooks/useApiCall';
import SystemFailureDisplay from '../components/SystemFailureDisplay';

// Mock API 호출 함수 (실제 백엔드와 통신한다고 가정)
const mockDangerousApiCall = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // 테스트를 위해 무작위로 실패 시나리오를 발생시킵니다.
            const random = Math.random();
            if (random < 0.2) {
                reject(new Error("Quota Exceeded: Rate Limit Reached")); // RATE_LIMIT 유도
            } else if (random < 0.4) {
                reject(new TypeError('Network connection lost during data transfer')); // NETWORK_FAILURE 유도
            } else if (random < 0.6) {
                 // 성공 시나리오
                resolve(`[SUCCESS] Analysis Complete. Risk Score: High (92/100).`);
            } else {
                reject(new Error('403 Forbidden')); // AUTH_ERROR 유도
            }
        }, 2000); // 2초 지연을 주어 로딩 상태 체감
    });
};


const ApiTestPage: React.FC = () => {
    // useApiCall 훅 사용
    const { state, execute, reset } = useApiCall(mockDangerousApiCall);

    const handleExecute = async (initialFailure?: ApiFailureType) => {
        await execute(() => mockDangerousApiCall()); // 실행 시도
    };

    return (
        <div className="p-10 bg-gray-900 min-h-screen text-white">
            <h1 className="text-4xl font-mono mb-8 border-b pb-2 border-red-700">
                [SYSTEM] API Dependency Failure Handler 🛠️
            </h1>
            <p className="mb-6 text-gray-300">
                API 호출의 성공/실패 상태를 구조화하고, 실패 자체를 고객에게 판매 가능한 '위협 경험'으로 포장하는 테스트 페이지입니다.
            </p>

            {/* 1. Failure Display 영역 (가장 중요) */}
            <div className="mb-8 relative">
                <SystemFailureDisplay state={state} onRetry={() => handleExecute()} />
            </div>


            {/* 2. 실행 버튼 및 상태 표시 */}
            <div className="flex gap-4 items-center mt-10">
                <button 
                    onClick={() => handleExecute()} 
                    disabled={state.loading}
                    className={`px-8 py-3 font-bold transition ${
                        state.loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-700 hover:bg-red-800'
                    }`}
                >
                    {state.loading ? '⚙️ 분석 중... (2초 대기)' : 'API 호출 시뮬레이션 실행'}
                </button>

                 <button 
                    onClick={() => reset()} 
                    disabled={!state.data && !state.error}
                    className={`px-4 py-3 font-bold transition ${
                        (!state.data && !state.error) ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 cursor-not-allowed'
                    }`}
                >
                    상태 리셋
                </button>
            </div>

            {/* 3. 결과 표시 */}
            <div className="mt-12 p-6 bg-green-900/50 border-l-4 border-green-500">
                <h3 className="text-xl font-mono text-green-400 mb-2">✅ 최종 결과 (Success Payload)</h3>
                {state.data ? <p className="text-lg">{state.data}</p> : <p className="text-gray-400">아직 데이터가 없습니다. 실행 버튼을 눌러 테스트해 보세요.</p>}
            </div>

        </div>
    );
};

export default ApiTestPage;