import React from 'react';

interface ResultsReportProps {
  finalScore: number; // 최종 누적 리스크 점수 (0~9)
}

/**
 * @component ResultsReport
 * 사용자가 제출한 최종 점수에 기반하여, 공포와 긴급성을 극대화하는 보고서를 출력합니다.
 */
const ResultsReport: React.FC<ResultsReportProps> = ({ finalScore }) => {
  // 📈 점수별 리스크 레벨 정의 (공포감 최대화)
  let levelName: string;
  let alertColorClass: string;
  let primaryMessage: string;

  if (finalScore >= 7) {
    levelName = "CRITICAL FAILURE ZONE"; // 존재론적 위협
    alertColorClass = "bg-red-800/90 border-[#C0392B] text-yellow-200 shadow-[0_0_20px_rgba(192,57,43,0.8)]";
    primaryMessage = "시스템의 근본 구조적 무결성이 심각하게 훼손되었습니다. 당장 활동을 중단하고 전문가 진단을 받아야 합니다.";
  } else if (finalScore >= 4) {
    levelName = "STRUCTURAL VULNERABILITY ALERT"; // 구조적 결함
    alertColorClass = "bg-yellow-800/90 border-[#f39c12] text-white shadow-[0_0_20px_rgba(243,156,18,0.8)]";
    primaryMessage = "운영 과정에 중대한 허점과 구조적 리스크가 노출되었습니다. 즉각적인 감사와 시스템 개선이 필수입니다.";
  } else if (finalScore >= 1) {
    levelName = "MINIMAL OPERATIONAL RISK DETECTED"; // 경미한 위험
    alertColorClass = "bg-[#3A3A3A] border-gray-600 text-green-200 shadow-[0_0_20px_rgba(54,180,54,0.3)]";
    primaryMessage = "현재는 운영상의 사소한 허점만 발견되었습니다. 하지만 이는 시스템적 취약점이 아닙니다. 점진적인 관리가 필요합니다.";
  } else {
    levelName = "ANALYSIS INCONCLUSIVE - HIGH RISK OF IGNORANCE"; // 0점일 때의 역설적 공포감
    alertColorClass = "bg-[#1A1A1A] border-gray-700 text-red-500 shadow-[0_0_20px_rgba(192,57,43,0.5)]";
    primaryMessage = "평가가 너무 이상적이거나, 핵심 위험 영역을 회피하셨습니다. 진정한 시스템적 위협은 '안전한 무지'에서 비롯됩니다.";
  }

  return (
    <div className="mt-12 p-10 bg-[#252525] rounded-xl shadow-2xl border-t-4 border-red-600/80">
      {/* 최종 리스크 경고 박스 */}
      <div className={`p-8 mb-8 rounded-lg border-l-8 ${alertColorClass}`}>
        <h3 className="text-xl uppercase tracking-widest font-mono">🔥 [최종 진단]</h3>
        <h2 className="text-4xl font-extrabold mt-1">{levelName}</h2>
        <p className="mt-4 text-lg italic">{primaryMessage}</p>
      </div>

      {/* 점수 요약 */}
      <div className="mb-8 p-6 bg-[#1A1A1A] rounded-lg border border-gray-700">
          <h3 className="text-2xl font-bold text-red-500 mb-2">총 리스크 점수: {finalScore} / 9</h3>
          <p className='text-sm text-gray-400'> (최대 점수는 모든 질문에서 가장 위험한 옵션을 선택했을 때 도달합니다.)</p>
      </div>

      {/* Call To Action */}
      <div className="text-center pt-6 border-t border-[#3A3A3A]">
        <h4 className="text-2xl font-bold text-[#2980B9] mb-4">다음 단계: 구조적 무결성 확보</h4>
        <p className='mb-6'>이 점수는 단순한 진단 결과가 아닙니다. 현재 비즈니스가 직면한 '시스템적 생존 위협'의 정량화된 수치입니다.</p>
        {/* 최종 CTA 버튼 */}
        <button 
            className="px-12 py-4 text-xl font-bold bg-[#C0392B] hover:bg-red-700 transition duration-300 rounded-full shadow-lg shadow-red-900/50"
        >
            Compliance Gateway Pro 전문가에게 문의하기 (지금 당장)
        </button>
      </div>
    </div>
  );
};

export default ResultsReport;