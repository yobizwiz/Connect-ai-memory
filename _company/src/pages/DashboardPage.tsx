import React, { useState } from 'react';
import RiskGauge from '../components/RiskGauge';
import PaywallModal from '../components/PaywallModal';

const DashboardPage: React.FC = () => {
  // 💡 [Defensive Coding] Paywall Modal의 개방 여부를 상태로 관리합니다.
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Gauge에서 발생한 요청을 받아 모달을 열어주는 핸들러
  const handleDiagnosisRequest = () => {
    setIsModalOpen(true); // State 변화를 통해 Paywall 렌더링 트리거
    console.log("User requested diagnosis. Opening Paywall Barrier.");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header/Dashboard Title */}
      <header className="mb-12 border-b border-neon-red pb-4">
        <h1 className="text-3xl font-bold text-neon-red uppercase tracking-wider">System Integrity Dashboard</h1>
        <p className="text-gray-400 mt-1">Real-time Risk Monitoring & Compliance Status</p>
      </header>

      {/* 📈 Core Component: Live Risk Gauge */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-6 text-white">Core Metrics</h2>
        <RiskGauge onDiagnosisRequested={handleDiagnosisRequest} />
      </section>

      {/* 📑 Placeholder Content (추가 기능 영역) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
              <h3 className="text-xl text-yellow-500 mb-2">Compliance Checklists</h3>
              <p className="text-gray-400">AI Act, GDPR 준수율 (92%)</p>
          </div>
           <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
              <h3 className="text-xl text-blue-500 mb-2">API Status</h3>
              <p className="text-gray-400">Audit Log API Online (Latency: 12ms)</p>
          </div>
      </div>

      {/* Paywall Modal 통합 */}
      <PaywallModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default DashboardPage;