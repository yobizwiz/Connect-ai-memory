import React, { useState } from 'react';
// 커스텀 훅 임포트
import { useRedZone } from '../hooks/useRedZone';
// 컴포넌트 임포트 (나중에 생성)
import HeroSection from '../components/sections/HeroSection';
import LossMeter from '../components/sections/LossMeter';

/**
 * @component yobizwiz Landing Page Main Container.
 * 사용자의 리스크 공포를 유도하고 '진단 요청'을 강제하는 메인 페이지 구조입니다.
 */
const YobizwizLandingPage: React.FC = () => {
  // 초기 상태 설정 (가정: 방문 시점의 낮은 위험 레벨)
  const [initialRisk, setInitialRisk] = useState<'LOW' | 'MEDIUM'>('LOW');
  const { riskLevel, isCritical, getStyles } = useRedZone(initialRisk);

  /**
   * 핵심 API 호출 지점: 사용자가 CTA를 클릭했을 때 실행되는 로직.
   * A/B 테스트 및 트래킹이 이곳에 집중되어야 합니다. [근거: 💻 코다리 개인 메모리]
   */
  const handleSubmitAuditRequest = async (data: any) => {
    console.log("Attempting to submit audit request...");
    // 1. 클라이언트 측 유효성 검사 및 데이터 구조화
    if (!data || !data.riskScore) {
      alert('유효하지 않은 데이터를 받았습니다.');
      return;
    }

    try {
      // 2. API 호출 시뮬레이션 (실제 백엔드 엔드포인트 필요: /api/v1/audit-request)
      const response = await fetch('/api/v1/audit-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          source_risk_level: riskLevel, // 현재 페이지의 리스크 상태 전파
          timestamp: new Date().toISOString(),
          // A/B 테스트 그룹 ID를 요청 시점에 받아와야 함 (예: cookie 또는 query param)
        }),
      });

      if (!response.ok) {
        throw new Error(`API Call failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log("Audit Request Success:", result);
      // 3. 성공 후 다음 액션 (예: 문의 양식으로 리다이렉트)
    } catch (error) {
      console.error("System Error during Audit Submission:", error);
      alert('시스템 오류 발생! 다시 시도해 주세요.');
    }
  };

  const containerStyle = getStyles(); // Red Zone 스타일 적용
  
  return (
    <div style={{ 
        minHeight: '100vh', 
        fontFamily: 'Arial, sans-serif', 
        background: `repeating-linear-gradient(45deg, #333 0px, #333 1px, transparent 1px, transparent 20px)`, // 기본 노이즈 배경
        transition: 'all 0.8s ease',
        ...containerStyle // Red Zone 스타일 오버레이 적용
    }}>
      <main className="max-w-7xl mx-auto py-16">
        {/* 섹션들을 순차적으로 배치하여 리스크가 점진적으로 높아지는 경험을 유도 */}
        <HeroSection 
          riskLevel={riskLevel} 
          onSubmitRequest={handleSubmitAuditRequest} 
        />

        <div className="my-24 border-t border-gray-700/50"></div>

        <LossMeter /> {/* 이 컴포넌트가 리스크를 높이는 역할을 수행해야 함 */}

        {/* 최종 CTA 섹션 (여기에 handleSubmitAuditRequest 함수를 다시 바인딩) */}
        <div className="text-center py-20 bg-[#1a0000]"> 
            <h2 className="text-4xl font-bold text-red-500">시스템적 생존 위협을 체감하셨습니까?</h2>
            {/* 최종 CTA 버튼 (실제 사용 시 여기에서 handleSubmitAuditRequest 호출) */}
        </div>
      </main>
    </div>
  );
};

export default YobizwizLandingPage;