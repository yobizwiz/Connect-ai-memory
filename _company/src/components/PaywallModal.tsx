import React from 'react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    // Modal Overlay: 화면 전체를 어둡게 덮어 시선 집중 유도
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 transition-opacity backdrop-blur-sm">
      {/* Modal Content: 실제 Paywall 콘텐츠 */}
      <div 
        className={`relative w-full max-w-lg p-12 rounded-xl shadow-[0_0_50px_rgba(255,69,0,0.7)] bg-gray-900/95 border-4 border-neon-red transition-all duration-500 transform ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Glitch Background Effect - 시각적 긴장감 조성 */}
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0 animate-glitch"></div>

        <div className="relative z-10 text-center space-y-8">
          {/* Red Zone Header: 공포 유발 */}
          <h2 className="text-5xl font-extrabold text-neon-red tracking-widest uppercase animate-pulse">
            🔴 Critical Risk Detected
          </h2>
          
          <p className="text-xl text-gray-300 border-l-4 border-yellow-500 pl-4 py-2 bg-black/30">
            현재 귀사의 시스템은 주요 규제 리스크 임계치를 초과했습니다. 이대로 방치할 경우, 재무적 손실($L_{'max'}$)이 예상됩니다.
          </p>

          {/* Core Value Proposition */}
          <div className="text-left bg-gray-800 p-6 rounded-lg border-t-2 border-yellow-500">
            <h3 className="text-2xl font-bold text-white mb-2">🛡️ Immediate Solution Required</h3>
            <p className="text-sm text-gray-400">
              오직 <span className="font-mono text-neon-red">yobizwiz Premium Tier</span>만이 실시간으로 리스크를 역추적하고, 법률 준수 프로세스를 자동화하여 $L_{'max'}$ 회피를 보장합니다.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col space-y-4 pt-6">
            <button 
              onClick={() => { /* API 호출 시뮬레이션 */ }}
              className="w-full py-3 text-lg font-bold uppercase bg-neon-red hover:bg-opacity-90 transition duration-200 shadow-[0_0_15px_rgba(255,69,0,0.8)] transform hover:scale-[1.02]"
            >
              🔥 Premium Tier로 $L_{'max'}$ 회피하기 (지금 진단)
            </button>
            <button 
              onClick={onClose}
              className="w-full py-3 text-lg font-semibold uppercase border border-gray-600 hover:bg-gray-700 transition duration-200"
            >
              진단 나중에 하기 (X)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;