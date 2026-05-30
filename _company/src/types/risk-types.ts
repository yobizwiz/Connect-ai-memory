export type RiskState = {
    currentScore: number;
    isCritical: boolean; // L_max 임계값 초과 여부
    lastChecked: Date;
};

export interface RiskParameters {
    lMaxThreshold: number; // 최대 허용 리스크 점수 (L_critical)
    initialScore: number;
}