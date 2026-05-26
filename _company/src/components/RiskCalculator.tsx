// src/components/RiskCalculator.tsx
import React, { useState, useCallback, useMemo } from 'react';
import './RiskCalculator.css'; // 전용 CSS 파일 생성 예정

type RiskLevel = 'Normal' | 'Warning' | 'Critical';

interface InputData {
    piiLeakageCount: number;
    complianceDriftScore: number;
    processAuditFailed: boolean;
}

/**
 * 리스크 레벨별 스타일과 경고 메시지를 관리하는 유틸리티 함수.
 * @param {RiskLevel} level 
 * @returns {{colorClass: string, title: string, description: string}}
 */
const getRiskState = (level: RiskLevel) => {
    switch (level) {
        case 'Normal':
            return { colorClass: 'border-green-500', title: '✅ 리스크 정상 범위', description: '현재 시스템 구조적 결함은 발견되지 않았습니다. 하지만 경계심을 늦추지 마십시오.' };
        case 'Warning':
            return { colorClass: 'border-yellow-500', title: '⚠️ 주의: 잠재적 위험 감지', description: '일부 규정 준수 편차가 확인되었습니다. 즉각적인 구조 검토가 필요합니다.' };
        case 'Critical':
            return { colorClass: 'border-red-600 animate-pulse', title: '🚨 시스템 생존 위협! (RED ZONE)', description: '심각한 결함이 다수 발견되어 운영 자체가 중단될 위험에 처했습니다. 즉시 전문가의 진단(Audit)을 받으십시오.' };
    }
};

/**
 * 핵심 리스크 계산 로직. 사용자 입력 데이터를 구조적 가중치 기반으로 분석합니다.
 * @param {InputData} data 
 * @returns {{riskLevel: RiskLevel, lossScore: number}}
 */
const calculateRisk = (data: InputData) => {
    // [근거: Loss_Meter_System_Spec_v1.0.md] - 가중치 적용 로직 구현
    let score = 0;

    // 1. PII Leakage Weighting (가장 치명적임)
    const piiScore = data.piiLeakageCount * 8; // 건당 높은 페널티
    score += piiScore;

    // 2. Compliance Drift Weighting (점수 기반)
    // 점수가 높을수록, 즉 편차가 클수록 위험도가 급증하는 비선형 함수 적용
    const compliancePenalty = Math.pow(data.complianceDriftScore / 100, 3) * 50; 
    score += compliancePenalty;

    // 3. Audit Failure (Binary Trigger - 가장 강력한 트리거)
    if (data.processAuditFailed) {
        score += 100; // 최대치에 가깝게 점수를 급상승시켜 Critical 유도
    }

    let riskLevel: RiskLevel = 'Normal';
    let lossScore = Math.round(score);

    // 리스크 레벨 결정 로직 (Threshold 기반)
    if (lossScore >= 150) {
        riskLevel = 'Critical'; // 임계점 초과
    } else if (lossScore >= 50) {
        riskLevel = 'Warning'; // 경고 구간 진입
    } else {
        riskLevel = 'Normal';
    }

    return { riskLevel, lossScore };
};


/**
 * 랜딩 페이지의 핵심 기능: 리스크 점수 계산기 및 Loss Meter 시뮬레이터.
 * 이 컴포넌트는 고객에게 구조적 생존 위협을 체험하게 만드는 영업 무기입니다.
 */
