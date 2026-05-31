// components/LiveRiskAlertModule.tsx
import React, { useState, useEffect } from 'react';

// =========================================================
// [TYPE DEFINITION] - 연구원님의 TARS 스키마를 기반으로 구조화합니다.
interface RiskDataPoint {
  risk_id: string; // PII_Leakage_HIPAA 등
  violation_category: string; // Data Integrity, Operational Failure
  tars_score: number; // Time-Adjusted Risk Score (0-100)
  min_loss_usd: number; // Minimum Financial Loss ($L_{min}$) - 재정적 손실액
}

// [State Definition] - 시스템의 현재 리스크 상태 정의.
type RiskLevel = 'Normal' | 'Warning' | 'Danger';

interface AlertState {
  level: RiskLevel;
  currentScore: number;
  dataPoints: RiskDataPoint[];
  message: string;
}

// =========================================================
// [MOCK API / DATA LAYER] - 실제 백엔드와의 통신 지점입니다.
/**
 * @description Mock API를 통해 현재 시스템의 리스크 상태 데이터를 가져옵니다.
 *          실제 환경에서는 fetch('/api/v1/risk-status') 등으로 대체되어야 합니다.
 */
const fetchRiskStatusMock = (level: RiskLevel): Promise<AlertState> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let state: AlertState;

      if (level === 'Normal') {
        state = {
          level: 'Normal',
          currentScore: 15, // 낮은 점수 유지
          dataPoints: [
            { risk_id: "COMPLIANCE_A", violation_category: "Scope Violation", tars_score: 10, min_loss_usd: 500 },
          ],
          message: "시스템 리스크 상태 정상. 주기적인 감사 로그 검토가 필요합니다.",
        };
      } else if (level === 'Warning') {
        state = {
          level: 'Warning',
          currentScore: 45, // 중간 점수 상승
          dataPoints: [
            { risk_id: "PII_Leakage_HIPAA", violation_category: "Data Integrity", tars_score: 30, min_loss_usd: 1200 },
            { risk_id: "OPS_FAILURE_CLOUD", violation_category: "Operational Failure", tars_score: 15, min_loss_usd: 800 },
          ],
          message: "경고: 일부 규제 영역에서 위반 패턴이 감지되었습니다. 즉시 원인 분석이 필요합니다.",
        };
      } else { // Danger Level
        state = {
          level: 'Danger',
          currentScore: 92, // 높은 점수 폭발
          dataPoints: [
            { risk_id: "PII_Leakage_HIPAA", violation_category: "Data Integrity", tars_score: 85, min_loss_usd: 5000 }, // $L_{min}$ 급증 강조
            { risk_id: "STRUCTURAL_GAP", violation_category: "Systemic Failure", tars_score: 92, min_loss_usd: 12000 },
          ],
          message: "🚨 치명적 위험! 시스템 무결성 위협 감지. 규제 준수 실패 시 최대 $L_{max}$ 발생 가능.",
        };
      }
      resolve(state);
    }, 800); // API 지연 시간 모의
  });
};

// =========================================================
/**
 * @component LiveRiskAlertModule
 * @description 대시보드 메인 화면에 통합될 실시간 리스크 경고 위젯입니다.
 * @param {React.FC} props - Props를 받지 않으며, 내부 상태 전환을 시연합니다.
 */
