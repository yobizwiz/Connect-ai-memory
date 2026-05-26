// src/components/LossMeterGate.tsx
import React, { useState, useCallback } from 'react';

// --- 1. 타입 정의 (Type Safety first) ---

/** 입력 데이터 구조 */
interface RiskInputData {
  area: string; // 예: PII 마스킹 실패, 워크플로우 단절 등
  severityScore: number; // 0~10 사이의 점수
}

/** 계산된 리스크 지표 구조 */
interface LossMetrics {
  lossAmountMillion: number; // 손실액 (백만 달러 단위)
  structuralFlawsCount: number; // 발견된 구조적 취약점 개수
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'; // 리스크 레벨
}

/** 게이트 상태 관리 */
type GateStatus = 'IDLE' | 'LOADING' | 'RESULT' | 'PURCHASED';

// --- 2. Mock API & 비즈니스 로직 (The Core Engine) ---

/**
 * 가상의 시스템 분석을 시뮬레이션합니다.
 * 실제로는 백엔드(FastAPI/GraphQL 등)를 호출하는 곳입니다.
 */
const fetchLossMetrics = async (input: RiskInputData): Promise<LossMetrics> => {
  console.log("⚙️ Starting system analysis for:", input.area);
  
  // [근거: Self-RAG, 🏢 회사 정체성] - 필수적인 시간적 압박(Time Pressure) 조성
  await new Promise(resolve => setTimeout(resolve, 3000)); // 3초 지연 시뮬레이션

  let loss = (input.severityScore / 10) * Math.random() * 5 + 1; // 최소 1M ~ 최대 6M
  let flaws = Math.floor(input.severityScore / 2) + Math.random() * 3;

  let riskLevel: LossMetrics['riskLevel'];

  if (loss > 4 || flaws >= 5) {
    riskLevel = 'HIGH'; // 높은 손실 또는 많은 취약점 -> Red Zone
  } else if (loss > 2 || flaws >= 2) {
    riskLevel = 'MEDIUM'; // 중간 위험 -> Yellow Warning
  } else {
    riskLevel = 'LOW'; // 낮은 위험 -> Green/Acceptable
  }

  return {
    lossAmountMillion: parseFloat(loss.toFixed(2)),
    structuralFlawsCount: flaws,
    riskLevel: riskLevel,
  };
};


// --- 3. UI 컴포넌트 (The Presentation Layer) ---

/** 리스크 레벨에 따른 스타일 정의 (Red Zone Logic) */
const getRiskZoneStyles = (level: LossMetrics['riskLevel']) => {
  switch (level) {
    case 'HIGH':
      return { color: 'text-red-500', bgEffect: 'ring-red-600/70 animate-pulse' }; // Red Zone!
    case 'MEDIUM':
      return { color: 'text-yellow-500', bgEffect: 'ring-yellow-600/50 border-yellow-800' }; // Warning
    case 'LOW':
    default:
      return { color: 'text-green-500', bgEffect: 'border-green-700/30' }; // Safe
  }
};

