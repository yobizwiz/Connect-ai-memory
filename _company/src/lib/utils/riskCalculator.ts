/**
 * $L_{max}$ 기반 리스크 레벨을 계산하는 Pure Function입니다.
 */
export const calculateRiskLevel = (level: number): { currentStage: 'Safe' | 'Warning' | 'Critical'; threatColorClass: string } => {
    // 입력값 검증 및 클램핑 (Defensive Programming)
    const clampedLevel = Math.max(0, Math.min(100, level));

    let stage: 'Safe' | 'Warning' | 'Critical';
    let colorClass: string;

    if (clampedLevel < 30) {
        stage = 'Safe';
        // Safe 상태는 너무 강렬하면 오히려 신뢰도를 떨어뜨리므로, 시스템 기본 색상으로 유지합니다.
        colorClass = 'border-green-700 bg-[#1f2937]'; 
    } else if (clampedLevel >= 30 && clampedLevel < 65) {
        stage = 'Warning';
        colorClass = 'border-yellow-700 bg-[#2d2c2b]';
    } else {
        // Critical: Neon Red Zone Alert. 가장 강력한 시각적 위협을 부여합니다.
        stage = 'Critical';
        // 글리치 효과가 들어갈 메인 클래스 정의
        colorClass = 'border-[#DC2626] bg-black shadow-[0_0_30px_rgba(220,38,38,0.5)]'; 
    }

    return { currentStage: stage, threatColorClass: colorClass };
};