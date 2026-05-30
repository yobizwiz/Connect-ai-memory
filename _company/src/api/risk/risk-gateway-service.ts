/**
 * @description 핵심 리스크 게이트웨이 서비스 (State Machine Orchestrator).
 * 이 서비스는 사용자 입력, 계산 로직 실행, 그리고 감사 기록 저장을 하나의 원자적 트랜잭션으로 묶습니다.
 */

import { AuditRecord, createAuditRecord, saveAuditRecord } from './audit-ledger';

// 상수 정의: Designer/Writer의 명세를 코드로 반영합니다.
const CRITICAL_THRESHOLD = 5000; // $L_{max}가 5000 USD를 넘으면 경고 발동
const INITIAL_PREVIOUS_HASH = 'GENESIS_HASH_V1';

/**
 * @typedef {object} UserInputData - 사용자로부터 입력받는 데이터 구조.
 * @property {number} inputA - 첫 번째 리스크 관련 변수 (예: 규제 준수 점수)
 * @property {number} inputB - 두 번째 리스크 관련 변수 (예: 시스템 복잡도 지표)
 */

/**
 * 1단계: 초기화 및 상태 확인.
 * @returns {Promise<{lmax: number, isCritical: boolean}>} 초기 리스크 값과 경고 여부.
 */
export const initializeRiskCheck = async (): Promise<{ lmax: number; isCritical: boolean }> => {
    // 1. 로그 기록 (State Transition)
    const auditRecord = createAuditRecord(
        'RiskGateway', 
        'STATE_TRANSITION', 
        { message: 'Initial state check started.' }, 
        INITIAL_PREVIOUS_HASH
    );
    await saveAuditRecord(auditRecord);

    // 2. 로직 실행 (초기값)
    const initialLmax = 0;
    return { lmax: initialLmax, isCritical: false };
};


/**
 * 2단계: 사용자 데이터 입력 및 Lmax 계산 (핵심 트랜잭션).
 * @param {UserInputData} userData - 사용자가 제출한 데이터.
 * @returns {Promise<{lmax: number; warningCopy: string}>} 최종 리스크 값과 경고 문구.
 */
export const calculateAndProcessRisk = async (userData: UserInputData): Promise<{ lmax: number; warningCopy: string }> => {
    console.log("⚙️ [GATEWAY] Input received. Starting calculation...");

    // 1. Lmax 계산 로직 (가상의 복잡한 비즈니스 로직)
    let lmax = Math.abs(userData.inputA * 0.5 + userData.inputB * 1.2);

    // 2. 상태 변화 감지 및 경고 카피 생성
    const isCritical = lmax >= CRITICAL_THRESHOLD;
    let warningCopy = '';

    if (isCritical) {
        // Writer가 정의한 Critical Copy를 API 레벨에서 트리거합니다.
        warningCopy = `🚨 [CRITICAL ALERT] 시스템 과부하 감지: $L_{max}$는 ${lmax.toLocaleString()} USD 이상으로 산정됩니다. 즉시 조치해야 합니다.`;
    } else {
         // 평온한 상태의 기본 안내 문구
        warningCopy = '현재 리스크 지표는 안정적입니다. 더 깊은 진단이 필요합니다.';
    }

    // 3. 로그 기록 (Calculation) - 가장 중요한 부분!
    const auditRecord = createAuditRecord(
        'RiskGateway', 
        'CALCULATION', 
        { 
            inputData: userData, 
            calculatedLmax: lmax 
        }, 
        INITIAL_PREVIOUS_HASH // 실제로는 이전 API 호출의 최종 해시를 사용해야 함.
    );
    await saveAuditRecord(auditRecord);

    return { lmax: Math.round(lmax), warningCopy };
};


/**
 * 3단계: Paywall 모달 트리거 및 실패 처리 (Failure Handling).
 * @param {number} currentLmax - 계산된 Lmax 값.
 * @returns {Promise<{failureMessage: string}>} 사용자에게 보여줄 오류 메시지.
 */
export const triggerPaywallGate = async (currentLmax: number): Promise<{ failureMessage: string }> => {

    // 1. 로그 기록 (Failure/Action Attempt)
    const auditRecord = createAuditRecord(
        'RiskGateway', 
        'STATE_TRANSITION', 
        { lmaxValue: currentLmax, actionAttempted: 'Paywall Access' }, 
        'LAST_CALCULATION_HASH_HERE' // 실제로는 이전 단계의 해시 사용
    );
    await saveAuditRecord(auditRecord);

    // 2. Writer가 정의한 Paywall 전용 카피를 반환합니다.
    const failureMessage = `✅ [ACTION REQUIRED]: 진단 리포트 요청으로 즉시 전환해야 합니다. 시스템은 이 데이터를 기반으로 귀사만의 취약점 보고서를 생성합니다. 망설이는 시간, 곧 $L_{max}$가 증가하는 시간입니다.`;

    return { failureMessage };
};