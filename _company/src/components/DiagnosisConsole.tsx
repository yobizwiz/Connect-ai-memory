import React, { useState } from 'react';
import { useRiskCalculator } from '../hooks/useRiskCalculator';
import PaywallBarrier from './PaywallBarrier';

/**
 * @description 메인 컨테이너 컴포넌트: 시스템 에러 콘솔의 외관과 상태 흐름을 담당합니다.
 */
const DiagnosisConsole: React.FC = () => {
  // State Management Flow 관리: '진단 전' -> '진행 중' -> '결과 확인' -> (Paywall)
  const [hasRunDiagnosis, setHasRunDiagnosis] = useState(false);
  const [diagnosisData, setDiagnosisData] = useState<any>({ containsPII: true, hasComplianceGap: false, lacksAuditLog: true });

  // 훅을 사용하여 리스크 계산 로직 호출
  const { riskMetrics, isLoading, error, calculateAndSetRisk } = useRiskCalculator();

  const handleRunDiagnosis = async () => {
    if (isLoading) return;

    setHasRunDiagnosis(false); // 진단 시작 시 초기화
    await calculateAndSetRisk(diagnosisData);
    setHasRunDiagnosis(true); // 로직 실행 완료 후 플래그 설정
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-yellow-400 animate-pulse">... 데이터 스트리밍 및 $TRE$ 계산 중입니다. 잠시만 기다려 주십시오.</div>;
    }
    if (error) {
        return <div className="text-red-600 p-4 border border-red-700 bg-red-900/30">{`ERROR: ${error}`}</div>;
    }
    if (!riskMetrics) return null; // 데이터가 아직 없으면 아무것도 안 보여줌

    // ⭐️ 핵심 로직: 리스크 레벨에 따라 Paywall 또는 결과 화면을 분기합니다.
    if (riskMetrics.structuralGapFound && riskMetrics.totalRiskExposureUSD >= 15000) {
      return <PaywallBarrier />; // 구조적 결함 발견 시 무조건 페이월로 유도
    }

    // 정상적인 진단 결과 출력 (Red Zone 컨셉)
    return (
      <div className="mt-8 p-6 bg-gray-900 border-l-4 border-red-500 shadow-lg">
        <h3 className="text-2xl text-white mb-4">[RESULT] 분석 완료: 구조적 취약점 감지</h3>
        <p className="text-gray-300 mb-6">
          당신의 시스템은 현재 **{riskMetrics.riskLevel}** 등급의 위험에 노출되어 있습니다. 즉각적인 대응이 필요합니다.
        </p>
        <div className="flex justify-between items-center p-4 bg-red-900/30 border border-red-700 rounded">
          <span className="text-2xl font-mono text-yellow-300">총 위험 노출도 ($TRE$):</span>
          <span className="text-5xl font-extrabold text-red-400">${riskMetrics.totalRiskExposureUSD.toLocaleString()}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#1a1c23] p-8">
      <h1 className="text-4xl font-bold text-red-500 mb-6 border-b border-gray-700 pb-2">[YOBIZWIZ: System Integrity Audit Console v1.0]</h1>
      <p className="text-sm text-yellow-500 mb-8">
        🚨 경고: 본 시스템은 귀사의 비표준적 운영 데이터를 분석하여 잠재적 재정 손실을 진단합니다. [근거: 💻 코다리 개인 메모리, Self-RAG]
      </p>

      {/* Input/Action Block */}
      <div className="bg-gray-800 p-6 rounded-lg mb-12 shadow-xl">
        <h2 className="text-xl text-white mb-4">[INPUT DATA STREAM]</h2>
        <p className="text-sm text-gray-400 mb-6">
          분석할 데이터를 로드하고 진단을 시작합니다. (Mock Data: PII 포함, 감사 로그 부재 등 치명적 오류 가정)
        </p>
        <button
          onClick={handleRunDiagnosis}
          disabled={isLoading}
          className={`px-8 py-3 text-lg font-bold rounded-md transition duration-300 ${
            isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 shadow-[0_0_15px_rgba(255, 50, 50, 0.8)]'} text-white`}
        >
          {isLoading ? 'ANALYZING...' : '무료 진단 요청 및 리스크 분석 시작 (3초 지연)'}
        </button>
      </div>

      {/* Result/Output Block */}
      <div className="relative min-h-[200px] pt-10">
        {renderContent()}
      </div>
    </div>
  );
};

export default DiagnosisConsole;