import json
from typing import Dict, List, Any
# 시스템 메모리에 있는 구조화된 리스크 데이터를 불러옵니다.
LMAX_DATA_PATH = "c:\\Users\\jinoh\\Desktop\\Connect AI\\_company\\KnowledgeBase\\Quantifiable_Risk_Scenarios_Lmax.json"

# 스키마 파일에서 정의한 입력 모델을 임포트 (실제 프로젝트에서는 경로 조정 필요)
try:
    from ..schemas.risk_input_schema import UserProfileInput, RiskReportOutput
except ImportError:
    print("⚠️ Warning: Could not import schemas. Ensure relative paths are correct.")


class ThreatGaugeEngine:
    """
    Threat Gauge API의 핵심 로직을 담당하는 엔진 클래스.
    사용자 입력 데이터 기반으로 리스크 점수와 L_max를 계산합니다.
    """

    def __init__(self, lmax_data_path: str = LMAX_DATA_PATH):
        print("✅ ThreatGaugeEngine 초기화 중... L_max 데이터를 로드합니다.")
        self._lmax_data = self._load_lmax_data(lmax_data_path)
        # 임계값 설정 (예시: TRE 점수 70 이상을 Red Zone으로 간주)
        self.RED_ZONE_THRESHOLD = 70.0

    def _load_lmax_data(self, path: str) -> Dict[str, Any]:
        """L_max 데이터셋 파일을 로드하고 구조적 유효성을 검사합니다."""
        try:
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            print("✅ L_max 데이터 로딩 성공. API 계산에 사용됩니다.")
            return data
        except FileNotFoundError:
            raise FileNotFoundError(f"🚨 Critical Error: L_max 데이터 파일을 찾을 수 없습니다. 경로 확인 필요: {path}")
        except json.JSONDecodeError as e:
            raise ValueError(f"🚨 Data Schema Error: JSON 파싱 오류 발생. 구조를 재검토해야 합니다. ({e})")

    def calculate_risk_report(self, user_data: dict) -> RiskReportOutput:
        """
        사용자 데이터를 받아 리스크 점수와 잠재적 최대 손실액을 계산하고 보고서를 생성합니다.
        :param user_data: UserProfileInput 스키마에 맞는 딕셔너리 형태의 입력 데이터.
        :return: 완성된 RiskReportOutput 객체.
        """
        try:
            # [1] 타입 유효성 검사 및 표준화 (Defensive Programming)
            validated_user_data = UserProfileInput(**user_data)

            # [2] 리스크 점수(TRE) 계산 로직 시작
            tre_score, total_lmax = self._calculate_tre_and_lmax(validated_user_data)

            # [3] Red Zone 판단 및 메시지 생성
            is_red_zone = tre_score >= self.RED_ZONE_THRESHOLD
            status_code = "Red" if is_red_zone else ("Yellow" if tre_score >= 50 else "Green")
            threat_messages = self._generate_threat_messages(validated_user_data, total_lmax)

            # [4] 최종 보고서 객체 생성 및 반환
            report = RiskReportOutput(
                risk_score_tre=round(tre_score, 2),
                is_red_zone=is_red_zone,
                estimated_lmax_usd=round(total_lmax, 2),
                threat_messages=threat_messages,
                status_code=status_code
            )
            return report

        except Exception as e:
            # API 호출 실패 시 에러 핸들링 로직 (Root Cause를 사용자에게 숨기지 않음)
            print(f"🚨 [System Error] 리스크 보고서 생성 중 치명적 오류 발생: {e}")
            # 공통의 '실패' 응답 객체를 반환하여 호출자가 처리 가능하게 함
            return RiskReportOutput(
                risk_score_tre=0.0,
                is_red_zone=False,
                estimated_lmax_usd=0.0,
                threat_messages=[{"message": f"시스템 계산 오류 발생: {type(e).__name__} (내부 로그 확인 필요)"}],
                status_code="Error"
            )


    def _calculate_tre_and_lmax(self, data: UserProfileInput) -> tuple[float, float]:
        """TRE 점수와 L_max를 계산하는 핵심 비즈니스 로직 (Mockup)."""

        # 가중치 정의 (Weights are critical for business logic)
        WEIGHTS = {
            "compliance": 35.0, # 규정 준수 상태가 가장 중요함
            "industry": 25.0,   # 산업 리스크 등급 반영
            "data_volume": 15.0, # 데이터 볼륨 및 관리 복잡성
            "employee_scale": 15.0 # 인력 규모에 따른 운영 위험
        }

        # --- TRE Score Calculation (Mock Formula) ---
        # 1. 규정 준수 점수: 감사 이력이 없으면 큰 감점 부과
        compliance_score = WEIGHTS["compliance"] * (1.0 if data.has_compliance_audit else 0.3)

        # 2. 산업 리스크 반영 (Mock: 금융 > 의료 > 일반)
        industry_risk_factor = {"금융": 0.9, "의료": 0.7, "제조": 0.5}.get(data.industry, 0.4)
        industry_score = WEIGHTS["industry"] * industry_risk_factor

        # 3. 데이터 볼륨 가중치: 일정 기준 초과 시 급격히 증가 (Non-linear growth)
        data_score = WEIGHTS["data_volume"] * min(1.0, data.data_storage_size_tb / 5.0)

        # 4. 직원 규모에 따른 운영 위험 점수
        employee_score = WEIGHTS["employee_scale"] * (1 + math.sqrt(min(10, data.employee_count) / 10))

        tre_score = compliance_score + industry_score + data_score + employee_score

        # --- L_max Calculation (Mock: Scenario based on high risk factors) ---
        total_lmax = 0.0
        if not data.has_compliance_audit:
            # 감사 이력 부재 시, 가장 치명적인 규제 리스크를 곱함
            total_lmax += self._lmax_data["risk_scenarios"][0]["litigation_cost_estimate"] * 1.5 # HIPAA Leakage 기반 과대 반영

        if data.industry == "금융" and data.employee_count > 100:
             # 금융권 대규모 기업은 운영 중단 비용이 매우 높음
            total_lmax += self._lmax_data["risk_scenarios"][2]["operational_loss_estimate"] * (data.employee_count / 50)

        return tre_score, total_lmax


    def _generate_threat_messages(self, data: UserProfileInput, lmax: float) -> list[dict]:
        """위험 상태에 맞는 구체적이고 actionable한 위협 메시지를 생성합니다."""
        messages = []

        if not data.has_compliance_audit:
            messages.append({
                "threat": "규제 사각지대 노출 (Compliance Gap)",
                "severity": "High",
                "action": "즉시 전문 감사(Audit)를 통해 전사적 컴플라이언스 gap을 식별하고, Missing Controls 목록화가 필수입니다."
            })

        if data.industry == "금융" and lmax > 50_000_000:
             messages.append({
                "threat": "시스템 연속성 위협 (BCP Failure)",
                "severity": "Critical",
                "action": f"잠재적 손실액 ${int(lmax):,}을 막기 위해, 백업 및 복구 프로세스(DR/BCP)를 분기별로 테스트하고 최신화해야 합니다."
            })

        if data.data_storage_size_tb > 5:
             messages.append({
                "threat": "대용량 데이터 취약점 (Data Sovereignty)",
                "severity": "Medium",
                "action": "저장된 데이터의 지리적 위치(Sovereignty)와 접근 권한을 재검토하고, 최소한의 필수 정보만 보존하는 정책 수립이 시급합니다."
            })

        return messages

