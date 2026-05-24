import random
from typing import Dict, Any, List
from dataclasses import dataclass, field

# --- Data Structures for Type Safety and Readability ---

@dataclass
class RiskItem:
    """미해결 리스크 하나를 담는 데이터 클래스."""
    title: str      # 리스크 제목 (e.g., '규제 미준수')
    description: str # 상세 설명
    risk_type: str  # 법적, 운영, 재무 등 분류
    impact_score: int # 개별 위협 점수 (1~10)
    estimated_cost: float # 예상 해결 비용 ($)

@dataclass
class ComplianceReport:
    """최종 산출물인 컴플라이언스 보고서 구조."""
    overall_threat_level: str  # Red, Yellow, Green
    integrated_score: int       # 최종 통합 위협 지수 (0~100)
    total_unresolved_risk: List[RiskItem] # 요약된 리스크 목록
    total_estimated_cost: float # 모든 리스크 해결에 필요한 총 비용

class ComplianceEngine:
    """
    yobizwiz의 핵심 비즈니스 로직 엔진. 
    원시 데이터를 받아 '시스템적 생존 위협'을 판별하는 역할을 수행합니다.
    [근거: Self-RAG, 🏢 회사 정체성]
    """

    def __init__(self):
        # 가중치 정의 (Weighting Logic)
        self._weights = {
            "Regulatory": 0.4,  # 법적 리스크가 가장 중요함
            "Operational": 0.3, # 운영 비효율도 중요하지만 법적보다 낮음
            "Financial": 0.2     # 재무 손실은 결과물로 사용됨
        }

    def _calculate_threat_score(self, risk_data: List[RiskItem]) -> int:
        """
        주어진 리스크 목록을 바탕으로 가중치를 적용하여 통합 위협 점수를 계산합니다.
        단순 합산이 아닌, 비즈니스 우선순위를 반영해야 합니다. [근거: 💻 코다리 개인 메모리]
        """
        total_score = 0
        for risk in risk_data:
            # 리스크 유형에 따라 가중치를 다르게 적용
            weight = self._weights.get(risk.risk_type, 0.1)
            # 점수는 (Impact Score * Weight * 25)를 통해 조정됨. 최대치는 100 내외로 제한.
            score_contribution = int(risk.impact_score * weight * 25 + random.randint(-3, 3))
            total_score += max(0, score_contribution)

        # 점수가 너무 높거나 낮지 않도록 클리핑 (0 ~ 100 범위 유지)
        return min(100, max(0, total_score))

    def _determine_threat_level(self, score: int) -> str:
        """통합 점수에 따라 사용자에게 보여줄 위협 레벨을 결정합니다."""
        if score >= 75:
            return "Red Zone (Critical)" # 공포 자극 최고치
        elif score >= 40:
            return "Yellow Alert (High Risk)"
        else:
            return "Green Status (Low Risk/Monitoring)"

    def analyze_compliance(self, raw_data: Dict[str, Any]) -> ComplianceReport:
        """
        [MVP 메인 엔드포인트] 전체 컴플라이언스 분석을 실행하는 핵심 메서드.
        1. 리스크 목록 생성 및 필터링 (Unresolved Risk)
        2. 위협 점수 계산 (Threat Score Calculation)
        3. 최종 보고서 구조화 및 반환
        """
        print(f"--- Compliance Engine: Analysis Initiated for {raw_data.get('company_name', 'Client')} ---")

        # 1. 리스크 데이터 가공 및 필터링 (MVP 시뮬레이션)
        unresolved_risks: List[RiskItem] = []
        for r in raw_data.get("potential_risks", []):
            if r.get("is_critical", True) and r.get("impact", 0) >= 6:
                # 데이터 구조에 맞춰 RiskItem 객체로 변환 및 추가
                risk = RiskItem(
                    title=r["name"],
                    description=r["detail"],
                    risk_type=r["category"],
                    impact_score=r["impact"],
                    estimated_cost=r["cost"]
                )
                unresolved_risks.append(risk)

        # 2. 위협 점수 계산 (핵심 로직 호출)
        integrated_score = self._calculate_threat_score(unresolved_risks)

        # 3. 최종 보고서 구조화 및 비용 집계
        total_cost = sum(r.estimated_cost for r in unresolved_risks)
        threat_level = self._determine_threat_level(integrated_score)

        report = ComplianceReport(
            overall_threat_level=threat_level,
            integrated_score=integrated_score,
            total_unresolved_risk=unresolved_risks,
            total_estimated_cost=total_cost
        )

        print("--- Analysis Complete. Report Generated Successfully. ---")
        return report

# --- Example Usage (Testing the flow) ---
if __name__ == '__main__':
    # 시뮬레이션용 원시 데이터 구조 (실제 DB/API 응답 형태를 가정)
    mock_raw_data = {
        "company_name": "Acme Corp",
        "industry": "FinTech",
        "potential_risks": [
            {"name": "GDPR Non-compliance", "detail": "데이터 저장 위치의 국가 법률 미반영 위험.", "category": "Regulatory", "impact": 9, "cost": 50000}, # Critical & High Impact
            {"name": "Outdated API Gateway", "detail": "구형 API 게이트웨이 사용으로 인한 보안 취약점 발생 가능성.", "category": "Operational", "impact": 7, "cost": 15000}, # Critical & Medium Impact
            {"name": "Low Staff Training Score", "detail": "직원들의 최신 규정 준수 교육 미흡. (Warning)", "category": "Operational", "impact": 3, "cost": 500} # Non-Critical
        ]
    }

    engine = ComplianceEngine()
    final_report = engine.analyze_compliance(mock_raw_data)

    print("\n===============================================")
    print("         🚨 최종 컴플라이언스 보고서 (MVP) 🚨")
    print("===============================================")
    print(f"위협 레벨: {final_report.overall_threat_level}")
    print(f"통합 위협 점수: {final_report.integrated_score}/100")
    print("-" * 50)

    print("\n[🚨 미해결 핵심 리스크 요약]")
    for i, risk in enumerate(final_report.total_unresolved_risk):
        print(f"\n[{i+1}] {risk.title} (유형: {risk.risk_type})")
        print(f"  - 설명: {risk.description}")
        print(f"  - 위협 점수: {risk.impact_score}/10, 예상 비용: ${int(risk.estimated_cost):,}")

    print("\n===============================================")
    print(f"💰 최종 해결 권고 총액 (Total Cost): ${int(final_report.total_estimated_cost):,}")
    print("===============================================")
#