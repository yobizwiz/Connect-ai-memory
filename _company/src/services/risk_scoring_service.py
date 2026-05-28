# Python 타입 힌트 및 클래스 구조를 사용하여 엔터프라이즈급 무결성 확보
from typing import Dict, List, Optional
import json
import re

# --- Type Definitions (유효한 리스크 데이터의 형태 정의) ---
class ThreatAttribute:
    """온톨로지 기반의 표준화된 위협 속성을 담는 클래스."""
    def __init__(self, threat_name: str, severity: float, impact_area: str):
        self.threat_name = threat_name  # 예: PII 유출, 규정 미준수
        self.severity = severity        # 0.0 ~ 1.0 (위협 심각도)
        self.impact_area = impact_area  # 예: 데이터 프라이버시, 운영 리스크

class RiskScoreCalculationInput:
    """API로 들어올 모든 종류의 원시(Raw) 입력 데이터를 담는 구조체."""
    def __init__(self, structured_data: List[ThreatAttribute], unstructured_text: Optional[str] = None):
        self.structured_data = structured_data # Researcher가 정리한 온톨로지 데이터
        self.unstructured_text = unstructured_text # 외부에서 수집된 비정형 텍스트 (뉴스, 보고서 등)

# --- Core Service Class ---
class RiskScoringService:
    """
    위협 속성 및 비표준 데이터를 종합하여 최종 시스템적 리스크 점수를 산출하는 코어 서비스.
    [원칙] 모든 외부 입력은 유효성 검사(Validation)를 거쳐야 합니다.
    """

    def __init__(self):
        # 내부 상태 관리가 필요할 경우 여기에 초기화 로직 추가 가능
        pass

    def process_unstructured_data(self, text: str) -> float:
        """
        비표준 텍스트에서 위험 키워드를 추출하고 임시 점수(Temporary Score)를 계산합니다.
        [진단] 이 함수는 가장 먼저 구현되어야 할 '비표준 데이터 처리 모듈'입니다.
        실제 환경에서는 BERT/GPT 등 LLM 기반의 엔티티 인식 처리가 필요하나, 여기서는 Regex와 키워드 매칭으로 대체합니다.
        """
        if not text:
            return 0.0

        # 예시 위험 키워드 패턴 (정규식 활용)
        risk_keywords = r"(PII|GDPR|CCPA|민감정보|유출|미준수|위험)"
        matches = re.findall(risk_keywords, text, re.IGNORECASE)

        # 매칭된 키워드 개수에 따라 점수를 부여 (간단한 가중치 모델)
        temporary_score = len(set(m.upper() for m in matches)) * 0.15
        
        print(f"DEBUG: Unstructured text processed. Found {len(matches)} risk keywords. Temporary Score contribution: {temporary_score:.2f}")
        return temporary_score

    def calculate_risk_score(self, input_data: RiskScoreCalculationInput) -> Dict[str, float]:
        """
        최종 리스크 점수 산출의 통합 로직을 실행합니다. 
        KPI (TRE, PIG, ARS...)가 반영되어야 하는 핵심 메소드입니다.
        """
        if not input_data.structured_data:
            print("WARNING: Structured data is missing. Cannot calculate robust risk score.")
            return {"overall_score": 0.0}

        # 1. 구조화된 데이터 기반의 기여도 합산 (핵심)
        total_structured_risk = 0.0
        for attribute in input_data.structured_data:
            # 가중치 로직 예시: Severity * ImpactArea Score
            contribution = attribute.severity * (1 + len(attribute.impact_area)) / 2.0
            total_structured_risk += contribution

        # 2. 비표준 데이터 처리 모듈 적용 및 점수 추가
        unstructured_contribution = self.process_unstructured_data(input_data.unstructured_text)

        # 3. 최종 종합 점수 계산 (가중치 부여)
        # 구조적 위험이 주도하고, 비표준 데이터는 보조적 역할을 합니다.
        final_score = (total_structured_risk * 0.7) + (unstructured_contribution * 0.3)

        return {
            "overall_score": round(final_score, 4), # 최종 점수
            "structured_component_score": round(total_structured_risk, 4),
            "unstructured_component_score": round(unstructured_contribution, 4)
        }

# --- 예시 사용 (Test Bed) ---
if __name__ == "__main__":
    print("--- Running RiskScoringService Test ---")
    service = RiskScoringService()

    # [Scenario 1: 온톨로지 데이터만 있는 경우]
    structured_list_safe = [
        ThreatAttribute("데이터 보관 기간 미준수", 0.4, "GDPR"),
        ThreatAttribute("권한 분리 원칙 위반", 0.7, "운영 리스크")
    ]
    input_1 = RiskScoreCalculationInput(structured_data=structured_list_safe)
    score_1 = service.calculate_risk_score(input_1)
    print(f"\n[Test Case 1: Structured Only] Calculated Score: {score_1['overall_score']:.4f}")

    # [Scenario 2: 온톨로지 데이터 + 비표준 텍스트가 있는 경우 (실제 목표)]
    structured_list_risky = [
        ThreatAttribute("PII 유출 위험", 0.9, "데이터 프라이버시"), # 높은 위협도
        ThreatAttribute("암호화 미적용", 0.6, "기술 리스크")
    ]
    unstructured_text_example = "최근 시장 보고서에 따르면 PII 유출 위험과 GDPR 규정 준수 여부가 핵심적인 법규 위반 사례로 지목되었습니다."
    input_2 = RiskScoreCalculationInput(structured_data=structured_list_risky, unstructured_text=unstructured_text_example)
    score_2 = service.calculate_risk_score(input_2)
    print(f"\n[Test Case 2: Full Integration] Calculated Score: {score_2['overall_score']:.4f}")

    # [Scenario 3: 데이터가 아예 없는 경우 (에러 핸들링 검증)]
    input_3 = RiskScoreCalculationInput(structured_data=[], unstructured_text="무의미한 텍스트")
    score_3 = service.calculate_risk_score(input_3)
    print(f"\n[Test Case 3: Empty Data] Calculated Score: {score_3['overall_score']:.4f}")