# --- 테스트용 실행 예시 (실제 API에서는 이 부분이 FastAPI 라우터가 담당) ---
if __name__ == '__main__':
    import math # 로직 내부에서 사용된 라이브러리 임포트 추가

    engine = ThreatGaugeEngine()

    print("\n======================================================")
    print("테스트 케이스 1: Red Zone (규정 미준수 + 금융권)")
    red_zone_data = {
        "industry": "금융",
        "employee_count": 250,
        "has_compliance_audit": False, # 핵심 실패 지점
        "data_storage_size_tb": 8.1
    }
    report_red = engine.calculate_risk_report(red_zone_data)
    print("\n[--- 결과 보고서 (Red Zone) ---]")
    print(json.dumps(report_red.dict(), indent=2))

    print("\n======================================================")
    print("테스트 케이스 2: Green Zone (준수하고 작은 회사)")
    green_zone_data = {
        "industry": "제조",
        "employee_count": 15,
        "has_compliance_audit": True,
        "data_storage_size_tb": 0.5
    }
    report_green = engine.calculate_risk_report(green_zone_data)
    print("\n[--- 결과 보고서 (Green Zone) ---]")
    print(json.dumps(report_green.dict(), indent=2))

    print("\n======================================================")
    print("테스트 케이스 3: Yellow Zone (일부 취약점 보유)")
    yellow_zone_data = {
        "industry": "의료",
        "employee_count": 80,
        "has_compliance_audit": True, # 감사 이력은 있음
        "data_storage_size_tb": 3.2 # 데이터 볼륨이 어느 정도 있는 경우
    }
    report_yellow = engine.calculate_risk_report(yellow_zone_data)
    print("\n[--- 결과 보고서 (Yellow Zone) ---]")
    print(json.dumps(report_yellow.dict(), indent=2))