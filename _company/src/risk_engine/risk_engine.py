import json
from typing import List, Dict, Any, TypedDict
import logging

# 로깅 설정 (디버깅 용이성 확보)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class RiskScenario(TypedDict):
    """Researcher가 제공한 하나의 위험 시나리오를 타입 정의."""
    ScenarioID: str
    ThreatCategory: str
    RiskDescription: str
    LegalBasis: Dict[str, str]
    QuantifiableLossModel: Dict[str, Any]

class RiskEngine:
    """
    AI 의료 진단 시스템의 구조적 리스크를 계산하는 엔진.
    Hyunbin이 정의한 L_max 및 Time Multiplier 공식을 적용한다.
    """
    def __init__(self):
        # 초기화 시, 모든 내부 상태는 클린하게 유지
        pass

    @staticmethod
    def _calculate_lmax(quantifiable_model: Dict[str, Any], global_revenue: float) -> float:
        """
        단일 리스크 모델을 바탕으로 L_max를 계산하는 순수 로직 함수.
        KeyError 방지 및 타입 안전성 확보가 핵심입니다.
        """
        try:
            # 1. 규제 벌금 (F): Global Revenue * 5%
            l_r_fine = global_revenue * 0.05

            # 2. 민사 배상 (D): N_Injured * $2M_{Avg. Malpractice}
            n_injured = quantifiable_model.get("N_Injured")
            if not isinstance(n_injured, int) or n_injured <= 0:
                l_r_dam = 0.0
            else:
                # 평균 의료 과실 비용 $2M (2,000,000) 적용
                avg_malpractice_cost = 2_000_000
                l_r_dam = n_injured * avg_malpractice_cost

            # L_max = F + D. 모든 손실액은 합산됩니다.
            total_lmax = l_r_fine + l_r_dam
            return round(total_lmax, 2)

        except Exception as e:
            logging.error(f"L_max 계산 중 예외 발생: {e}")
            # 치명적인 실패 시, 안전하게 0을 반환하여 시스템 오류를 막습니다 (Fallback).
            return 0.0


    def calculate_overall_risk(self, raw_json_data: Dict[str, Any], global_revenue: float) -> Dict[str, Any]:
        """
        전체 위험 JSON 데이터를 받아 종합적인 L_max를 계산하고 구조화합니다.

        Args:
            raw_json_data: Researcher가 제공한 전체 리스크 모델 데이터 딕셔너리.
            global_revenue: 회사의 총 글로벌 매출액 (L_r fine 계산용).

        Returns:
            계산된 위험 지표를 포함하는 JSON 구조의 딕셔너리.
        """
        if not isinstance(raw_json_data, dict):
             raise ValueError("입력 데이터가 유효한 JSON 형식 딕셔너리가 아닙니다.")

        report = {
            "ReportTitle": raw_json_data.get("ReportTitle", "Unknown Risk Report"),
            "GlobalRevenueUsed": global_revenue,
            "TotalCalculatedLmax": 0.0,
            "ScenarioBreakdown": []
        }

        # JSON 배열을 순회하며 각 시나리오의 L_max를 계산합니다.
        scenarios: List[RiskScenario] = raw_json_data.get("ViolationScenarios", [])

        if not scenarios:
            logging.warning("경고: 분석할 위험 시나리오가 발견되지 않았습니다.")
            return report

        cumulative_lmax = 0.0
        for scenario in scenarios:
            try:
                # 안전하게 QuantifiableLossModel을 추출합니다.
                quant_model = scenario.get("QuantifiableLossModel", {})
                
                if not quant_model or "N_Injured" not in quant_model:
                    logging.warning(f"시나리오 {scenario['ScenarioID']}: L_max 계산에 필요한 N_Injured 값이 누락되었습니다.")
                    lmax = 0.0
                else:
                    # 핵심 로직 호출
                    lmax = self._calculate_lmax(quant_model, global_revenue)
                
                # 결과 구조화 및 합산
                scenario_result = {
                    "ScenarioID": scenario["ScenarioID"],
                    "ThreatCategory": scenario["ThreatCategory"],
                    "DescriptionSummary": scenario["RiskDescription"][:50] + "...", # 50자 요약
                    "LmaxCalculated": lmax,
                    "TimeMultiplier_tau": scenario.get("QuantifiableLossModel", {}).get("TimeMultiplier_tau", "N/A")
                }
                report["ScenarioBreakdown"].append(scenario_result)
                cumulative_lmax += lmax

            except KeyError as e:
                logging.error(f"시나리오 처리 중 필수 키 누락 오류 발생 (키: {e}). 해당 시나리오는 건너뜁니다.")
            except Exception as e:
                logging.critical(f"예상치 못한 치명적 에러 발생: {type(e).__name__} - {e}")

        report["TotalCalculatedLmax"] = round(cumulative_lmax, 2)
        return report

