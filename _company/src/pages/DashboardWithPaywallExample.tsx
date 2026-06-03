// src/pages/DashboardWithPaywallExample.tsx (테스트용 상위 컴포넌트)
import React, { useState } from 'react';
import PaywallBarrier from '../components/paywall/PaywallBarrier';

const DashboardWithPaywallExample: React.FC = () => {
  // 🚨 실제로는 백엔드 API를 통해 이 값을 받아와야 합니다.
  // 테스트 목적을 위해 임시 상태 변수로 정의합니다. (75점 초과 시 Paywall 발동)
  const [riskScore, setRiskScore] = useState(82); // Critical Score로 설정하여 테스트

  // 결제 요청 처리 핸들러
  const handleDiagnosisRequest = (score: number) => {
    console.log(`✅ Diagnosis Request Processed: Final score ${score} confirmed.`);
    alert("🚨 강제 진입! Paywall 로직에 따라 모달을 띄웁니다.");
    // 실제로는 여기에 Payment Gateway Modal State를 토글하는 로직이 들어갑니다.
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <h1>📊 Your Financial Health Dashboard</h1>
      <p>현재 시스템 리스크 점수: <span style={{ color: riskScore >= 75 ? '#C0392B' : '#2ECC71', fontWeight: 'bold' }}>{riskScore}점</span></p>

      {/* 핵심 컴포넌트 배치 */}
      <PaywallBarrier 
        initialRiskScore={riskScore} 
        onDiagnosisRequest={handleDiagnosisRequest} 
      />
    </div>
  );
};

export default DashboardWithPaywallExample;