/**
 * @fileoverview 핵심 보고서 생성 및 구조적 결함 감지 시뮬레이션 서비스
 * 이 모듈은 사용자 입력 데이터를 받아 가상의 위험 평가를 수행하고,
 * 그 결과에 따라 리스크 점수, 오류 메시지, 그리고 사운드 트리거 ID를 반환합니다.
 * ⚠️ 주의: 실제 금융/법규 로직이 아닌, '구조적 불안감' 체험을 위한 시뮬레이션입니다.
 */

import { ReportInput } from '../types/reportTypes'; // 가정된 타입 파일

/**
 * Mock API 응답 구조체 정의
 * 모든 필수 필드가 포함되어야만 데이터 무결성이 확보됩니다.
 */
export interface AnalysisResult {
    isStructuralFlawDetected: boolean; // 구조적 결함 여부 (Boolean)
    riskScore: number;                // 위험 점수 (0-100, 높을수록 심각)
    errorMessage: string;             // 사용자에게 노출될 경고 메시지 (String)
    soundTriggerId: 'none' | 'glitch_alert' | 'critical_alarm'; // 사운드 트리거 ID
}

/**
 * 가상의 데이터 기반으로 구조적 결함을 분석하고 위험 보고서를 생성합니다.
 * @param input - 사용자로부터 받은 데이터를 담은 객체 (예: 재무 상태, 규정 준수 레벨 등)
 * @returns AnalysisResult - 평가 결과를 포함하는 구조화된 객체
 */
export const generateRiskReport = async (input: ReportInput): Promise<AnalysisResult> => {
    // 🌐 백엔드 시뮬레이션 지연 시간 부여. 사용자에게 '분석 중'이라는 압박을 주어 몰입도를 높입니다.
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 2000));

    // ======================================================
    // [핵심 로직: 구조적 결함 검증 (Structural Integrity Check)]
    // 이 곳에 복잡한 비즈니스/법규 데이터 체크 로직이 들어갈 자리입니다.
    // 현재는 가상의 조건문으로 대체합니다.
    // ======================================================

    let isFlawDetected: boolean;
    let riskScore: number;
    let errorMessage: string;
    let soundTriggerId: 'none' | 'glitch_alert' | 'critical_alarm';

    const complianceLevel = input.complianceLevel || 0; // 가상의 레벨
    const financialHealth = input.financialMetrics?.cashReserve || 0; // 가상의 재무 지표

    // Case 1: 치명적 구조 결함 감지 (Critical Alarm)
    if (complianceLevel < 0.3 && financialHealth < 10000) {
        isFlawDetected = true;
        riskScore = Math.floor(Math.random() * 20) + 85; // 높은 점수 할당
        errorMessage = `🚨 치명적 구조 결함 감지: 핵심 규정 준수 레벨(${complianceLevel})과 현금 보유량 부족으로 인해 시스템 운영이 즉시 위험합니다. ${Math.floor((1 - complianceLevel) * 100)}%의 법적 리스크가 확인되었습니다.`;
        soundTriggerId = 'critical_alarm';
    }
    // Case 2: 경고 레벨 결함 감지 (Glitch Alert)
    else if (complianceLevel < 0.7 || financialHealth < 50000) {
        isFlawDetected = true;
        riskScore = Math.floor(Math.random() * 30) + 40; // 중간 점수 할당
        errorMessage = `⚠️ 시스템 개입 경고: 재무 건전성 또는 특정 규제 영역에서 미세한 구조적 결함이 감지되었습니다. 즉각적인 전문가 진단이 필요합니다.`;
        soundTriggerId = 'glitch_alert';
    }
    // Case 3: 정상 (No Flaw)
    else {
        isFlawDetected = false;
        riskScore = Math.floor(Math.random() * 15); // 낮은 점수 할당
        errorMessage = `✅ 시스템 무결성 정상 감지: 현재까지의 데이터 흐름은 구조적 위험이 감지되지 않았습니다. 주기적인 검증을 권장합니다.`;
        soundTriggerId = 'none';
    }

    return {
        isStructuralFlawDetected: isFlawDetected,
        riskScore: riskScore,
        errorMessage: errorMessage,
        soundTriggerId: soundTriggerId
    };
};

/**
 * [테스트 전용] Mock API 호출 시뮬레이션 함수.
 * 실제 백엔드 환경에서는 이 함수가 외부 서비스(예: Payment Gateway)와 연동되어야 합니다.
 */
export const testMockApiCall = async (inputData: ReportInput): Promise<AnalysisResult> => {
    console.log(`[Test] Running API simulation with input data...`);
    // 실제 환경에서는 여기에 try/catch 및 에러 핸들링 로직이 추가되어야 합니다.
    return generateRiskReport(inputData);
};

export const reportGeneratorService = {
    generateRiskReport,
    testMockApiCall
};