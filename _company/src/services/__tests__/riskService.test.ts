import { calculateTotalRisk } from '../riskService';
import { RiskCaseData, RiskQuantification } from '../risk-types';

describe('calculateTotalRisk', () => {
    // 🧪 Test Case 1: 정상적인 다중 데이터 계산 테스트 (Happy Path)
    test('should accurately sum the Lmax across multiple risk cases', () => {
        const mockData: RiskCaseData[] = [
            {
                case_id: "DORA-001",
                regulation: "DORA",
                violation_type: "시스템적 운영 복원력 실패",
                description: "핵심 시스템 마비로 인한 48시간 이상의 기능 마비.",
                risk_quantification: {
                    regulatoryFineEstimate: 50000000, // $50M
                    operationalDowntimeLossAnnualized: 12000000, // 연간 $12M -> 일일 $3.28M (4일 * 3.28M = $13.12M)
                    litigationSettlementEstimate: 50000000, // $50M
                }
            },
            {
                case_id: "AI-002",
                regulation: "EU AI Act",
                violation_type: "비공개 데이터 사용 위반",
                description: "학습 과정에서 민감 개인 정보 무단 활용.",
                risk_quantification: {
                    regulatoryFineEstimate: 15000000, // $15M
                    operationalDowntimeLossAnnualized: 6000000, // 연간 $6M -> 일일 $1.64M (4일 * 1.64M = $6.56M)
                    litigationSettlementEstimate: 20000000, // $20M
                }
            },
        ];

        // 예상 계산값 (DORA): 50M + ((12M/365)*4) + 50M = 100M + 13.15M = 113,150,685. (반올림 고려)
        // 예상 계산값 (AI Act): 15M + ((6M/365)*4) + 20M = 35M + 6.58M = 41,575,342.
        // 총합: 113,150,685 + 41,575,342 = 154,726,027
        const result = calculateTotalRisk(mockData);

        // 임계치 비교를 위한 테스트 추가 (PAYWALL_THRESHOLD는 85M)
        expect(result.totalLmaxUSD).toBeCloseTo(154726027, 0); // $154.7M > $85M -> true
        expect(result.exceedsThreshold).toBe(true);
    });

    // 🧪 Test Case 2: 임계치 미달성 및 데이터 누락 방어 테스트 (Edge Case)
    test('should handle missing data gracefully and report below threshold', () => {
        const mockData: RiskCaseData[] = [
            {
                case_id: "LOW-001",
                regulation: "Minor",
                violation_type: "경미한 위반",
                description: "최소 금액만 발생.",
                risk_quantification: {
                    regulatoryFineEstimate: 1000, // $1k
                    operationalDowntimeLossAnnualized: 1000, // 일일 손실 무시 가능
                    litigationSettlementEstimate: 500, // $0.5k
                }
            },
            // 누락된 데이터 케이스 (서비스 로직에서 경고를 출력하고 스킵되어야 함)
            null as unknown as RiskCaseData, 
        ];

        const result = calculateTotalRisk(mockData);
        
        // 예상 계산값: 1000 + 0 + 500 = 1500
        expect(result.totalLmaxUSD).toBeCloseTo(1500, 0);
        expect(result.exceedsThreshold).toBe(false); // $1.5k < $85M -> false
    });

    // 🧪 Test Case 3: 입력 데이터가 비어있거나 잘못되었을 때의 방어 테스트 (Failure Guard)
    test('should throw an error if the input array is empty or invalid', () => {
        expect(() => calculateTotalRisk([])).toThrow("RISK_SERVICE_ERROR");
        expect(() => calculateTotalRisk(null as unknown as RiskCaseData[])).toThrow("RISK_SERVICE_ERROR");
    });
});