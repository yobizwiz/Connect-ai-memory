import React from 'react';
import { useTarsContext } from '../context/riskContext';

// 🚨 UI 컴포넌트: Glitch Noise 및 타이머 연동 지점
const RiskAlertDisplay: React.FC = () => {
    const { currentRiskStatus, isLoading } = useTarsContext();

    if (isLoading) {
        return <div className="p-4 bg-gray-800 text-white">시스템 리스크 점수 계산 중... 잠시만 기다려주세요. ⚙️</div>;
    }

    let visualEffectClass = 'border-yellow-500'; // 기본 경고
    let alertMessage = '';

    if (currentRiskStatus === 'CRITICAL') {
        // CRITICAL State: 글리치, 네온 레드, 카운트다운 필수 연출 지점
        visualEffectClass = 'animate-glitch border-red-600 bg-red-950/70';
        alertMessage = "🚨 [OPERATIONAL BLACKOUT IMMINENT] 🔴 즉각적인 대응이 필요합니다. 리스크가 임계치를 초과했습니다.";
    } else if (currentRiskStatus === 'WARNING') {
        // WARNING State: 경고 노란색 강조
        visualEffectClass = 'border-yellow-600 bg-gray-800/70';
        alertMessage = "⚠️ [HIGH ALERT] 규제 위반 위험이 높아지고 있습니다. 대응 전략 재검토가 필요합니다.";
    } else {
        // NORMAL State: 정상 표시
        return null; // 상태가 Normal이면 아무것도 보여주지 않아 깔끔함을 유지 (디자인 원칙)
    }

    return (
        <div className={`p-6 my-8 rounded-xl border-4 ${visualEffectClass}`} style={{ boxShadow: '0 0 30px rgba(255, 0, 0, 0.5)' }}>
            <h2 className="text-3xl font-bold text-red-400 mb-2">시스템 위험 경고 발동</h2>
            <p className={`text-lg mb-4 ${currentRiskStatus === 'CRITICAL' ? 'text-red-300 animate-pulse' : 'text-yellow-300'}`}>
                {alertMessage}
            </p>

            {/* Live Countdown Timer Placeholder */}
            <div className="mt-4 p-3 bg-black border border-red-500 rounded text-center">
                <span className='text-xl font-mono'>⏰ 남은 시간: </span>
                <span className={`text-4xl font-extrabold ${currentRiskStatus === 'CRITICAL' ? 'text-red-600 glitch' : 'text-yellow-400'}`}>
                    {/* 실제 타이머 로직이 들어갈 자리 (예: <Timer seconds={countdownSeconds} />) */}
                    3시간 12분 5초
                </span>
            </div>

            <p className="mt-4 text-sm text-gray-300">
                * 이 경고는 Time-Adjusted Risk Score(TARS)가 임계치에 도달했음을 의미합니다.
            </p>
        </div>
    );
};

export default RiskAlertDisplay;