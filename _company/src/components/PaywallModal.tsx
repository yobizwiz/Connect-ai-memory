import React from 'react';
import { getDesignTokens } from '../utils/designTokensLoader';

interface PaywallModalProps {
    onClose: () => void; // 모달 닫기 함수 (사용자에게는 거의 주어지지 않아야 함)
}

const PaywallModal: React.FC<PaywallModalProps> = ({ onClose }) => {
    // Design Token을 사용하여 위협 색상과 배경색을 사용합니다.
    const tokens = getDesignTokens();
    const threatRed = tokens?.color['color-threat-red'] || '#C0392B';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl" aria-modal="true" role="dialog">
            <div 
                className={`w-full max-w-3xl bg-[#2a0c0c] border-4 border-[${threatRed}] shadow-[0_0_50px_rgba(192,57,43,0.8)] p-10 rounded-lg transform transition-all duration-500 scale-100`}
                style={{ borderColor: threatRed }}
            >
                <h2 className="text-4xl font-extrabold text-red-400 mb-4 tracking-widest uppercase animate-pulse">
                    🚨 [경고] 필수 진단 완료! 🔴
                </h2>
                <p className="text-lg text-gray-300 mb-6 border-l-4 pl-4" style={{ borderColor: threatRed }}>
                    사용자님의 기업은 현재 **미개방 책임(Uncovered Liability)**에 심각하게 노출되어 있습니다. $L_{totalMax}$ 수치 확인이 필수적입니다.
                </p>

                <div className="text-center mb-10">
                    <p className="text-xl font-mono text-yellow-400">진단 리포트 접근 권한 필요.</p>
                    <p className="text-sm text-gray-500 mt-2">이 데이터는 공공재가 아닙니다. 시스템적 실패를 방어하는 보험료입니다.</p>
                </div>

                {/* 결제/업그레이드 CTA */}
                <button 
                    onClick={() => {console.log("Initiating Gold Tier Payment Flow...");}}
                    className="w-full py-4 text-xl font-bold rounded-lg transition duration-300 shadow-2xl"
                    style={{ backgroundColor: '#E74C3C', color: 'white', border: `2px solid ${threatRed}` }}
                >
                    🔑 Gold Tier 진입 및 미개방 책임 보험료 납부 ($XXX)
                </button>

                <p className="text-center mt-6 text-sm text-gray-500">
                    (이 버튼은 사용자 선택권이 아닌, 시스템적 필수 경로입니다.)
                </p>
            </div>
        </div>
    );
};

export default PaywallModal;