// 메인 컴포넌트
const LossMeterGate: React.FC = () => {
  const [status, setStatus] = useState<GateStatus>('IDLE');
  const [input, setInput] = useState<RiskInputData>({ area: 'PII 마스킹 실패', severityScore: 8 });
  const [metrics, setMetrics] = useState<LossMetrics | null>(null);

  /** 사용자 입력 처리 핸들러 */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput({ area: e.target.value, severityScore: parseFloat(e.target.value) || 0 });
  }, []);

  /** 리스크 분석 시작 로직 (State Machine Transition) */
  const handleRunAnalysis = async () => {
    if (status === 'LOADING') return; // 이미 진행 중이면 무시
    setStatus('LOADING');
    setMetrics(null);
    try {
      // Mock API 호출 및 결과 수신
      const result = await fetchLossMetrics(input); 
      setMetrics(result);
      setStatus('RESULT');
    } catch (error) {
      console.error("🚨 Analysis failed:", error);
      alert("시스템 분석 중 오류가 발생했습니다. 콘솔을 확인하세요.");
      setStatus('IDLE');
    }
  };

  /** 최종 CTA 액션 */
  const handlePurchase = () => {
    if (status !== 'RESULT') return;
    console.log("✅ User clicked Purchase - Transitioning to payment flow...");
    // 실제 환경에서는 /payment 로 라우팅을 변경해야 합니다.
    setStatus('PURCHASED'); 
    alert(`구매 진행: ${metrics?.lossAmountMillion}M 손실 방어벽 구축 시작.`);
  };

  // --- 4. 렌더링 로직 (The Visual Feedback) ---
  let content;

  if (status === 'LOADING') {
    content = (
      <div className="text-center p-8 bg-gray-900/50 rounded-xl border border-red-700 animate-pulse">
        <p className="text-lg text-red-400 mb-2 flex items-center justify-center">
          <span className="mr-2 text-xl">⚙️</span> 시스템 분석 중... (3초 대기)
        </p>
        <p className="text-sm text-gray-500">구조적 무결성 지표를 계산하는 중입니다. 이 과정은 필수적입니다.</p>
      </div>
    );
  } else if (status === 'PURCHASED') {
    content = (
      <div className="text-center p-12 bg-red-900/80 rounded-xl border-4 border-red-600 shadow-2xl">
        <h2 className="text-3xl text-white font-bold mb-4">🛡️ 시스템 무결성 확보 완료</h2>
        <p className="text-lg text-gray-200">축하합니다. 이제 당신의 비즈니스는 구조적 위험으로부터 보호받습니다.</p>
        <button 
          onClick={() => setStatus('IDLE')} // 재시뮬레이션을 위해 초기화 가정
          className="mt-6 px-8 py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg transition duration-200"
        >
          다른 리스크 분석하기 🔄
        </button>
      </div>
    );
  } else if (status === 'RESULT' && metrics) {
    const styles = getRiskZoneStyles(metrics.riskLevel);
    return (
      <div className="p-8 bg-gray-900/50 rounded-xl border border-transparent">
        <h2 className={`text-3xl font-extrabold mb-6 ${styles.color}`}>🚨 분석 완료: 구조적 리스크 경고</h2>
        
        {/* 손실 지표 시각화 */}
        <div className="mb-8 p-6 bg-black rounded-lg shadow-inner border-l-4" style={{borderColor: styles.color}}>
          <p className="text-xl text-gray-300 mb-2">💰 예상 최소 손실액 (Loss Potential):</p>
          <div className={`text-6xl font-mono tracking-wider ${styles.color} transition duration-500`}>
            ${metrics.lossAmountMillion.toFixed(2)}M <span className="text-3xl text-gray-400">USD</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">({metrics.structuralFlawsCount}개의 미확인 취약점 발견)</p>
        </div>

        {/* 최종 CTA */}
        <div className={`text-center p-6 rounded-xl border-4 ${styles.bgEffect}`}>
          <h3 className="text-2xl font-bold mb-3 text-white">🚨 경고: 방관은 곧 손실입니다.</h3>
          <p className="mb-6 text-lg text-gray-300">이 리스크는 단순한 비용 문제가 아닙니다. 시스템의 생존 문제입니다.</p>
          <button 
            onClick={handlePurchase}
            className={`px-12 py-4 text-xl font-bold rounded-full transition duration-300 ${styles.color === 'text-red-500' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 cursor-not-allowed'} shadow-lg`}
            disabled={metrics.riskLevel === 'LOW'} // 낮은 위험은 구매를 강제하지 않음 (논리적 예외 처리)
          >
             {metrics.riskLevel === 'HIGH' ? '지금 즉시 구조적 무결성 확보 (진단 신청)' : `안전합니다 (${metrics.structuralFlawsCount}개 리스크 발견)`}
          </button>
        </div>
      </div>
    );

  } else { // IDLE 상태
     content = (
       <div className="p-8 bg-gray-900/50 rounded-xl border border-transparent">
         <h2 className="text-2xl font-bold mb-6 text-white">🛡️ QLoss Meter: 시스템적 리스크 진단</h2>
          <p className="mb-6 text-gray-400">당신의 비즈니스가 직면한 잠재적 구조적 취약점을 분석합니다. (데이터 입력 $\rightarrow$ 로딩/경고 $\rightarrow$ 해결책 제시)</p>

         {/* 입력 폼 */}
         <div className="space-y-4 mb-8 p-6 bg-gray-800 rounded-lg">
            <div>
                <label htmlFor="area" className="block text-sm font-medium text-gray-300 mb-1">취약점 영역 (예: PII 마스킹 실패)</label>
                <input 
                    type="text" 
                    id="area" 
                    value={input.area} 
                    onChange={handleInputChange} 
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:border-red-500 focus:ring-red-500"
                />
            </div>
            <div>
                <label htmlFor="severityScore" className="block text-sm font-medium text-gray-300 mb-1">심각도 점수 (0~10)</label>
                <input 
                    type="number" 
                    id="severityScore" 
                    min="0" 
                    max="10" 
                    value={input.severityScore} 
                    onChange={handleInputChange} 
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:border-red-500 focus:ring-red-500"
                />
            </div>
         </div>

        {/* 버튼 */}
        <button 
          onClick={handleRunAnalysis}
          disabled={status === 'LOADING'}
          className={`w-full py-3 text-xl font-bold rounded-lg transition duration-200 ${
            status === 'LOADING' ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {status === 'LOADING' ? '분석 대기 중...' : '🚨 리스크 분석 시작'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-10">
      <h1 className="text-4xl font-extrabold text-white mb-8 border-b pb-2 border-red-700/50">
        yobizwiz: 구조적 취약점 진단 엔진 ⚙️
      </h1>
      {content}
    </div>
  );
};

export default LossMeterGate;