# 테스트용 더미 데이터 로드 함수 (실제 환경에서는 외부 JSON 파일에서 로드해야 함)
def load_dummy_data() -> Dict[str, Any]:
    """테스트 실행을 위한 구조화된 더미 리스크 데이터를 반환합니다."""
    return {
      "ReportTitle": "AI 의료 진단 시스템의 시간 가중치 위험 모델 (Time-Weighted Regulatory Risk Model)",
      "TargetIndustry": "AI 기반 진단 및 디지털 헬스케어 데이터 관리",
      "Objective": "시간 경과에 따른 법적 책임(L_r) 증폭 계수(τ) 최대화 방안 제시.",
      "KnowledgeBase_Source": "Hyunbin's Strategic Brief & Researcher Personal Memory (Self-RAG)",
      "ViolationScenarios": [
        {
          "ScenarioID": "V001",
          "ThreatCategory": "모델의 투명성 및 편향성 부족",
          "RiskDescription": "학습 데이터셋이 특정 인구 집단에 치중되어 있어, 소외 집단에게 진단 오류가 발생하고 이로 인해 신체적 피해를 입힌 경우.",
          "LegalBasis": {"GlobalRegulation": "GDPR"},
          "QuantifiableLossModel": {
            "L_max_Formula": "(Global Revenue * 5%) + (N_Injured * $2M_{Avg. Malpractice})",
            "EstimatedRange": "$100M ~ $1B+",
            "TimeMultiplier_tau": "High Risk: Rapid Escalation"
          }
        },
        {
          "ScenarioID": "V002",
          "ThreatCategory": "개인 식별 정보 유출 (PII Leakage)",
          "RiskDescription": "운영 과정에서 환자의 민감한 PII(개인 식별 정보)가 해킹을 통해 제3자에게 노출된 경우.",
          "LegalBasis": {"GlobalRegulation": "HIPAA"},
          "QuantifiableLossModel": {
            "L_max_Formula": "(Global Revenue * 3%) + (N_Injured * $1M_{Avg. Breach})", # 다른 가정값을 테스트하기 위해 수정
            "EstimatedRange": "$50M ~ $800M",
            "TimeMultiplier_tau": "Medium Risk: Regulatory Response Time"
          }
        },
         # 데이터 누락 케이스를 위한 추가 시나리오 (테스트용)
        {
          "ScenarioID": "V999_INVALID",
          "ThreatCategory": "데이터 구조 오류 테스트",
          "RiskDescription": "N_Injured 값이 명시되지 않은 가짜 시나리오.",
          "LegalBasis": {"GlobalRegulation": "Dummy"},
          "QuantifiableLossModel": {
            "L_max_Formula": "(Global Revenue * 1%)", # N_Injured를 무시하는 로직 테스트
            # 의도적으로 N_Injured 키를 누락함
            "TimeMultiplier_tau": "Low Risk: Manual Audit"
          }
        }
      ]
    }