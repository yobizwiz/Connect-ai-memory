/**
 * @fileoverview 리스크 진단 대시보드의 핵심 컴포넌트 쉘.
 * 상태 관리 로직(useRiskCalculation)을 소비하고, Lmax 임계치에 따라 UI를 전환합니다.
 */
import React from 'react';
import { useRiskCalculation } from '../hooks/useRiskCalculation';
import { RiskInput } from '../types/risk-types';

// 초기 상태 값 정의 (실제로는 Context나 Redux에서 가져와야 함)
const INITIAL_RISK_STATE: RiskInput = {
    regulatoryComplianceScore: 85, // 기본값 설정
    dataStorageSecurityLevel: 'Medium',
    employeeTrainingFrequencyDays: 30,
};

// UI의 임계치 스타일을 정의하는 Props 타입
interface ThreatGaugeProps {
    lmaxScore: number;
    isCritical: boolean;
}

/**
 * [핵심 로직] L_max 점수에 따라 전체 컴포넌트의 상태와 시각적 톤(Tone)을 결정합니다.
 */
const calculateDisplayStyle = (props: ThreatGaugeProps) => {
    if (props.isCritical) {
        // Designer가 요구한 'Red Zone' 모드 진입
        return {
            backgroundColor: '#1a0000', // 어두운 와인색 배경
            borderColor: '#ff0000',     // 네온 레드 테두리
            animationClass: 'glitch-active neon-red', // CSS 클래스로 Glitch 효과 호출
        };
    } else if (props.lmaxScore > 60) {
        return {
            backgroundColor: '#331a00', // 경고 오렌지 계열 배경
            borderColor: '#ff8c00',
            animationClass: 'warning-pulse',
        };
    } else {
        // 정상 모드 (Normal State)
        return {
            backgroundColor: '#0d2b17', // 안정적인 다크 그린 계열 배경
            borderColor: '#4caf50',
            animationClass: '',
        };
    }
};


/**
 * 위협 게이지의 시각적 렌더링을 담당하는 컴포넌트.
 * 실제 API 로직은 useRiskCalculation에서 분리하여 처리합니다.
 */
const ThreatGaugeShell: React.FC = () => {
    // 상태 훅 사용: 모든 비즈니스 로직과 상태 관리는 여기서 가져옵니다.
    const { inputs, result, updateInputs, calculateRisk } = useRiskCalculation(INITIAL_RISK_STATE);

    if (!result) {
        return <div className="loading-state">Loading Risk Data...</div>;
    }

    // 1. 스타일 결정: Lmax 결과에 따라 시각적 상태를 계산합니다. (핵심)
    const displayStyle = calculateDisplayStyle({ lmaxScore: result.lmaxScore, isCritical: result.isCritical });

    // 사용자 입력 변경 핸들러
    const handleInputChange = (key: keyof RiskInput, value: any) => {
        let newInputs: Partial<RiskInput>;

        if (typeof value === 'number') {
            newInputs = { [key]: Number(value) };
        } else if (['Low', 'Medium', 'High'].includes(value as string)) {
             newInputs = { [key]: value as any };
        } else {
            // 타입 안전성을 위해 기본적으로 number로 간주하고 처리하도록 유도
            newInputs = { [key]: parseFloat(String(value) || "0") };
        }

        updateInputs(newInputs); // 상태 업데이트 -> useRiskCalculation 내부에서 재계산 트리거
    };


    return (
        <div className={`dashboard-card p-6 rounded-xl border-4 transition-all duration-500 ${displayStyle.animationClass} shadow-2xl`}>
            {/* 🚨 리스크 경고 표시 영역 */}
            <h2 className="text-xl font-bold mb-4 text-gray-100">🔥 System Threat Assessment</h2>

            {/* 위협 게이지 (핵심 시각화) */}
            <div className="w-full h-8 bg-gray-700 rounded-full mb-6 relative overflow-hidden" 
                 style={{ border: `2px solid ${displayStyle.borderColor}` }}>
                <div 
                    className="absolute left-0 top-0 h-full transition-all duration-1000 ease-out" 
                    style={{ width: `${result.lmaxScore}%`, backgroundColor: result.isCritical ? '#ff0000' : '#4CAF50' }}
                ></div>
            </div>

            {/* 주요 지표 표시 */}
            <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                 <div>
                    <p className="text-sm uppercase text-gray-300">Total Resilience Index (TRI)</p>
                    <p className={`text-3xl font-extrabold ${result.isCritical ? 'text-red-500' : 'text-green-400'}`}>{result.totalResilienceIndex}%</p>
                </div>
                 <div>
                    <p className="text-sm uppercase text-gray-300">Max Risk Score ({"$L_{max}$"})</p>
                    <p className={`text-3xl font-extrabold ${result.isCritical ? 'text-red-500' : 'text-yellow-400'}`}>{result.lmaxScore}%</p>
                </div>
                 <div>
                    <p className="text-sm uppercase text-gray-300">Alert Status</p>
                    <p className={`text-xl font-bold ${result.isCritical ? 'text-red-600' : 'text-green-500'}`}>
                        {result.isCritical ? "🔴 CRITICAL" : "🟢 SAFE"}
                    </p>
                </div>
            </div>

            {/* ⚙️ 사용자 입력 및 제어 패널 (Input & Control) */}
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Input Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. 규정 준수 점수 (Slider Input) */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Compliance Score (0-100)</label>
                    <input type="range" min="0" max="100" value={inputs.regulatoryComplianceScore} onChange={(e) => handleInputChange('regulatoryComplianceScore', Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"/>
                    <p className="text-sm mt-1 text-right">{inputs.regulatoryComplianceScore}/100</p>
                </div>

                {/* 2. 데이터 보안 레벨 (Select Input) */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Data Security Level</label>
                    <select value={inputs.dataStorageSecurityLevel} onChange={(e) => handleInputChange('dataStorageSecurityLevel', e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white">
                        <option value="Low">🔴 Low</option>
                        <option value="Medium">🟡 Medium</option>
                        <option value="High">🟢 High</option>
                    </select>
                </div>

                 {/* 3. 직원 교육 빈도 (Input Field) */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Training Frequency (Days)</label>
                    <input type="number" min="1" max="365" value={inputs.employeeTrainingFrequencyDays} onChange={(e) => handleInputChange('employeeTrainingFrequencyDays', Number(e.target.value))} className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"/>
                </div>
            </div>

             {/* 최종 계산 버튼 (재실행 용도) */}
            <button 
                onClick={calculateRisk} 
                className={`mt-8 w-full p-3 rounded font-semibold transition duration-200 ${result.isCritical ? 'bg-red-700 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-500'} text-white`}
            >
                재진단 및 리스크 계산 실행 ⚙️
            </button>

            {/* CSS 스타일 정의 (실제 환경에서는 Global CSS 파일에 분리되어야 함) */}
            <style jsx global>{`
                .dashboard-card {
                    background-color: rgba(0, 0, 0, 0.4); /* Glassmorphism base */
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                }
                /* Red Zone Glitch Effect (Designer BluePrint 참조) */
                .glitch-active {
                    box-shadow: 0 0 50px rgba(255, 0, 0, 0.8); /* 강한 빨간색 그림자 */
                    animation: glitch-shake 0.2s infinite alternate;
                }
                @keyframes glitch-shake {
                    0% { transform: translate(-1px, -1px); }
                    50% { transform: translate(1px, 1px); }
                    100% { transform: translate(-2px, 2px); }
                }
            `}</style>
        </div>
    );
};

export default ThreatGaugeShell;