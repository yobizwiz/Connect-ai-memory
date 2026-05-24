import React, { useState, useEffect, useCallback } from 'react';

// --- 타입 정의 ---
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface ReportData {
  title: string;
  riskScore: number; // 0-100점
  complianceStatus: string[];
}

// --- 유틸리티 함수 (로직 분리) ---

/**
 * 위험 등급을 계산하고 Tailwind 클래스를 반환합니다.
 * [근거: 코다리 개인 메모리, 자율 사이클 — 2026-05-19T13:55]
 */
const getRiskLevel = (score: number): { level: RiskLevel; className: string } => {
  if (score >= 85) return { level: 'CRITICAL', className: 'bg-red-700/90 animate-pulse' };
  if (score >= 60) return { level: 'HIGH', className: 'bg-yellow-600/90 animate-pulse' };
  if (score >= 30) return { level: 'MEDIUM', className: 'bg-orange-500/90' };
  return { level: 'LOW', className: 'bg-green-600/90' };
};

// --- 메인 컴포넌트 ---

/**
 * 가상의 보고서 뷰어 프로토타입. 타이머 만료 및 리스크 조건에 따른 게이트키핑 로직을 포함합니다.
 */
const ReportViewerPrototype: React.FC = () => {
  const [data, setData] = useState<ReportData>({
    title: "Compliance Risk Assessment Report V1.0",
    riskScore: 78, // 테스트용 초기 값 (High 위험)
    complianceStatus: ["Missing API Key for Jurisdiction X", "Outdated Data Schema detected"],
  });
  const [timeLeft, setTimeLeft] = useState(30); // 30초 카운트다운 시뮬레이션
  const [isLocked, setIsLocked] = useState(false); // 시스템 잠금 상태

  // 1. 타이머 로직 (시간적 긴급성 부여)
  useEffect(() => {
    if (timeLeft <= 0 || isLocked) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isLocked]);

  // 2. 게이트키핑 로직 (조건부 경고 활성화)
  useEffect(() => {
    if (data.riskScore < 50 && timeLeft > 0 && !isLocked) {
      // 리스크가 특정 임계점(50점) 이하로 떨어지면, 시간적 긴급성을 무시하고 강제 경고를 발생시키는 로직 시뮬레이션
      setTimeout(() => {
        alert("🚨 경고: 리스크 점수가 안전 수준으로 판단되어 추가적인 심층 분석이 필요합니다. 지금 전문가에게 문의하여 '시스템적 공백'을 채우십시오!");
        setIsLocked(true); // 시스템 잠금 상태로 전환
      }, 5000);
    }
  }, [data.riskScore, timeLeft, isLocked]);


  // 리스크 레벨 계산 및 클래스 적용 (Self-RAG 근거 사용)
  const { level: riskLevel, className: riskClass } = getRiskLevel(data.riskScore);

  // --- 렌더링 로직 시작 ---

  return (
    <div className="p-8 max-w-4xl mx-auto bg-gray-50 shadow-2xl border border-red-100">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        {data.title} (독점 분석 리포트)
      </h2>

      {/* 🚨 타이머 및 게이트키핑 섹션 (가장 눈에 띄게 구현) */}
      <div className={`p-4 mb-6 rounded-lg text-center ${riskClass}`}>
        <h3 className="text-xl font-extrabold tracking-widest uppercase">
          남은 분석 시간: <span className="text-white text-2xl">{timeLeft}초</span>
        </h3>
        {isLocked && (
            <div className="mt-2 p-2 bg-black rounded text-yellow-300 font-mono animate-pulse">
                ⚠️ 시스템 경고! 접근이 잠금되었습니다. 추가 분석을 위해 결제가 필요합니다.
            </div>
        )}
      </div>

      {/* 📊 리스크 요약 섹션 */}
      <div className="mb-8 p-6 bg-white border-l-4" style={{ borderColor: riskLevel === 'CRITICAL' ? '#dc2626' : (riskLevel === 'HIGH' ? '#f59e0b' : '#10b981') }}>
        <div className="flex justify-between items-baseline">
            <span className="text-xl font-semibold text-gray-600">종합 리스크 점수 (0-100):</span>
            <span className={`text-4xl font-extrabold ${riskLevel === 'CRITICAL' ? 'text-red-700 animate-pulse' : riskLevel === 'HIGH' ? 'text-yellow-600' : 'text-green-600'}`}>
                {data.riskScore}% ({riskLevel})
            </span>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          이 점수는 귀하의 현재 운영 환경이 법적/기술적으로 얼마나 '시스템적 무지(Systemic Ignorance)' 상태에 놓여 있는지 나타냅니다.
        </p>
      </div>

      {/* ⚠️ 발견된 문제점 섹션 */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4 text-gray-700 flex items-center">
            🚨 주요 위험 요소 ({data.complianceStatus.length}개) <span className="ml-2 text-red-500">필수 확인</span>
        </h3>
        <ul className="space-y-3 bg-red-50 p-4 rounded-lg border border-red-200">
          {data.complianceStatus.map((issue, index) => (
            <li key={index} className="flex items-start text-sm text-gray-700">
              <span className="text-xl mr-3 mt-[-4px] leading-none animate-bounce">🛑</span>
              {issue} <span className="ml-2 text-xs font-mono bg-red-100 px-2 py-0.5 rounded">[미해결]</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 🚀 CTA (강제 행동 유도) */}
      <div className="p-6 bg-gray-900 text-white text-center sticky bottom-0 border-t-4 border-red-500 shadow-xl">
          <h3 className="text-2xl font-bold mb-4 uppercase tracking-wider">
              지금 당장 시스템적 무지를 해소하십시오.
          </h3>
          <p className="mb-6 text-gray-300">
             추가 분석 및 해결책은 유료 컨설팅을 통해 즉시 제공됩니다. ⏳ 기회 비용($QLoss$)이 발생하고 있습니다.
          </p>
          {/* 강제 CTA 버튼 */}
          <button 
            onClick={() => alert("결제가 진행됩니다! (프로토타입 기능) - $QLoss$ 방어 시스템 가동 완료")}
            className="w-full py-4 text-xl font-extrabold bg-red-600 hover:bg-red-700 transition duration-300 transform hover:scale-[1.02] shadow-lg border-b-4 border-black/50"
          >
            [Premium] $QLoss$ 방어 컨설팅 시작하기 (클릭)
          </button>
      </div>
    </div>
  );
};

export default ReportViewerPrototype;