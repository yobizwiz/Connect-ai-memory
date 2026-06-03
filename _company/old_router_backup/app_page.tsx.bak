import React, { useState, useMemo } from 'react';
import RiskInputForm from '@/components/RiskInputForm';
import TotalRiskGauge from '@/components/TotalRiskGauge';
import PaywallModal from '@/components/PaywallModal';

// 💡 Component Props와 State 관리를 위한 상수 정의
interface RiskState {
  industry: string;
  employeeCount: number;
}

const initialRiskState: RiskState = { industry: 'General Tech', employeeCount: 10 };

export default function Home() {
  const [riskState, setRiskState] = useState<RiskState>(initialRiskState);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 핵심 로직: 리스크 점수 계산 (useMemo로 성능 최적화)
  const totalRiskScore = useMemo(() => {
    // ⚠️ 코다리: 여기는 Researcher의 데이터를 기반으로 하는 '가중치 함수'입니다.
    // 실제 배포 시, 이 함수 내에 API 호출을 통해 복잡한 리스크 모델이 들어가야 합니다.
    let score = calculateTotalRiskScore(riskState);
    return Math.min(100, Math.max(0, score)); // 0% ~ 100% 클램핑
  }, [riskState]);

  // 상태 머신 로직: 점수 기반으로 모달 오픈 여부 결정 (Funneling Gate)
  React.useEffect(() => {
    if (totalRiskScore > 70 && !isModalOpen) {
      console.warn("🚨 Critical Threshold Exceeded! Activating Paywall Funnel.");
      // 일정 시간 후 강제 전환을 시뮬레이션하여 사용자에게 긴급성을 부여합니다.
      const timer = setTimeout(() => setIsModalOpen(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setIsModalOpen(false);
    }
  }, [totalRiskScore]);

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white p-8 font-mono">
      <header className="text-center mb-12 pt-4 border-b border-red-900/50">
        <h1 className="text-4xl font-extrabold tracking-widest uppercase text-red-500">// YOBIZWIZ :: SYSTEM AUDIT PORTAL</h1>
        <p className="mt-2 text-lg text-gray-400">// L_max 기반 구조적 리스크 진단 시스템</p>
      </header>

      {/* 1. 입력 및 제어 영역 */}
      <div className="max-w-3xl mx-auto mb-16 bg-[#251e1e] p-8 border border-[#DC2626]/40 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
        <h2 className="text-xl text-red-400 mb-6">// 🔍 리스크 진단 입력 (Input Variables)</h2>
        <RiskInputForm onStateChange={setRiskState} />
      </div>

      {/* 2. 게이지 디스플레이 영역 */}
      <div className="max-w-3xl mx-auto mb-24">
        <TotalRiskGauge score={totalRiskScore} />
      </div>

      {/* 3. Paywall 모달 (조건부 렌더링) */}
      {isModalOpen && (
        <PaywallModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}

// ===============================================================
// CORE LOGIC IMPLEMENTATION
// ===============================================================

/**
 * @description 총 리스크 점수 L_totalMax를 계산하는 핵심 함수.
 * 이 로직은 Researcher가 제시한 '구조적 공백' 개념을 수치화하여 적용합니다.
 * 실제 운영 환경에서는 복잡한 API 호출과 데이터 처리가 필요합니다.
 * @param {RiskState} state - 현재 입력된 산업군 및 직원 수 상태.
 * @returns {number} 0에서 100 사이의 리스크 점수 (%).
 */
function calculateTotalRiskScore(state: RiskState): number {
  let riskMultiplier = 1; // 기본 승수

  // [가중치 로직 1] 산업군 기반 초기 위험 가중치 적용 (Researcher Data Source)
  switch (state.industry.toLowerCase()) {
    case 'ai':
      riskMultiplier *= 1.3; // AI 분야는 모델 오염 리스크로 인해 기본값 증가
      break;
    case 'finance':
      riskMultiplier *= 1.5; // 금융은 규제 준수 및 데이터 주권 충돌 위험이 높음
      break;
    case 'healthcare':
      riskMultiplier *= 1.2; // PII 민감도가 높아 기본값 증가
      break;
    default:
      riskMultiplier *= 1.0;
  }

  // [가중치 로직 2] 직원 수 기반 운영 리스크 가산 (Operational Risk)
  // 직원이 많을수록, 프로세스 복잡성 및 내부 관리 리스크($L_{op}$)가 증가한다고 가정합니다.
  const opRisk = Math.min(50, state.employeeCount * 0.5); // 최대 50점까지 기여

  // [가중치 로직 3] 구조적 공백 변수 (Structural Gap Factor) - 임의 가산
  // 현재는 입력에 없지만, 추후 시스템 감사 시 추가될 수 있는 '프로세스 자동화 미비' 리스크를 가정합니다.
  const structuralGapFactor = state.employeeCount > 50 ? 15 : 5;

  // 최종 점수 계산: (기본 승수 * 산업 기반 위험) + 운영 리스크 + 구조적 공백 요인
  let finalScore = Math.round((riskMultiplier * 30) + opRisk + structuralGapFactor);

  console.log(`[Audit Log] Industry Multiplier: ${riskMultiplier.toFixed(2)} | Op Risk: ${opRisk} | Final Score: ${finalScore}`);

  return finalScore;
}