const RiskCalculator: React.FC = () => {
    // 초기 상태 정의 (모든 위험이 낮은 가정)
    const [inputs, setInputs] = useState<InputData>({
        piiLeakageCount: 0,
        complianceDriftScore: 5,
        processAuditFailed: false,
    });

    // 사용자 입력 변경 핸들러 (State Update)
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, type, value, checked } = e.target;
        let updatedValue: any;

        if (type === 'checkbox') {
            updatedValue = checked;
        } else if (name === 'piiLeakageCount' || name === 'complianceDriftScore') {
            updatedValue = parseFloat(value) || 0;
        } else {
            updatedValue = value;
        }

        setInputs(prev => ({ ...prev, [name]: updatedValue }));
    }, []);

    // 리스크 계산 로직 (Memoization을 사용하여 불필요한 재계산을 방지)
    const analysisResult = useMemo(() => {
        return calculateRisk(inputs);
    }, [inputs]); // inputs 상태가 변경될 때만 재실행

    const riskState = getRiskState(analysisResult.riskLevel);

    // UI 렌더링 로직을 위한 공통 스타일 정의
    const lossMeterClasses = `p-6 rounded-xl shadow-2xl transition duration-500 ${riskState.colorClass} bg-gray-900/70 border-4`;


    return (
        <div className="max-w-4xl mx-auto py-12">
            {/* 🚨 메인 섹션 제목 */}
            <h2 className="text-5xl font-extrabold text-red-600 mb-3 tracking-tight">
                구조적 리스크 진단 시스템 (v1.0)
            </h2>
            <p className="text-xl text-gray-400 mb-10 border-b pb-8">
                잠재적 손실액($QLoss)을 실시간으로 측정하고, 귀사의 생존 위협 수준을 진단하십시오.
            </p>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
                {/* 📐 좌측: 데이터 입력 (Inputs) */}
                <div className="space-y-8 p-6 bg-gray-900/50 rounded-xl shadow-inner border border-gray-700">
                    <h3 className="text-2xl font-semibold text-white border-b pb-4">📊 1. 데이터 입력: 위협 요소 식별</h3>

                    {/* PII Leakage */}
                    <div>
                        <label htmlFor="piiLeakageCount" className="block text-lg font-medium text-gray-300 mb-2">
                            개인 식별 정보(PII) 유출 건수 (0~10):
                        </label>
                        <input 
                            type="number" 
                            id="piiLeakageCount"
                            name="piiLeakageCount"
                            min="0"
                            max="10"
                            value={inputs.piiLeakageCount}
                            onChange={handleInputChange}
                            className="w-full p-3 bg-gray-800 text-white border border-gray-700 focus:border-red-500 focus:ring-red-500 transition"
                        />
                    </div>

                    {/* Compliance Drift Score */}
                    <div>
                        <label htmlFor="complianceDriftScore" className="block text-lg font-medium text-gray-300 mb-2">
                            규정 준수 편차 점수 (Compliance Drift, 0~100):
                        </label>
                        <input 
                            type="range" 
                            id="complianceDriftScore"
                            name="complianceDriftScore"
                            min="0"
                            max="100"
                            value={inputs.complianceDriftScore}
                            onChange={handleInputChange}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg [&::-webkit-slider-thumb]:bg-red-600 [&::-moz-range-thumb]:bg-red-600"
                        />
                        <p className="text-sm text-gray-400 mt-2">현재 편차: <span className="font-bold text-white">{inputs.complianceDriftScore}%</span></p>
                    </div>

                    {/* Audit Failure Checkbox */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                        <input 
                            type="checkbox" 
                            id="processAuditFailed"
                            name="processAuditFailed"
                            checked={inputs.processAuditFailed}
                            onChange={handleInputChange}
                            className="form-checkbox h-5 w-5 text-red-600 bg-gray-800 border-gray-700 rounded focus:ring-red-500 cursor-pointer"
                        />
                        <label htmlFor="processAuditFailed" className="text-lg font-medium text-gray-300">
                            프로세스 감사 실패 여부 확인 (Critical Trigger)
                        </label>
                    </div>
                </div>

                {/* 📉 우측: Loss Meter 및 결과 표시 */}
                <div className={lossMeterClasses}>
                    <h3 className="text-2xl font-bold text-white mb-6 border-b pb-3">📈 2. 리스크 점수 산출 (Loss Meter)</h3>

                    {/* 헤더 정보 */}
                    <div className="mb-8 p-4 bg-gray-900/70 rounded-lg border-l-4" style={{ borderColor: riskState.colorClass.includes('red') ? '#ff3d3d' : riskState.colorClass.includes('yellow') ? '#ffe132' : '#48bb78' }}>
                        <p className="text-sm font-semibold uppercase text-gray-300">진단 상태</p>
                        <h4 className={`text-3xl font-extrabold mt-1 ${riskState.colorClass}`}>{riskState.title}</h4>
                    </div>

                    {/* 핵심 지표: Loss Score */}
                    <div className="mb-6">
                        <p className="text-lg text-gray-400 mb-2">잠재적 재무 손실액 (Quantitative Loss, $QLoss)</p>
                        <div className="flex items-baseline space-x-3">
                            <span className={`text-7xl font-black ${riskState.colorClass}`}>
                                ${analysisResult.lossScore.toLocaleString()}K <span className='text-4xl'>USD</span>
                            </span>
                            <span className={`text-2xl font-bold uppercase tracking-wider hidden sm:inline`}>점수</span>
                        </div>
                    </div>

                    {/* 상세 설명 및 CTA */}
                    <div>
                        <p className="text-xl text-gray-300 mb-4">
                            경고 분석: {riskState.description}
                        </p>
                        <button 
                            className={`w-full py-4 text-lg font-bold uppercase tracking-widest transition duration-300 ${riskState.colorClass.replace('border-', 'bg-')} hover:opacity-90`}
                            style={{ backgroundColor: riskState.colorClass.includes('red') ? '#c0392b' : riskState.colorClass.includes('yellow') ? '#f1c40f' : '#2ecc71' }}
                        >
                            지금 바로 전문가에게 진단 요청하기 (Audit Request) ⚙️
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default RiskCalculator;