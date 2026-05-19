// 보고서 포맷팅 및 클라이언트 전송용 응답 생성 (Presentation)
export type FinalReportPayload = { 
    success: boolean; 
    statusMessage: string; 
    reportDetails: any; // 실제 컨텍스트에 맞는 데이터 포함
};

/**
 * 계산된 리스크 점수를 받아 최종 사용자에게 보여줄 포맷으로 변환합니다.
 * @param riskScore - Risk Scoring Engine의 결과물.
 * @returns FinalReportPayload
 */
export function generateFinalReport(riskScore: RiskScoreObject): FinalReportPayload {
    let statusMessage = `분석 완료. 현재 리스크 레벨은 ${riskScore.redZoneLevel}입니다.`;
    if (riskScore.redZoneLevel === 'CRITICAL') {
        statusMessage = "🚨 경고: 시스템 구조적 위협 감지! 즉각적인 컨설팅이 필요합니다.";
    }
    return {
        success: true,
        statusMessage: statusMessage,
        reportDetails: riskScore,
    };
}