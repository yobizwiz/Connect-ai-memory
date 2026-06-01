import React from 'react';

/**
 * @description 최종 목표지점: 결제 배리어 모달. 이탈 방지를 위한 강제 진입 지점.
 */
const PaywallModalBarrier: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4">
      <div className="bg-[#1a0d0f] border-8 border-red-700 shadow-[0_0_60px_#ff0000] max-w-3xl w-full p-12 text-center animate-in zoom-in duration-500">
        <div className="text-9xl mb-4" role="img" aria-label="경고 아이콘">🔥</div>
        <h1 className="text-7xl font-black tracking-tighter uppercase text-[#ffaaaa] drop-shadow-[0_0_15px_#ff0000]">
          [ACCESS DENIED] <br />Premium Barrier Locked
        </h1>
        <p className="text-3xl mt-4 text-red-200/90">
          현재 노출된 $L_{max}$ 수치는 귀사의 현재 자원으로는 감당할 수 없는 수준입니다.
        </p>
        <div className="mt-8 p-6 bg-[#3a1c1f] border-l-4 border-red-500">
          <h3 className="text-xl font-bold text-white">
            솔루션이 필요합니다. (Premium Solution Required)
          </h3>
          <p className="mt-2 text-gray-300/80">
            위험을 관리하고 재정적 손실액($L_{max}$)을 절감할 수 있는 유일한 방법은 '시스템 무결성 감사 리포트' 구매입니다.
          </p>
        </div>
        <button 
          onClick={() => { alert('결제 프로세스 시작...'); onClose(); }}
          className="mt-10 w-full py-4 text-2xl font-bold uppercase tracking-widest bg-[#ff0000] hover:bg-[#cc0000] transition duration-300 shadow-[0_0_25px_#ff0000]"
        >
          🔴 진단 리포트 구매 (Unlock Solution) 💳
        </button>
      </div>
    </div>
  );
};

export default PaywallModalBarrier;