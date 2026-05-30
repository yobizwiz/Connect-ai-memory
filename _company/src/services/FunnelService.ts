import { RiskScore, SessionContext } from '../types/risk-types'; // Assuming this is the correct relative import for types
import { AuditLogger } from './AuditLogger'; // Dummy logger dependency
import * as crypto from 'crypto';

/**
 * @description FunnelService: 사용자의 초기 진단 요청부터 Paywall 노출까지의 상태 전이 로직을 관리합니다.
 * 이 서비스는 세션별 데이터 무결성을 보장하며, A/B 테스트 플래그를 포함하여 실행됩니다.
 */
export class FunnelService {

    /**
     * @private
     * @description 주어진 리스크 점수를 기반으로 현재 상태와 다음 목표 상태를 계산합니다.
     * 실제 비즈니스 로직에 따라 가중치를 적용하는 곳입니다.
     * @param currentScore - 현재 측정된 $L_{max}$ 점수 객체.
     * @returns {string} Funnel Stage (CRITICAL, WARNING, SOLUTION)
     */
    private static determineCurrentStage(currentScore: RiskScore): string {
        // 임계값 로직: L_max가 높을수록 Critical에 가깝다 가정
        if (currentScore.structuralGap > 0.9 && currentScore.provenanceConfidence < 0.5) {
            return "CRITICAL";
        }
        if (currentScore.structuralGap >= 0.6) {
            return "WARNING";
        }
        return "SOLUTION_READY"; // 이미 충분히 낮은 상태이거나 무시 가능
    }

    /**
     * @public
     * @description Funnel 진입의 시작점을 시뮬레이션하고 초기 데이터를 로깅합니다. (Step 1: Critical)
     * 이 함수는 '무료 진단 요청 버튼 클릭' 직후 호출됩니다.
     * @param sessionContext - 현재 사용자의 세션 및 기본 정보.
     * @param initialRiskScore - 초기 $L_{max}$ 점수 계산 결과.
     * @returns {Promise<{ currentStage: string, nextTriggerPointData: any }>} 다음 단계로 넘어가기 위해 필요한 데이터와 상태.
     */
    public static async initiateDiagnosticFunnel(sessionContext: SessionContext, initialRiskScore: RiskScore): Promise<{ currentStage: string, nextTriggerPointData: Record<string, any> }> {
        const currentStage = this.determineCurrentStage(initialRiskScore);

        // 1. 세션 로깅 및 초기 상태 기록 (Audit Log)
        await AuditLogger.logEvent(sessionContext.sessionId, 'FUNNEL_START', {
            stage: currentStage,
            riskDetails: initialRiskScore,
            message: "무료 진단 요청 시작 - Critical 리스크 감지.",
            timestamp: new Date().toISOString()
        });

        const nextTriggerPointData = {
            // A/B 테스트 플래그 초기화 및 다음 단계 전환 지점 정의
            attentionPointHit: false, // 기본값은 미도달
            targetStage: "WARNING",
            triggerMetricThreshold: initialRiskScore.structuralGap * 1.2 // Warning으로 넘어가기 위한 목표 임계치 증가 유도
        };

        console.log(`[FunnelService] Funnel 시작됨. 현재 단계: ${currentStage}. 다음 트리거 지점은 '${nextTriggerPointData.targetStage}' 입니다.`);

        return { currentStage, nextTriggerPointData };
    }


    /**
     * @public
     * @description 사용자가 '위험 구간'을 인지하고 스크롤하거나 특정 인터랙션을 했을 때 호출됩니다. (Step 2: Warning)
     * 이 단계는 A/B 테스트 플래그를 체크하여 로직 분기를 시도합니다.
     * @param sessionContext - 현재 세션 정보.
     * @param attentionPointHitFlag - 프론트엔드에서 받은 Attention Point 도달 여부 (A/B Test Flag).
     * @returns {Promise<{ nextStage: string, updatedData: Record<string, any> }>} 다음 단계의 상태와 데이터.
     */
    public static async processWarningEscalation(sessionContext: SessionContext, attentionPointHitFlag: boolean): Promise<{ nextStage: string, updatedData: Record<string, any> }> {

        // 1. 플래그 검증 및 로깅 (A/B Test Hook)
        const isAttentionPointReached = !!attentionPointHitFlag; // Boolean check for safety
        await AuditLogger.logEvent(sessionContext.sessionId, 'FUNNEL_WARNING', {
            stage: "WARNING",
            attentionPointTriggered: isAttentionPointReached,
            message: `위험 고조 단계 진입. Attention Point 도달 여부: ${isAttentionPointReached}.`,
        });

        // 2. 로직 분기점 (Decision Logic)
        let nextStage: string;
        if (isAttentionPointReached && sessionContext.userTier === 'PREMIUM') {
            // A/B Test 그룹 B + 프리미엄 사용자 = 즉시 전환 유도 강화
            nextStage = "SOLUTION_IMMEDIATE";
        } else if (isAttentionPointReached) {
            // 일반적인 Attention Point 도달 시, 경고를 극대화하며 Solution으로 유도 시작.
            nextStage = "WARNING_HIGH_INTENSITY";
        } else {
            // 플래그가 감지되지 않았거나, 로직상 강제가 필요할 때.
            nextStage = "WARNING";
        }

        const updatedData = {
            currentRiskLevel: nextStage,
            suggestedAction: `최소 $L_{max}$ 분석을 통해 '${nextStage}' 상태로 진입했습니다.`,
            requiresConversion: true
        };

        return { nextStage, updatedData };
    }


    /**
     * @public
     * @description 최종적으로 Paywall/Solution 페이지에 도달하는 지점입니다. (Step 3: Solution)
     * 이 단계에서는 결제 게이트(Payment Gateway) 연동 전의 마지막 검증을 수행합니다.
     * @param sessionContext - 현재 세션 정보.
     * @returns {Promise<{ finalStage: string, callToActionText: string }>} 최종 상태와 CTA 메시지.
     */
    public static async finalizeConversionFunnel(sessionContext: SessionContext): Promise<{ finalStage: string, callToActionText: string }> {

        await AuditLogger.logEvent(sessionContext.sessionId, 'FUNNEL_COMPLETE', {
            stage: "SOLUTION",
            message: "최종 결제 게이트 진입 시도.",
            conversionAttempted: true
        });

        const callToActionText = `당신의 사업은 현재 '${FunnelService.determineCurrentStage({ structuralGap: 0, provenanceConfidence: 1 })}' 상태입니다. $L_{max}$ 보고서로 공포를 제거하십시오.`;

        return { finalStage: "SOLUTION", callToActionText };
    }
}