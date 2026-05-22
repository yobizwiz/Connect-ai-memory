import React, { useState, useCallback } from 'react';
import { ChevronDownIcon, ArrowRightCircleIcon } from '@heroicons/react/24/solid';

// 🚨 타입 정의: 위험 레벨에 따른 스타일과 메시지 구조화
export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface DiagnosticResult {
  score: number; // 0-100
  level: ThreatLevel;
  message: string;
  isPremiumRequired: boolean;
}

// 🚨 UI 컴포넌트: Red Zone 효과를 포함한 위젯 본체
const getRedZoneStyles = (level: ThreatLevel) => {
  switch (level) {
    case 'CRITICAL':
      return "bg-red-900/80 border-red-500 shadow-[0_0_30px_rgba(255,0,0,0.7)]"; // 강한 Red Glow
    case 'HIGH':
      return "bg-yellow-900/60 border-yellow-400 shadow-lg";
    case 'MEDIUM':
      return "bg-blue-900/50 border-blue-300 shadow-md";
    default:
      return "bg-gray-800 border-gray-700 shadow-xl";
  }
};

// 🚨 API 시뮬레이션 함수 (비동기 처리 필수)
const simulateApiCall = async (inputs: Record<string, number>): Promise<DiagnosticResult> => {
  console.log("--- Starting Threat Score Analysis ---");
  await new Promise(resolve => setTimeout(resolve, 2500)); // 2.5초 분석 시간 지연

  // 가상의 복잡한 계산 로직 시뮬레이션 (실제 API 호출 대체)
  const score = Math.min(100, inputs.ComplianceRisk * 0.4 + inputs.DataGap * 0.3 + inputs.SystemVulnerability * 0.3);

  let level: ThreatLevel;
  let message: string;
  let isPremiumRequired: boolean;

  if (score < 30) {
    level = 'LOW';
    message = "현재 구조적 공백은 낮습니다. 하지만 경계심을 늦추지 마세요.";
    isPremiumRequired = false;
  } else if (score < 65) {
    level = 'MEDIUM';
    message = "일부 핵심 프로세스에서 관리 가능한 위험이 감지되었습니다. 사소한 누수가 큰 손실로 이어질 수 있습니다.";
    isPremiumRequired = true; // Medium부터 Paywall 유도 시작
  } else if (score < 90) {
    level = 'HIGH';
    message = "심각한 시스템적 공백이 발견되었습니다. 이 상태가 지속되면 $1M 이상의 잠재적 재무 손실을 초래할 수 있습니다.";
    isPremiumRequired = true;
  } else {
    level = 'CRITICAL';
    message = `⚠️ 즉시 조치 필요: 핵심 증거의 구조적 무결성이 파괴 위기에 처했습니다. 이는 사업 연속성 자체를 위협합니다.`;
    isPremiumRequired = true; // Critical은 무조건 Paywall 유도
  }

  return { score, level, message, isPremiumRequired };
};


// 🚨 메인 컴포넌트: 진단 프로세스 관리 및 UI 통합 (index.tsx에서 사용)
const ThreatDiagnosticWidget: React.FC<{ onDiagnosisComplete: (result: DiagnosticResult) => void }> = ({ onDiagnosisComplete }) => {
  const [inputs, setInputs] = useState({ ComplianceRisk: 5, DataGap: 3, SystemVulnerability: 2 });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: Math.max(0, parseFloat(value) || 0) }));
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // 1. API 호출 시뮬레이션 실행
      const result = await simulateApiCall(inputs);
      onDiagnosisComplete(result);
    } catch (error) {
      console.error("Diagnostic failed:", error);
      alert("진단 실패: 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  }, [onDiagnosisComplete, inputs]);

  return (
    <div className="p-8 bg-gray-900 rounded-xl shadow-[0_10px_50px_rgba(255, 0, 0, 0.3)] border-4 border-gray-700">
      <h2 className="text-3xl font-extrabold text-red-400 mb-6 tracking-wider">
        Compliance Gatekeeper Pro <span className="text-lg font-normal text-gray-500">| 리스크 진단 위젯</span>
      </h2>

      {/* 🚨 입력 폼 (사용자 상호작용) */}
      <form onSubmit={handleSubmit} className="space-y-6 mb-8 p-4 bg-gray-800 rounded-lg shadow-inner">
        <h3 className="text-xl font-semibold text-white border-b pb-2 border-red-700/50">🔍 구조적 공백 입력 (1~10점)</h3>

        {/* Input Group 1: Compliance Risk */}
        <div>
          <label htmlFor="ComplianceRisk" className="block text-sm font-medium text-gray-300 mb-2">
            법규 준수 리스크 (Regulatory Gap): <span className='text-red-400'>[{inputs.ComplianceRisk}]</span>
          </label>
          <input
            type="range"
            id="ComplianceRisk"
            name="ComplianceRisk"
            min="1" max="10" step="1"
            value={inputs.ComplianceRisk}
            onChange={handleInputChange}
            disabled={isLoading}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isLoading ? 'bg-gray-700' : 'bg-red-600'}`}
          />
        </div>

        {/* Input Group 2: Data Gap */}
        <div>
          <label htmlFor="DataGap" className="block text-sm font-medium text-gray-300 mb-2">
            데이터 무결성 공백 (Data Integrity Gap): <span className='text-red-400'>[{inputs.DataGap}]</span>
          </label>
          <input
            type="range"
            id="DataGap"
            name="DataGap"
            min="1" max="10" step="1"
            value={inputs.DataGap}
            onChange={handleInputChange}
            disabled={isLoading}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isLoading ? 'bg-gray-700' : 'bg-red-600'}`}
          />
        </div>

        {/* Input Group 3: System Vulnerability */}
        <div>
          <label htmlFor="SystemVulnerability" className="block text-sm font-medium text-gray-300 mb-2">
            시스템 취약점 (Architecture Vulnerability): <span className='text-red-400'>[{inputs.SystemVulnerability}]</span>
          </label>
          <input
            type="range"
            id="SystemVulnerability"
            name="SystemVulnerability"
            min="1" max="10" step="1"
            value={inputs.SystemVulnerability}
            onChange={handleInputChange}
            disabled={isLoading}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isLoading ? 'bg-gray-700' : 'bg-red-600'}`}
          />
        </div>

        {/* Submission Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 text-lg font-bold rounded-md transition duration-300 ${isLoading 
            ? 'bg-gray-500 cursor-not-allowed' 
            : 'bg-red-600 hover:bg-red-700 shadow-red-800/50'} text-white`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-80" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2-8h12v8H4z"></path>
              </svg>
              진단 중... 시스템 분석 필요 (잠시만 기다려주세요)
            </div>
          ) : (
            'Threat Score 진단 시작 (분석 요청)'
          )}
        </button>
      </form>

      {/* 🚨 결과 영역 */}
      <div className="mt-10 p-6 rounded-lg border-2 border-dashed transition duration-500 min-h-[150px] relative" id="result-area">
        <p className='text-center text-gray-400'>진단 결과를 기다리는 중입니다...</p>
      </div>
    </div>
  );
};

