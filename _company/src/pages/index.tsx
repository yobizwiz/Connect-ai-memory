import React, { useCallback } from 'react';
import QLossGatekeeper from '../components/QLossGatekeeper';
import { FaCreditCard, FaStore, FaShieldAlt } from 'react-icons/fa'; // 필요한 아이콘만 임포트

// 부모 컴포넌트 (실제 Landing Page 역할을 수행)
const HomePage: React.FC = () => {
    const [lastReportResult, setLastReportResult] = React.useState<any>(null);

    /**
     * QLossGatekeeper로부터 최종 리스크 결과를 받아 처리하는 콜백입니다.
     * 이 함수가 실제 유료 결제 플로우를 트리거합니다.
     */
    const handlePurchaseCompletion = useCallback((result: any) => {
        setLastReportResult(result);
        // TODO: 여기서 /pay?risk=CRITICAL 로 강제 리다이렉션 로직을 구현해야 합니다.
        console.log("✅ 최종 구매 흐름 시작:", result);
    }, []);

    return (
        <div className="min-h-screen bg-[#121212] text-white py-12">
            {/* ----------------- HERO SECTION ----------------- */}
            <header className="text-center mb-20 pt-10">
                <h1 className="text-6xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-400">
                    당신의 비즈니스는 안전합니까? (QLoss 진단)
                </h1>
                <p className="mt-6 text-xl text-slate-300 max-w-2xl mx-auto">
                    단순한 컨설팅이 아닙니다. 저희는 당신의 시스템에 내재된 **구조적 생존 위협(Structural Survival Threat)**을 찾아냅니다.
                </p>
            </header>

            {/* ----------------- DIAGNOSIS & PURCHASE SECTION ----------------- */}
            <main className="max-w-3xl mx-auto">
                <div className='text-center mb-12'>
                    <h2 className='text-3xl font-bold text-slate-200 flex items-center justify-center'>
                        {/* QLossGatekeeper 컴포넌트를 사용하고, 결제 버튼 클릭 이벤트를 가로채는 역할을 합니다. */}
                         진단 결과 보고서 받기 <FaStore className='ml-3 text-red-500' />
                    </h2>
                </div>

                {/* 핵심: 게이트키퍼 컴포넌트 삽입 (가상의 결제 버튼 클릭을 유도) */}
                <QLossGatekeeper onPurchaseAttempt={handlePurchaseCompletion} />

                {lastReportResult && (
                    <div className="mt-16 p-8 bg-[#220a0a] border-l-4 border-red-500/70 rounded-lg shadow-xl">
                        <h3 className='text-2xl font-bold text-red-400 mb-2'>[진단 결과 보고서 요약]</h3>
                        <p className={`text-lg ${lastReportResult.status === 'FAILED' ? 'text-red-300' : 'text-green-300'}`}>
                            상태: {lastReportResult.status} | 위험 레벨: <span className='font-extrabold'>{lastReportResult.risk_level || 'N/A'}</span>
                        </p>
                        <p className="mt-2 text-slate-400">
                            다음 단계로 진행하여 구체적인 해결책을 확인하십시오. (강제 CTA)
                        </p>
                    </div>
                )}

                 {/* 일반 정보 섹션 */}
                 <section className='mt-20 p-8 bg-[#1e1e1e] rounded-xl'>
                     <h3 className='text-2xl font-bold text-slate-200 mb-4'>왜 QLoss인가요?</h3>
                     <p className='text-slate-300 mb-6'>우리는 당신이 "문제가 있다"고 느끼기 전에, 시스템 자체가 위험 신호를 보내도록 설계했습니다. 이 경험은 단순한 마케팅을 넘어, **재무적 손실 방지 보험**의 첫 단계입니다.</p>
                     <div className='flex justify-around'>
                         <div>
                             <FaShieldAlt className='text-4xl text-red-500 mb-2'/>
                             <p className='font-semibold'>위협 시나리오</p>
                             <p className='text-sm text-slate-400'>($X Million 손실 예측)</p>
                         </div>
                         <div>
                             <FaCreditCard className='text-4xl text-blue-500 mb-2'/>
                             <p className='font-semibold'>솔루션 제공</p>
                             <p className='text-sm text-slate-400'></p>
                         </div>
                     </div>
                 </section>

            </main>
        </div>
    );
};

export default HomePage;