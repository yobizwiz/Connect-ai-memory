/**
 * @fileoverview useRiskDiagnosis hook: 위험 진단 과정의 비동기 로직 및 상태 관리를 담당합니다.
 * 이 훅은 실제 백엔드 API 호출을 시뮬레이션하며, 리스크 점수 계산과 전역 상태 변화를 관리합니다.
 */

import { useState, useCallback } from 'react';

// --- [API 계약 정의] ---
interface DiagnosisInput {
    companyName: string;
    employeesCount: number;
    annualRevenueUSD: number;
}

export interface RiskReport {
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    riskScore: number; // 0 - 100 (높을수록 위험)
    summary: string;
    recommendedAction: string[];
    threatMultiplier: number; // 공포감 증폭 계수 (예: 1.5)
}

// 로컬에서 API 호출을 시뮬레이션하는 함수 (실제 환경에서는 fetch('/api/risk-engine') 사용)
const simulateApiCall = async (inputs: DiagnosisInput): Promise<RiskReport> => {
    console.log("⚙️ [API Mock] 진단 엔진 가동 중... 시스템 데이터 분석 시작.");

    // 2초간의 강제 지연을 통해 시간적 압박(Time Pressure) 부여
    await new Promise(resolve => setTimeout(resolve, 2000));

    // --- 구조적인 리스크 점수 계산 로직 시뮬레이션 (위험 극대화 목표) ---
    let score = (inputs.annualRevenueUSD / 1e6) * 0.5 + inputs.employeesCount * 2;
    if (inputs.companyName.includes("Startup") && inputs.annualRevenueUSD < 1e6) {
        score *= 1.5; // 스타트업은 초기 리스크가 높다고 강제 조정
    }

    let riskLevel: RiskReport['riskLevel'];
    let summary: string;
    let threatMultiplier: number;

    if (score > 70) {
        riskLevel = 'Critical';
        summary = `[ALERT] 현재 귀사의 구조적 취약점은 측정 기준을 초과했습니다. 즉각적인 시스템 재평가(Systemic Reassessment)가 필요합니다.`;
        threatMultiplier = 2.5; // 최고 위험
    } else if (score > 40) {
        riskLevel = 'High';
        summary = `[WARNING] 몇 가지 핵심 지표에서 잠재적 결함이 감지되었습니다. 전문적인 진단 없이는 운영 리스크가 높습니다.`;
        threatMultiplier = 1.8; // 높은 위험
    } else if (score > 15) {
        riskLevel = 'Medium';
        summary = `[NOTICE] 기본적인 구조는 갖추었으나, 미비한 부분에서 미래의 법적/재정적 취약점이 발견됩니다. 보강이 필요합니다.`;
        threatMultiplier = 1.2; // 보통 위험
    } else {
        riskLevel = 'Low';
        summary = `[INFO] 현재까지 감지된 데이터 흐름은 비교적 안정적입니다. 그러나 'Total Risk' 관점에서 볼 때, 다른 변수를 반드시 체크해야 합니다.`;
        threatMultiplier = 0.8; // 낮은 위험
    }

    return {
        riskLevel: riskLevel,
        riskScore: Math.min(100, Math.round(score)),
        summary: summary,
        recommendedAction: ["위험 점수 분석 보고서 요청", "전담 컨설턴트와 심층 논의 예약"],
        threatMultiplier: threatMultiplier
    };
};

/**
 * @description 진단 프로세스 상태 관리 및 API 호출 로직을 제공하는 커스텀 훅.
 * @returns {Object} 현재 상태, 에러 핸들러, 데이터 처리 함수
 */
export const useRiskDiagnosis = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [report, setReport] = useState<RiskReport | null>(null);

    /**
     * 진단 프로세스를 시작하고 결과를 설정하는 함수.
     * @param inputs - 사용자 입력 데이터
     */
    const runDiagnosis = useCallback(async (inputs: DiagnosisInput) => {
        if (!inputs || !inputs.companyName || typeof inputs.annualRevenueUSD !== 'number') {
            setError("진단에 필요한 모든 필수 정보를 입력해 주십시오.");
            setReport(null);
            return;
        }

        setIsLoading(true);
        setError(null);
        setReport(null);

        try {
            // 1. API 시뮬레이션 호출 (가장 중요한 비동기 부분)
            const result = await simulateApiCall(inputs);
            
            // 2. 상태 업데이트 및 리포트 저장
            setReport(result);
            console.log("✅ [SUCCESS] 진단 프로세스 완료. 최종 보고서 생성.");

        } catch (e) {
            setError(`진단 엔진에서 오류가 발생했습니다: ${(e as Error).message}`);
            console.error("❌ Diagnosis Failed:", e);
        } finally {
            // 3. 로딩 상태 해제
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        error,
        report,
        runDiagnosis
    };
};