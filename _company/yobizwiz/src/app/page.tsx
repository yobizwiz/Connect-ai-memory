'use client'; // Next.js Client Component로 지정해야 useState와 이벤트 핸들러 사용 가능

import React, { useState } from 'react';
import DiagnosisButton from '../components/DiagnosisButton';
import LoadingIndicator from '../components/LoadingIndicator';
import PaywallModal from '../components/PaywallModal';
import { useDiagnosisState } from '../hooks/useDiagnosisState';

// 페이지 컴포넌트: main logic flow를 담당합니다.
const DiagnosisPage = () => {
    // 훅을 사용하여 전역 상태 및 액션을 가져옵니다. (Clean Architecture)
    const { status, riskScoreTRE, initiateDiagnosis, resetDiagnosis } = useDiagnosisState();

    // Paywall 모달의 열림/닫힘 상태를 관리합니다.
    const [isModalOpen, setIsModalOpen] = useState(false);

    /**
     * 1. 진단 버튼 클릭 핸들러: 시스템 플로우 시작점입니다.
     */
    const handleDiagnosisClick = async () => {
        // 로직 실행 전에 모달은 확실히 닫습니다.
        setIsModalOpen(false);
        await initiateDiagnosis();
    };

    /**
     * 2. Paywall 활성화 시, 모달을 열고 상태를 고정합니다.
     */
    React.useEffect(() => {
        if (status === 'PAIDWALL_ACTIVE' && riskScoreTRE !== null) {
            setIsModalOpen(true);
        } else if (status === 'IDLE') {
             setIsModalOpen(false); // 상태 초기화 시 모달 닫기
        }
    }, [status, riskScoreTRE]);


    return (
        <div className="min-h-screen bg-[#1A1A1A] text-white p-8">
            <header className="text-center mb-16 border-b border-gray-700 pb-8">
                <h1 className="text-5xl font-extrabold tracking-tight text-[#2980B9]">
                    yobizwiz: 구조적 리스크 진단 게이트
                </h1>
                <p className="mt-3 text-lg text-gray-400">
                    당신의 재정 시스템이 직면한 '구조적 공백(Structural Gap)'을 지금 즉시 확인하십시오.
                </p>
            </header>

            {/* 핵심 상호작용 영역 */}
            <div className="max-w-3xl mx-auto text-center bg-[#1A1A1A] p-8 rounded-xl shadow-2xl border border-gray-700">
                <h2 className="text-3xl font-semibold mb-6 text-red-400">
                    🚨 리스크 진단 시작
                </h2>

                {/* 상태에 따라 다른 UI를 보여줍니다. (State Machine 구현) */}
                {status === 'CALCULATING' ? (
                    <LoadingIndicator />
                ) : (
                    <>
                        <p className="text-gray-300 mb-8 text-lg">
                            진단 버튼을 클릭하여 당신의 총 리스크 노출 점수(TRE)를 확인하세요. 이 점수는 단순한 지표가 아닌, <strong className='text-[#C0392B]'>재정적 생존 의무</strong>와 직결됩니다.
                        </p>

                        {/* 진단 버튼 컴포넌트 사용 */}
                        <DiagnosisButton 
                            status={status} 
                            onDiagnose={handleDiagnosisClick} 
                        />

                        {/* 상태 리셋 및 설명 영역 */}
                        {(status === 'IDLE' || status === 'PAIDWALL_ACTIVE') && (
                             <div className="mt-12 p-6 bg-[#1A1A1A]/50 border-l-4 border-[#2980B9]">
                                <p className='text-gray-400'>* 이 진단은 시뮬레이션이며, 실제 법적 효력과 같습니다. 모든 서비스는 의무적으로 점검되어야 합니다.</p>
                            </div>
                        )}
                    </>
                )}

            </div>

            {/* 페이월 모달 컴포넌트 (최상위 레벨에서 렌더링) */}
            <PaywallModal 
                isOpen={isModalOpen} 
                riskScoreTRE={riskScoreTRE}
                onClose={() => setIsModalOpen(false)} 
            />

        </div>
    );
};

export default DiagnosisPage;