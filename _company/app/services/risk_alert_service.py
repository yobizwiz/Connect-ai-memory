from datetime import datetime
from typing import List
# 🚨 절대 경로 사용 규칙 준수: 위에서 만든 모델 임포트
from app.models.live_alert import LiveAlertData, RiskCaseStudy

class RiskAlertService:
    """
    Live Risk Alert 모듈의 핵심 비즈니스 로직을 담당하는 서비스 클래스.
    최고 위험도(Lmax) 데이터를 기반으로 경고 상태를 결정하고 데이터를 가공합니다.
    """

    def __init__(self):
        # 초기화 시점에는 빈 상태로 시작하며, 외부 데이터 호출에 의존함.
        pass

    @staticmethod
    def _mock_fetch_risk_data() -> List[dict]:
        """
        [Mock] 실제 DB 또는 API에서 데이터를 가져오는 것을 시뮬레이션합니다.
        Writer와 Researcher의 자료를 결합하여 고위험 시나리오로 가공했습니다.
        """
        return [
            {
                "case_id": "AI_PROV_2026",
                "violation_law": "EU AI Act",
                "focus": "데이터 출처 및 의사결정 과정의 불명확성 (Lack of Audit Trail)",
                "estimated_max_fine_lmax": "최대 €70M+",
                "impact_focus": "법적 준전문가 책임 증대. 시스템 투명성 부재에 대한 처벌.",
                "severity_score": 95.0, # 최고 위험도 부여
                "source_note": "Proven Model/AI Act Trend"
            },
            {
                "case_id": "DATA_BREACH_2023",
                "violation_law": "GDPR (General Data Protection Regulation)",
                "focus": "국경 간 데이터 전송 흐름 단절 및 미준수.",
                "estimated_max_fine_lmax": "최소 4%에 달하는 월 매출액($$)",
                "impact_focus": "운영 정지, 시장 퇴출 위협. 데이터 주권 침해.",
                "severity_score": 88.0,
                "source_note": "Industry Standard/GDPR Breach"
            },
            {
                "case_id": "INTEGRITY_FAIL",
                "violation_law": "내부 감사 규정 (Internal Audit Mandate)",
                "focus": "위변조 방지 감사 로그(SHA-256 원장) 부재.",
                "estimated_max_fine_lmax": "$XX,XXX부터 시작하는 소송 비용",
                "impact_focus": "증거 불충분으로 인한 신뢰도 붕괴. 무방비 상태.",
                "severity_score": 75.0,
                "source_note": "Writer Hook/Trust Failure"
            }
        ]

    def get_live_risk_alert(self) -> LiveAlertData:
        """
        실시간 리스크 데이터를 가져와 가공하고, 가장 높은 위험도의 경고를 반환합니다.
        이 메서드는 모든 Attention Point의 Single Source of Truth가 됩니다.
        """
        raw_data = self._mock_fetch_risk_data()

        # 1. 최고 심각도(Lmax) 기반으로 Primary Risk 선정 (가장 높은 score)
        highest_risk = max(raw_data, key=lambda x: x["severity_score"])
        
        # 2. 경고 레벨 및 메인 타이틀 설정
        alert_level = "CRITICAL" if highest_risk["severity_score"] >= 85 else "WARNING"
        primary_title = f"🚨 [경고] {highest_risk['violation_law']} 위반: 데이터 투명성 확보가 생존의 문제입니다."
        
        # 3. 하위 위험 목록 구성 (상위 N개)
        sorted_risks = sorted(raw_data, key=lambda x: x["severity_score"], reverse=True)[:2]
        secondary_risks = [RiskCaseStudy(**r) for r in sorted_risks if r['case_id'] != highest_risk['case_id']]

        # 4. 최종 아웃풋 객체 생성 (데이터 무결성 보장)
        return LiveAlertData(
            timestamp=datetime.now(),
            alert_level=alert_level,
            primary_risk_title=primary_title,
            secondary_risks=secondary_risks,
            suggested_action="yobizwiz의 Immutable Audit Log Ledger를 즉시 통합하여 시스템 무결성을 확보하십시오.",
            visual_direction_hint="Glitch Noise / Neon Red Flashing (Timecode: 0:05-0:15)"
        )

# ======================================================
# 테스트용 엔드포인트 시뮬레이션 (FastAPI Mockup)
# ======================================================
def simulate_api_call():
    """실제 FastAPI 환경에서 호출될 것으로 예상되는 함수입니다."""
    service = RiskAlertService()
    return service.get_live_risk_alert()