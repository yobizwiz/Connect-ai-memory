// src/pages/api/audit-gate.ts

import { NextApiRequest, NextApiResponse } from 'next';

/**
 * @typedef {object} RiskInput
 * @property {string} dataCategory - 사용자가 입력한 데이터 카테고리 (예: PII_COMPLIANCE)
 * @property {number} severityScore - 위험도 점수 (0~100)
 */

// NOTE: 실제 환경에서는 이 로직이 복잡한 DB 조회 및 법규 API 호출을 포함해야 합니다.
/**
 * 사용자 리스크 입력에 기반하여 최종 필수 감사 등급과 필요한 최소 상품 패키지를 결정합니다.
 * @param {RiskInput} input - 클라이언트에서 전송된 위험 요소 데이터.
 * @returns {{riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'; requiredPackageId: string; qlossFactor: number}}
 */
const determineAuditGate = (input) => {
    let riskLevel = 'LOW';
    let requiredPackageId = '';
    let qlossFactor = 1.0;

    if (!input || input.severityScore === undefined) {
        return { riskLevel: 'LOW', requiredPackageId: 'FREE_TRIAL', qlossFactor: 1.0 };
    }

    // 위험 점수가 높을수록 (위험한 데이터일수록) 강제적인 등급 상승 및 $QLoss$ 증폭 유도
    if (input.severityScore >= 75 && input.dataCategory === 'PII_COMPLIANCE') {
        riskLevel = 'HIGH'; // 최고 위험: 필수 감사 필요
        requiredPackageId = 'PREMIUM_AUDIT_PACKAGE';
        qlossFactor = 3.0; // $QLoss$ 3배 증폭 강제
    } else if (input.severityScore >= 40) {
        riskLevel = 'MEDIUM'; // 중위험: 권장 감사 필요
        requiredPackageId = 'STANDARD_AUDIT_PACKAGE';
        qlossFactor = 1.5; // $QLoss$ 1.5배 증폭 유도
    } else {
        riskLevel = 'LOW'; // 저위험: 무료 진단으로 종료
        requiredPackageId = 'FREE_TRIAL';
        qlossFactor = 1.0;
    }

    return { riskLevel, requiredPackageId, qlossFactor };
};


/**
 * API 게이트웨이 핸들러: 리스크 분석 및 필수 감사 패키지 강제화
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // 1. 요청 검증 (가드 로직 추가)
    if (!req.method || !['POST', 'GET'].includes(req.method)) {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const body = req.body;
    if (typeof body !== 'object' || Object.keys(body).length === 0) {
        console.error("API Error: Missing request body.");
        return res.status(400).json({ error: 'Validation Failed: Required input data is missing.' });
    }

    try {
        // 2. 리스크 분석 로직 실행 (핵심 비즈니스 로직)
        /** @type {RiskInput} */
        const riskInput = body as any; // 타입 캐스팅을 통해 유연하게 처리
        const auditResult = determineAuditGate(riskInput);

        // 3. 결제 게이트웨이 연결 시뮬레이션 (Stripe Payment Intent 호출 대체)
        if (auditResult.riskLevel === 'HIGH' || auditResult.riskLevel === 'MEDIUM') {
            // 실제로는 Stripe Client SDK를 사용하여 payment intent를 생성하고,
            // 그 결과를 클라이언트에 반환해야 합니다.
            console.log(`[Audit Gate] High/Medium Risk Detected. Forcing Audit Flow.`);

            return res.status(200).json({
                success: true,
                message: '시스템적 생존 위협 감지. 필수 리스크 감사 프로토콜을 실행해야 합니다.',
                riskLevel: auditResult.riskLevel,
                requiredPackageId: auditResult.requiredPackageId,
                // 실제 결제 시도에 필요한 데이터를 반환합니다. (예: Client Secret)
                paymentDetailsRequired: true, 
                transactionEndpoint: `https://api.stripe.com/v1/payment_intent?package=${auditResult.requiredPackageId}`
            });

        } else {
             // Low Risk: 무료 진단으로 마무리하고 CTA를 약화시킵니다.
            return res.status(200).json({
                success: true,
                message: '현재 데이터만으로는 심각한 시스템적 생존 위협은 감지되지 않았습니다.',
                riskLevel: auditResult.riskLevel,
                requiredPackageId: 'FREE_TRIAL',
                paymentDetailsRequired: false,
                transactionEndpoint: null
            });
        }

    } catch (error) {
        console.error('API Processing Error:', error);
        return res.status(500).json({ success: false, message: '서버 내부 오류로 분석에 실패했습니다.' });
    }
}