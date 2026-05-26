// src/services/threatIndexCalculator.ts

/**
 * @typedef {'Low' | 'Medium' | 'High'} ThreatLevel - 위협 수준 타입
 */

/**
 * 사용자의 답변 객체 구조를 정의합니다.
 * 키는 체크리스트 항목 ID, 값은 Yes('yes') 또는 No('no')입니다.
 * 예시: { "q1_1": "yes", "q1_2": "no", ... }
 */

/**
 * 사용자 응답 기반으로 종합적인 '위협 지수(Threat Index)'를 계산합니다.
 * 이 로직은 yobizwiz의 핵심 영업 무기 중 하나이므로, 정확성과 재현성이 최우선입니다.
 * @param answers - 사용자가 체크리스트 항목에 응답한 객체 (ID: Yes/No)
 * @returns {Promise<{threatLevel: ThreatLevel; score: number}>} 계산된 위협 수준과 점수
 */
export const calculateThreatIndex = async (answers: Record<string, 'yes' | 'no'>) => {
    // Mock API 호출 지연을 시뮬레이션하여 사용자에게 '분석 중' 경험 제공 (Time Pressure)
    await new Promise(resolve => setTimeout(resolve, 1500));

    let totalRiskScore = 0;
    const MAX_SCORE = 20; // 최대 위험 점수 설정

    // [근거: Researcher가 제공한 체크리스트 구조를 기반으로 가중치 할당]
    const scoringMap = {
        "q1_1": { weight: 5, description: "PII 유출은 최상위 리스크입니다. (High Impact)" }, // PII Leakage
        "q1_2": { weight: 3, description: "데이터 사일로 발생 위험." }, // Data Silo
        "q1_3": { weight: 4, description: "법적 근거 미비는 준전문가 책임 리스크를 야기합니다." }, // Compliance Failure

        "q2_1": { weight: 4, description: "시스템 구조 자체의 무결성 부족은 치명적입니다. (Structural Integrity)" }, // Structural Vulnerability
        "q2_2": { weight: 3, description: "자동화된 프로세스에 대한 검증 부재." }, // Lack of Process Validation

        "q3_1": { weight: 4, description: "선제적 대응 체계의 부재는 손실로 이어집니다. (Proactive Defense)" } // Proactive Defense Failure
    };

    // 응답 기반으로 점수 계산
    for (const [itemId, answer] of Object.entries(answers)) {
        if (answer === 'yes' && scoringMap[itemId]) {
            totalRiskScore += scoringMap[itemId].weight;
        }
    }

    let threatLevel = 'Low';
    // 점수에 따른 위협 레벨 결정 로직 (임계점 설정)
    if (totalRiskScore >= 14) { // 14점 이상: 매우 높은 위험 - Red Zone
        threatLevel = 'High';
    } else if (totalRiskScore >= 8) { // 8점 ~ 13점: 주의 필요 - Yellow Zone
        threatLevel = 'Medium';
    }

    return {
        threatLevel,
        score: totalRiskScore,
        maxScore: MAX_SCORE
    };
};

/**
 * ThreatLevel에 맞는 CSS 클래스 및 설명을 반환합니다. (UI 레벨에서 사용)
 * @param level - 위협 수준
 * @returns {{className: string; message: string}}
 */
export const getThreatDisplay = (level: 'Low' | 'Medium' | 'High' | string) => {
    switch (level) {
        case 'High':
            return { className: 'bg-red-600 animate-pulse', message: "🚨 RED ZONE 경고: 치명적인 시스템적 위협 감지. 즉각적인 전문가 진단이 필요합니다." };
        case 'Medium':
            return { className: 'bg-yellow-500 border-l-4 border-yellow-700', message: "⚠️ 주의 필요: 구조적 취약점이 확인되었습니다. 점검 후 보완이 필수입니다." };
        case 'Low':
        default:
            return { className: 'bg-green-100 border-l-4 border-green-500', message: "✅ 양호한 상태: 현재 프로세스는 기본적인 안정성을 갖추고 있습니다. 지속적인 모니터링이 필요합니다." };
    }
};

export const getThreatLevels = () => ({
    High: '🚨 RED ZONE 경고: 치명적인 시스템적 위협 감지. 즉각적인 전문가 진단이 필요합니다.',
    Medium: '⚠️ 주의 필요: 구조적 취약점이 확인되었습니다. 점검 후 보완이 필수입니다.',
    Low: '✅ 양호한 상태: 현재 프로세스는 기본적인 안정성을 갖추고 있습니다. 지속적인 모니터링이 필요합니다.'
});

// 테스트용 더미 데이터 (Self-RAG 원칙에 따라 가중치와 설명을 구조화)
export const getChecklistQuestions = () => ({
    title: "I. 데이터 처리 및 보안 리스크",
    questions: [
        { id: "q1_1", text: "외부 AI 툴에 고객의 PII를 직접 입력하여 분석한 적이 있습니까?", type: 'radio', scoreId: 'q1_1' },
        { id: "q1_2", text: "민감 문서가 암호화된 전용 저장소 외 다른 매체에 남아있지는 않습니까?", type: 'radio', scoreId: 'q1_2' },
        { id: "q1_3", text: "AI 분석 결과의 법적 근거(판례/조항)를 명확히 기록하는 시스템이 갖춰져 있습니까?", type: 'radio', scoreId: 'q1_3' }
    ],
    // ... 나머지 섹션도 이와 같은 방식으로 구조화 필요
});