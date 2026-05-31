/**
 * @module diagnose
 * @description 사용자가 입력한 비즈니스 데이터를 받아 시스템적 리스크 레벨을 진단하는 Mock API 엔드포인트.
 * 이 로직은 실제 데이터베이스 조회나 복잡한 계산 대신, '규제 준수'의 권위적인 톤과 강제성을 부여합니다.
 */

import { NextApiRequest, NextApiResponse } from 'next';

// @typedef {Object} DiagnosticInputPayload
// 사용자가 입력할 가상의 비즈니스 데이터 구조
interface DiagnosticInputPayload {
    companyName: string;
    industrySector: string;
    employeeCount: number;
    annualRevenueMillions: number;
    regulatoryComplianceScore: number; // 0~100점 사이의 수치 (핵심 리스크 변수)
}

// @typedef {Object} DiagnosticReportPayload
// 시스템이 반환할 구조화된 진단 보고서 데이터
interface DiagnosticReportPayload {
    riskLevel: 'RED' | 'YELLOW' | 'GREEN'; // 시스템적 위협 등급
    totalRiskScore: number; // 0~100 (점수가 낮을수록 위험)
    isCompliant: boolean; // 법규 준수 여부
    suggestedAction: string[]; // 권고 조치 목록
    requiredInsurancePremiumMillions: number; // 강제적으로 요구되는 보험료(결제 유도 핵심 변수)
}

/**
 * 리스크 레벨을 결정하는 비즈니스 로직 시뮬레이션.
 * @param {DiagnosticInputPayload} data - 사용자 입력 데이터
 * @returns {DiagnosticReportPayload} 구조화된 진단 보고서
 */
const determineRisk = (data) => {
    // 1. 핵심 리스크 변수: '규제 준수 점수'가 가장 중요합니다.
    let score = Math.min(100, data.regulatoryComplianceScore);

    // 2. 게이트키퍼 로직 구현: Score가 낮을수록 위험도가 높고, 보험료 요구액이 높아져야 함.
    if (score < 60) { // Red Zone Threshold
        return {
            riskLevel: 'RED',
            totalRiskScore: Math.round(Math.max(30, score * 1.5)), // 낮은 점수 -> 높은 위험도 수치
            isCompliant: false,
            suggestedAction: ['긴급 법률 감사 수행 필요', '규제 프레임워크 재설계'],
            requiredInsurancePremiumMillions: Math.max(0.5, (60 - score) * 0.01), // 점수 차이만큼 보험료 부과
        };
    } else if (score < 85) { // Yellow Zone Threshold
        return {
            riskLevel: 'YELLOW',
            totalRiskScore: Math.round(Math.max(60, score * 1.2)),
            isCompliant: false,
            suggestedAction: ['내부 규정 검토 및 개선 필요', '준법 감시팀 운영 고려'],
            requiredInsurancePremiumMillions: Math.min(0.2, (85 - score) * 0.005), // 낮은 수준의 보험료 요구
        };
    } else { // Green Zone
        return {
            riskLevel: 'GREEN',
            totalRiskScore: Math.round(score * 1.0),
            isCompliant: true,
            suggestedAction: ['정기 모니터링 유지 및 현상 유지 권고'],
            requiredInsurancePremiumMillions: 0, // Green Zone은 결제 강제 X (초기 진입 장벽 낮추기)
        };
    }
};


/**
 * Next.js API Handler for Risk Diagnosis Simulation.
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
    // 1. 입력값 검증 및 파싱
    const data = req.body as DiagnosticInputPayload;

    if (!data || !data.regulatoryComplianceScore) {
        return res.status(400).json({ error: "Invalid input payload. 'regulatoryComplianceScore' is required." });
    }

    try {
        // 2. 리스크 진단 로직 실행 (Mocking the complex business logic)
        const report = determineRisk(data);

        // 3. 성공 응답 반환
        console.log(`[API Success] Diagnosis complete for ${data.companyName}. Risk Level: ${report.riskLevel}`);
        res.status(200).json({ success: true, data: report });

    } catch (error) {
        console.error("[API Error] Failed to process diagnosis:", error);
        res.status(500).json({ error: "Internal server error during risk simulation." });
    }
};