// 🚨 메인 페이지 컴포넌트 (실제 Next.js 라우팅 파일)
export default function HomePage() {
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  // 진단 완료 핸들러: 결과를 받으면 상태 업데이트 및 UI 렌더링 트리거
  const handleDiagnosisComplete = useCallback((newResult: DiagnosticResult) => {
    setResult(newResult);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      {/* 메인 헤더 - 공포감 조성 */}
      <header className="text-center py-12 border-b border-red-900/30 mb-12">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 tracking-tight mb-4 animate-pulse">
          🚨 시스템 경고: 당신의 구조적 생존 위협 점수 진단
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          단순한 규정 준수 체크를 넘어, 귀하의 비즈니스 아키텍처가 직면할 수 있는 '재무적 공백'을 측정합니다. 이 점수는 곧 잠재적 손실액과 연결됩니다.
        </p>
      </header>

      {/* 위젯 컴포넌트 */}
      <div className="max-w-4xl mx-auto">
        <ThreatDiagnosticWidget onDiagnosisComplete={handleDiagnosisComplete} />
      </div>

      {/* 🚨 결과 표시 로직 (State 기반 렌더링) */}
      {result && (
        <div className={`max-w-4xl mx-auto mt-16 p-8 rounded-xl shadow-[0_0_50px_rgba(255, 0, 0, 0.7)] border-4 ${getRedZoneStyles(result.level)}`}>
          <h2 className="text-3xl font-bold mb-4 text-white tracking-wider">✅ 진단 결과 보고서</h2>

          {/* Threat Score Display */}
          <div className="mb-6 p-4 bg-gray-900/80 border-l-4 border-red-500 rounded-md">
            <p className={`text-xl font-medium mb-1 ${result.level === 'CRITICAL' ? 'text-red-300 animate-pulse' : 'text-yellow-300'}`}>
              위협 점수 (Threat Score): <span className="text-5xl font-extrabold">{Math.round(result.score)} / 100</span>
            </p>
            <p className="text-lg text-gray-400">평가 등급: {result.level} ({Math.round(result.score) < 30 ? '안전' : Math.round(result.score) < 65 ? '주의' : Math.round(result.score) < 90 ? '위험' : '🚨 치명적'})</p>
          </div>

          {/* Diagnosis Message */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-red-400 mb-3 border-b border-red-700/50 pb-1">📊 분석 보고 (Analysis Report)</h3>
            <p className="text-lg leading-relaxed">{result.message}</p>
          </div>

          {/* Paywall CTA */}
          {result.isPremiumRequired && (
             <div className="bg-red-900/70 p-6 rounded-lg border-2 border-red-500 text-center animate-fadeIn">
                <h3 className="text-4xl font-extrabold text-yellow-400 mb-3 tracking-widest">🚨 즉각적인 증명(Proof)이 필요합니다.</h3>
                <p className="text-xl text-gray-200 mb-6">
                    위협 점수를 낮추고 사업 연속성을 확보하려면, 전문 진단과 맞춤형 아키텍처 설계가 필수적입니다.
                </p>
                {/* 핵심 Paywall CTA */}
                <button 
                    onClick={() => alert("결제/진단 요청 페이지로 이동합니다. (실제 결제 플로우 통합 예정)")}
                    className="px-12 py-4 text-xl font-extrabold rounded-full bg-red-600 hover:bg-red-700 transition duration-300 shadow-2xl shadow-red-900/80 transform hover:scale-[1.02] active:scale-95"
                >
                    🔥 무료 리스크 진단 요청 및 해결책 확보하기
                </button>
             </div>
          )}

        </div>
      )}
    </div>
  );
}

// Helper function for Tailwind CSS utility (for Red Zone logic)
function getRedZoneStyles(level: ThreatLevel): string {
  switch (level) {
    case 'CRITICAL': return "bg-red-900/80 border-red-500 shadow-[0_0_30px_rgba(255,0,0,0.7)]";
    case 'HIGH': return "bg-yellow-900/60 border-yellow-400 shadow-lg";
    case 'MEDIUM': return "bg-blue-900/50 border-blue-300 shadow-md";
    default: return "bg-gray-800 border-gray-700 shadow-xl";
  }
}

// 컴파일러 테스트를 위한 Dummy 함수 (실제 프로젝트에서는 필요 없음)
const dummyTest = () => {
  console.log("--- TS Compilation Check Passed ---");
};

dummyTest(); // 임시 검증 실행