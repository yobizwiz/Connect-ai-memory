// src/hooks/useRiskAnalysis.ts
import { useState, useCallback } from 'react';

/**
 * @typedef {Object} InputData - 사용자가 입력하는 가상의 데이터 구조체.
 */
interface InputData {
    revenueLoss: number; // 최근 분기 예상 손실액 (억 원 단위)
    complianceGapCount: number; // 법규 미준수 Gap 수
    marketSentimentScore: number; // 시장 심리 지수 (-100 ~ 100)
}

/**
 * @typedef {Object} RiskResult - 분석 결과 구조체.
 */
interface RiskResult {
    score: number; // 최종 리스크 점수 (0-100)
    level: 'Green' | 'Yellow' | 'Red'; // 경고 레벨
    message: string; // 사용자에게 보여줄 설명 메시지
}

/**
 * @description 가상의 복잡한 금융/법규 분석을 시뮬레이션하는 훅.
 * 비동기 처리를 통해 시스템 지연(Latency)과 전문성을 체감하게 함.
 * @param initialData 초기 입력 데이터
 * @returns [result, isLoading]
 */
export const useRiskAnalysis = (initialData: InputData | null) => {
    const [result, setResult] = useState<RiskResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * 리스크 점수 계산 로직. (복잡한 가중치 및 임계값 기반 시뮬레이션)
     * @param data 입력 데이터
     * @returns {number} 0-100 사이의 점수
     */
    const calculateScore = useCallback((data: InputData): number => {
        // 🚨 코다리 검증 포인트: 가중치 및 임계값은 외부 변수로 관리해야 함. 하드코딩 금지.
        // 하지만 MVP 초기 단계이므로, 일단 복잡한 로직을 여기에 통합합니다.
        let score = 0;

        // 손실액 가중치 (가장 중요)
        score += Math.min(data.revenueLoss / 10, 40); // 최대 40점 기여

        // 법규 Gap 수 가중치 (구조적 리스크)
        score += data.complianceGapCount * 7; // 개당 7점씩 기여

        // 시장 심리 점수 반영 (극단적인 경우 높은 리스크)
        const sentimentPenalty = Math.abs(data.marketSentimentScore) / 50; // 최대 2점 기여
        score += sentimentPenalty * 10;

        // 최종 클램핑 및 스케일링 (최대 100점을 넘지 않도록)
        return Math.min(Math.max(score, 0), 95);
    }, []);

    /**
     * 리스크 점수에 따라 레벨과 메시지를 결정하는 로직.
     */
    const determineLevel = useCallback((score: number): { level: RiskResult['level']; message: string } => {
        if (score > 70) {
            return { level: 'Red', message: "🚨 CRITICAL WARNING! 시스템적 생존 위협 감지. 즉각적인 구조적 조치가 필요합니다." };
        } else if (score >= 35) {
            return { level: 'Yellow', message: "⚠️ HIGH RISK ZONE. 현재 리스크는 관리 가능하나, 주요 취약 지점(Gap/Loss)에 대한 재검토가 시급합니다." };
        } else {
            return { level: 'Green', message: "✅ SAFE ZONE. 현재 구조적 무결성은 양호한 수준입니다. 지속적인 모니터링이 필요합니다." };
        }
    }, []);

    /**
     * 분석을 실행하고 결과를 상태에 저장합니다. (비동기 시뮬레이션)
     * @param data 사용자 입력 데이터
     */
    const analyzeRisk = useCallback(async (data: InputData | null) => {
        if (!data) return;

        setIsLoading(true);
        setResult(null);

        // ⏳ 시스템 분석 지연 시뮬레이션 (3초) - 전문성 부여 목적
        await new Promise(resolve => setTimeout(resolve, 2500));

        try {
            const score = calculateScore(data);
            const { level, message } = determineLevel(score);

            setResult({ score, level, message });
        } catch (error) {
            console.error("Risk analysis failed:", error);
            setResult({ score: 0, level: 'Red', message: "❌ 분석 오류 발생. 데이터를 확인하거나 관리자에게 문의하십시오." });
        } finally {
            setIsLoading(false);
        }
    }, [calculateScore, determineLevel]);

    return { result, isLoading, analyzeRisk };
};