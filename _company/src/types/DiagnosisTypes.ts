/**
 * @description DiagnosisPage 및 리스크 계산 로직에 사용되는 공통 타입 정의
 */

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface AuditResult {
    reportTitle: string; // 예: "시스템 무결성 감사 보고서"
    calculatedTRE: number; // Total Risk Exposure Score (0 ~ 100)
    findings: Array<{
        category: string; // I. AI 기반 출처 무효화 위험 점검 등
        isAtRisk: boolean; // 해당 항목이 리스크가 있는지 여부
        details: string; // 상세 설명
    }>;
}

/**
 * @description 리스크 레벨별 시각적 속성 정의 (WHY? 공포와 긴급성 유발을 위함)
 */
export const riskLevelStyles = {
    Low: {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        message: "현재 시스템은 구조적 취약성이 낮은 것으로 진단되었습니다.",
        actionRequired: false, // 액션 불필요
    },
    Medium: {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        message: "경고. 몇 가지 구조적 취약성이 감지되었습니다. 심층 진단이 필요합니다.",
        actionRequired: true, // 심층 진단 유도
    },
    High: {
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        message: "⚠️ 긴급 경고! 핵심 프로세스에서 치명적인 공백(Structural Gap)이 발견되었습니다. 즉각적인 조치가 필수입니다.",
        actionRequired: true, // 결제 유도 강제
    },
    Critical: {
        color: 'text-red-700',
        bgColor: 'bg-red-100/90 border-4 border-red-500 animate-pulse',
        message: "🚨 시스템 공황 상태! 법적/재정적 손실($L_{max}$)이 예상됩니다. 지금 당장 방어벽을 구축해야 합니다.",
        actionRequired: true, // Paywall 진입 강제
    }
};