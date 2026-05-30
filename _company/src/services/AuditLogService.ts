/**
 * 시스템 내에서 발생하는 모든 중요 이벤트(State Transition, Payment Attempt)를 
 * 위변조 불가능한 해시 체인 형태로 로깅하는 서비스. (Immutable Ledger Stub)
 */

export interface AuditRecord {
    timestamp: Date;
    eventType: string; // 예: PAYMENT_SUCCESS, STATE_TRANSITION
    data: any;        // 이벤트가 발생했을 때의 데이터 (트랜잭션 ID, 이전 상태 등)
    previousHash: string; // 이전 블록/레코드의 해시값으로 연결성을 보장
    currentHash: string;  // 이 레코드 전체를 암호화한 고유 해시값
}

export class AuditLogService {
    private readonly ledger: AuditRecord[] = [];
    private lastBlockHash: string = '0'; // Genesis Block Hash

    /**
     * 새로운 감사 기록을 생성하고, 이전 블록의 해시값을 연결하여 저장합니다.
     * @param eventType - 발생 이벤트 타입.
     * @param data - 관련 데이터.
     */
    public async recordEvent(eventType: string, data: any): Promise<AuditRecord> {
        // 1. 시간 및 이전 상태 확인 (Source of Truth)
        const timestamp = new Date();

        // 2. 해시 계산을 위한 입력 데이터 구조화
        const recordData = JSON.stringify({
            timestamp: timestamp,
            eventType: eventType,
            data: data,
            previousHash: this.lastBlockHash // 체인의 핵심!
        });

        // 3. SHA-256 해시 생성 (실제 구현 시 crypto 모듈 사용)
        const currentHash = `sha256_${recordData.length}_${Math.random().toString(16).slice(2)}`; 

        const newRecord: AuditRecord = {
            timestamp: timestamp,
            eventType: eventType,
            data: data,
            previousHash: this.lastBlockHash,
            currentHash: currentHash
        };

        // 4. 레저에 추가 및 마지막 해시 업데이트
        this.ledger.push(newRecord);
        this.lastBlockHash = currentHash;

        console.log(`[AUDIT LOG] Successfully recorded event '${eventType}'. New Chain Hash: ${currentHash}`);
        return newRecord;
    }
    
    public getLedgerHistory(): AuditRecord[] {
        // 실제로는 DB에서 가져오지만, 여기서는 메모리 캐시를 반환합니다.
        return [...this.ledger]; 
    }
}