const LiveRiskAlertModule: React.FC = () => {
  // [STATE] 현재 리스크 레벨을 관리하며, 이 값을 변경하여 테스트할 수 있습니다.
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('Normal'); 
  const [alertState, setAlertState] = useState<AlertState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 리스크 레벨 변화에 따라 데이터 로딩을 트리거합니다.
  useEffect(() => {
    setIsLoading(true);
    fetchRiskStatusMock(riskLevel)
      .then((state) => {
        setAlertState(state);
        setIsLoading(false);
      });
  }, [riskLevel]);

  // UI 렌더링을 위한 공통 스타일 및 로직
  const getLevelStyles = (level: RiskLevel) => {
    switch (level) {
      case 'Normal':
        return "border-green-500 bg-[#1A2d1a] text-green-400"; // 안정적인 녹색 계열
      case 'Warning':
        return "border-yellow-500 bg-[#3d3c1e] text-yellow-400 animate-pulse"; // 주의를 주는 노란색/깜빡임
      case 'Danger':
        // Designer 브리프 기반: 네온 레드, 글리치 느낌 강조
        return "border-red-600 bg-[#5d1f2b] text-red-400 shadow-[0_0_30px_rgba(220,38,38,0.7)] animate-glitch"; 
      default:
        return "border-gray-600 bg-gray-800 text-white";
    }
  };

  if (isLoading) {
    return <div className="p-4 border rounded-lg bg-gray-900">🚨 리스크 데이터 로딩 중... API 지연 시간 모의 처리 중.</div>;
  }

  const currentStyles = getLevelStyles(alertState!.level);
  const isDanger = alertState!.level === 'Danger';

  return (
    <div className={`p-6 rounded-xl shadow-2xl ${currentStyles}`}>
      <h2 className="text-3xl font-extrabold mb-4 tracking-widest uppercase">
        {isDanger ? "⚠️ CRITICAL SYSTEM ALERT" : "📊 Live Risk Assessment Module"}
      </h2>

      {/* 1. 핵심 지표 및 상태 표시 영역 */}
      <div className="flex justify-between items-center py-3 border-b border-opacity-50 border-[#4a2e2d] mb-6">
        <div>
          <p className="text-sm uppercase opacity-80">Current Risk Status</p>
          <h3 className={`text-6xl font-mono tracking-tighter ${isDanger ? 'text-red-500' : 'text-yellow-400'}`}>
            {alertState!.currentScore}% <span className="text-lg opacity-70">({alertState!.level})</span>
          </h3>
        </div>
        <div className={`p-3 rounded-md text-right ${isDanger ? 'bg-red-800/50' : 'bg-gray-700/50'}`}>
            <p className="text-xs uppercase opacity-90">Immediate Action Required</p>
            <p className="text-xl font-bold">{alertState!.level === 'Danger' ? "$L_{max}$ IMPACT" : "Review Logs"}</p>
        </div>
      </div>

      {/* 2. 시스템 경고 메시지 */}
      <div className="mb-8 p-4 bg-[#0f0e0b] border-l-4 border-red-500 text-lg italic">
          💡 {alertState!.message}
      </div>

      {/* 3. 리스크 데이터 포인트 목록 (가장 중요한 아키텍처 부분) */}
      <h3 className="text-xl font-semibold mb-3 uppercase tracking-wider border-b border-opacity-30 pb-2">
        🔍 Detected Violation Patterns ({alertState!.dataPoints.length} 항목)
      </h3>

      {alertState!.dataPoints.map((point, index) => (
        <div key={index} className="flex justify-between items-start py-3 border-b border-opacity-20 border-[#4a2e2d] last:border-b-0">
          <div>
            {/* [DATA BINDING POINT 1]: 리스크 식별자 */}
            <p className={`text-lg font-mono ${point.risk_id.includes("HIPAA") ? 'text-red-400' : ''}`}>
                [ID: {point.risk_id}] - <span className="font-bold">{point.violation_category}</span>
            </p>
            {/* [DATA BINDING POINT 2]: 상세 설명 및 TARS 점수 */}
            <p className="text-sm opacity-70 mt-1">TARS Score: {point.tars_score}% | 위험도 근거 추적 필요.</p>
          </div>

          <div className='text-right'>
            {/* [DATA BINDING POINT 3]: 재정적 손실액 ($L_{min}$) */}
            <span className={`text-2xl font-extrabold ${point.tars_score > 70 ? 'text-red-500' : 'text-yellow-400'}`}>
                $ {point.min_loss_usd.toLocaleString()} <span className="text-base opacity-60">($L_{min}$)</span>
            </span>
          </div>
        </div>
      ))}

      {/* 4. 테스트 컨트롤 (시연용) */}
      <div className="mt-8 flex space-x-4 pt-4 border-t border-opacity-20 border-[#4a2e2d] justify-center">
          <button onClick={() => setRiskLevel('Normal')} className={`px-6 py-2 rounded uppercase transition ${riskLevel === 'Normal' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
              Test Normal (정상)
          </button>
          <button onClick={() => setRiskLevel('Warning')} className={`px-6 py-2 rounded uppercase transition ${riskLevel === 'Warning' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
              Test Warning (경고)
          </button>
          <button onClick={() => setRiskLevel('Danger')} className={`px-6 py-2 rounded uppercase transition ${riskLevel === 'Danger' ? 'bg-red-700 hover:bg-red-800 animate-pulse' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
              Test Danger (위험)
          </button>
      </div>

    </div>
  );
};

export default LiveRiskAlertModule;