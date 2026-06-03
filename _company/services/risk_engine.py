import json
import time
import sys
import os
from typing import Dict, List, Any

# Self-Healing 모듈 임포트
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from _shared import self_healing, classify_error, HealingLogger
from _shared.error_classifier import ErrorCategory

# 시스템 메모리에 있는 구조화된 리스크 데이터를 불러옵니다.
LMAX_DATA_PATH = "c:\\Users\\jinoh\\Desktop\\Connect AI\\_company\\KnowledgeBase\\Quantifiable_Risk_Scenarios_Lmax.json"
# 대체 경로 (Alternative Path 전략)
LMAX_DATA_ALT_PATHS = [
    "c:\\Users\\jinoh\\Desktop\\Connect AI\\_company\\KnowledgeBase\\Lmax_Test_Vectors_Compliance_2026-06-03.json",
    "c:\\Users\\jinoh\\Desktop\\Connect AI\\_company\\data\\risk_scenarios_backup.json",
]

_healing_logger = HealingLogger()

# 스키마 파일에서 정의한 입력 모델을 임포트 (실제 프로젝트에서는 경로 조정 필요)
try:
    from ..schemas.risk_input_schema import UserProfileInput, RiskReportOutput
except ImportError:
    print("⚠️ Warning: Could not import schemas. Ensure relative paths are correct.")


