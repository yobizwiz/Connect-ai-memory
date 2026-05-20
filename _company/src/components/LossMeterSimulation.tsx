import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';

// --- 타입 정의 (API 스펙 준수) ---
interface RiskData {
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  loss_detected_usd: number; // 재무적 손실액 USD 단위
  details: string[];
}

// 🚨 시각적 효과 및 로직 정의 (Self-RAG 기반)
const getRiskStyles = (level: RiskData['risk_level']) => {
  switch (level) {
    case 'CRITICAL':
      return {
        colorClass: 'bg-red-900/90 border-red-600 shadow-[0_0_30px_rgba(255,0,0,0.8)]',
        icon: <FaExclamationTriangle className="text-red-500 animate-pulse" />,
        message: '🚨 CRITICAL ALERT! 시스템적 생존 위협 감지. 즉각적인 통제가 필요합니다.',
      };
    case 'HIGH':
      return {
        colorClass: 'bg-orange-900/80 border-orange-600 shadow-[0_0_25px_rgba(255,140,0,0.7)]',
        icon: <FaExclamationTriangle className="text-orange-400" />,
        message: '⚠️ HIGH RISK DETECTED. 운영 통제 솔루션이 시급합니다.',
      };
    case 'MEDIUM':
      return {
        colorClass: 'bg-yellow-900/70 border-yellow-600 shadow-[0_0_20px_rgba(255,193,7,0.6)]',
        icon: <FaExclamationTriangle className="text-yellow-400" />,
        message: '🟡 MEDIUM RISK. 리스크 진단 및 프로세스 검토가 필요합니다.',
      };
    case 'LOW':
    default:
      return {
        colorClass: 'bg-green-900/70 border-green-600 shadow-[0_0_15px_rgba(76,175,80,0.5)]',
        icon: <FaShieldAlt className="text-green-400" />,
        message: '🟢 LOW RISK. 현재 프로세스 안정성이 확보되었습니다.',
      };
  }
};

// ⏳ API 호출 시뮬레이션 (비동기 처리, 구조적 결함 포함)
const simulateApiCall = (): Promise<RiskData> => {
  return new Promise((resolve) => {
    // 3초 지연을 주어 로딩 상태를 체감하게 만듭니다. [근거: 코다리 개인 메모리]
    setTimeout(() => {
      const randomWeight = Math.random();
      let riskData: RiskData;

      if (randomWeight < 0.2) { // Critical Alert (20%)
        riskData = {
          risk_level: 'CRITICAL',
          loss_detected_usd: Math.floor(Math.random() * 500 + 1000), // $1,100 ~ $6,000 손실액
          details: ['규제 위반 (GDPR/CCPA)', '운영 중단 예측 손실', '재무적 통제 실패'],
        };
      } else if (randomWeight < 0.5) { // High Risk (30%)
        riskData = {
          risk_level: 'HIGH',
          loss_detected_usd: Math.floor(Math.random() * 200 + 300), // $300 ~ $500 손실액
          details: ['프로세스 병목 현상 감지', '공급망 리스크 노출', '비규격 데이터 처리'],
        };
      } else if (randomWeight < 0.8) { // Medium Risk (30%)
        riskData = {
          risk_level: 'MEDIUM',
          loss_detected_usd: Math.floor(Math.random() * 150 + 10), // $10 ~ $160 손실액
          details: ['개선 가능한 비효율성 발견', '업무 프로세스 최적화 필요'],
        };
      } else { // Low Risk (20%)
        riskData = {
          risk_level: 'LOW',
          loss_detected_usd: 0,
          details: ['기준 프로세스 준수 확인', '시스템 안정성 양호'],
        };
      }

      resolve(riskData);
    }, 3000); // 3초 지연 시뮬레이션
  });
};


// ==============================================================
// 메인 컴포넌트: Loss Meter Simulation (Loss/Warning Area)
// ==============================================================
const LossMeterSimulation: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [riskData, setRiskData] = useState<RiskData | null>(null);

  useEffect(() => {
    setIsLoading(true);
    simulateApiCall()
      .then((data) => {
        setRiskData(data);
      })
      .catch((error) => {
        console.error("API Simulation Failed:", error);
        setRiskData({ risk_level: 'CRITICAL', loss_detected_usd: 9999, details: ['시스템 오류 발생'], }); // 실패 시 최대 위협으로 설정
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // 리스크 레벨에 따른 스타일과 메시지를 계산합니다. [근거: Self-RAG, 🏢 회사 정체성]
  const currentStyles = getRiskStyles(riskData?.risk_level || 'CRITICAL');


  return (
    <div className="p-8 bg-gray-900/70 border-y border-red-800 shadow-2xl mt-16">
      <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
        재무적 리스크 진단 (Risk Assessment) ⚙️
      </h2>
      <p className="text-lg text-red-300 mb-8">
        현재 귀사의 운영 시스템은 구조적 생존 위협에 얼마나 노출되어 있을까요? <span className="font-bold underline">진단을 요청하세요.</span>
      </p>

      {isLoading ? (
        <div className="text-center p-12 bg-gray-800/70 rounded-lg border border-red-900 animate-pulse">
          <h3 className="text-xl text-red-400 mb-4">데이터 흐름 분석 중...</h3>
          <p>최대 3초간의 시스템 연산을 통해 구조적 취약점을 검사합니다. 전문적인 시스템 통합(System Integration) 과정이므로 잠시만 기다려 주십시오.</p>
          {/* 로딩 애니메이션 */}
          <div className="mt-8 h-2 bg-gray-700 rounded-full overflow-hidden">
             <div className="animate-[linear_3s_ease-out] h-full bg-red-600" style={{ width: '100%' }}></div>
          </div>
        </div>
      ) : (
        // 🟢 결과 출력 영역 (Red/Blue Zone 인터랙션 시뮬레이션)
        <div className={`p-8 rounded-xl border-4 ${currentStyles.colorClass} text-white shadow-2xl`}>
            <div className="flex items-center mb-4">
                {currentStyles.icon}
                <h3 className="text-3xl font-bold ml-3 tracking-wide">{currentStyles.message}</h3>
            </div>

            {/* 핵심 결과 지표: 재무적 손실액 */}
            <div className="bg-black/50 p-4 rounded-lg border-l-4 border-red-500 mb-6">
                <p className="text-sm text-gray-300 uppercase tracking-widest">추정 재무적 손실액 (Estimated Loss)</p>
                <p className={`text-5xl font-extrabold ${riskData.risk_level === 'CRITICAL' ? 'text-red-400 animate-ping' : 'text-white'} transition duration-500`}>
                    ${riskData.loss_detected_usd.toLocaleString()} USD 💸
                </p>
            </div>

            {/* 상세 위험 요소 */}
            <div>
                <h4 className="text-xl font-semibold text-gray-200 mb-3">✅ 감지된 주요 취약점:</h4>
                <ul className="space-y-2 list-none pl-0">
                    {riskData.details.map((detail, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-200">
                            <span className={`mr-3 mt-1 inline-block ${riskData.risk_level === 'CRITICAL' ? 'text-red-400' : 'text-yellow-400'} transform translate-y-[-5px]'>•</span> 
                            {detail}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-10 text-center">
                <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-12 rounded-lg text-xl transition duration-300 shadow-lg transform hover:scale-105">
                    무료 리스크 진단 요청 (Free Diagnosis) 🛡️
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default LossMeterSimulation;