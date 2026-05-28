from typing import Dict, Any, List
from datetime import datetime
import uuid

# =============================================================
# 1. 데이터 모델 (Risk Ontology Schema Definition)
# =============================================================
# 실제 DB 스키마를 대신하는 전역 클래스/Dict 구조 정의
class RiskOntology:
    """
    리스크 온톨로지의 핵심 속성들을 담는 구조체입니다. 
    TRE$ 계산의 입력값(Input Schema) 역할을 합니다.
    [근거: CEO 지시 - 리스크 온톨로지 기반 로직 확장]
    """
    def __init__(self):
        # Threat Attributes (위협 속성)
        self.threat_attributes = {
            "RegulatoryViolation": {"severity_score": 0.4, "data_type": "PII/GDPR", "is_critical": True},
            "SystemFailure": {"severity_score": 0.3, "data_type": "Operational", "is_critical": False},
            "MarketFluctuation": {"severity_score": 0.2, "data_type": "Economic", "is_critical": False}
        }
        # Mitigation Factors (완화 요인) - 방어 능력 점수
        self.mitigation_factors = {
            "EncryptionImplemented": {"score_reduction": 0.15, "status": "Active"}, # 암호화 적용 시 리스크 감소분
            "AuditTrailLogging": {"score_reduction": 0.10, "status": "Active"}    # 감사 로그 기록으로 인한 안정성 증가
        }

def get_current_ontology() -> Dict[str, Any]:
    """현재 시스템의 온톨로지 상태를 조회합니다."""
    return {
        "threats": RiskOntology().threat_attributes,
        "mitigation": RiskOntology().mitigation_factors
    }

# =============================================================
# 2. 핵심 로직 서비스 (Risk Scoring Engine)
# =============================================================

def calculate_tre(
    raw_risk_data: Dict[str, float], 
    ontology: Dict[str, Any]
) -> Dict[str, Any]:
    """
    TRE$ (Total Risk Exposure Score)를 계산하는 핵심 함수입니다.
    수식 구조는 다음과 같습니다:
    TRE = Σ(Threat_Score * Threat_Weight) * Mitigation_Factor_Adjustment
    """
    print("--- [INFO] TRE$ Calculation Started ---")

    # A. 위협 속성별 가중치 계산 (Raw Risk Input 반영)
    weighted_risk_sum = 0.0
    for threat, weight in raw_risk_data.items():
        if threat in ontology['threats']:
            # 위험 점수(weight) * 온톨로지 중요도(severity_score)를 곱합니다.
            score = weight * ontology['threats'][threat]['severity_score']
            weighted_risk_sum += score
            print(f"  -> {threat} Contribution: {weight:.2f} * {ontology['threats'][threat]['severity_score']:.1f} = {score:.4f}")

    # B. 완화 요인 조정 (Mitigation Adjustment)
    total_reduction = 0.0
    for factor, data in ontology['mitigation'].items():
        if data['status'] == 'Active':
            total_reduction += data['score_reduction']
            print(f"  -> Mitigation Applied: {factor} (-{data['score_reduction']:.2f})")

    # C. 최종 TRE$ 계산 (최소 0으로 제한)
    final_tre = max(0.0, weighted_risk_sum - total_reduction)

    return {
        "timestamp": datetime.utcnow().isoformat(),
        "raw_input_data": raw_risk_data,
        "weighted_risk_sum": round(weighted_risk_sum, 4), # 완화 전 총 위험 점수
        "total_reduction_factor": round(total_reduction, 2), # 모든 완화 요인 합산
        "final_tre_score": round(final_tre, 4) # 최종 TRE$ (Total Risk Exposure Score)
    }

# =============================================================
# 3. API/Service Interface Simulation
# =============================================================

def assess_systemic_risk(raw_data: Dict[str, float]) -> Dict[str, Any]:
    """
    사용자 입력(Raw Data)을 받아 시스템적 위험 평가를 수행합니다.
    이 함수가 API 호출의 최종 엔드포인트 역할을 합니다.
    """
    print("\n[System] Calling Risk Scoring Service...")
    ontology = get_current_ontology()
    
    # 🚨 핵심 로직 실행 지점 (The Magic Happens Here)
    tre_result = calculate_tre(raw_data, ontology)
    
    return tre_result

if __name__ == "__main__":
    print("--- [TEST] Running Core Scoring Engine Test ---")
    # 테스트 케이스: 규제 위반이 높은 상황을 가정
    test_input = {
        "RegulatoryViolation": 0.9, # 매우 높음 (예: PII 유출)
        "SystemFailure": 0.5,      # 중간
        "MarketFluctuation": 0.1   # 낮음
    }

    result = assess_systemic_risk(test_input)
    print("\n============================================")
    print("✅ Assessment Complete:")
    print(f"  최종 TRE$ 점수: {result['final_tre_score']}")
    print("============================================\n")