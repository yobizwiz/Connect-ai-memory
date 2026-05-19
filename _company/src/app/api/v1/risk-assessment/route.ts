// src/app/api/v1/risk-assessment/route.ts
import { NextResponse } from 'next/server';

/**
 * @desc QLoss 기반 리스크 평가 및 등급을 계산하는 API 엔드포인트.
 * @param body - 클라이언트로부터 받은 가상의 위협 시나리오 데이터.
 * @returns JSON 객체: 계산된 리스크 점수, 경고 레벨(Red/Yellow/Green), 그리고 상세 분석 보고서.
 */
export async function POST(req: Request) {
    const { userInputs } = await req.json();

    if (!userInputs || typeof userInputs !== 'object') {
        return NextResponse.json({ error: "Invalid input data provided." }, { status: 400 });
    }

    try {
        // 시뮬레이션된 비동기 처리 시간 (Time Pressure 유도)
        await new Promise(resolve => setTimeout(resolve, 1500));

        const assessment = await calculateRiskScoreAndLevel(userInputs);
        
        return NextResponse.json({
            success: true,
            data: assessment
        });

    } catch (error) {
        console.error("Error during risk assessment:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Internal server error during analysis." 
        }, { status: 500 });
    }
}


/**
 * [Core Logic] 사용자 입력 데이터를 받아 QLoss 점수와 위험 레벨을 구조적으로 계산합니다.
 * @param inputs - 사용자가 가상의 위협 시나리오를 입력한 객체.
 * @returns Promise<{ score: number, level: 'Red' | 'Yellow' | 'Green', details: object }>
 */
async function calculateRiskScoreAndLevel(inputs: any): Promise<any> {
    // 1. 가중치 기반 점수 계산 (Weighting Logic)
    let totalScore = 0;
    const calculatedVulnerabilities: any[] = [];

    // 연구사님의 보고서 카테고리를 근거로 가중치를 부여합니다.
    // (AI 환각 및 준전문가 책임 증대 > PII 유출 > 지식 사일로)
    const weights: { [key: string]: number } = {
        'AI Hallucination': 0.35, // 가장 위험도가 높음
        'PII Leakage': 0.25,
        'Knowledge Silo': 0.15,
        // ... 기타 취약점 추가 가능
    };

    const vulnerabilityKeys = Object.keys(weights);

    for (const key of vulnerabilityKeys) {
        const inputVal = inputs[key];
        if (inputVal && typeof inputVal === 'number') {
            // 입력된 값 * 가중치로 점수 계산
            const scoreContribution = Math.min(1, inputVal / 100); // 최대 기여도 1로 제한
            totalScore += scoreContribution * weights[key];

            calculatedVulnerabilities.push({
                type: key,
                input_value: inputVal,
                risk_contribution: Math.round(scoreContribution * 100) / 100 // 소수점 처리
            });
        }
    }

    // 2. 리스크 레벨 결정 (Grading Logic)
    let level: 'Red' | 'Yellow' | 'Green';
    if (totalScore >= 0.65) {
        level = 'Red'; // 시스템적 생존 위협 감지
    } else if (totalScore >= 0.3) {
        level = 'Yellow'; // 주의 필요, 즉각적인 점검 요구됨
    } else {
        level = 'Green'; // 현재 구조는 안정적임 (최소 리스크 가정)
    }

    // 3. 상세 결과 객체 구성
    const result = {
        final_score: parseFloat(totalScore.toFixed(2)),
        risk_level: level,
        detailed_analysis: calculatedVulnerabilities,
        summary_message: generateSummaryMessage(level) // 레벨별 메시지 생성
    };

    return result;
}


/**
 * 리스크 레벨에 따른 사용자 친화적인 요약 메시지를 반환합니다.
 */
function generateSummaryMessage(level: 'Red' | 'Yellow' | 'Green'): string {
    switch (level) {
        case 'Red':
            return "🚨 [CRITICAL WARNING] 시스템적 생존 위협 감지! 즉각적인 구조 개선이 필수적입니다. 현재의 취약점은 곧 치명적인 재정 손실로 이어질 수 있습니다.";
        case 'Yellow':
            return "⚠️ [ATTENTION REQUIRED] 주의가 필요한 수준의 결함이 확인되었습니다. 사전에 검토하여 위험을 최소화하는 것이 권장됩니다.";
        case 'Green':
            return "✅ [STATUS OK] 현재 분석된 범위 내에서는 구조적 무결성이 유지되고 있습니다. 다만, 지속적인 감시가 필요합니다.";
    }
}

export { calculateRiskScoreAndLevel };