/**
 * @fileoverview API v1: 실시간 리스크 평가 서비스 로직 정의.
 * Yellow -> Red 상태 전환 시 Total Risk Exposure (TRE)를 계산하고 반환합니다.
 * 이 서비스는 모든 클라이언트 요청의 구조적 무결성을 담당하는 핵심 게이트키퍼입니다.
 */

import { z, ZodError } from 'zod';
// 임시로 정의된 타입들: 실제 프로젝트에서는 별도의 types/index.ts에 분리되어야 합니다.
export type ComplianceData = Record<string, number>; 
export type RiskLevel = 'GREEN' | 'YELLOW' | 'RED';

/**
 * [Schema Definition] 요청 바디의 유효성 검증 스키마 (Input Validation)
 * Zod를 사용하여 모든 입력 데이터가 예상한 구조와 타입을 갖추었는지 확인합니다.
 */
export const RiskAssessmentSchema = z.object({
    // 클라이언트가 제공하는 원본 컴플라이언스 데이터 셋.
    complianceData: z.record(z.string().regex(/[A-Z]+/)), // 예: { "LFC": 0.8, "DORA": 0.2 }
    // 현재 분석이 시작되는 시점의 '기준' 리스크 레벨 (예: Yellow).
    previousLevel: z.enum(['GREEN', 'YELLOW']),
    // 평가를 실행할 특정 트랜잭션 또는 이벤트 ID. 감사 로그 추적에 필수적입니다.
    transactionId: z.string().min(1), 
});

export type RiskAssessmentInput = z.infer<typeof RiskAssessmentSchema>;

/**
 * [Schema Definition] API 응답의 구조 (Output Validation)
 * 모든 성공적인 리스크 평가 결과는 이 스키마를 따라야 합니다. 데이터 일관성 유지에 필수적입니다.
 */
export const AssessmentResultSchema = z.object({
    // 최종 판단된 리스크 레벨. 반드시 GREEN, YELLOW, RED 중 하나여야 함.
    finalLevel: z.enum(['GREEN', 'YELLOW', 'RED']), 
    // 총 위험 노출액 (Total Risk Exposure) 값. Yellow->Red 전환 시에만 유의미하게 계산됩니다.
    totalRiskExposureUSD: z.number().min(0).max(1_000_000_000), // 최대 10억 달러로 제한 설정
    // 이 리스크 레벨을 결정한 핵심 근거 및 로직 흐름 (Audit Log용).
    assessmentDetails: z.object({
        triggerConditionMet: z.boolean(), // 예: 'complianceData'의 특정 KPI가 임계치를 넘었는지?
        criticalKPIsExceeded: z.array(z.string()), // 어떤 KPI(LFC, DORA 등)를 초과했는지 목록화
        thresholdUsed: z.record(z.string(), z.number().describe("활용된 위험 임계치")), // 예: { "DORA_Threshold": 0.7 }
    }).describe("리스크 판단의 모든 과정을 기록하는 감사 증명서."),
    // 고객에게 보여줄 요약 메시지 (마케팅/경고에 사용).
    clientMessage: z.string().min(10),
});

export type AssessmentResult = z.infer<typeof AssessmentResultSchema>;


/**
 * [Core Logic] 리스크 평가 엔진의 핵심 함수. 
 * Yellow -> Red 전환 시 TRE를 계산하는 로직이 포함됩니다.
 * @param input - 유효성 검사를 거친 입력 객체.
 * @returns 최종 리스크 평가 결과.
 */
export async function calculateRiskAssessment(input: RiskAssessmentInput): Promise<AssessmentResult> {
    console.log(`[Service] Starting risk assessment for TX ID: ${input.transactionId}`);

    // 1. 상태 전이 로직 및 임계값 검사 (State Machine / Rule Engine)
    let isRedZoneTriggered = false;
    const criticalKPIsExceeded: string[] = [];
    const thresholdUsed: Record<string, number> = {};
    
    // 가상의 복잡한 KPI 체크 로직. 실제로는 백엔드 DB 조회 및 계산이 필요함.
    if (input.complianceData['DORA'] > 0.7) { // DORA 임계치 초과 시도
        isRedZoneTriggered = true;
        criticalKPIsExceeded.push('DORA');
        thresholdUsed['DORA_Threshold'] = 0.7;
    } else if (input.complianceData['LFC'] > 0.3) { // Yellow 임계치 초과 시도
        isRedZoneTriggered = false;
    }

    // 2. TRE 계산 로직 (Total Risk Exposure Calculation)
    let treValue: number = 0;
    if (isRedZoneTriggered) {
        // [핵심] Yellow -> Red 전환이 감지되었을 때, 가장 보수적인 '잠재 최대 손실액'을 계산합니다.
        // 이 값은 규제 리스크(DORA)와 운영 실패 비용(LFC)의 결합으로 정의됩니다.
        const regulationRiskFactor = input.complianceData['DORA'] * 50_000_000; // DORA 위험도에 비례하여 높은 계수 적용
        const operationalFailureCost = (1 - input.complianceData['LFC']) * 20_000_000; // LFC가 낮을수록 손실 증가
        
        treValue = Math.ceil(regulationRiskFactor + operationalFailureCost);
    } else {
        // Red Zone이 아니면, TRE는 현재의 리스크 점수만 반영합니다. (낮은 값)
        treValue = 0;
    }

    // 3. 최종 상태 결정 및 결과 반환
    const finalLevel: RiskLevel = isRedZoneTriggered ? 'RED' : (input.previousLevel === 'YELLOW' && !isRedZoneTriggered ? 'YELLOW' : 'GREEN');

    const result: AssessmentResult = {
        finalLevel: finalLevel,
        totalRiskExposureUSD: treValue,
        assessmentDetails: {
            triggerConditionMet: isRedZoneTriggered,
            criticalKPIsExceeded: criticalKPIsExceeded,
            thresholdUsed: thresholdUsed,
        },
        clientMessage: `🚨 경고! 시스템 분석 결과, 귀사의 운영 리스크는 현재 ${finalLevel} 상태이며, 잠재적 최대 손실액(TRE)은 $${treValue.toLocaleString()}에 달할 수 있습니다. 즉각적인 개선이 필요합니다.`,
    };

    console.log(`[Service] Assessment complete. Final Level: ${finalLevel}, TRE: $${treValue.toLocaleString()}`);
    return result;
}

/**
 * [Exported API Function Signature] 실제 Express/FastAPI 등의 라우터에서 호출될 형식의 함수입니다.
 * 이 함수가 요청을 받아 유효성을 검증하고, 서비스 로직을 실행합니다.
 */
export async function handleRiskAssessmentRequest(reqBody: any): Promise<AssessmentResult> {
    try {
        // 1. 입력 데이터 검증 (Validation) - 가장 먼저 수행되어야 할 단계입니다.
        const validatedInput = RiskAssessmentSchema.parse(reqBody);

        // 2. 핵심 비즈니스 로직 실행
        const result = await calculateRiskAssessment(validatedInput);
        
        return result; // 성공적으로 구조화된 결과를 반환합니다.

    } catch (error) {
        if (error instanceof z.ZodError) {
            // Zod Validation 실패 시, 상세 에러를 던져서 클라이언트에게 알려줍니다.
            throw new Error(`Validation Failed: ${JSON.stringify(error.issues)}`); 
        }
        // 그 외의 시스템적 오류 처리
        console.error("Critical System Error during risk assessment:", error);
        throw new Error("Internal Server Error: 리스크 평가 엔진에 치명적인 문제가 발생했습니다.");
    }
}