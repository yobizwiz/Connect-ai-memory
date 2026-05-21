import React from 'react';
import { ApiState, ApiFailureType } from '../hooks/useApiCall';

interface SystemFailureDisplayProps {
    state: ApiState<any>;
    onRetry: () => void;
}

/**
 * API 호출 실패 시 사용자에게 보여주는 '구조적 무결성 위협' 컴포넌트.
 * 단순 에러 메시지가 아닌, 전문적인 경고 경험을 제공합니다.
 */
const SystemFailureDisplay: React.FC<SystemFailureDisplayProps> = ({ state, onRetry }) => {
    // 1. 성공/로딩 상태일 때는 아무것도 표시하지 않습니다.
    if (state.loading || state.data) return null;

    // 2. 에러가 있을 때만 작동합니다.
    const error = state.error;

    if (!error) return null;

    let title: string;
    let description: React.ReactNode;
    let actionButtonText: string;

    // 실패 타입에 따라 위협의 톤을 조정합니다. [근거: 자율 사이클 — 2026-05-21T13:55]
    switch (error.code) {
        case 'RATE_LIMIT':
            title = "🚨 API 요청 제한 초과 감지 (Rate Limit Exceeded)";
            description = <p>현재 시스템의 처리 용량을 초과했습니다. 반복적인 호출은 데이터 무결성을 위협할 수 있습니다. 잠시 후 재시도하십시오.</p>;
            actionButtonText = "재진단 요청";
            break;
        case 'AUTH_ERROR':
            title = "⚠️ 권한 구조 결함: 접근 거부 (Authorization Error)";
            description = <p>요청된 리소스에 대한 적절한 인증/인가 레벨이 확인되지 않았습니다. 시스템의 보호 장치가 작동했습니다.</p>;
            actionButtonText = "로그인 재검증";
            break;
        case 'API_CONTRACT_VIOLATION':
             title = "🔥 치명적 오류: API 계약 위반 (Contract Violation)";
            description = <p>사용된 데이터 구조가 예상되는 규정/시스템 스펙과 불일치합니다. 이는 보고서의 근거 자료 자체가 무효화되었음을 의미할 수 있습니다.</p>;
            actionButtonText = "전문가 검토 요청";
            break;
        default:
            title = `❌ 시스템 오류 발생 [${error.code}]`;
            description = <p>예상치 못한 구조적 문제가 감지되었습니다. 상세 정보: {error.details || '알 수 없음'}</p>;
            actionButtonText = "시스템 재시도";
    }

    return (
        <div className="red-zone-overlay p-8 border-4 border-red-700 bg-black/90 text-white max-w-xl">
            <h2 className="text-3xl font-mono text-red-500 mb-4 tracking-wider">{title}</h2>
            <div className="mb-6 p-4 bg-gray-800 border-l-4 border-yellow-500 text-sm">
                {description}
            </div>
            <button 
                onClick={onRetry} 
                className="px-6 py-3 bg-red-700 hover:bg-red-800 transition duration-200 font-bold tracking-widest"
            >
                {actionButtonText}
            </button>
        </div>
    );
};

export default SystemFailureDisplay;