from typing import Dict, Any, List
from ..models import UserProfileData, RegulationRiskScore, RiskMetricsOutput

class RiskEngineService:
    """
    규제 준수 기반의 위험 노출도(TRE)를 계산하는 핵심 비즈니스 로직 서비스입니다. 
    모든 리스크 계산은 이 클래스 내에서 독립적으로 수행되어야 합니다. (SRP 원칙 적용)
    """
    def __init__(self):
        # 규제별 가중치 및 페널티 정의 (가장 중요한 지식 베이스)
        self.REGULATION_WEIGHTS = {
            "GDPR": {"weight": 0.35, "penalty_base": 20}, # 유럽 사용자 데이터 관련 높은 중요도
            "CCPA": {"weight": 0.25, "penalty_base": 15}, # 캘리포니아 거주자 개인정보 보호
            "HIPAA": {"weight": 0.30, "penalty_base": 30}, # 의료 정보 (PHI) 처리의 치명적 리스크
        }

    def calculate_risk(self, profile: dict) -> RiskMetricsOutput:
        """
        주어진 사용자 프로필 데이터를 기반으로 모든 규제에 대한 위험을 계산하고 집계합니다.
        """
        # 1. 초기화 변수 설정
        total_score = 0.0
        violation_list: List[RegulationRiskScore] = []

        # 2. 데이터 유효성 검증 (Guard Clause)
        if not profile or "data_type_inventory" not in profile:
            raise ValueError("Profile data is missing required inventory information.")

        # 3. 규제별 리스크 계산 루프
        for reg, weights in self.REGULATION_WEIGHTS.items():
            score = self._calculate_single_regulation(reg, weights, profile)
            violation_list.append(RegulationRiskScore(
                regulation=reg, 
                score=round(score, 2), 
                violation_details=f"위반 항목: {profile.get('data_storage_location', ['N/A'])[0]}에 '{reg}' 관련 데이터가 존재하나, 동의 여부: {profile['has_consent'].get(reg, 'UNKNOWN')}"
            ))
            total_score += score * weights["weight"] # 가중 평균으로 총점 계산

        # 4. 최종 결과 반환 (Pydantic 모델 사용)
        return RiskMetricsOutput(
            total_risk_exposure(TRE)=round(total_score, 2),
            violation_count=sum([1 for r in violation_list if r.score > 0]), # 점수가 0보다 높으면 위반으로 카운트
            risk_scores=violation_list
        )

    def _calculate_single_regulation(self, reg: str, weights: Dict[str, float], profile: dict) -> float:
        """
        단일 규제에 대한 점수를 계산하는 private helper method.
        이 부분이 모든 비즈니스 로직의 심장이므로 가장 신중해야 합니다.
        """
        score = 0.0
        base_penalty = weights['penalty_base']

        # A. 동의 여부 체크 (가장 강력한 변수)
        has_consent = profile.get('has_consent', {}).get(reg, False)
        if not has_consent:
            score += base_penalty * 0.4 # 기본 점수의 40% 할당

        # B. 데이터 유형 인벤토리 체크 (PHI/PII 등 고위험 데이터 유무)
        data_inventory = profile.get('data_type_inventory', {})
        if "PHI" in data_inventory and data_inventory["PHI"] > 0: # 의료 정보 존재 시 높은 가중치 부여
            score += base_penalty * 0.35

        # C. 저장 위치 검증 (데이터 거버넌스)
        storage_locations = profile.get('data_storage_location', [])
        if "온프레미스" in storage_locations and reg == "GDPR": # 온프레미스에 GDPR 데이터가 있을 때 리스크 증폭 가정
            score += base_penalty * 0.25

        # 최종 점수 조정 및 클리핑 (Score must be between 0 and 100)
        final_score = min(100.0, max(0.0, score))
        return final_score