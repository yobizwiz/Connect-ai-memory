// c:\Users\jinoh\Desktop\Connect AI\_company\src\services\types\AuditLogTypes.ts

/**
 * @description Audit Log Schema를 재정의하고, Type Safety와 구조적 무결성을 최우선으로 합니다.
 */
export type AuditLogSchema = {
    event_uuid: string;        // UUID: 고유 이벤트 식별자 (비가역적 증거)
    timestamp_utc: string;     // ISO 8601 DateTime: UTC 기준 기록 시간 (법적 무결성 보장)
    user_id: string;           // String: 액션을 수행한 사용자 ID (책임 소재 지정)
    workflow_name: string;     // String: 이벤트 발생 워크플로우명 (리스크 국소화 근거)
    subject_resource_id: string; // String: 대상 자원의 고유 ID (피해 범위 산정의 기준점)
    action_type: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'; // Enum: 발생 액션 타입
    details: Record<string, any>; // JSON: 변경된 데이터나 상세 컨텍스트를 담는 유연한 객체 (예: {field: oldVal, newVal})
};

/**
 * @description AuditLogService에 전달될 부분적인 데이터를 정의합니다.
 */
export type PartialAuditLog = Omit<AuditLogSchema, 'event_uuid' | 'timestamp_utc'>;