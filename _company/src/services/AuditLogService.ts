// c:\Users\jinoh\Desktop\Connect AI\_company\src\services\AuditLogService.ts

/**
 * @description 감사 로그(Immutable Ledger)를 처리하는 서비스 레이어.
 * 이 서비스는 모든 기록이 '불변'하고, '책임 소재'를 명확히 하는 것이 최우선 목표입니다.
 */
export class AuditLogService {
    // 실제 운영 환경에서는 DB 클라이언트 인스턴스를 주입받아야 합니다 (DI).
    private static mockDatabase: Map<string, AuditLogSchema[]> = new Map();

    /**
     * @description 새로운 감사 로그를 기록합니다. 이 과정은 트랜잭션 단위로 처리되어야 합니다.
     * 무결성 유지를 위해 'Write-Only' 원칙을 강제하며, 로직상 수정(Update)은 불가합니다.
     * @param logData - 저장할 AuditLogSchema 객체
     * @returns 성공적으로 기록된 로그의 UUID
     */
    public static async saveLog(logData: Omit<AuditLogSchema, 'event_uuid' | 'timestamp_utc'>): Promise<string> {
        // 1. 무결성 체크: 필수 필드가 누락되었는지 확인합니다.
        if (!logData.user_id || !logData.workflow_name) {
            throw new Error("Audit Log 기록 실패: 사용자 ID와 워크플로우 이름은 필수입니다.");
        }

        // 2. 불변성 보장: 시스템이 UUID와 시간을 생성하여 위변조 가능성을 원천 차단합니다.
        const eventUuid = crypto.randomUUID(); // Node.js v3.16+ 또는 Web Crypto API 사용 가정
        const timestampUtc = new Date().toISOString();

        // 3. 최종 스키마 조합 및 저장 (Mock Persistence)
        const finalLog: AuditLogSchema = {
            event_uuid: eventUuid,
            timestamp_utc: timestampUtc,
            ...logData
        };

        // 실제 DB 트랜잭션 시작 (예: PostgreSQL의 INSERT INTO ... RETURNING *)
        console.log(`[AUDIT LOG] Successfully recording event ${eventUuid} for workflow: ${logData.workflow_name}`);
        
        // Mock 저장소에 추가 (실제로는 여기서 await dbClient.save(...) 가 호출됨)
        let logs = AuditLogService['mockDatabase'].get(logData.user_id) || [];
        logs.push(finalLog);
        AuditLogService['mockDatabase'].set(logData.user_id, logs);

        return eventUuid;
    }

    /**
     * @description 특정 UUID를 가진 로그를 조회합니다. (Read-Only 접근만 허용)
     * @param eventUuid - 조회할 이벤트의 고유 ID
     * @returns AuditLogSchema | null
     */
    public static async getLogById(eventUuid: string): Promise<AuditLogSchema | null> {
        // 실제 DB 쿼리 (SELECT * FROM audit_log WHERE event_uuid = ?)
        console.log(`[AUDIT LOG] Retrieving log by UUID: ${eventUuid}`);
        for (const logs of Array.from(AuditLogService.mockDatabase.values())) {
            const found = logs.find((log: AuditLogSchema) => log.event_uuid === eventUuid);
            if (found) return found;
        }
        return null;
    }

    // 경고: delete나 update 메소드는 이 서비스에 포함하지 않습니다. 무결성 유지가 핵심이기 때문입니다.
}

/**
 * @description Audit Log의 모든 필드를 정의하는 타입 스키마 (TypeScript Interface).
 */
export interface AuditLogSchema {
    event_uuid: string;        // UUID: 고유 이벤트 식별자 (비가역적 증거)
    timestamp_utc: string;     // ISO 8601 DateTime: UTC 기준 기록 시간 (법적 무결성 보장)
    user_id: string;           // String: 액션을 수행한 사용자 ID (책임 소재 지정)
    workflow_name: string;     // String: 이벤트 발생 워크플로우명 (리스크 국소화 근거)
    subject_resource_id: string; // String: 대상 자원의 고유 ID (피해 범위 산정의 기준점)
    action_type: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'; // Enum: 발생 액션 타입
    details: Record<string, any>; // JSON: 변경된 데이터나 상세 컨텍스트를 담는 유연한 객체 (예: {field: oldVal, newVal})
    // TRE와 관련된 추가적인 지표 필드도 여기에 통합될 수 있습니다.
}