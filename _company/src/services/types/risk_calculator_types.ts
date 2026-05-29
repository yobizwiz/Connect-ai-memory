/**
 * @fileoverview 위험 계산 서비스의 전역 타입을 정의합니다.
 * 이 파일은 모든 리스크 관련 로직에서 사용되는 표준 인터페이스를 제공하여 타입 안전성을 보장합니다.
 */

// 1. 입력 파라미터 스키마 (Designer Blueprint 기반)
export interface RiskInputs {
    /** 규제 미준수로 인한 가중치 (0.0 ~ 1.0). 가장 중요한 리스크 축입니다. */
    regulatoryRiskWeight: number; // W_Reg
    /** 시스템 결함 또는 내부 프로세스 오류에 대한 가중치 (0.0 ~ 1.0). */
    complianceFailureWeight: number; // W_Comp
    /** 운영 비효율성이나 인적 실수에 대한 가중치 (0.0 ~ 1.0). */
    operationalRiskWeight: number; // W_Ops
    /** 손실 증폭 계수 (Loss Multiplier). 예: Low=1.0, Medium=1.5, High=2.0. */
    lossMultiplier: number; // L_Multiplier
}

// 2. 상태 및 경고 레벨 열거형 (Enum)
export enum RiskState {
    NORMAL = 'Normal',  // 녹색/안전 - 낮은 리스크
    YELLOW = 'Yellow',  // 노란색/경고 - 모니터링 필요, 조치 권고
    RED = 'Red',        // 빨간색/위험 - 즉각적 개입 및 감사 요구 (Critical)
}

export enum WarningLevel {
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
    CRITICAL = 4, // Red Zone 상태에서만 발동 가능한 최상위 경고
}

// 3. 서비스의 최종 출력 스키마 (JSON Schema 준수)
export interface RiskCalculationResult {
    /** 계산된 잠재적 최대 손실액 ($L_r$). 이 값이 핵심 지표입니다. */
    potentialMaxLossAmount: number; // $L_r$
    /** 현재 시스템의 전반적인 리스크 상태 (Normal, Yellow, Red). */
    currentState: RiskState;
    /** 경고 레벨 및 필요한 조치 수준. */
    warningLevel: WarningLevel;
    /** 상태 전환이 발생했는지 여부 (True/False). 프론트엔드 애니메이션 트리거에 필수적입니다. */
    isTransitioningToCritical: boolean;
}

// 4. 기본 손실액 상수 정의 (L_Base) - 임시 상수값으로 사용합니다.
export const BASE_LOSS_AMOUNT = 1000000; // 예시: 100만 단위의 기본 재무적 가치