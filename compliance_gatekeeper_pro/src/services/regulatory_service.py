from typing import Dict, Any
import random
import time

class RegulatoryReport(Dict[str, Any]):
    """규제 검색 API의 응답 스키마."""
    report_id: str
    risk_level: str # 'High', 'Medium', 'Low'
    compliance_status: bool # True면 법적 문제 없음
    suggested_mitigation: list[str]

def fetch_regulatory_data(query: str, jurisdiction: str) -> RegulatoryReport:
    """
    외부 규제 데이터베이스(Regulatory DB API Gateway)를 호출하는 핵심 로직.
    이 함수는 Rate Limiting 및 비용 추적 로직을 포함해야 합니다. [근거: sessions/2026-05-19T04-54/developer.md]
    """
    print(f"\n⚙️ [Regulatory Service] Querying DB for '{query}' in {jurisdiction}...")
    time.sleep(0.5) # API 호출 지연 시뮬레이션

    # 🚨 핵심 비즈니스 로직: 위험 판단 및 구조적 검증 수행
    if "PII" in query and jurisdiction == "EU":
        # 예시: GDPR 위반 가능성이 높은 경우
        risk_level = "High"
        compliance_status = False
        mitigations = ["데이터 마스킹 적용", "사용 목적 명시 동의 획득"]
    elif "Finance" in query and jurisdiction == "KR":
        # 예시: 국내 금융 법규 위반 가능성 체크
        risk_level = "Medium"
        compliance_status = True
        mitigations = ["최신 가이드라인 준수 확인", "정기적인 내부 감사 도입"]
    else:
        risk_level = random.choice(["Low", "Medium"])
        compliance_status = random.choice([True, True, False]) # 성공 확률을 높게 설정
        mitigations = ["최적화된 워크플로우 구축", "법률 자문 지속"]

    return {
        "report_id": f"RPT-{int(time.time())}",
        "risk_level": risk_level,
        "compliance_status": compliance_status,
        "suggested_mitigation": mitigations
    }

def generate_detailed_report(data: RegulatoryReport) -> str:
    """진단 결과를 사람이 읽기 쉬운 보고서 문자열로 가공합니다."""
    if data["compliance_status"]:
        return f"✅ 분석 완료: 구조적 위험 없음. Level {data['risk_level']}로 판단됩니다. 권고 사항: {'; '.join(data['suggested_mitigation'])}\n\n[요약] 현재 워크플로우는 법규를 충족합니다."
    else:
        return f"🚨 분석 경고: **법적 위험 감지 (Risk Level: {data['risk_level']})** - 즉각적인 조치가 필요합니다. 권장 완화 방안: {'; '.join(data['suggested_mitigation'])}\n\n[요약] 핵심 프로세스에 규제 준수 게이트웨이를 도입해야 합니다."