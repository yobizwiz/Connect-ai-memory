/**
 * @fileoverview 인터랙티브 리스크 게이지 컴포넌트 (Next.js / React)
 * Lmax 계산 로직을 활용하여 실시간으로 재무적 위험 노출도를 시각화합니다.
 */

'use client'; // Next.js App Router 환경임을 명시

import React, { useState, useMemo } from 'react';
import { calculateMaxLoss } from '@/components/utils/calculateMaxLoss'; // 상대 경로 지정

// ------------------- TYPES DEFINITION (TypeScript Strictness) -------------------

/** @typedef {Object} RiskInputs */
interface RiskInputs {
    complianceDriftScore: number;
    dataLeakRiskScore: number;
    operationalVulnerability: number;
}

/** @typedef {Object} LmaxResult */
interface LmaxResult {
    lmax: number; // 최대 손실액 (단위: 만 원)
    complexityScore: number; // 복합성 계수
}


// ------------------- CORE COMPONENT LOGIC -------------------

const RiskGauge: React.FC = () => {
    // 초기 상태 설정 및 제한
    const [inputs, setInputs] = useState<RiskInputs>({
        complianceDriftScore: 20, // 기본값은 낮게 시작 (안전한 느낌)
        dataLeakRiskScore: 15,
        operationalVulnerability: 30,
    });

    // 입력 값 변경 핸들러: 모든 입력을 단일 객체로 업데이트하여 상태 관리의 일관성을 유지합니다.
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numberValue = parseFloat(value) || 0;

        setInputs((prev) => ({
            ...prev,
            [name]: Math.max(0, Math.min(100, numberValue)), // 값은 0~100 사이로 클램핑 처리 (Guard)
        }));
    };


    // useMemo를 사용하여 inputs가 변경될 때만 리스크 계산을 실행합니다. 성능 최적화 및 로직 분리 목적.
    const riskResult: LmaxResult = useMemo(() => {
        console.log("--- [코다리 검증] Risk Calculation Triggered ---");
        return calculateMaxLoss(inputs);
    }, [inputs]); // inputs 배열 의존성 명시

    // ------------------- RENDER LOGIC & VISUALIZATION -------------------

    /** Lmax 값에 따른 시각적 위험 레벨 결정 */
    const getRiskLevel = (lmax: number): 'LOW' | 'MEDIUM' | 'HIGH' => {
        if (lmax < 1000) return 'LOW'; // 1천만 원 미만
        if (lmax < 4000) return 'MEDIUM'; // 4천만 원 미만
        return 'HIGH'; // 4천만 원 이상 -> 경고 필요
    };

    const riskLevel = getRiskLevel(riskResult.lmax);
    // 위험 레벨에 따른 색상 정의 (Neon Crimson & Authority Blue 대비)
    const hazardColor = riskLevel === 'HIGH' ? 'neon-crimson' : 
                        riskLevel === 'MEDIUM' ? 'orange-warning' : 'authority-blue';


    return (
        <div className="p-8 bg-gray-900 text-white min-h-[60vh] shadow-2xl border border-red-800/50">
            <h2 className="text-3xl font-bold mb-4 tracking-wider uppercase flex items-center">
                🚨 시스템적 리스크 대시보드 (Prototype) 
                <span className="ml-3 text-lg font-normal text-red-600/70">(V1.0 - Initial Build)</span>
            </h2>
            <p className="text-sm mb-8 text-gray-400">
                사용자 입력 변수가 변경될 때마다 실시간으로 $L_{max}$ (재무적 최대 손실액)가 계산됩니다. 
                위험도가 높을수록 네온 크림슨 글리치 애니메이션이 트리거됩니다.
            </p>

            {/* 1. INPUT CONTROL PANEL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                {[
                    { name: 'complianceDriftScore', label: '규제 준수 위반 지연 점수 (C)', range: [0, 100] },
                    { name: 'dataLeakRiskScore', label: 'PII 데이터 유출 위험도 (D)', range: [0, 100] },
                    { name: 'operationalVulnerability', label: '운영 취약성 지수 (V)', range: [0, 100] },
                ].map((field) => (
                    <div key={field.name} className="flex flex-col">
                        <label htmlFor={field.name} className="text-sm font-medium text-gray-300 mb-2">{field.label}</label>
                        <input
                            type="range"
                            id={field.name}
                            name={field.name}
                            min={field.range[0]}
                            max={field.range[1]}
                            value={inputs[field.name] || 0}
                            onChange={handleInputChange}
                            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${hazardColor.replace('-warning', 'bg-red-500')}`}
                        />
                        <div className="text-center mt-1 text-lg font-mono text-red-400">{inputs[field.name] || 0}%</div>
                    </div>
                ))}
            </div>

            {/* 2. VISUAL OUTPUT: RISK GAUGE */}
            <div className={`p-8 rounded-xl shadow-inner transition-all duration-500 ${hazardColor === 'neon-crimson' ? 'bg-red-900/30 border-4 border-red-600 animate-glitch' : 
                                                                    hazardColor === 'orange-warning' ? 'bg-yellow-900/30 border-4 border-amber-600' : 'bg-blue-900/30 border-4 border-blue-600'}`}>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold uppercase tracking-wide text-red-100">
                        총 위험 노출도 ($\mathbf{TRE}$)
                    </h3>
                    <span className={`text-lg font-semibold px-4 py-1 rounded ${riskLevel === 'HIGH' ? 'bg-red-700' : riskLevel === 'MEDIUM' ? 'bg-yellow-700' : 'bg-blue-700'} text-white`}>
                        위험 레벨: {riskLevel}
                    </span>
                </div>

                {/* Lmax 표시 영역 */}
                <div className="my-6 relative pt-4">
                    <div 
                        className={`text-5xl font-extrabold tracking-tight transition-all duration-300 ${riskLevel === 'HIGH' ? 'text-red-400' : riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-blue-400'} glitch`}
                        data-lmax={riskResult.lmax} // 애니메이션용 데이터 속성
                    >
                        ₩ {riskResult.lmax.toLocaleString()} 만원
                    </div>
                    <p className="absolute top-2 right-3 text-sm font-mono opacity-70">($L_{max}$)</p>
                </div>

                {/* 텍스트 피드백 (CTA Funnel 강화) */}
                <div className={`mt-8 p-4 rounded-lg transition-all duration-500 ${riskLevel === 'HIGH' ? 'bg-red-900/70 border border-red-600 animate-pulse' : riskLevel === 'MEDIUM' ? 'bg-yellow-900/70 border border-amber-600' : 'bg-blue-900/70 border border-blue-600'}`}>
                    <p className="font-semibold text-lg mb-2">⚠️ 시스템 경고 (System Alert)</p>
                    {riskLevel === 'HIGH' && (
                        <p className="text-red-300 font-medium">
                            [CRITICAL] $L_{max}$ 임계치 초과. 현재 위험 조합은 비선형적이며, 즉각적인 외부 개입(진단) 없이는 재무 구조가 붕괴할 수 있습니다.
                        </p>
                    )}
                    {riskLevel === 'MEDIUM' && (
                        <p className="text-yellow-300 font-medium">
                            [WARNING] 위험 요소들이 감지되었습니다. 복합성 계수($M_{Complexity}$)가 높아지고 있어, 구조적 점검이 필요합니다.
                        </p>
                    )}
                    {riskLevel === 'LOW' && (
                        <p className="text-blue-300 font-medium">
                            [STATUS] 현재 리스크 노출도는 안정적입니다. 하지만 잠재적인 Blind Spot을 발견할 수 있습니다. 더 깊은 분석이 필요합니다.
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
};


export default RiskGauge;