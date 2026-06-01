import React from 'react';
import { useDiagnosisState } from '../hooks/useDiagnosisState';

interface DiagnosisButtonProps {
    // 상태와 핸들러를 props로 받아서 재사용성을 높입니다. (Dependency Injection 패턴)
    status: 'IDLE' | 'CALCULATING' | 'PAIDWALL_ACTIVE';
    onDiagnose: () => void;
}

/**
 * 진단 시작 버튼 컴포넌트. 상태에 따라 비활성화됩니다.
 */
const DiagnosisButton: React.FC<DiagnosisButtonProps> = ({ status, onDiagnose }) => {
    let buttonText = '🚨 나의 리스크 점수 진단하기';
    let isDisabled = status !== 'IDLE';

    if (status === 'CALCULATING') {
        buttonText = '진단 중... 시스템 로딩 및 분석 완료까지 잠시만 기다려주세요.';
    } else if (status === 'PAIDWALL_ACTIVE') {
        buttonText = '🚨 [필수] 다음 단계로 진행하려면 구독이 필요합니다.';
    }

    return (
        <button 
            onClick={onDiagnose} 
            disabled={isDisabled}
            className={`px-8 py-3 text-lg font-bold transition-all ${
                isDisabled ? 'bg-gray-700 cursor-not-allowed' : 'bg-[#C0392B] hover:bg-[#A93025]'
            }`}
        >
            {buttonText}
        </button>
    );
};

export default DiagnosisButton;