class ThreatGaugeEngine:
    """
    Threat Gauge API의 핵심 로직을 담당하는 엔진 클래스.
    사용자 입력 데이터 기반으로 리스크 점수와 L_max를 계산합니다.

    Self-Healing 기능:
    - 파일 로드 실패 시 대체 경로 탐색 + 캐시 fallback
    - 계산 오류 시 안전한 기본값 반환
    """

    def __init__(self, lmax_data_path: str = LMAX_DATA_PATH):
        print("✅ ThreatGaugeEngine 초기화 중... L_max 데이터를 로드합니다.")
        self._lmax_data = self._load_lmax_data_with_healing(lmax_data_path)
        self._lmax_cache = self._lmax_data.copy() if self._lmax_data else {}
        # 임계값 설정 (예시: TRE 점수 70 이상을 Red Zone으로 간주)
        self.RED_ZONE_THRESHOLD = 70.0

    def _load_lmax_data_with_healing(self, path: str) -> Dict[str, Any]:
        """
        L_max 데이터를 로드합니다. 실패 시 자가 복구 전략을 실행합니다.

        복구 전략:
        1. 기본 경로에서 로드 시도
        2. 실패 → 대체 경로들에서 순차 로드 시도 (Alternative Path)
        3. 모든 경로 실패 → 빈 기본값 구조 반환 (Graceful Degradation)
        """
        # 1차 시도: 기본 경로
        try:
            data = self._load_json_file(path)
            if data:
                _healing_logger.log_recovery(
                    service="ThreatGaugeEngine",
                    error_type="None",
                    action="primary_load_success",
                    result="success",
                    recovery_time_ms=0,
                )
                return data
        except (FileNotFoundError, json.JSONDecodeError, ValueError) as e:
            _healing_logger.log_error(
                service="ThreatGaugeEngine",
                error=e,
                classification=classify_error(e),
                attempt=1,
            )

        # 2차 시도: 대체 경로 탐색
        for i, alt_path in enumerate(LMAX_DATA_ALT_PATHS):
            try:
                data = self._load_json_file(alt_path)
                if data:
                    _healing_logger.log_recovery(
                        service="ThreatGaugeEngine",
                        error_type="FileNotFoundError",
                        action=f"alternative_path_{i + 1}",
                        result="success",
                        recovery_time_ms=0,
                        details={"alt_path": alt_path}
                    )
                    print(f"🔄 대체 경로에서 L_max 데이터 로드 성공: {alt_path}")
                    return data
            except Exception:
                continue

        # 3차: 모든 시도 실패 → 안전한 기본 데이터 반환
        _healing_logger.log_recovery(
            service="ThreatGaugeEngine",
            error_type="FileNotFoundError",
            action="fallback_to_default_schema",
            result="degraded",
            recovery_time_ms=0,
        )
        print("⚠️ 모든 L_max 데이터 로드 실패. 안전한 기본 스키마를 사용합니다.")
        return self._get_safe_default_data()

    def _load_json_file(self, path: str) -> Dict[str, Any]:
        """단일 JSON 파일 로드 (에러 발생 시 전파)."""
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"✅ L_max 데이터 로딩 성공: {path}")
        return data

    @staticmethod
    def _get_safe_default_data() -> Dict[str, Any]:
        """모든 데이터 로드가 실패했을 때 사용할 안전한 기본 구조."""
        return {
            "risk_scenarios": [
                {
                    "scenario_id": "DEFAULT_SAFE",
                    "litigation_cost_estimate": 500000,
                    "operational_loss_estimate": 1000000,
                    "description": "자가 복구에 의해 생성된 기본 시나리오"
                }
            ],
            "_is_fallback": True,
        }

    @self_healing(
        max_retries=2,
        fallback_value=None,
        service_name="ThreatGaugeEngine.calculate_risk_report",
    )
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

            # 성공 결과를 캐시에 저장 (다음 실패 시 fallback용)
            self._last_successful_report = report
            return report

        except Exception as e:
            classification = classify_error(e)

            _healing_logger.log_error(
                service="ThreatGaugeEngine.calculate_risk_report",
                error=e,
                classification=classification,
            )

            # DEGRADABLE: 마지막 성공 결과가 있으면 캐시 반환
            if hasattr(self, '_last_successful_report') and self._last_successful_report:
                _healing_logger.log_recovery(
                    service="ThreatGaugeEngine.calculate_risk_report",
                    error_type=type(e).__name__,
                    action="fallback_to_cached_report",
                    result="degraded",
                    recovery_time_ms=0,
                )
                return self._last_successful_report

            # 최종 방어: 안전한 기본 보고서 반환
            _healing_logger.log_recovery(
                service="ThreatGaugeEngine.calculate_risk_report",
                error_type=type(e).__name__,
                action="fallback_to_safe_default",
                result="degraded",
                recovery_time_ms=0,
            )
            return RiskReportOutput(
                risk_score_tre=0.0,
                is_red_zone=False,
                estimated_lmax_usd=0.0,
                threat_messages=[{
                    "message": f"⚠️ 자가 복구 완료: {type(e).__name__} 에러 발생 후 안전한 기본값을 반환합니다.",
                    "was_self_healed": True,
                }],
                status_code="SelfHealed"
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
        import math
        employee_score = WEIGHTS["employee_scale"] * (1 + math.sqrt(min(10, data.employee_count) / 10))

        tre_score = compliance_score + industry_score + data_score + employee_score

        # --- L_max Calculation (Mock: Scenario based on high risk factors) ---
        total_lmax = 0.0
        try:
            if not data.has_compliance_audit:
                # 감사 이력 부재 시, 가장 치명적인 규제 리스크를 곱함
                total_lmax += self._lmax_data["risk_scenarios"][0]["litigation_cost_estimate"] * 1.5

            if data.industry == "금융" and data.employee_count > 100:
                 # 금융권 대규모 기업은 운영 중단 비용이 매우 높음
                total_lmax += self._lmax_data["risk_scenarios"][0].get(
                    "operational_loss_estimate",
                    self._lmax_data["risk_scenarios"][0].get("litigation_cost_estimate", 1000000)
                ) * (data.employee_count / 50)
        except (KeyError, IndexError) as e:
            # 데이터 구조 불일치 시 자가 복구: 안전한 기본 Lmax 사용
            _healing_logger.log_recovery(
                service="ThreatGaugeEngine._calculate_tre_and_lmax",
                error_type=type(e).__name__,
                action="lmax_data_key_fallback",
                result="degraded",
                recovery_time_ms=0,
            )
            total_lmax = 500000.0  # 안전한 기본값

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