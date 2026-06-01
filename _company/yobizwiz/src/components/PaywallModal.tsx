import React from 'react';
import { useDiagnosisState } from '../hooks/useDiagnosisState';

interface PaywallProps {
    isOpen: boolean;
    riskScoreTRE: number | null;
    onClose: () => void;
}

/**
 * 핵심 수익화 게이트. 사용자가 가장 공포를 느끼고, 해결책을 구매하도록 강제하는 인터페이스입니다.
 */
const PaywallModal: React.FC<PaywallProps> = ({ isOpen, riskScoreTRE, onClose }) => {
    if (!isOpen || !riskScoreTRE) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className={`w-[90%] max-w-xl p-10 rounded-lg shadow-2xl ${riskScoreTRE > 300 ? 'border-4 border-[#C0392B] animate-pulse' : 'border-4 border-gray-700'}`}>
                <div className="text-center mb-8">
                    <h1 className={`text-4xl font-extrabold text-[#C0392B] tracking-wider`}>
                        ⚠️ [경고]: 시스템 임계치 초과 감지 ⚠️
                    </h1>
                    <p className="mt-2 text-xl text-gray-300">
                        당신의 현재 리스크 노출 수준은 치명적입니다. 즉각적인 조치가 필요합니다.
                    </p>
                </div>

                {/* 핵심 데이터 시각화 */}
                <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#2980B9]/50">
                    <h2 className="text-xl font-semibold text-gray-400 mb-3">
                        ✅ 진단 결과: Total Risk Exposure (TRE)
                    </h2>
                    <div className='flex justify-between items-end'>
                        <span className="text-6xl font-mono text-[#C0392B]">{riskScoreTRE}</span>
                        <span className="text-sm uppercase text-gray-400">점수 (Max 100%)</span>
                    </div>
                    {/* 실제 리스크 게이지 로직이 여기에 들어갈 예정 */}
                </div>

                <div className='mt-8 p-6 bg-[#2980B9]/10 border-l-4 border-[#2980B9]'>
                     <h3 className="text-2xl font-bold text-[#2980B9]">
                        ➡️ 생존을 위한 필수 투자 (Mandate Path)
                    </h3>
                     <p className="mt-1 text-gray-300">
                         이 리스크를 방지하려면, 전문적인 '시스템적 공백 분석'이 의무적으로 필요합니다. 지금 바로 <strong className='text-[#C0392B]'>yobizwiz의 보호막</strong>을 가입하십시오.
                    </p>
                </div>

                <div className="mt-8 flex justify-center space-x-4">
                    <button 
                        className="px-6 py-3 bg-[#C0392B] text-white font-bold hover:bg-[#A93025] transition"
                        onClick={() => { console.log("💳 결제 모듈 호출 로직 실행"); onClose(); }}
                    >
                        🛡️ 리스크 방지 플랜 구매하기 (의무)
                    </button>
                     <button 
                        className="px-6 py-3 bg-gray-700 text-white font-bold hover:bg-gray-600 transition"
                        onClick={onClose}
                    >
                        닫기 및 재진단 (비추천)
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PaywallModal;