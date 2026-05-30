/**
 * @description 리스크 대시보드 컴포넌트에서 사용되는 모든 데이터 구조 및 타입 정의.
 */

export type RiskInputs = {
    employeeCount: number;          // 직원 수 (정수)
    complianceRate: number;         // 규제 준수율 (0.0 ~ 1.0)
    aiUsageScope: number;            // AI 활용 범위 지수 (0.0 ~ 1.0)
    dataRetentionYears?: number;     // 데이터 보존 기간 (년, 선택 사항)
};

export type CalculatedResult = {
    lmaxScore: number;              // 최종 Lmax 점수
    isCritical: boolean;            // 임계값 초과 여부 (경고 상태)
    threshold: number;              // 경고 임계값 값
};