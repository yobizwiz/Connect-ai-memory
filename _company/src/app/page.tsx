// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';

// -------------------------------------------------
// 1. Type Declarations
// -------------------------------------------------
interface ReportData {
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  qLossEstimate: number;
  complianceStatus: string[];
  systemWeaknessReport: {
    description: string;
    actionRequired: string;
  };
}

// -------------------------------------------------
// 2. Real API Connection Layer (Full-Stack MVP)
// -------------------------------------------------
const fetchReportData = async (
  dataVolumeGB: number,
  jurisdiction: string,
  complianceGapScore: number
): Promise<ReportData> => {
  const response = await fetch('/api/v1/calculate-risk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dataVolumeGB,
      jurisdiction,
      complianceGapScore,
    }),
  });

  if (!response.ok) {
    throw new Error('API Request Failed');
  }

  const result = await response.json();
  const loss = result.calculatedLossY;

  // Determine risk level based on Gap Score and Loss value
  let riskLevel: ReportData['riskLevel'] = 'Low';
  if (complianceGapScore >= 75) {
    riskLevel = 'Critical';
  } else if (complianceGapScore >= 50) {
    riskLevel = 'High';
  } else if (complianceGapScore >= 25) {
    riskLevel = 'Medium';
  }

  const statusList = [
    `뉴욕 거주자 데이터 및 자산 규모(${dataVolumeGB.toLocaleString()} GB) 통제 범위 초과 (${jurisdiction} 위반 위험)`,
    `뉴욕주 규제 컴플라이언스 격차 지수 ${complianceGapScore}% 검출 (구조적 통제 무효화)`,
  ];

  if (jurisdiction === 'NYDFS') {
    statusList.push('뉴욕 금융감독청(NYDFS) 23 NYCRR 500 규정에 따른 일일 단위 누적 민사 벌금 및 최고정보보안책임자(CISO) 인증 무효화 리스크');
  } else if (jurisdiction === 'NY_SHIELD') {
    statusList.push('뉴욕주 SHIELD Act(Stop Hacks and Improve Electronic Data Security) 위반으로 인한 뉴욕주 검찰총장(AG) 집행조치 및 민사 페널티 노출');
  } else if (jurisdiction === 'GDPR') {
    statusList.push('유럽 연합 데이터 보호 위원회(EDPB) 기준 최대 €2,000만 또는 글로벌 매출의 4% 페널티 구간 노출');
  } else {
    statusList.push('캘리포니아 소비자 프라이버시 규정(CCPA) 의무 고지 및 소비자 집단 소송 리스크 노출');
  }

  return {
    riskLevel,
    qLossEstimate: loss,
    complianceStatus: statusList,
    systemWeaknessReport: {
      description: '사후 체크리스트형 보고서는 실질적인 재정 소송이 시작되는 순간 아무런 방어 능력을 갖지 못합니다. 진정한 위협은 표면적인 점수판 너머의 구조적 결함(Structural Gap)에 있습니다.',
      actionRequired: '이 리스크 공백을 완벽하게 방어하고 시스템 무결성을 확보할 유일한 아키텍처 설계 청사진을 획득하십시오.',
    },
  };
};

// -------------------------------------------------
// 3. UI Components
// -------------------------------------------------

/**
 * Animated Counter for $QLoss Value
 */
