// (이전 파일 내용에 추가/수정되는 부분입니다.)

/**
 * Mock API: 사용자 입력 데이터를 기반으로 구조적 리스크와 위협 지수를 계산합니다.
 * @param data - 사용자가 제출한 폼 데이터
 * @returns {object} riskLevel, threatIndex 포함
 */
const calculateThreatIndex = (data: FormData): { riskLevel: "Low" | "Medium" | "High"; threatIndex: number } => {
    // [근거: 🏢 회사 정체성] - 리스크는 일반 규정 위반이 아닌 구조적 사각지대와 인간 오류에서 기인해야 함.

    let score = 0;
    
    // 가상의 복잡한 로직: 데이터 조합을 통해 높은 점수를 유도합니다.
    if (data.isSystemCritical && data.regulatoryGap > 5) {
        score += 40; // 시스템 핵심 기능 누락 + 큰 법적 사각지대 = 치명적
    } else if (data.complianceScore < 60) {
        score += 30; // 준수 점수가 낮으면 높은 위험도 부여
    } else {
        score += 15; // 기본 리스크
    }

    // 난수의 변동성을 추가하여 예측 불가능한 긴급함을 조성 (마케팅적 장치)
    const randomFactor = Math.random() * 10;
    score += randomFactor;

    let threatIndex = Math.min(Math.max(0, score), 100); // 0~100 범위 제한
    let riskLevel: "Low" | "Medium" | "High";

    if (threatIndex >= 75) {
        riskLevel = "High";
    } else if (threatIndex >= 35) {
        riskLevel = "Medium";
    } else {
        riskLevel = "Low";
    }

    return { riskLevel, threatIndex: parseFloat(threatIndex.toFixed(2)) };
};


/**
 * 위협 지수 레벨에 따른 이모지 반환
 */
const getRiskEmoji = (level: "Low" | "Medium" | "High"): string => {
    switch (level) {
        case "High": return "🔴"; // Red Zone
        case "Medium": return "⚠️";
        case "Low": return "✅";
        default: return "❓";
    }
};

// ... (기존 컴포넌트 코드에 추가하여 사용합니다.)

// 5. Paywall Gateway Component 통합 및 조건부 렌더링
const PaywallGateway = ({ threatIndex, isRedZone }: { threatIndex: number; isRedZone: boolean }) => {
    if (!isPaywallVisible) return null; // 상태 관리에 따라 표시 여부 결정

    return (
        <div className="paywall-gateway bg-red-900/80 p-6 mt-12 border-4 border-red-500 animate-pulse">
            <h2 className="text-3xl font-extrabold text-red-400 mb-3 flex items-center">
                🚨 시스템 경고: 구조적 생존 위협 감지 (Threat Index: {threatIndex.toFixed(1)}%) 🚨
            </h2>
            <p className="text-lg text-red-200 mb-6">
                이 수치는 단순한 점수가 아닙니다. **당신의 비즈니스 시스템에 구조적 사각지대가 존재함**을 의미합니다. 이대로 방치하면 $25,000의 손실 위험에 노출될 수 있습니다.
            </p>
            <div className="text-center">
                <button 
                    className="px-12 py-4 text-xl font-bold bg-red-600 hover:bg-red-700 transition duration-300 rounded shadow-lg transform hover:scale-105"
                    onClick={() => console.log("Paywall Clicked: Redirect to Subscription/Consultation")}
                >
                    생존 필수품 진단 요청 (보험 가입) →
                </button>
            </div>
        </div>
    );
};

// ... (기존 React Component 구조에 위 함수와 컴포넌트를 통합합니다.)