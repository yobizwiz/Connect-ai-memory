import random
from typing import Dict, Any, List

class DiagnosisResult:
    """진단 결과 구조체 (JSON 반환 포맷 정의)"""
    def __init__(self, tre_score: float, compliance_gaps: List[str], summary_report: str):
        self.tre_score = round(tre_score, 2)  # 최대 잠재 손실액 점수 (TRE Score)
        self.compliance_gaps = compliance_gaps # 발견된 주요 미준수 영역 리스트
        self.summary_report = summary_report

    def to_dict(self) -> Dict[str, Any]:
        """API 응답용 딕셔너리 변환"""
        return {
            "risk_score_tre": self.tre_score,
            "status": "WARNING", # Red Zone Alert를 시뮬레이션하는 상태
            "major_compliance_gaps": self.compliance_gaps,
            "recommendation_summary": f"{self.summary_report}. 지금 즉시 전문 컨설팅을 받아야 합니다."
        }

def calculate_lmax(company_size: int, data_storage_years: int) -> float:
    """
    [CORE LOGIC] $L_{max}$ (Maximum Potential Loss)를 계산하는 핵심 서비스 함수.
    
    *주의*: 현재는 Mock 데이터와 단순 수학 모델을 사용합니다. 실제 구현 시 Researcher가 제공한 
    글로벌 규제 법률 조항 기반의 복잡한 가중치 모델(Weighted Formula)로 교체해야 합니다.
    """
    # 운영 공백 기회비용 (C_OP) 계산에 규모와 보존 기간을 반영하여 페널티 부과
    base_risk = 1000 + (company_size * 5) + (data_storage_years * 3)
    
    # 랜덤하게 심각한 위험 요소를 추가하여 경고 효과 극대화
    random_multiplier = random.uniform(1.2, 1.8)
    lmax = base_risk * random_multiplier

    return lmax

def run_system_diagnosis(company_size: int, data_storage_years: int, is_using_ai: bool) -> DiagnosisResult:
    """
    시스템 진단 로직을 실행하고 결과를 반환합니다.
    
    Args:
        company_size: 고객사 규모 (예: 직원 수).
        data_storage_years: 데이터 보존 기간 (년).
        is_using_ai: AI 기술 사용 여부 (규제 리스크 가중치에 영향).

    Returns:
        DiagnosisResult 객체.
    """
    print("--- [SYSTEM DIAGNOSTICS]: Starting Lmax Calculation ---")
    if company_size <= 0 or data_storage_years < 1:
        raise ValueError("진단 요청을 위한 필수 입력값(규모, 보존 기간)이 유효하지 않습니다.")

    # 1. $L_{max}$ 계산 (재무적 공포 기반)
    lmax = calculate_lmax(company_size, data_storage_years)

    # 2. 주요 미준수 영역 분석 (Mock Logic)
    gaps: List[str] = []
    if not is_using_ai: # AI 사용 여부와 무관하게 필수 체크리스트 항목을 강제함
        gaps.append("✅ Attribution Crisis Check: 모든 LLM 결과물의 법적 근거(Case Law) 및 출처 명시가 누락됨.")
    
    if data_storage_years > 5: # 장기 보존 데이터는 항상 위험 요소임
        gaps.append("⚠️ Q-Day Readiness Check: 10년 이상 보존되는 PII 데이터에 대한 포워드 보안(PQC) 로드맵 부재.")

    if company_size > 50 and random.random() < 0.6: # 임의로 고위험군을 생성
        gaps.append("🚨 Compliance Drift Check: 자동화 워크플로우에서 발생 가능한 '시스템 거부 예외 케이스'에 대한 수동 검토 및 승인 게이트가 공식화되지 않았습니다.")

    # 3. 최종 보고서 요약 (Mandate Tone 유지)
    summary = f"진단 결과, 귀사의 운영 프로세스 공백(C_OP)으로 인해 최소 {round(lmax / 1000, 2)}k 이상의 잠재적 재정 손실이 예측됩니다. 즉각적인 외부 진단 및 시스템 보강이 필수입니다."

    return DiagnosisResult(
        tre_score=lmax,
        compliance_gaps=list(set(gaps)), # 중복 제거
        summary_report=summary
    )

# 예시 테스트 (자체 검증용)
if __name__ == "__main__":
    try:
        result = run_system_diagnosis(company_size=150, data_storage_years=7, is_using_ai=True)
        print("\n--- [Mock Test Result] ---")
        print("TRE Score:", result.tre_score)
        print("Gaps Found:", len(result.compliance_gaps))
    except ValueError as e:
        print(f"Error during test: {e}")