const AnimatedCounter = ({ targetValue }: { targetValue: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = targetValue;
    if (start === end) return;

    const totalDuration = 1500; // ms
    const incrementTime = 30; // ms
    const totalSteps = Math.ceil(totalDuration / incrementTime);
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      // Ease out quad
      const current = Math.round(end * (progress * (2 - progress)));
      setDisplayValue(current);

      if (step >= totalSteps) {
        clearInterval(timer);
        setDisplayValue(end);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [targetValue]);

  return (
    <span className="font-mono text-5xl md:text-7xl font-black text-[#F39C12] drop-shadow-[0_0_20px_rgba(243,156,18,0.4)]">
      ${displayValue.toLocaleString('en-US')}
    </span>
  );
};

/**
 * Audit Report Presentation Component (Premium Red Zone & Authority Blue)
 */
const ReportDisplay = ({ data }: { data: ReportData }) => {
  const isCritical = data.riskLevel === 'Critical' || data.riskLevel === 'High';

  return (
    <div className="p-8 bg-[#151A22] rounded-2xl border border-red-900/50 shadow-2xl mt-12 transition-all duration-500 hover:border-red-500/50">
      
      {/* Glitch styled alert banner */}
      <div className={`p-4 rounded-xl mb-8 border ${
        isCritical 
          ? 'bg-[#310E12] border-red-700/60 text-[#EC7063] animate-pulse' 
          : 'bg-[#0E2F1F] border-emerald-700/60 text-[#52BE80]'
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚨</span>
          <div>
            <h4 className="font-mono font-bold tracking-wider text-lg">
              [SYSTEM DIAGNOSTIC REPORT] RISK LEVEL: {data.riskLevel.toUpperCase()}
            </h4>
            <p className="text-sm opacity-80 mt-1 font-mono">
              STATUS CODE: 0x889A_COMPLIANCE_CRITICAL_GAP
            </p>
          </div>
        </div>
      </div>

      {/* QLoss Block */}
      <div className="bg-[#1C232E] p-6 rounded-xl border border-gray-800/80 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#85929E] font-bold mb-1">
            예상되는 최대 재무적 손실액 (ESTIMATED MAXIMUM QLOSS)
          </p>
          <p className="text-sm text-gray-400 max-w-md">
            소송 패소율, 규제 벌금, 영업 정지 비용을 종합 산출한 최악의 시나리오 손실 규모입니다.
          </p>
        </div>
        <div className="text-right">
          <AnimatedCounter targetValue={data.qLossEstimate} />
        </div>
      </div>

      {/* Compliance Status Details */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 text-[#3498DB] border-b border-gray-800 pb-2">
          🔎 발견된 구조적 위험 요소 (Detected Systemic Gaps)
        </h3>
        <ul className="space-y-3">
          {data.complianceStatus.map((item, index) => (
            <li 
              key={index} 
              className="text-base text-gray-300 border-l-4 border-[#E74C3C] pl-4 py-2 bg-[#1C1617]/50 rounded-r-lg font-mono"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Gap Analysis & Warning */}
      <div className="bg-[#1C232E] p-6 rounded-xl border-l-4 border-[#3498DB] space-y-4">
        <h4 className="text-lg font-bold text-[#EC7063] flex items-center gap-2">
          ⚠️ 단순 체크리스트형 진단 보고서의 한계
        </h4>
        <p className="text-gray-300 leading-relaxed text-sm">
          {data.systemWeaknessReport.description}
        </p>
        <div className="p-4 bg-[#310E12]/50 border border-red-900/40 rounded-lg text-center">
          <p className="text-base font-bold text-white uppercase tracking-wider">
            {data.systemWeaknessReport.actionRequired}
          </p>
          <p className="text-xs text-red-300/80 mt-1">
            * yobizwiz 무결성 보증 컨설팅은 법률 방어력을 99.8% 극대화하는 아키텍처 설계도입니다.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Stripe Payment Gateway Simulation (The Conversion Gate)
 */
const ConsultingForm = ({ riskScore, qLoss }: { riskScore: number; qLoss: number }) => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState('compliance');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/audit-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: email || 'anonymous_user',
          amountCents: Math.round(qLoss * 100),
        }),
      });

      if (!response.ok) {
        throw new Error('Transaction execution failed');
      }

      const result = await response.json();
      if (result.success) {
        setSubmitted(true);
        alert('🛡️ [시스템 권한 승인 완료] 컴플라이언스 게이트웨이 무결성 및 방어벽 구축 설계가 성공적으로 승인되었습니다.');
      } else {
        alert(`❌ 승인 실패: ${result.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('❌ 결제/인증 서버 통신 실패. 백엔드 서비스(audit-purchase) 상태를 점검해 주십시오.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#1B365D] to-[#154360] text-white p-8 md:p-12 mt-12 rounded-2xl border border-[#3498DB]/40 shadow-2xl">
      <div className="max-w-3xl mx-auto text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-white">
          🛡️ 법적 방어 아키텍처 청사진 확보 (Defense Blueprint)
        </h2>
        <p className="text-sm md:text-base text-blue-200/90 leading-relaxed">
          이 리스크 보고서가 탐지한 ${qLoss.toLocaleString()} 규모의 잠재적 재정 파산을 막는 유일한 솔루션입니다. 
          귀사의 프로세스를 완벽한 규제 무결성 시스템으로 전환해 드립니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-5">
        {submitted ? (
          <div className="text-center p-8 bg-emerald-950/80 border border-emerald-500/50 rounded-xl">
            <h3 className="text-2xl font-bold mb-2 text-emerald-400">🛡️ 프로토콜 승인 완료</h3>
            <p className="text-sm text-gray-300">
              담당 리스크 관리 파트너가 24시간 내에 보안 채널을 통해 1:1 진단 컨설팅 도면을 전달해 드리겠습니다.
            </p>
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="comp-name" className="block text-xs font-mono uppercase tracking-widest text-[#85929E] mb-2 font-bold">
                회사명 / 책임자 성함
              </label>
              <input 
                id="comp-name"
                type="text" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3.5 rounded-lg bg-[#0F172A] border border-gray-700/80 text-white focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent font-sans"
                placeholder="예: (주)커넥트에이아이 / 김진오"
              />
            </div>
            <div>
              <label htmlFor="comp-email" className="block text-xs font-mono uppercase tracking-widest text-[#85929E] mb-2 font-bold">
                이메일 주소 (보안 채널 송신용)
              </label>
              <input 
                id="comp-email"
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3.5 rounded-lg bg-[#0F172A] border border-gray-700/80 text-white focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent font-sans"
                placeholder="example@company.com"
              />
            </div>
            <div>
              <label htmlFor="comp-interest" className="block text-xs font-mono uppercase tracking-widest text-[#85929E] mb-2 font-bold">
                최우선 대응이 필요한 리스크 분야
              </label>
              <select 
                id="comp-interest"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="w-full p-3.5 rounded-lg bg-[#0F172A] border border-gray-700/80 text-white focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent font-sans"
              >
                <option value="compliance">법적 컴플라이언스 파괴 방어 (GDPR / HIPAA)</option>
                <option value="data-loss">기밀성 및 데이터 누수 통제 확보</option>
                <option value="process-failure">비즈니스 프로세스 병목 및 인적 오류 개선</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-4 text-lg font-extrabold rounded-xl transition duration-300 uppercase tracking-wide transform hover:scale-[1.01] ${
                isLoading 
                  ? 'bg-gray-700 cursor-not-allowed text-gray-400' 
                  : 'bg-[#C0392B] hover:bg-[#A93226] text-white shadow-[0_8px_20px_rgba(192,57,43,0.5)]'
              }`}
            >
              {isLoading ? '⚙️ SECURING TRANSACTION CHANNEL...' : '🛡️ 구조적 무결성 확보 및 리스크 방어벽 구축 승인'}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

// -------------------------------------------------
// 4. Main Page Component (The Assembler)
// -------------------------------------------------
export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  // Form states matching calculate-risk requirements
  const [processName, setProcessName] = useState('뉴욕 지사 핵심 자산 데이터 유통 흐름');
  const [dataVolumeGB, setDataVolumeGB] = useState(1500);
  const [jurisdiction, setJurisdiction] = useState('NYDFS');
  const [complianceGapScore, setComplianceGapScore] = useState(80);

  const handleAnalyzeClick = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setReportData(null);

    try {
      const data = await fetchReportData(dataVolumeGB, jurisdiction, complianceGapScore);
      setReportData(data);
    } catch (e) {
      console.error(e);
      alert('진단 엔진 호출에 실패했습니다. API 라우터 상태를 점검해 주십시오.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#C5C6C7] font-sans pb-24 selection:bg-[#E74C3C] selection:text-white">
      
      {/* Dynamic Grid Background Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Hero Header */}
      <header className="relative pt-24 pb-20 overflow-hidden border-b border-gray-900/60 bg-gradient-to-b from-[#0F172A] to-[#0B0C10]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#310E12] border border-red-900/50 text-[#EC7063] font-mono text-xs uppercase tracking-widest mb-6 animate-pulse">
            [⚠️ CRITICAL SYSTEM FAILURE SIMULATOR ACTIVE]
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6 leading-[1.1] uppercase">
            당신의 시스템은 합법적입니까? <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EC7063] to-[#F39C12] drop-shadow-md">
              무효화되는 리스크의 본질
            </span>
          </h1>
          
          <p className="text-base md:text-xl text-gray-400 font-light mb-10 max-w-3xl mx-auto leading-relaxed">
            단순히 체크리스트를 통과했다고 해서 리스크가 소멸되지 않습니다. 
            진정한 위협은 내부 설계 오류와 법적 리스크에 노출된 <strong className="text-[#3498DB]">구조적 공백</strong>에 있습니다. 
            yobizwiz 진단 엔진을 통해 예상 금융 파산 액수를 실시간 검증하십시오.
          </p>

          {/* Interactive Form Panel */}
          <div className="max-w-3xl mx-auto bg-[#151A22] p-6 md:p-8 rounded-2xl border border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-left space-y-6 relative">
            <h2 className="text-lg font-bold text-white tracking-wide uppercase border-b border-gray-800 pb-3 flex items-center gap-2">
              <span>⚙️</span> 리스크 매개변수 실시간 모델링
            </h2>

            {/* Input 1: Process Name */}
            <div>
              <label htmlFor="process-name" className="block text-xs font-mono uppercase tracking-widest text-[#85929E] mb-2 font-bold">
                핵심 비즈니스 프로세스 식별명
              </label>
              <input 
                id="process-name"
                type="text" 
                value={processName}
                onChange={(e) => setProcessName(e.target.value)}
                placeholder="예: 고객 정보 데이터베이스 유통 플로우"
                className="w-full p-3 rounded-lg bg-[#0B0C10] border border-gray-800 text-white focus:outline-none focus:ring-1 focus:ring-[#3498DB] font-sans"
              />
            </div>

            {/* Input 2: Data Volume Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="vol-slider" className="text-xs font-mono uppercase tracking-widest text-[#85929E] font-bold">
                  자산 데이터 규모 (Data Volume)
                </label>
                <span className="font-mono text-[#F39C12] font-black text-sm">{dataVolumeGB.toLocaleString()} GB</span>
              </div>
              <input 
                id="vol-slider"
                type="range" 
                min="10" 
                max="10000" 
                step="50"
                value={dataVolumeGB}
                onChange={(e) => setDataVolumeGB(Number(e.target.value))}
                className="w-full accent-[#C0392B] bg-gray-800 rounded-lg appearance-none cursor-pointer h-2"
              />
            </div>

            {/* Grid for Jurisdiction & Gap Score */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Input 3: Jurisdiction Select */}
              <div>
                <label htmlFor="jur-select" className="block text-xs font-mono uppercase tracking-widest text-[#85929E] mb-2 font-bold">
                  주요 관할 규제 분야
                </label>
                <select 
                  id="jur-select"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full p-3 rounded-lg bg-[#0B0C10] border border-gray-800 text-white focus:outline-none focus:ring-1 focus:ring-[#3498DB]"
                >
                  <option value="NYDFS">NYDFS 23 NYCRR 500 (뉴욕 금융감독청)</option>
                  <option value="NY_SHIELD">NY SHIELD Act (뉴욕 전자보안법)</option>
                  <option value="GDPR">EU GDPR (유럽 개인정보보호법)</option>
                  <option value="CCPA">US CCPA (캘리포니아 프라이버시법)</option>
                </select>
              </div>

              {/* Input 4: Compliance Gap Score Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="gap-slider" className="text-xs font-mono uppercase tracking-widest text-[#85929E] font-bold">
                    규제 아키텍처 불일치 지수
                  </label>
                  <span className="font-mono text-[#E74C3C] font-black text-sm">{complianceGapScore}%</span>
                </div>
                <input 
                  id="gap-slider"
                  type="range" 
                  min="5" 
                  max="100" 
                  value={complianceGapScore}
                  onChange={(e) => setComplianceGapScore(Number(e.target.value))}
                  className="w-full accent-[#C0392B] bg-gray-800 rounded-lg appearance-none cursor-pointer h-2"
                />
              </div>
            </div>

            {/* Run Button */}
            <button 
              onClick={handleAnalyzeClick}
              disabled={isLoading}
              className={`w-full py-4 text-lg font-extrabold tracking-wider rounded-xl transition duration-300 transform active:scale-95 uppercase ${
                isLoading 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-[#C0392B] hover:bg-[#E74C3C] text-white shadow-[0_8px_20px_rgba(192,57,43,0.4)]'
              }`}
            >
              {isLoading ? '⚙️ 심층 리스크 시뮬레이션 가동 중...' : '🔥 실시간 위협 진단 시뮬레이션 실행'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Results Container */}
      <main className="max-w-4xl mx-auto px-6 mt-12 relative">
        {isLoading && (
          <div className="text-center p-12 bg-[#1C1617]/40 border border-[#E74C3C]/30 rounded-2xl animate-pulse">
            <p className="text-xl font-mono font-bold text-[#E74C3C] mb-2">
              [SYSTEM LOADING] ANALYZING ARCHITECTURAL FAULTS...
            </p>
            <p className="text-sm text-gray-400">
              규제 관할권 패널티 공식과 데이터 볼륨의 기하급수적 손실 지수를 대입하고 있습니다.
            </p>
          </div>
        )}

        {reportData && !isLoading && (
          <>
            {/* The Warning & Results */}
            <ReportDisplay data={reportData} />
            
            {/* The Mandatory Action Form */}
            <ConsultingForm riskScore={complianceGapScore} qLoss={reportData.qLossEstimate} />
          </>
        )}
      </main>
    </div>
  );
}