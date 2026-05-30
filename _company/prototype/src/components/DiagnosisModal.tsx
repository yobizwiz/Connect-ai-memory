import React from 'react';

/**
 * @description Paywall 전환을 담당하는 모달 컴포넌트. 
 * 사용자가 진단 요청에 대한 심리적 가치를 느끼도록 설계합니다.
 */
const DiagnosisModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        // Overlay: 배경을 어둡게 하고, 포커스를 모달로 강제 이동시킵니다. [근거: 💻 코다리 개인 메모리]
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-lg p-10 bg-[#2a0e0e] border-4 border-[#c0392b]/70 shadow-[0_0_50px_rgba(192,57,43,0.6)] transform transition-transform duration-500 animate-zoomIn">
                
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">&times;</button>

                {/* 경고 헤더 */}
                <div className='text-center mb-8'>
                    <h2 className="text-4xl font-extrabold uppercase tracking-widest text-[#f56c5e]">
                        Access Restricted. Diagnosis Required.
                    </h2>
                    <p className="mt-2 text-lg text-gray-300">
                        Your current risk profile requires professional evaluation to prevent structural collapse.
                    </p>
                </div>

                {/* 가치 증명 및 CTA */}
                <div className='text-center space-y-6'>
                    <p className="text-sm text-gray-400 italic border-l-4 pl-4 border-[#c0392b]">
                        "Self-diagnosis is insufficient. You need a quantified, systemic report." - yobizwiz Core Principle
                    </p>
                    
                    <button 
                        onClick={() => { console.log("🚀 Purchase flow initiated."); onClose(); }} 
                        className="w-full py-4 text-xl font-bold uppercase bg-[#c0392b] hover:bg-[#a83526] transition duration-200 shadow-lg shadow-[#c0392b]/50"
                    >
                        Proceed to Full Risk Diagnosis ($L_{max}$ Report)
                    </button>

                    <p className="text-xs text-gray-500 pt-4">
                        (By proceeding, you acknowledge the high risk of non-compliance.)
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DiagnosisModal;