/**
 * @fileoverview 리스크 진단 도구에서 사용되는 모든 사용자 입력 변수들의 타입 안전성 정의.
 */

export interface InputData {
    /** 0 (없음) ~ 1 (최대) 사이의 값으로, 규제 준수 프로세스의 부족 정도를 반영합니다. */
    regulatoryFailureRate: number | null;
    /** 0 (안전) ~ 1 (극도로 위험) 사이의 값으로, 산업적 공백 노출 빈도와 심각도를 반영합니다. */
    systemicGapExposure: number | null;
    /** 0 (낮음) ~ 1 (매우 높음) 사이의 값으로, 핵심 데이터 무결성 취약점의 정도를 반영합니다. */
    dataIntegrityWeakness: number | null;
}

export type RiskLevel = 'Low' | 'Medium' | 'Critical';