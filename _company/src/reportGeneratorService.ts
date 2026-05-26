import { RiskScenario, getMockReportData } from './mock-data/riskScenarios';

/**
 * 핵심 Mock Report Generator 서비스 로직 (Backend Simulation).
 * 🚨 이 함수는 비즈니스 로직의 심장부입니다. 데이터 흐름과 위험 등급 판정이 여기서 이루어져야 합니다.
 */
export class ReportGeneratorService {
    private readonly mockData: RiskScenario[];

    constructor() {
        this.mockData = getMockReportData();
    }

    /**
     * 주어진 컨텍스트(가상의 데이터)를 기반으로 구조적 위험 보고서를 생성합니다.
     * @returns Promise<Object> 최종 리포트 객체 (위험 점수, 시나리오 배열 포함)
     */
    public async generateReportStructure(): Promise<{ reportId: string; totalRiskScore: number; scenarios: RiskScenario[] }> {
        console.log("⚙️ [Service] Mock Report Generator가 실행됩니다...");

        // 1. 리스크 점수 계산 (Critical > High > Medium)
        let totalScore = this.mockData.reduce((acc, scenario) => acc + this.calculateRiskPoint(scenario), 0);

        // 2. 시스템적 결함 여부 판정 (가장 중요한 로직)
        const isStructuralFailure = this.mockData.some(s => s.violationType === 'DataIntegrityBreach' && s.severity === 'Critical');

        // 최종 보고서 객체 반환
        return {
            reportId: `REPORT-${Date.now()}`,
            totalRiskScore: totalScore,
            scenarios: this.mockData
        };
    }

    /**
     * 개별 시나리오의 위험 점수를 계산합니다. (단순 합산 방식)
     * @param scenario - 리스크 시나리오 객체
     */
    private calculateRiskPoint(scenario: RiskScenario): number {
        switch (scenario.severity) {
            case 'Critical': return 400; // 최고 위험도에 높은 가중치 부여
            case 'High': return 300;
            case 'Medium': return 150;
            default: return 0;
        }
    }

    /**
     * 보고서의 구조적 무결성을 판단하고, 프론트엔드에 전달할 메타 정보를 제공합니다.
     */
    public getReportMetadata(reportData: { totalRiskScore: number }): { isCriticalFailure: boolean; warningLevel: 'Glitch' | 'Red' | 'None'; message: string } {
        if (reportData.totalRiskScore >= 800) { // 임계값 설정: Critical + High 이상이면 최고 경고 발동
            return {
                isCriticalFailure: true,
                warningLevel: 'Glitch',
                message: "🚨 CRITICAL FAILURE DETECTED: 시스템적 생존 위협이 포착되었습니다. 즉각적인 구조적 점검이 필수입니다."
            };
        } else if (reportData.totalRiskScore >= 400) {
             return {
                isCriticalFailure: false,
                warningLevel: 'Red',
                message: "⚠️ WARNING: 중대한 리스크가 발견되었습니다. 추가적인 법적 검토가 필요합니다."
            };
        } else {
            return {
                isCriticalFailure: false,
                warningLevel: 'None',
                message: "✅ Status OK: 현재 구조적 무결성은 양호한 것으로 판단됩니다."
            };
        }
    }
}