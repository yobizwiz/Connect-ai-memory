/**
 * @fileoverview 리스크 진단 서비스 관련 모든 공통 타입 정의.
 */

// 사용자 입력 항목의 구조를 정의합니다. (예시로 3가지 리스크 요소를 가정)
export interface RiskInput {
    regulatoryComplianceScore: number; // 규정 준수 점수 (0-100)
    dataStorageSecurityLevel: 'Low' | 'Medium' | 'High'; // 데이터 보안 레벨
    employeeTrainingFrequencyDays: number; // 직원 교육 빈도 (일 단위, 숫자가 작을수록 위험)
}

// Mock API의 최종 출력 스키마입니다.
export interface LmaxResult {
    totalResilienceIndex: number; // Total Resilience Index (TRI): 전체 총점수 (0-100)
    lmaxScore: number;             // 최대 리스크 점수 ($L_{max}$): 임계치 판단 기준이 되는 핵심 지표
    isCritical: boolean;          // $L_{max}$가 위험 임계치를 초과했는지 여부 (불리언 플래그로 UI에 직접 전달)
}

// Lmax 계산의 경계값 및 상수 정의 (Configuration Rule)
export const CRITICAL_THRESHOLD: number = 75; // 예시 임계치: 이 점수 이상이면 Red Zone 발동

export interface RiskParameters {
    initialScore: number;
    lMaxThreshold: number;
}

export interface RiskState {
    currentScore: number;
    isCritical: boolean;
    lastChecked: Date;
}

export interface RiskScore {
    structuralGap: number;
    provenanceConfidence: number;
    regulatoryExposureScore: number;
}

export interface SessionContext {
    sessionId: string;
    userTier: string;
}