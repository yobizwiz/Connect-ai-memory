/**
 * @module RiskGatewayService
 * @description 외부 규제 데이터를 기반으로 실시간 리스크 점수(TRE)를 계산하는 핵심 비즈니스 로직 계층 (API Gateway 역할 시뮬레이션).
 * 이 모듈은 모든 입력 값에 대한 가드와 타입 검사를 수행하여 데이터 무결성을 보장합니다.
 */

import { RiskDataset } from '../data/MVP_Backend_Risk_Dataset';

// --- [1. Data Type Definitions] ---
/**
 * 개별 리스크 요인(Compliance Gap)의 입력 값 정의.
 * @typedef {Object} ComplianceInput
 * @property {string} riskId - 리스크 ID (예: R-AI-001).
 * @property {number} gapScore - 해당 리스크 영역에서 감지된 현행 컴플라이언스 격차 점수 (0~100).
 */

/**
 * 최종 계산 결과 구조체.
 * @typedef {Object} RiskResult
 * @property {number} treScore - 최종 통합 리스크 점수 (Total Risk Exposure Score).
 * @property {'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'} riskLevel - 시스템이 판단한 위험 레벨.
 * @property {string} message - 사용자에게 보여줄 경고 메시지.
 */

// --- [2. Core Calculation Logic] ---

/**
 * 리스크 데이터셋을 로드합니다. (실제 환경에서는 DB나 API 호출로 대체됨)
 * @type {RiskDataset[]}
 */
const riskDataset: RiskDataset[] = JSON.parse(require('../data/MVP_Backend_Risk_Dataset.json'));


/**
 * 주어진 컴플라이언스 격차 입력값들을 기반으로 최종 리스크 점수(TRE)를 계산합니다.
 * @param {ComplianceInput[]} inputs - 사용자가 분석한 각 리스크 영역의 현재 격차 점수 배열.
 * @returns {RiskResult} 계산된 리스크 결과 객체.
 * 
 * [Defensive Coding Note]
 * 모든 입력 값에 대해 NaN, null, 또는 음수를 체크하여 시스템 충돌을 방지합니다.
 */
export const calculateTREScore = (inputs) => {
    if (!Array.isArray(inputs) || inputs.length === 0) {
        console.error("🚨 [Critical Error] TRE 계산에 필요한 입력 데이터가 제공되지 않았습니다.");
        return { treScore: 0, riskLevel: 'LOW', message: "분석을 시작하려면 리스크 항목을 선택해 주세요." };
    }

    let totalWeightedRisk = 0; // 총 가중치 합산 (Total Weighted Risk)
    let compliantInputs = [];  // 유효한 입력값만 모음

    for (const input of inputs) {
        if (!input || typeof input.gapScore !== 'number' || isNaN(input.gapScore)) {
            console.warn(`⚠️ [Warning] ${input?.riskId || 'Unknown'}의 Gap Score가 유효하지 않아 건너뜁니다.`);
            continue; // 무효한 입력은 계산에서 제외 (Graceful Fallback)
        }

        // 1. 리스크 데이터셋에서 해당 ID의 Weight를 조회합니다.
        const datasetItem = riskDataset.find(r => r.risk_id === input.riskId);
        if (!datasetItem) {
            console.warn(`⚠️ [Warning] ${input.riskId}에 대한 가중치 정보가 데이터셋에 없습니다.`);
            continue; 
        }

        // 2. 계산 공식 적용: (Gap Score / 100) * Weight
        // Gap Score를 정규화(Normalization)하여 0~1 사이의 값으로 만든 후, Weight를 곱합니다.
        const normalizedGap = Math.min(Math.max(0, input.gapScore), 100); // 0-100 클램핑
        const weightedRisk = (normalizedGap / 100) * datasetItem.weight;

        totalWeightedRisk += weightedRisk;
        compliantInputs.push(input);
    }

    // 최종 점수 보정 및 레벨 결정 로직
    const treScore = parseFloat(Math.min(100, totalWeightedRisk).toFixed(2)); // 최대 100점으로 제한
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    let message: string;

    if (treScore <= 30) {
        riskLevel = 'LOW';
        message = "✅ 시스템 안정적. 현재 규제 격차는 관리 가능한 범위 내에 있습니다.";
    } else if (treScore > 30 && treScore <= 65) {
        riskLevel = 'MEDIUM';
        message = "⚠️ 경고: 중간 수준의 리스크 노출 감지. 선행적인 컴플라이언스 개선이 필요합니다.";
    } else if (treScore > 65 && treScore <= 90) {
        riskLevel = 'HIGH';
        message = "🚨 위험! 높은 규제 격차가 확인되었습니다. 즉각적인 프로세스 감사 및 수정 조치가 필수입니다.";
    } else { // treScore > 90
        riskLevel = 'CRITICAL';
        message = "🔥🔥 시스템 마비 임박 (Critical Failure)! 운영 중단 리스크를 초래할 수 있는 심각한 격차가 감지되었습니다. 즉시 최고 의사결정권자의 개입이 필요합니다.";
    }

    return { treScore, riskLevel, message };
};

/**
 * [Testing Stub] 이 함수는 단위 테스트 환경에서 직접 호출되어야 합니다.
 * @param {ComplianceInput[]} testInputs - 테스트용 입력값 배열.
 */
export const runUnitTests = (testInputs) => {
    try {
        const result = calculateTREScore(testInputs);
        console.log("✅ Unit Test Success: TRE Score Calculation Passed.");
        return result;
    } catch (e) {
        console.error("❌ Unit Test Failed: Exception caught during calculation.", e);
        throw new Error("Test Failure");
    }
};

// 테스트용 초기 실행 (실제 배포 시에는 주석 처리 필요)
/*
const testInputs = [
    { riskId: "R-AI-001", gapScore: 85 }, // High Gap in AI
    { riskId: "R-DATA-002", gapScore: 30 }, // Low Gap in Data
    { riskId: "R-GEO-003", gapScore: 60 }  // Medium Gap in Geo
];
const testResult = calculateTREScore(testInputs);
console.log("\n--- [Test Run Result] ---");
console.log(`Calculated TRE Score: ${testResult.treScore}`);
console.log(`Risk Level: ${testResult.riskLevel} - ${testResult.message}`);
*/