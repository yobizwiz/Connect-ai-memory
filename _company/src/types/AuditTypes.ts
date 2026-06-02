/**
 * @fileoverview System Compliance Module: Audit Ledger Types Definition
 * @description 모든 서비스에서 사용될 트랜잭션 무결성 원장(Ledger)의 공통 타입 정의.
 */

export type ActionType = 'READ' | 'WRITE' | 'ACCESS_CONTROL' | 'DELETE';

/**
 * API 요청 본문 (Request Body) 타입. 
 * 모든 데이터는 이 구조를 따르며, 이전 해시(previousHash)가 필수적입니다.
 */
export interface AuditLogRequest {
    userId: string;
    actionType: ActionType;
    targetResource: string; // 예: "user/profile", "report/financial"
    details: Record<string, any>; 
    /** 이전 트랜잭션의 SHA-256 해시. 체인의 연결 고리 역할을 합니다. */
    previousHash?: string | null; 
}

/**
 * API 응답 본문 (Response Body) 타입. 
 * 서버가 계산하여 반환하며, 클라이언트는 이를 다음 요청의 previousHash로 사용해야 합니다.
 */
export interface AuditLogResponse {
    success: boolean;
    message: string;
    newHash: string; // 이번 트랜잭션을 대표하는 SHA-256 해시 값
    timestamp: Date;
}

/**
 * 데이터베이스 레코드 타입 (DB Model).
 */
export interface AuditLogRecord {
    logId: number;
    userId: string;
    actionType: ActionType;
    targetResource: string;
    details: Record<string, any>;
    timestamp: Date;
    ipAddress: string | null;
    previousHash: string | null;
    currentHash: string; // 이 레코드를 대표하는 최종 해시
}

/**
 * 시스템 전반에 사용되는 SHA-256 해시 길이 상수. 
 */
export const HASH_LENGTH = 64;