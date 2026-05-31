// app/api/risk/route.ts - TRE Calculation API Endpoint (Next.js Route Handler)

import { NextResponse } from 'next/server';

// ⚠️ Defensive Coding: 모든 입력 변수는 null, undefined, NaN에 대한 가드 처리가 필수입니다.
interface RiskInput {
    vulnerabilityScore: number;
    selectedRegulations: Array<{
        acronym: string;
        fBase: number; // F_base: 기본 벌금 (Millions USD)
        tau: number;   // Tau: 위험 증폭 계수
        settlementLoss: number; // L_settlement: 예상 합의 손실액 (Millions USD)
    }>;
}

/**
 * @description 주어진 규제 데이터와 취약성 점수를 기반으로 최종 위험 노출도(TRE)를 계산합니다.
 * TRE = Σ [ (F_base + L_settlement) * (1 + Tau * Vulnerability_Score) ]
 * @param input - 클라이언트로부터 받은 리스크 분석 입력 객체
 * @returns 계산된 종합 위험 점수와 상세 보고서
 */
const calculateTRE = (input: RiskInput): { tre: number; lMax: number; breakdown: any } => {
    if (!input.selectedRegulations || input.selectedRegulations.length === 0) {
        throw new Error("규제 데이터가 제공되지 않았습니다. 분석을 진행할 수 없습니다.");
    }

    let totalTRE = 0;
    let maxPotentialLossSum = 0; // L_max를 합산하기 위한 변수

    // 각 규제별로 개별 위험 노출도를 계산하고 누적합니다 (Σ)
    const results: { tre: number; lMax: number }[] = input.selectedRegulations.map(reg => {
        // 1. 기본 손실액 합산: F_base + L_settlement
        const baseLossSum = reg.fBase + reg.settlementLoss;

        // 2. 규제 증폭 요소 계산: (1 + Tau * Vulnerability_Score)
        // Defensive Check: 혹시나 tau가 음수이거나 NaN인 경우를 대비하여 Math.max(0, ...) 사용
        const multiplier = 1 + reg.tau * Math.max(0, input.vulnerabilityScore);

        // 3. 최종 TRE 계산
        const tre = baseLossSum * multiplier; // (F_base + L_settlement) * Multiplier

        // 해당 규제의 잠재적 최대 손실액은 기본 벌금과 합의 손실을 더한 값으로 간주합니다.
        const lMax = reg.fBase + reg.settlementLoss; 

        return { tre: parseFloat(tre.toFixed(2)), lMax: parseFloat(lMax.toFixed(2)) };
    });

    // 최종 종합 결과 산출 (Summation)
    totalTRE = results.reduce((acc, curr) => acc + curr.tre, 0);
    maxPotentialLossSum = results.reduce((acc, curr) => acc + curr.lMax, 0);


    return {
        tre: parseFloat(totalTRE.toFixed(2)),
        lMax: parseFloat(maxPotentialLossSum.toFixed(2)),
        breakdown: results
    };
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const input: RiskInput = {
            vulnerabilityScore: Number(body.vulnerabilityScore),
            selectedRegulations: body.selectedRegulations as any[]
        };

        // 1. 입력 유효성 검사 (Guard Check)
        if (isNaN(input.vulnerabilityScore) || input.vulnerabilityScore < 0 || input.vulnerabilityScore > 5) {
             return NextResponse.json({ success: false, message: "유효하지 않은 취약성 점수입니다. 0에서 5 사이의 숫자를 입력해주세요." }, { status: 400 });
        }

        // 2. 핵심 계산 로직 실행
        const { tre, lMax, breakdown } = calculateTRE(input);

        // 3. 결과 가공 및 응답 (Response)
        let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        if (tre < 100) { // 임의의 기준 설정
            riskLevel = 'LOW';
        } else if (tre < 500) {
            riskLevel = 'MEDIUM';
        } else if (tre < 1500) {
            riskLevel = 'HIGH';
        } else {
            riskLevel = 'CRITICAL'; // 가장 높은 공포 자극 레벨
        }


        return NextResponse.json({
            success: true,
            message: "위험 노출도 계산이 완료되었습니다. 즉각적인 시스템 감사 조치가 필요합니다.",
            data: {
                lMax: lMax,
                tre: tre,
                riskLevel: riskLevel,
                detailedBreakdown: breakdown
            }
        });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ 
            success: false, 
            message: `시스템 오류 발생: ${error instanceof Error ? error.message : "알 수 없는 에러"}. 백엔드 로직을 점검해주세요.` 
        }, { status: 500 });
    }
}