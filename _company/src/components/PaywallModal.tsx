import React from 'react';

interface PaywallModalProps {
  onClose: () => void; // 외부에서 호출 가능한 닫기 함수
}

const PaywallModal: React.FC<PaywallModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex justify-center items-center p-4 animate-fadeIn">
      <div className={`bg-[#1A1A1A] border-t-8 ${'border-[#DC2626]'} shadow-[0_0_50px_rgba(220,38,38,0.7)] max-w-lg w-full p-8 transform scale-95 animate-zoomIn`}>
        <h3 className="text-4xl font-extrabold mb-2 text-[#DC2626] tracking-wider">
          ⚠️ 시스템 무결성 결함 발견!
        </h3>
        <p className="text-lg text-gray-300 mb-6 border-b border-yellow-700 pb-4">
          귀하의 비즈니스는 현재 {window.innerWidth > 1024 ? '구조적 결함' : '위협 레벨'}에 놓여 있습니다. $L_{max}$ 수치에 대한 전문 진단 없이는 시스템을 정상화할 수 없습니다.
        </p>

        {/* 모의 Payment Form */}
        <div className="space-y-4">
            <div>
                <label htmlFor="card" className="block text-sm font-medium text-gray-300 mb-1">결제 금액 (진단 리포트):</label>
                <input type="text" id="card" placeholder="$9,999.00 USD" className="w-full p-3 bg-[#2c2c2c] border border-gray-600 text-white focus:ring-[#DC2626] focus:border-[#DC2626]" disabled />
            </div>
             <div>
                <label htmlFor="cc_name" className="block text-sm font-medium text-gray-300 mb-1">카드 소유주명:</label>
                <input type="text" id="cc_name" placeholder="Your Name" className="w-full p-3 bg-[#2c2c2c] border border-gray-600 text-white focus:ring-[#DC2626] focus:border-[#DC2626]"/>
            </div>
        </div>

        <div className="flex justify-between mt-8">
            <button 
                onClick={onClose} 
                className="px-6 py-3 text-gray-400 border border-gray-700 hover:bg-gray-800 transition duration-200"
            >
                닫기 (진단 포기)
            </button>
            <button className="px-10 py-3 bg-[#DC2626] text-white font-extrabold uppercase hover:bg-red-500 transition duration-200 shadow-[0_0_20px_rgba(220,38,38,0.9)]">
                진단 리포트 구매 및 시작하기
            </button>
        </div>
      </div>
    </div>
  );
};