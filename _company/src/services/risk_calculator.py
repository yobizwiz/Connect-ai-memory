from typing import Dict, Any, Tuple
import math

class DiagnosisResult:
    """위험 진단 결과를 구조화하여 반환하는 데이터 클래스."""
    def __init__(self, risk_score: float, status: str, severity_level: str):
        self.risk_score = round(risk_score, 2)
        self.status = status  # 예: 'Critical', 'Warning', 'Safe'
        self.severity_level = severity_level # 예: 'Red Zone', 'Yellow Zone', 'Green Zone'

    def to_dict(self) -> Dict[str, Any]:
        return {
            "risk_score": self.risk_score,
            "status": self.status,
            "severity_level": self.severity_level
        }

def calculate_systemic_risk(
    initial_threat_score: float, 
    user_input_data: Dict[str, Any], 
    psychological_pressure_intensity: float
) -> DiagnosisResult:
    """
    시스템적 위험 점수를 계산하는 핵심 비즈니스 로직.
    이 함수는 외부 입력에 의존하지 않는 순수 함수여야 하며, 모든 비즈니스 규칙을 포함합니다.
    (원칙: Single Responsibility Principle - 오로지 계산만 담당)
    """
    # 1. 구조적 결함 가중치 추출 (핵심 로직)
    # 사용자가 제출한 데이터 중 '결함' 키워드를 찾아가중치를 부여합니다.
    structural_defect_weight = 0.0
    if user_input_data and isinstance(user_input_data, dict):
        for key, value in user_input_data.items():
            # 예: '규정 미준수', '사일로 구조' 등 공포 키워드가 포함된 경우 높은 가중치 부여
            if "결함" in str(key) or "미준수" in str(value) or "위협" in str(value):
                structural_defect_weight += 0.3 # 결함 발견 시 최소 30% 리스크 증가

    # 2. 복합 위험 점수 계산 (압박감 * 초기 위협 * 결함 가중치 계수)
    # 이 공식은 '시간적 압박'이 가장 큰 영향을 미친다는 비즈니스 가설에 기반합니다.
    risk_multiplier = max(1.0, psychological_pressure_intensity / 2.0) # 압박감이 낮으면 최소 1배 적용
    calculated_score = (initial_threat_score * risk_multiplier * (1 + structural_defect_weight))

    # 3. 위험 상태 판정 및 라벨링
    if calculated_score >= 85:
        status = "Critical"
        severity_level = "Red Zone - IMMEDIATE ACTION REQUIRED"
    elif calculated_score >= 60:
        status = "Warning"
        severity_level = "Yellow Zone - STRUCTURAL REVIEW RECOMMENDED"
    else:
        status = "Safe"
        severity_level = "Green Zone - MONITORING OK"

    return DiagnosisResult(calculated_score, status, severity_level)

# 테스트용 더미 데이터 구조 (실제로는 API Gateway에서 JSON으로 전달될 것임)
DUMMY_INPUTS = {
    "data_field_1": 0.8, # 예: 내부 프로세스 비효율성 지표
    "structural_defect_flag": True, # 결함 여부 플래그
    "time_pressure_index": 0.9 # 시간적 압박 정도 (0.0 ~ 1.0)
}