import React from 'react';
import { RiskDetail } from '../utils/dataValidator';

interface StructuralRiskWarningProps {
  risks: RiskDetail[];
}

/**
 * 구조적 리스크 보고서 컴포넌트.
 * Red Zone 경고를 통해 사용자에게 재무적 위협을 체감하게 만드는 것이 목표입니다.
 */
const StructuralRiskWarning: React.FC<StructuralRiskWarningProps> = ({ risks }) => {
  if (!risks || risks.length === 0) return null;

  return (
    <div className="p-8 bg-red-950/70 border-l-4 border-red-600 shadow-2xl animate-fadeIn">
      <h2 className="text-3xl font-extrabold text-red-400 mb-4 uppercase tracking-widest">
        ⚠️ 구조적 생존 위협 경고 (Structural Survival Threat Alert)
      </h2>
      <p className="text-lg text-gray-300 mb-8 border-b border-red-700 pb-4">
        **경고:** 현재 입력된 데이터는 yobizwiz의 분석 기준에 미달하며, 시스템적 취약성이 감지되었습니다. 이대로 진행할 경우 심각한 재무적 손실을 초래할 수 있습니다. 즉각적인 구조 조언이 필요합니다. [근거: 🏢 회사 정체성]
      </p>

      <div className="space-y-8">
        {risks.map((risk, index) => (
          <div key={index} className={`p-6 rounded-lg ${risk.severity === 'High' ? 'bg-red-900/50 border-l-4 border-red-600 shadow-xl' : 'bg-red-800/30 border-l-4 border-yellow-500'} transition duration-300 hover:shadow-2xl`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-xl font-bold ${risk.severity === 'High' ? 'text-red-400' : 'text-yellow-300'}`}>{risk.category}</h3>
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-700 text-white">
                {risk.severity === 'High' ? '🔴 HIGH RISK' : risk.severity === 'Medium' ? '🟡 MEDIUM RISK' : '🟢 LOW RISK'}
              </span>
            </div>
            <p className="text-gray-200 mb-3">{risk.description}</p>
            {risk.impactEstimate && (
                <div className="bg-red-950/80 p-3 rounded text-center mt-4 border border-red-600">
                    <span className="text-sm block uppercase tracking-wider text-red-400">예상 최소 재무 손실액 (Estimated Loss)</span>
                    <p className="text-2xl font-extrabold text-white">{risk.impactEstimate}</p>
                </div>
            )}
          </div>
        ))}
      </div>

      {/* 최종 CTA: 해결책 강제 유도 */}
      <div className="mt-10 pt-8 border-t border-red-700 text-center">
        <p className="text-xl font-semibold text-gray-200 mb-4">
          이 리스크들을 스스로 진단하고 해결하는 것은 불가능합니다. <span className="text-yellow-300 underline">[Authority Blue]</span> 전문가의 개입이 필수적입니다.
        </p>
        <button 
            className="px-12 py-3 text-lg font-bold rounded-md bg-red-600 hover:bg-red-700 transition duration-200 shadow-lg transform hover:scale-105"
            onClick={() => alert("전문 컨설팅 요청 모달 오픈")} // 실제로는 API 호출
        >
            ✅ 즉시 구조적 위협 진단 및 컨설팅 요청하기 (Premium)
        </button>
      </div>
    </div>
  );
};

export default StructuralRiskWarning;