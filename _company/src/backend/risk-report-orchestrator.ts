import { fetchAndNormalizeData, RawDataPayload } from "./services/data-ingestion-service";
import { calculateRiskScore, RiskScoreObject } from "./services/risk-scoring-engine";
import { generateFinalReport, FinalReportPayload } from "./services/report-generation-service";

/**
 * [Main Entry Point] 전체 리스크 보고서 생성 흐름을 제어합니다. (비동기 순차 처리)
 * ⚠️ 이 함수가 시스템의 구조적 무결성을 책임집니다.
 */
export async function generateFullRiskReport(userId: string): Promise<FinalReportPayload> {
    try {
        // 1. Data Ingestion (I/O Bound, 병렬 호출 가능 지점)
        const rawData: RawDataPayload = await fetchAndNormalizeData(userId);

        // 2. Risk Scoring (CPU Bound, 순수 계산 로직)
        const riskScore: RiskScoreObject = calculateRiskScore(rawData);

        // 3. Report Generation (Presentation Layer)
        const finalReport: FinalReportPayload = generateFinalReport(riskScore);

        return finalReport;
    } catch (error) {
        console.error("FATAL ERROR in report generation pipeline:", error);
        return {
            success: false,
            statusMessage: "시스템 처리 오류가 발생했습니다. 관리자에게 문의해주세요.",
            reportDetails: null
        };
    }
}