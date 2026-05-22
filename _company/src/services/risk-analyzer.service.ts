import { DiagnosisRequest, RiskDiagnosisResult } from '../types/threat-score.d';

/**
 * [코다리 검증] 핵심 비즈니스 로직: ThreatScore를 재무적 손실액으로 변환합니다.
 * 이 함수는 '단순 계산'이 아니라, '시스템 구조적 결함'을 근거로 해야 합니다.
 * 
 * @param request 사용자의 진단 요청 데이터 (위협 점수 및 자산 가치 포함)
 * @returns 예측된 재무 손실 위험 결과 객체
 */
export const analyzeRiskAndCalculateLoss = (request: DiagnosisRequest): RiskDiagnosisResult => {
    const { threatData, userContext } = request;

    // [WHY] 코드는 단순 점수 매핑이 아니라, 자산 규모(userContext.assetValueUSD)를 고려한 '가중치'를 적용해야 합니다. 
    // 위협도가 높아질수록 손실액도 기하급수적으로 늘어나도록 설계합니다.
    let baseLossFactor = threatData.score / 100; // 0.0 to 1.0

    // [WHY] 자산 규모에 비례하여 손실 폭이 커집니다 (Leverage Effect).
    let estimatedLossUSD: number;
    if (userContext.assetValueUSD === 0) {
        estimatedLossUSD = 0;
    } else {
        // 복잡도 증가 함수 예시: Loss = Asset * BaseFactor^(1 + ThreatScore/200)
        // ThreatScore가 높을수록 지수 승수가 커져서 급격히 늘어남.
        const multiplier = Math.pow(baseLossFactor, 1 + threatData.score / 200);
        estimatedLossUSD = userContext.assetValueUSD * (Math.random() * 0.5 + multiplier) * 0.8; // 랜덤성을 약간 추가하여 '예측 불가'의 공포감 부여
    }

    // [WHY] 위험 레벨은 계산된 점수와 손실액을 종합적으로 판단해야 합니다.
    let riskLevel: 'Low' | 'Medium' | 'High';
    if (estimatedLossUSD > userContext.assetValueUSD * 0.15 && threatData.score >= 70) {
        riskLevel = 'High';
    } else if (estimatedLossUSD > userContext.assetValueUSD * 0.03 && threatData.score >= 40) {
        riskLevel = 'Medium';
    } else {
        riskLevel = 'Low';
    }

    const summaryMessage: string = (() => {
        if (riskLevel === 'High') return "경고: 구조적 공백으로 인한 시스템 생존 위협이 감지되었습니다. 즉각적인 조치가 필요합니다.";
        if (riskLevel === 'Medium') return "주의: 일부 영역에서 잠재적 리스크가 관찰됩니다. 상세 진단이 권장됩니다.";
        return "안전: 현재까지는 구조적으로 안정적인 상태입니다. 주기적인 모니터링을 권장합니다.";
    })();

    // 결과 반환 (타입 명시)
    return {
        threatScore: threatData,
        riskLevel: riskLevel,
        estimatedLossUSD: parseFloat(Math.min(estimatedLossUSD, userContext.assetValueUSD * 0.8)).toFixed(2), // 손실액이 자산가치를 넘지 않도록 상한선 설정 및 소수점 처리
        summaryMessage: summaryMessage,
    };
};

/**
 * API 엔드포인트 시뮬레이터 (Mock API Call)
 * 실제 환경에서는 FastAPI나 Express 등의 라우팅 레이어에서 호출됩니다.
 */
export const simulateApiCall = async (request: DiagnosisRequest): Promise<RiskDiagnosisResult> => {
    // [WHY] 비동기 처리를 통해 '시스템 분석 중'이라는 시간적 압박과 전문성을 부여합니다. 
    await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5초 지연 (시간적 긴장감)
    return analyzeRiskAndCalculateLoss(request);
};