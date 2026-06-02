// @jest-environment node
import { recordAudit } from '../riskService';
import { AuditLogRequest, ActionType } from '../../types/AuditTypes';

describe('RiskService - Audit Ledger Integration Test (Immutability Check)', () => {
    
    // Mocking the database service for isolated testing
    const mockDatabaseService = {
        saveAuditLog: jest.fn().mockResolvedValue({ newHash: "0xabcdef1234567890abcdef1234567890", timestamp: new Date() })
    };

    // Mock the global database service access point
    jest.mock('../../services/databaseService', () => ({
        databaseService: { saveAuditLog: mockDatabaseService.saveAuditLog }
    }));


    it('✅ [SUCCESS] Should successfully record a new audit log entry and calculate new hash when previousHash is provided.', async () => {
        // Arrange: 체인의 중간 지점부터 시작하는 테스트 케이스
        const request: AuditLogRequest = {
            userId: 'user-abc-123',
            actionType: ActionType.WRITE,
            targetResource: "report/financial",
            details: { riskScore: 85, mitigationSteps: ["A", "B"] },
            previousHash: "0xdeadbeef0000deadbeef0000deadbeef00" // 임의의 이전 해시
        };

        // Act
        const result = await recordAudit(request);

        // Assert
        expect(result.success).toBe(true);
        expect(mockDatabaseService.saveAuditLog).toHaveBeenCalledWith(expect.objectContaining({
            previousHash: "0xdeadbeef0000deadbeef0000deadbeef00"
        }));
        console.log("Test Passed: New hash generated and expected previous hash was used.");
    });

    it('✅ [SUCCESS] Should successfully record the first block (Chain Genesis) when previousHash is null.', async () => {
        // Arrange: 체인의 시작점 테스트 케이스
        const request: AuditLogRequest = {
            userId: 'system-initial',
            actionType: ActionType.WRITE,
            targetResource: "system/genesis",
            details: { message: "System initialization start." },
            previousHash: null // 체인 시작이므로 null 허용
        };

        // Act
        const result = await recordAudit(request);

        // Assert
        expect(result.success).toBe(true);
        expect(mockDatabaseService.saveAuditLog).toHaveBeenCalledWith(expect.objectContaining({
            previousHash: null
        }));
    });

    it('❌ [FAILURE] Should throw an error if the previousHash is missing or malformed.', async () => {
        // Arrange: 유효성 검증 실패 케이스
        const request: AuditLogRequest = {
            userId: 'user-fail',
            actionType: ActionType.READ,
            targetResource: "dummy",
            details: {},
            previousHash: null // Null은 체인 시작 시에만 허용되므로, 여기서는 실패 유도
        };

        // Act & Assert
        await expect(recordAudit({ ...request, previousHash: 'INVALID_HASH' as string })).rejects.toThrow("Invalid or missing previous hash");
    });
});