// TypeScript를 사용하며, 서버 환경에서만 실행되는 API 로직입니다.
import { NextResponse } from 'next/server';

/**
 * @description Safety Capital Ratio (SCR)을 계산하는 Mock API 엔드포인트.
 * TMRV(Total Mitigation Risk Value)와 Lmax(Maximum Potential Loss)를 비교하여 고객의 재무적 결핍을 측정합니다.
 * @param body - { mitigationValues: number[] } 5가지 최소 입력 변수 배열.
 * @returns JSON 객체: SCR 결과, 결핍 금액 및 Paywall 활성화 여부.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const mitigationValues: number[] | undefined = body.mitigationValues;

        // 1. 입력 값 검증 (Guard Clause)
        if (!mitigationValues || !Array.isArray(mitigationValues) || mitigationValues.length < 5) {
            return NextResponse.json({ error: "Minimum 5 valid mitigation values are required for calculation." }, { status: 400 });
        }

        // 2. L_max 데이터 로드 (Mocked Data Loading - 실제 환경에서는 DB/파일 I/O 필요)
        // Researcher가 제공한 JSON 데이터를 이용한다고 가정하고, 가장 높은 위험 시나리오를 $L_{max}$로 설정합니다.
        const lMaxDeficiency = {
            lmax_range: "$10M - $20M+", // S001의 범위 사용
            estimated_loss_usd: 15_000_000, // 계산 편의를 위해 평균값 사용 ($15 Million)
        };

        // 3. TMRV (Total Mitigation Risk Value) 계산 - 가중치 적용 및 합산
        // 각 답변 값에 고유한 리스크 가중치를 부여하여 총 방어력을 측정합니다.
        const weights = [0.2, 0.15, 0.3, 0.25, 0.1]; // 예시 가중치 배열 (총합이 1임을 보장)
        if (weights.length !== mitigationValues.length) {
             return NextResponse.json({ error: "Weight array mismatch with input values." }, { status: 500 });
        }

        const totalMitigationRiskValue = mitigationValues.reduce(
            (sum, value, index) => sum + (value * weights[index]), 
            0
        ); // TMRV 계산 완료

        // 4. SCR 및 결핍액 계산
        // SCR (%) = (TMRV / L_max) * 100
        const scrPercentage = Math.min(100, (totalMitigationRiskValue / lMaxDeficiency.estimated_loss_usd) * 100);

        // 결핍액 계산: $L_{max} - \text{TMRV}$ (비율 기반으로 금액 산정 필요하나, 단순화를 위해 TMRV를 비율로 환산)
        const deficiencyAmount = lMaxDeficiency.estimated_loss_usd * (1 - scrPercentage / 100);

        // 5. 결과 반환
        return NextResponse.json({
            success: true,
            scr_percentage: parseFloat(scrPercentage.toFixed(2)), // 안전 자본금 비율 (%)
            total_mitigation_risk_value: parseFloat(totalMitigationRiskValue.toFixed(2)), // TMRV ($)
            lmax_deficiency: lMaxDeficiency.estimated_loss_usd, // $L_{max}$ (기준 금액)
            calculated_deficiency_amount: parseFloat(Math.max(0, deficiencyAmount).toFixed(2)), // 결핍액 ($)
            is_paywall_required: scrPercentage < 50.0, // SCR이 50% 미만이면 Paywall 필요 (강제 Funneling 유도)
        });

    } catch (error) {
        console.error("SCR Calculation Error:", error);
        return NextResponse.json({ error: "Internal Server Error during calculation.", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}