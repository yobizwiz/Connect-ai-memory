export interface MasterRiskDataset {
    schema_metadata: {
        version: string;
        creation_date: string;
        description: string;
        required_fields_for_calculation: ["regulatory_weighting", "probability_score", "impact_score"]
    };
    risk_scenarios: Array<{
        id: string;
        name: string;
        primary_regulations: string[];
        risk_category: string;
        failure_type: string; // Researcher가 작성한 스키마를 기반으로 임시 정의
        // M_Complexity 계산에 필요한 핵심 변수 (타입 강제)
        regulatory_weighting?: number; 
        probability_score?: number;
        impact_score?: number;
    }>;
}

export interface ComplexityScore {
    value: number;
    isCritical: boolean; // 임계값 초과 여부 판단용 플래그
    message: string; // 사용자에게 보여줄 경고 메시지
}

// 핵심 리스크 점수 임계값 정의 (회사 공동 목표에 따라 설정)
export const RISK_THRESHOLD = {
    WARNING: 0.6,   // 노란색/주의 단계
    CRITICAL: 0.85  // 네온 크림슨 글리치 발동 단계
};

// 가짜 데이터 로드 함수 (실제로는 API 호출 또는 Context에서 가져와야 함)
export const fetchMasterRiskDataset = async (): Promise<MasterRiskDataset> => {
    // 실제 환경에서는 여기에 axios.get(...) 와 같은 비동기 네트워크 호출이 들어갑니다.
    await new Promise(resolve => setTimeout(resolve, 300)); // Mocking latency
    console.log("✅ [Mock API] Master Structural Risk Dataset 로드 완료.");

    // Researcher가 생성한 스키마의 일부 데이터를 모킹하여 사용합니다.
    return {
        schema_metadata: {
            version: "1.0.0",
            creation_date: "2026-05-30",
            description: "Mock data for M_Complexity calculation.",
            required_fields_for_calculation: ["regulatory_weighting", "probability_score", "impact_score"]
        },
        risk_scenarios: [
            // 낮은 리스크 시나리오 (테스트용)
            { id: "R001_PII_LEAKAGE", name: "PII Leakage Mock", primary_regulations: ["GDPR"], risk_category: "Data Privacy & Security", failure_type: "Mock", regulatory_weighting: 0.2, probability_score: 0.3, impact_score: 0.1 },
            // 높은 리스크 시나리오 (네온 글리치 유발용)
            { id: "R999_SYSTEMIC_FAILURE", name: "Systemic Failure Mock", primary_regulations: ["Global"], risk_category: "Operational Risk", failure_type: "Mock", regulatory_weighting: 0.7, probability_score: 0.6, impact_score: 1.2 }
        ]
    } as MasterRiskDataset; // 타입 캐스팅으로 강제합니다.
};