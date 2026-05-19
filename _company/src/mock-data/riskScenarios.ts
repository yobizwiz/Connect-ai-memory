/**
 * @fileoverview yobizwiz Mock Report Generator용 핵심 리스크 데이터 구조체 및 더미 시나리오 정의.
 * 🚨 주의: 이 값들은 테스트 목적으로만 사용되며, 실제 서비스에서는 외부 DB 연동을 거쳐야 함.
 */

export type ViolationCategory = 'ComplianceFailure' | 'DataIntegrityBreach' | 'SystemicVulnerability';

/**
 * 리스크 보고서의 구조적 요소를 정의합니다.
 * @param title - 리스크 제목 (고객에게 공포를 자극할 수 있는 언어)
 * @param qLossValue - 예상되는 잠재적 손실액 ($50만 단위 강조).
 * @param violationType - 위반 카테고리.
 * @param severity - 위험 등급 (Critical, High, Medium).
 */
export interface RiskScenario {
    id: string;
    title: string;
    qLossValue: number; // $500k 단위로 설정된 가상의 금액
    violationType: ViolationCategory;
    severity: 'Critical' | 'High' | 'Medium';
    description: string;
}

/**
 * 핵심 리스크 시나리오 3가지 (각 $500K QLoss 연관) 정의.
 */
export const MOCK_RISK_SCENARIOS: RiskScenario[] = [
    {
        id: 'rs-101',
        title: "데이터 구조적 무결성 결함: 비정형 데이터 처리 실패",
        qLossValue: 520000, // $52만 (Compliance Failure)
        violationType: 'DataIntegrityBreach',
        severity: 'Critical',
        description: "레거시 시스템의 비정형 데이터를 수집하는 과정에서 구조적 결함이 발견되었습니다. 이는 보고서 전체의 법적 무효화 위험을 초래할 수 있습니다.",
    },
    {
        id: 'rs-202',
        title: "시스템 권한 위반: 접근 통제 메커니즘 우회 시도",
        qLossValue: 780000, // $78만 (Systemic Vulnerability)
        violationType: 'SystemicVulnerability',
        severity: 'High',
        description: "핵심 데이터에 대한 접근 권한이 명시적인 정책을 위반하고 있습니다. 이는 외부 해킹이나 내부 오용 시 수억 단위의 손실로 직결됩니다.",
    },
    {
        id: 'rs-303',
        title: "규정 준수 미달: 최신 법규 변화 반영 실패",
        qLossValue: 510000, // $51만 (Compliance Failure)
        violationType: 'ComplianceFailure',
        severity: 'Medium',
        description: "최근 개정된 산업 규제(2026년 법규)에 맞춰 데이터 필드가 업데이트되지 않았습니다. 이는 단순 벌금 수준을 넘어 사업 영속성에 위협이 됩니다.",
    }
];

/**
 * Mock Report Generator가 처리할 가상의 보고서 컨텍스트를 반환합니다.
 * @returns {RiskScenario[]} 시뮬레이션에 사용될 리스크 배열
 */
export const getMockReportData = (): RiskScenario[] => {
    // 실제로 API 호출이 필요한 상황을 가정하고, Mock 데이터를 그대로 반환하는 로직입니다.
    console.log("⚙️ [INFO] Mock Report Generator: 3가지 핵심 시나리오 데이터 로드 완료.");
    return MOCK_RISK_SCENARIOS;
};