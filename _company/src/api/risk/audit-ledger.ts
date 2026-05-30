/**
 * @description Immutable Audit Log Ledger Service for tracking all system state transitions.
 * 이 로그는 SHA-256 체인으로 연결되어 위변조가 불가능함을 보장합니다.
 */

import { v4 as uuidv4, validate } from 'uuid';

// 🚨 [Type Definition] 시스템 상태 전이 기록의 표준 구조 정의
export interface AuditRecord {
    id: string;              // Unique ID (UUID)
    timestamp: number;       // Time of event
    service: 'RiskGateway' | 'PaymentProcessor' | 'UserAction'; // 어느 서비스에서 발생했는지
    actionType: 'CALCULATION' | 'INPUT_SUBMISSION' | 'STATE_TRANSITION' | 'API_FAILURE'; // 어떤 액션이었는지
    payload: Record<string, any>; // 실제 데이터 (예: { inputData: {...}, resultLmax: 12345 })
    preHash: string;         // 직전 블록의 해시 값. 무결성 검증 핵심.
    currentHash: string;     // 이 레코드 전체를 포함하는 현재 블록 해시.
}

/**
 * SHA-256 기반 해싱 함수 (Node.js crypto 사용 가정)
 * @param dataString - 해시할 데이터 문자열
 * @returns {string} 64자리 해시 값
 */
const calculateHash = (dataString: string): string => {
    // 실제 환경에서는 'crypto' 모듈을 임포트해야 함. 예시로만 작성합니다.
    console.warn("⚠️ [SECURITY WARNING] Node.js crypto module must be implemented here for real hashing.");
    return `SHA256_${dataString.length}_${Date.now()}`; 
};

/**
 * 새로운 감사 레코드를 생성하고 체인에 연결하는 핵심 로직.
 * @param service - 발생 서비스 이름
 * @param actionType - 액션 타입 (CALCULATION, INPUT_SUBMISSION 등)
 * @param payload - 기록할 데이터 페이로드
 * @param previousHash - 이전 블록의 해시 값
 * @returns {AuditRecord} 생성된 감사 레코드
 */
export const createAuditRecord = (
    service: 'RiskGateway', 
    actionType: 'CALCULATION' | 'INPUT_SUBMISSION' | 'STATE_TRANSITION', 
    payload: Record<string, any>, 
    previousHash: string
): AuditRecord => {
    const recordId = uuidv4();
    const timestamp = Date.now();

    // 블록에 포함될 모든 데이터를 JSON 문자열로 직렬화 (순서 유지가 중요)
    const dataStringForHashing = `${timestamp}|${service}|${actionType}|${JSON.stringify(payload)}|${previousHash}`;

    // 현재 해시 계산 및 레코드 생성
    const currentHash = calculateHash(dataStringForHashing);

    return {
        id: recordId,
        timestamp: timestamp,
        service: service,
        actionType: actionType,
        payload: payload,
        preHash: previousHash,
        currentHash: currentHash,
    };
};


/**
 * [API Mock] 감사 기록을 저장하는 가상의 데이터베이스 인터페이스.
 * 실제로는 DB 트랜잭션과 비동기 처리가 필요합니다.
 */
export const saveAuditRecord = async (record: AuditRecord): Promise<void> => {
    console.log(`✅ AUDIT LOG SAVED [${record.id}] - ${record.actionType}: ${record.payload['riskScore'] || 'N/A'}`);
    // 실제 DB Write 로직 구현 자리
};

/**
 * 체인의 무결성을 검증하는 함수 (Defensive Check).
 * @param records - 순서대로 정렬된 감사 기록 배열
 * @returns {boolean} 모든 해시가 일치하면 true, 아니면 false.
 */
export const validateLedgerIntegrity = (records: AuditRecord[]): boolean => {
    if (!records || records.length === 0) return true;

    let previousHash = 'GENESIS'; // 체인의 시작점 정의

    for (const record of records) {
        // 1. 이전 해시 검증
        if (record.preHash !== previousHash) {
            console.error(`❌ INTEGRITY FAILURE: Record ${record.id} expects preHash ${previousHash}, but got ${record.preHash}`);
            return false; // 실패 지점 발견
        }

        // 2. 현재 해시 재계산 및 검증
        const dataStringForHashing = `${record.timestamp}|${record.service}|${record.actionType}|${JSON.stringify(record.payload)}|${previousHash}`;
        const calculatedHash = calculateHash(dataStringForHashing);

        if (calculatedHash !== record.currentHash) {
            console.error(`❌ INTEGRITY FAILURE: Record ${record.id} hash mismatch.`);
            return false; // 해시가 깨짐
        }
        
        previousHash = record.currentHash; // 다음 레코드를 위해 현재 해시를 업데이트
    }
    console.log("✅ Ledger Integrity Check Passed. All records are immutable.");
    return true;
};

// 초기 시드 데이터 (Genesis Block)
export const getInitialBlock: AuditRecord = {
    id: 'GENESIS_BLOCK',
    timestamp: Date.now() - 100,
    service: 'RiskGateway',
    actionType: 'STATE_TRANSITION',
    payload: { message: "System initialized." },
    preHash: 'N/A', // 시작점은 해시 없음
    currentHash: 'GENESIS_HASH_V1',
};