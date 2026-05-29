import React from 'react';

/**
 * @description 무료 진단 후 만나는 결제 장벽 컴포넌트입니다.
 * 위기감을 최고조로 끌어올리는 것이 목표입니다.
 */
const PaywallBarrier: React.FC = () => {
  return (
    <div className="p-10 max-w-3xl mx-auto bg-gray-950 border border-red-700 shadow-[0_0_20px_rgba(255,0,0,0.8)] animate-pulse">
      <h2 className="text-4xl font-extrabold text-red-500 mb-4 tracking-widest">[SYSTEM ALERT]</h2>
      <p className="text-xl text-white mb-6 border-l-4 border-yellow-500 pl-3">
        진단 완료. 현재 총 위험 노출도($TRE$)는 임계치를 넘어섰습니다. 이 상태는 **운영 생존에 치명적**입니다. [근거: Self-RAG, 💻 코다리 개인 메모리]
      </p>
      <div className="text-center space-y-6">
        <p className="text-2xl text-gray-300">
          이 데이터는 진단의 시작일 뿐입니다. 구조적 공백을 메우고, 시스템 무결성을 복구하려면 <span className="font-bold text-red-400">전문가의 직접 개입</span>이 필수입니다.
        </p>
        <button className="px-12 py-3 text-lg font-bold rounded-md transition duration-300 bg-yellow-600 hover:bg-yellow-500 text-gray-900 shadow-xl">
          ▶️ 심층 진단 및 운영 보험료(Survival Fee) 요청하기
        </button>
      </div>
    </div>
  );
};

export default PaywallBarrier;